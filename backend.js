browser = false;

const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'localhost',
      user : 'phpuser',
      password : 'password',
      database : 'flow2'
    }
});

modelRaw = null;
model = {};

knex('notes').then(function(results){
  modelRaw = JSON.parse(JSON.stringify(results));
  console.log(modelRaw);
  modelRaw.forEach(function(note){
    model[note.id] = note;
  });
  console.log(model);
});

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

var Change = require('./modules/shared/Change');
processText = require('./modules/shared/processText');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function(req, res){
  res.render('index.ejs');
});

app.get('/api', function(req, res){
  res.json(modelRaw.filter(x => x.parentId != 'deleted'));
});

app.post('/api', async function(req, res){
  console.log(req.body.changes);
  if(model[req.body.id] == undefined){
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

async function createNew(id){
  await knex('notes').insert({id: id}, 'id').then(x => console.log(x));
  console.log('geting new one');
  await knex('notes').where({id: id}).then(function(results){
    console.log(results);
    modelRaw.push(JSON.parse(JSON.stringify(results))[0]);
    model[id] = modelRaw.find(x => x.id == id);
  });
  return 1;
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
