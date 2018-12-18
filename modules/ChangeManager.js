var Change = require('./shared/Change');

function ChangeManager(){

}

ChangeManager.prototype.change = function(id, changes, fallThrough){

  console.log('NOW WE ARE HERE')

  var nowISO = new Date().toISOString();

  changes.forEach(function(change){
    if(change.value === true) change.value = 1;
    if(change.value === false) change.value = 0;
    if(change.prop == 'isComplete'){
      if(change.value == 1) changes.push({prop:'dateCompleted', value: nowISO});
      else changes.push({prop:'dateCompleted', value: null});
    }
  });

  changes.push({prop:'dateUpdated', value: nowISO});

  //post the changes
  ajax.post({id:id, changes:changes}, function(success){
    console.log(`Successfully updated ${id} with ${JSON.stringify(changes)}`);
  });

  //TODO broadcast the changes via broadcastchannel api

  //create a Change object to calculate the subsequent changes here, and draw them to the screen
  var changeObject = new Change(id, changes);

  console.log(JSON.stringify(changeObject));

  drawUpdates(changeObject);

}

module.exports = new ChangeManager();

function drawUpdates(updates){

  Object.keys(updates).forEach(function(id){
    var note = model[id];
    console.log('DRAWING UPDATE FOR '+id)
    console.log(updates[id]);
    var div = document.querySelector(`.note[data-id="${id}"]`) || holdingPen.querySelector(`.note[data-id="${id}"]`);
    if(div == undefined) return;
    var update = updates[id];
    if(update.hasOwnProperty('parentId')){
      console.log(id);
      var content = div.querySelector('.content');
      var caretPos = caret.get(content);
      var parentDiv = document.querySelector(`.note[data-id="${update.parentId}"] .children`);
      if(update.parentId == null) parentDiv = document.querySelector('#notes');
      if(update.parentId == 'INBOX') parentDiv = document.querySelector('#inbox');
      if(update.parentId == 'deleted') parentDiv = holdingPen;
      console.log(parentDiv);
      var precedingDiv = document.querySelector(`.note[data-id="${update.precedingId}"]`);
      var nextDiv = parentDiv.querySelector('.note');
      if(precedingDiv) nextDiv = precedingDiv.nextSibling;

      parentDiv.insertBefore(div, nextDiv);

      if(note.parentId != 'deleted'){
        content.focus();
        caret.set(content, caretPos);
      }
    }
    if(update.hasOwnProperty('content')){
      var el = div.querySelector('.content');
      var pos;
      if(el == document.activeElement) pos = caret.get(el);
      el.innerHTML = update.content;
      if(pos && el == document.activeElement) caret.set(el, pos);
    }
    if(update.hasOwnProperty('dueDate')){
      var el = div.querySelector('.dueDate');
      el.dataset.date = new Date(note.dueDate).getTime();
      el.innerHTML = 'due '+friendlyDate(new Date(note.dueDate))+' <span class="clearDate">';
    }
    applyClasses.forEach(function(className){
      if(update.hasOwnProperty(className)){
        if(update[className] != false) div.classList.add(className)
        else div.classList.remove(className);
      }
    });
  });
}
