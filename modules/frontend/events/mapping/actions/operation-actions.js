var Action = require('./new-action');
var undoRedo = require('../../../operations-wrappers/undo-redo');
var caret = require('../../../utils/caret');
var getId = require('./get-id-from-dom-element');
var throttle = require('./throttle');
var generateId = require('../../../../shared/operations/generate-id');
var domHelpers = require('../../../dom/dom-helpers');
var snap = require('../../../../shared/text-processing/snap');
var dateBox = require('../../../dom/date-box');

//operations which require to go through the operations-wrappers
new Action('INDENT', function(e){
  e.preventDefault();
  var id = getId(e.target);
  var prev = domHelpers.prevSibling(e.target, 'visible');
  if(prev == null) return;
  var prevId = prev.dataset.id;
  var children = domHelpers.children(prev, 'visible');
  var lastChildId = null;
  if(children.length > 0) lastChildId = children[children.length-1].dataset.id;
  undoRedo.new([{id:id, operation:'move', data:{parentId:prevId, precedingId:lastChildId}}]);
  e.target.focus();
  //figure out if it's possible to indent
  //if so, send to the undo-redo stack whatever is necessary
  //an object with id, {id, operation, values}
  //the operations are basically... move, delete, set value (e.g. complete would just set the completed value to completed)
  //what about new?
  //what about stuff like backspacing and combining tow

});

new Action('OUTDENT', function(e, model){
  e.preventDefault();
  var id = getId(e.target);
  var parent = model.names[model.names[id].parentId];
  if(parent.id != 'OUTLINE' && parent.id != 'INBOX'){
    parentParent = model.names[parent.parentId];
    undoRedo.new([{id:id, operation:'move', data:{parentId:parentParent.id, precedingId:parent.id}}]);
  }
  e.target.focus();
});

new Action('REPOSITION_UP', function(e, model){
  e.preventDefault();
  var id = getId(e.target);
  var parentId = model.names[id].parentId;
  var prev = domHelpers.prevSibling(e.target, 'visible');
  if(prev){
    var prevInModel = model.names[prev.dataset.id];
    undoRedo.new([{id:id, operation:'move', data:{parentId:parentId, precedingId:prevInModel.precedingId}}]);
  }
  e.target.focus();
});

new Action('REPOSITION_DOWN', function(e, model){
  e.preventDefault();
  var id = getId(e.target);
  var parentId = model.names[id].parentId;
  var next = domHelpers.nextSibling(e.target, 'visible');
  if(next){
    var nextInModel = model.names[next.dataset.id];
    undoRedo.new([{id:id, operation:'move', data:{parentId:parentId, precedingId:nextInModel.id}}]);
  }
  e.target.focus();
});

new Action('ENTER_NEW_NOTE', function(e, model){
  e.preventDefault();
  var id = getId(e.target);
  var newId = generateId();
  //figure out what to do
  var newParentId, newPrecedingId, newContent;
  var operations = [];
  var pos = caret.pos(e.target);
  //note has content, we are in the middle or at the beginning (i.e. not at the end): create new note above with the content to the left of the cursor
  if(pos != 'empty' && pos != 'end'){
    if(pos == 'middle'){
      newContent = e.target.innerText.substr(0, caret.get(e.target));
      //also update content of current note to remove content to the left of cursor
      operations.push({id:id, operation:'setProp', data:{prop:'content', value:e.target.innerText.substr(caret.get(e.target))}});
    }
    newParentId = model.names[id].parentId;
    var prev = domHelpers.prevSibling(e.target, 'visible');
    if(prev) newPrecedingId = prev.dataset.id;
    else newPrecedingId = null;
  }
  //note has children (search only for VISIBLE children): create new note as first child of current note
  else if(domHelpers.children(e.target, 'visible').length > 0){
    newParentId = id;
    newPrecedingId = null;
  }
  //otherwise, create a new note below
  else{
    newParentId = model.names[id].parentId;
    newPrecedingId = id;
  }

  operations.push({id:newId, operation:'create', data:{parentId: newParentId, precedingId: newPrecedingId}});
  if(newContent != undefined) operations.push({id:newId, operation:'setProp', data:{prop: 'content', value: newContent}});

  undoRedo.new(operations);
  //TODO figure out if ALWAYS to move cursor to new note?
  waitTillDivDrawn(e.target.closest('.notesContainer'), `[data-id="${newId}"]>.topLine>.contentHolder>.content`, (content)=>{
    content.focus();
    caret.set(content, content.innerHTML.length);
  });
});

function waitTillDivDrawn(obj, selector, callback){
  requestAnimationFrame(()=>{
    if(obj.querySelector(selector)) callback(obj.querySelector(selector));
    else waitTillDivDrawn(obj, selector, callback);
  });
}


new Action('TOGGLE_COMPLETE', function(e, model){
  e.preventDefault();
  var id = getId(e.target);
  var newValue = true;
  if(model.names[id].isComplete == true) newValue = false;
  undoRedo.new([{id:id, operation:'setProp', data:{prop:'isComplete', value:newValue}}]);
});

new Action('BACKSPACE_DELETE_NOTE', function(e, model){
  e.preventDefault();
  var id = getId(e.target);
  var prev = domHelpers.prevSibling(e.target);
  var prevCousin = domHelpers.prevInView(e.target);
  if(prev && prev.querySelector('.content').innerText == ''){
    undoRedo.new([{id:prev.dataset.id, operation:'move', data:{parentId:'DELETED', precedingId:null}}]);
    //NOW UNNECESSARY TODO REMOVE e.target.focus();
  }
  else if(e.target.innerText == '' && model.names[id].isParent == false){
    undoRedo.new([{id:id, operation:'move', data:{parentId:'DELETED', precedingId:null}}]);
    /*NOW UNNECESSARY TODO REMOVE
    if(prev) prev.querySelector('.content').focus();
    else if(prevCousin) prevCousin.querySelector('.content').focus();
    else actions['NAV_FIRST_NOTE'](e);
    */
  }
});

new Action('TOGGLE_CHILDREN', function(e, model){
  e.preventDefault();
  var id = getId(e.target);
  var newValue = true;
  if(model.names[id].isCollapsed == true) newValue = false;
  undoRedo.new([{id:id, operation:'setProp', data:{prop:'isCollapsed', value:newValue}}]);
});

new Action('UNDO', function(e){
  console.log('UNDOING');
  e.preventDefault();
  undoRedo.undo();
});

new Action('REDO', function(e){
  console.log('REDOING');
  e.preventDefault();
  undoRedo.redo();
});

new Action('INPUT_CONTENT', function(e){
  var id = getId(e.target);
  snap(id, e.target.innerText);
  throttle.input(id, e.target.innerText);
});

new Action('FORCE_THROTTLE', function(e){
  if(throttle.id) throttle.send();
});

new Action('CLEAR_PRIORITY', function(e){
  var id = getId(e.target);
  undoRedo.new([{id:id, operation:'setProp', data:{prop:'priority', value:null}}]);
});

new Action('CLEAR_DATE', function(e){
  var id = getId(e.target);
  undoRedo.new([{id:id, operation:'setProp', data:{prop:'dueDate', value:null}}]);
});

new Action('PICK_DATE', function(e, model){
  var id = getId(e.target);
  dateBox.drawBox(new Date(model.names[id].effectiveDueDate), e.target, new Date(model.names[id].effectiveDueDate));
});

new Action('CHOOSE_DATE', function(e){
  var thisBox = e.target.closest('.dateBox');
  var id = getId(e.target);
  undoRedo.new([{id:id, operation:'setProp', data:{prop:'dueDate', value:new Date(1*e.target.dataset.date)}}]);
  thisBox.parentNode.removeChild(thisBox);
});

new Action('DATE_BOX_CHANGE_MONTH', function(e, model){
  var thisBox = e.target.closest('.dateBox');
  var id = getId(e.target);
  dateBox.updateBox(new Date(1*e.target.dataset.date), thisBox, new Date(model.names[id].effectiveDueDate));
});

new Action('HIDE_DATE_BOX', function(e){
  var thisBox = e.target.closest('.dateBox');
  var id = getId(e.target);
  thisBox.parentNode.removeChild(thisBox);
});
