const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'localhost',
      user : 'phpuser',
      password : 'password',
      database : 'flow2'
    }
});

const load = function(){
  return Promise.all([knex('notes'), knex.select('id').from('changes').orderBy('id', 'desc').limit(1)])
  .then(function(results){
    var model = {};
    model.names = {};
    model.raw = [];
    model.raw = JSON.parse(JSON.stringify(results[0]));
    model.raw.forEach(function(note){
      model.names[note.id] = note;
    });
    if(results[1].length > 0) model.currentChange = results[1][0].id;
    else model.currentChange = 0;
    return model;
  });
}

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const Change = require('./modules/shared/Change');
const processText = require('./modules/shared/processText');
const Tree = require('./modules/shared/operations/Tree');
const getDeepInverse = require('./modules/shared/operations/get-deep-inverse');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/reset', function(req, res){
  var notes = [
    {id:'DELETED', content:'', parentId:null},
    {id:'OUTLINE', content:'', effectivePriority:0, effectiveDueDate:0, parentId:null},
    {id:'INBOX', content:'', effectivePriority:0, effectiveDueDate:0, parentId:null},
    {id:'NEW', content:'', parentId:null},
    {id:'1', content:'One', parentId:'OUTLINE', effectivePriority: 0},
    {id:'2', content:'Two', parentId:'OUTLINE', precedingId:'1', effectivePriority: 0},
    {id:'3', content:'Three', parentId:'OUTLINE', precedingId:'2', effectivePriority: 0},
    {id:'inbox1', content:'I am in the inbox', parentId:'INBOX', precedingId:null, effectivePriority: 0}
  ];
  knex('notes').del()
  .then(() => knex('changes').del())
  .then(() => knex.schema.raw('alter table changes auto_increment=1'))
  .then(() => knex('notes').insert(notes))
  .then(() => setTimeout(()=>{res.redirect('/')}), 200);
});

app.get('/', function(req, res){
  res.render('index.ejs');
});

app.get('/api', function(req, res){
  load().then(function(model){
    res.json({model:model.raw.filter(x => x.parentId != 'DELETED'), currentChange:model.currentChange});
  });
});

app.put('/api/inbox', function(req, res){
  load().then(async function(model){
    var now = new Date();
    //inbox ones get their date set 20 years in the future to avoid collisions
    var id = (now.getTime()+640000000000).toString(16);
    var result = await createNew(id);
    if(result == 0) return res.json(0);
    var changeList = new Change(id, [{prop:"parentId", value:"INBOX"}, {prop:"precedingId", value:null}, {prop:"dateCreated", value:now.toISOString()}]);
    var content = processText('snap', req.body.content, id, changeList, false);
    content = processText('normal', content, id, changeList, false);
    //add the manipulated content into the changelist
    new Change(id, [{prop:"content", value:content}], changeList);
    multiUpdate(changeList).then(function(result){
      res.json(result);
    });
  });
});

app.post('/api', function(req, res){
  load().then(async (model) => {

    var response = {};

    console.log('backend currentChange and frontend-sent lastConfirmed:');
    console.log(model.currentChange);
    console.log(req.body.lastConfirmed);
    console.log('test if currentChange > lastConfirmed:');
    console.log(model.currentChange > req.body.lastConfirmed);

    if(model.currentChange > req.body.lastConfirmed){
      console.log('grabbing missing changes');
      //send the missing updates
      response.missingChanges = await knex('changes').where('id', '>', req.body.lastConfirmed);
    }

    //TODO we really need to select the data in the same transaction as below, using forUpdate() to lock it until we make the update

    var updates = req.body.updates;
    var tree = new Tree(model);
    var knownIds = Object.keys(model.names);

    //keep going if true, otherwise break once something fails
    for(let update of updates){
      var changes = {};

      update.operations.forEach(function(operation){
        changes = tree[operation.operation](operation.id, operation.data, changes);
        //apply the changes to the temporary model created inside the tree
        tree.apply(changes);
      });

      if(await knex.transaction(function(trx) {
        Promise.all(update.operations.filter(o=>o.operation == 'create').map(o=> {
            if(knownIds.some(x=> x==o.id) == false) return knex('notes').transacting(trx).insert({id:o.id});
            else{
              console.log('ID already exists - should be as a result of an undo/redo.');
              return true;
            }
          }
        ))
        .then(() => Promise.all(Object.keys(changes).map(id => knex('notes').transacting(trx).where({id: id}).update(changes[id]))))
        .then(() => knex('changes').transacting(trx).insert({operations:JSON.stringify(update.operations), rollbackChanges:JSON.stringify(getDeepInverse(changes, model))}))
        .then(trx.commit)
        .catch(trx.rollback);
      })
      .then(results => {
        update.status = 'COMPLETE';

        //apply the changes to the real model so that getting deep inverse will work on the next iteration
        model.raw = tree.model.raw;
        model.names = tree.model.names;

        return true;
      })
      .catch(err => {
        update.status = 'ERROR';
        console.log('ERROR: '+err);
        //stop processing updates if any of them give us an error
        return false;
      }) == false) break; //break the for loop of updates above

    };

    response.updates = updates;

    res.json(response);

    /*
    TODO make a way to step backwards through database changes (temporarily - need another way to commit to stay in that state)

  //something here for creating a new note
    console.log(req.body.changes);
    if(x.model[req.body.id] == undefined){
      var result = await createNew(req.body.id);
      console.log('RESULT');
      console.log(result);
      if(result == 0) return;
    }
    console.log('making changes');
    var changeList = new Change(req.body.id, req.body.changes);
    console.log(JSON.stringify(changeList));
    multiUpdate(changeList).then(function(result){
      res.json(result);
    });
    */
  });
});

function createNew(id){
  return load().then(async function(model){
    await knex('notes').insert({id: id}, 'id').then(x => console.log(x));
    console.log('geting new one');
    await knex('notes').where({id: id}).then(function(results){
      console.log(results);
      model.raw.push(JSON.parse(JSON.stringify(results))[0]);
      model.names[id] = model.raw.find(x => x.id == id);
    });
    return 1;
  });
}

async function multiUpdate(changeList){
  var result = 1;
  for(var id in changeList){
    if(changeList.hasOwnProperty(id)){
      await knex('notes').where({id: id}).update(changeList[id]).then(x => result *= x);
    }
  }
  return result;
}

app.listen(process.env.PORT || 3001)
