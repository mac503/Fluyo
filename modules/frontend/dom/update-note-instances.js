var newNoteDiv = require('./new-note-div');
var updateNoteNode = require('./update-note-node');
var model = require('../model/model');

module.exports = function(id, changes){
  //find all examples of the note within the DOM
  if(id != 'NEW' && document.querySelector(`[data-id="${id}"]`) == null){
    [].forEach.call(document.querySelectorAll(`:not(.notesContainer)[data-id="${model.names[id].parentId}"]`), function(parentDiv){
      var div = newNoteDiv(id);
      parentDiv.querySelector('.children').appendChild(div);
    });
  }
  //in case we're moving from inbox to main outline, or vice versa, may need to create new divs if they don't exist yet in the other outline view
  else if(changes.hasOwnProperty('parentId')){
    //for each div of the new parent, if that view doesn't contain a note div for this id, create one
    [].forEach.call(document.querySelectorAll(`[data-id="${changes.parentId}"]`), function(parentDiv){
      var component = parentDiv.closest('[data-outline-component]');
      if(component.querySelector(`[data-id="${id}"]`) == null){
        var div = newNoteDiv(id);
        parentDiv.querySelector('.children').appendChild(div);
        //need to apply everything from the model unfortunately
        var currentState = JSON.parse(JSON.stringify(model.names[id]));
        updateNoteNode(div, currentState);
      }
    });
  }
  [].forEach.call(document.querySelectorAll(`[data-id="${id}"]`), function(div){
    updateNoteNode(div, changes);
  });
}
