var outlineComponent = require('./outline-component');
var newNoteDiv = require('./new-note-div');
var updateNoteNode = require('./update-note-node');

//create a new outline component in panel1
module.exports = function(model){

  document.querySelector('#panel1').appendChild(outlineComponent('INBOX'));
  document.querySelector('#panel1').appendChild(outlineComponent('OUTLINE'));
  document.querySelector('#panel2').appendChild(outlineComponent('OUTLINE'));

  //for each outline component, populate the notes which should be there
  [].forEach.call(document.querySelectorAll('[data-outline-component]'), function(component){
    var holdingPen = component.querySelector('.holdingPen');
    orderNotes(model.raw.filter(x => x.parentId == component.dataset.topLevelId)).forEach(function(note){
      drawNote(note, holdingPen, model);
    });
  });

  //TODO later here draw the priority view and todo view

}

function orderNotes(childrenRaw){
  var children = [];
  var precedingId = null;
  for(var i = 0; i<childrenRaw.length; i++){
    var nextChild = childrenRaw.find(x => x.precedingId == precedingId);
    children.push(nextChild);
    precedingId = nextChild.id;
  }
  return children;
}

function drawNote(note, holdingPen, model){
  var div = newNoteDiv(note.id);
  holdingPen.appendChild(div);
  updateNoteNode(div, note, true);
  var divChildrenHolder = div.querySelector('.children');
  var childrenRaw = model.raw.filter(x => x.parentId == note.id);
  var children = orderNotes(childrenRaw);
  children.forEach(function(child){
    drawNote(child, holdingPen, model);
  });
}
