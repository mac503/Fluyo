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
    //need to recursively do this for children as well...
    [].forEach.call(document.querySelectorAll(`[data-id="${changes.parentId}"]`), function(parentDiv){
      var component = parentDiv.closest('[data-outline-component]');
      if(component.querySelector(`[data-id="${id}"]`) == null){
        recursiveCopyNotes(id, parentDiv);
      }
    });
  }
  [].forEach.call(document.querySelectorAll(`[data-id="${id}"]`), function(div){
    updateNoteNode(div, changes);
  });
}

function recursiveCopyNotes(id, newParent){
  var div = newNoteDiv(id);
  newParent.querySelector('.children').appendChild(div);
  var currentState = JSON.parse(JSON.stringify(model.names[id]));
  updateNoteNode(div, currentState);
  //check for children and do the same
  model.raw.filter(x=> x.parentId == id).forEach(function(child){
    recursiveCopyNotes(child.id, div);
  });
}

function addChildDivs(oldDiv, newDiv){
  [].forEach.call(oldDiv.querySelectorAll('.note'), function(childNote){
    var childId = childNote.dataset.id;
    var newChildDiv = newNoteDiv(childId);
    var currentState = JSON.parse(JSON.stringify(model.names[childId]));
    updateNoteNode(newChildDiv, currentState);
    var newParentDivOfChild;
    var oldParentDivOfChild = childNote.parentNode.closest('.note');
    if(oldParentDivOfChild == oldDiv) newParentDivOfChild = newDiv;
    else newParentDivOfChild = newDiv.querySelector(`[data-id="${oldParentDivOfChild.dataset.id}"]`);
    newParentDivOfChild.querySelector('.children').appendChild(newChildDiv);
  });
}
