var ajax = require('../utils/ajax');

module.exports = model = {};

model.initialise = function(callback){

  ajax.get(function(data){
    model.raw = data.model;
    model.names = {};
    model.raw.forEach(function(note){
      model.names[note.id] = note;
    });
    model.currentChange = data.currentChange;

    callback(model);

  });
}

model.update = function(newModel){
  model.raw = newModel.raw;
  model.names = {};
  model.raw.forEach(function(note){
    model.names[note.id] = note;
  });
}
