var updateNoteInstances = require('./update-note-instances');

module.exports = function(changes){
  Object.getOwnPropertyNames(changes).forEach(function(id){
    updateNoteInstances(id, changes[id]);
  });
}
