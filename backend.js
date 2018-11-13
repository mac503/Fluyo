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
  res.json(modelRaw);
});

app.post('/api', function(req, res){
  var changeList = new Change(req.body.id, req.body.changes);
  console.log(JSON.stringify(changeList));
  var result = 1;
  Object.keys(changeList).forEach(function(id){
    knex('notes').where({id: id}).update(changeList[id]).then(x => result *= x);
  });
  res.json(result);
});

app.put('/api', function(req, res){
  res.json('{"Putting"}');
});

app.listen(process.env.PORT || 3000)
