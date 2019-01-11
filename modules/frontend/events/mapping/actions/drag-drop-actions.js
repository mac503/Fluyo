var getId = require('./get-id-from-dom-element');
var model = require('../../../model/model');
var Action = require('./new-action');

new Action('DRAGSTART', function(e){
  var id = getId(e.target);
  [].forEach.call(document.querySelectorAll(`[data-id="${id}"]`), function(div){
    div.classList.add('dragOrigin');
  });
  document.body.classList.add('dragging');
});

new Action('DRAGEND', function(e){
  if(document.querySelector('.hover')){
    var originId = document.querySelector('.dragOrigin').dataset.id;
    var hover = document.querySelector('.hover');
    var id = getId(hover);
    var parentId = model.names[id].parentId;
    if(hover.classList.contains('dragDropHelperTop')) undoRedo.new([{id:originId, operation:'move', data:{parentId:parentId, precedingId:null}}]);
    else if(hover.classList.contains('dragDropHelperBottom')) undoRedo.new([{id:originId, operation:'move', data:{parentId:parentId, precedingId:id}}]);
    else if(hover.classList.contains('dragDropHelperFirstChild')) undoRedo.new([{id:originId, operation:'move', data:{parentId:id, precedingId:null}}]);
  }
  document.body.classList.remove('dragging');
  [].forEach.call(document.querySelectorAll('.dragOrigin'), function(el){
    el.classList.remove('dragOrigin');
  });
  removeHovers();
});

new Action('DRAGENTER', function(e){
  //first check if target is allowed
  var container = e.target.closest('.notesContainer');
  var origin = container.querySelector('.dragOrigin');
  if(origin){
    //make sure target isn't origin
    var target = e.target.closest('.note');
    if(target == origin || target.contains(origin) || origin.contains(target)) return;
  }
  removeHovers();
  e.target.classList.add('hover');
});

function removeHovers(){
  [].forEach.call(document.querySelectorAll('.hover'), function(el){
    el.classList.remove('hover');
  });
}
