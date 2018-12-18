ajax = require('./modules/ajax');
require('./modules/InputManager');
require('./modules/dragDrop');
processText = require('./modules/shared/processText');
caret = require('./modules/caret')
throttle = require('./modules/throttle')
dateBox = require('./modules/dateBox')
friendlyDate = require('./modules/friendlyDate')

applyClasses = ['isParent', 'isTodo', 'isCollapsed', 'isComplete',
'isDescendantOfComplete', 'isProjectAndIfSoPriority', 'isImportant', 'hasTimeEstimate'];

modelRaw = [];
model = {};

console.log(model);

changeManager = require('./modules/ChangeManager');

holdingPen = document.createElement('div');

ajax.get(function(data){
  var notesDiv = document.querySelector('#notes');
  var inboxDiv = document.querySelector('#inbox');
  modelRaw = data;
  modelRaw.forEach(function(note){
    model[note.id] = note;
  });
  orderNotes(modelRaw.filter(x => x.parentId == null)).forEach(function(note){
    drawNote(note, notesDiv);
  });
  orderNotes(modelRaw.filter(x => x.parentId == 'INBOX')).forEach(function(note){
    drawNote(note, inboxDiv);
  });
  populateSchedule();
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});

drawNote = function(note, parentNode, drawChildren = true){
  var div = createNoteDiv(note);
  parentNode.appendChild(div);
  var divChildrenHolder = div.querySelector('.children');
  if(drawChildren){
    var childrenRaw = modelRaw.filter(x => x.parentId == note.id);
    var children = orderNotes(childrenRaw);
    children.forEach(function(child){
      drawNote(child, divChildrenHolder);
    });
  }
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

createNoteDiv = function(note){
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
        <div class='bullet' draggable='true'></div>
      </div>
      <div class='contentHolder'><div class='dragDropTop'></div><div class='dragDropBottom'></div>
        <div class='content' contenteditable>${processText('blur', note.content, note.id)}</div>
        <div class='dueDate' data-date='${new Date(note.dueDate).getTime()}'>due ${friendlyDate(new Date(note.dueDate))} <span class='clearDate'></div>
      </div>
    </div>
    <div class='children'></div>
  `;
  div.querySelector('.bullet').dataset.hashTarget = '/'+note.id;
  return div;
}

populateSchedule = function(){
  var today = new Date();
  today.setHours(0,0,0,0);
  date = today.getDate();
  workingDate = new Date(today.getTime());
  document.querySelector('#tabs').innerHTML = `
    ${Array(7).fill().map((x,i)=> `
      <div class='tab' data-date='${workingDate.setDate(date+i)}'><input type="radio" id="tab-${i}" name="tabs" ${i==0 ? 'checked' : ''}><label for="tab-${i}" data-hash-target='/${workingDate.setDate(date+i)}'>${i==0 ? `Today` : i==1 ? 'Tomorrow' : ['Sun','Mon','Tues','Wednes','Thurs','Fri','Satur','Sun'][new Date(workingDate.setDate(date+i)).getDay()]+'day'}</label><div class='content'></div></div>
    `).join('')}
  `;
}
