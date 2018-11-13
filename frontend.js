browser = true;

ajax = require('./modules/ajax');
var InputManager = require('./modules/InputManager');
processText = require('./modules/shared/processText');

applyClasses = ['isParent', 'isTodo', 'isNote', 'isNoteOrigin', 'isCollapsed', 'isCompleteOrigin',
'isComplete', 'isProjectPriority', 'isImportant', 'isWorkable', 'hasTimeEstimate'];

modelRaw = [];
model = {};

console.log(model);
var inputManager = new InputManager();
changeManager = require('./modules/ChangeManager');

ajax.get(function(data){
  var notesDiv = document.querySelector('#notes');
  modelRaw = data;
  modelRaw.forEach(function(note){
    model[note.id] = note;
  });
  modelRaw.filter(x => x.parentId == null).forEach(function(note){
    drawNote(note, notesDiv);
  });
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});

function drawNote(note, parentNode, drawChildren = true){
  var div = createNoteDiv(note);
  parentNode.appendChild(div);
  var divChildrenHolder = div.querySelector('.children');
  if(drawChildren){
    modelRaw.filter(x => x.parentId == note.id).forEach(function(child){
      drawNote(child, divChildrenHolder);
    });
  }
}

function createNoteDiv(note){
  var div = document.createElement('div');
  div.dataset.id = note.id;
  div.classList.add('note');
  applyClasses.forEach(function(prop){
    if(note[prop]) div.classList.add(prop);
  });
  div.innerHTML = `
    <div class='topLine'>
      <div class='left'>
        <div class='toggle'></div>
        <div class='bullet'></div>
      </div>
      <div class='contentHolder'><div class='dragDropTop'></div><div class='dragDropBottom'></div>
        <div class='content' contenteditable>${processText(note.content)}</div>
      </div>
    </div>
    <div class='children'></div>
  `;
  div.querySelector('.bullet').dataset.hashTarget = '/'+note.id;
  return div;
}
