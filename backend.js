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
  return knex('notes').then(function(results){
    var model = [];
    modelRaw = JSON.parse(JSON.stringify(results));
    modelRaw.forEach(function(note){
      model[note.id] = note;
    });
    return {model, modelRaw};
  });
}

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const Change = require('./modules/shared/Change');
const processText = require('./modules/shared/processText');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/reset', function(req, res){
  var notes = [
    {id:'123', content:'One'}
  ];
  knex('notes').del().then(
    function(x){knex('notes').insert(notes).then(res.redirect('/'))}
  );
});

app.get('/', function(req, res){
  res.render('index.ejs');
});

app.get('/api', function(req, res){
  load().then(function(x){
    console.log(x);
    res.json(x.modelRaw.filter(x => x.parentId != 'deleted'));
  });
});

app.put('/api/inbox', function(req, res){
  load().then(async function(x){
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
  load().then(async function(x){
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
  });
});

function createNew(id){
  return load().then(async function(x){
    await knex('notes').insert({id: id}, 'id').then(x => console.log(x));
    console.log('geting new one');
    await knex('notes').where({id: id}).then(function(results){
      console.log(results);
      x.modelRaw.push(JSON.parse(JSON.stringify(results))[0]);
      x.model[id] = x.modelRaw.find(x => x.id == id);
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

app.listen(process.env.PORT || 3000)
