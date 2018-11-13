function Change(id, changes, changeList){
  var topLevel = false;
  if(changeList === undefined){
    topLevel = true;
    var changeList = {};
  }

  //make the change to the note in the model
  changes.forEach(function(change){
    model[id][change.prop] = change.value;
  });

  //figure out any subsequent changes
  changes.forEach(function(change){

    //process the text - return the processed version now and add it to the changelist if we are on frontend
    if(change.prop == 'content'){
      var processed = processText(change.value, id, changeList);
      if(browser) change.value = processed;
    }

    //add the change to the change list for use later
    if(changeList[id] === undefined) changeList[id] = {};
    changeList[id][change.prop] = change.value;

    //return to prevent checking every time we change text
    if(change.prop == 'content') return changeList;

    var note = model[id];

    switch(change.prop){
      case 'isNoteOrigin':
        //becoming a noteOrigin
        if(higherInChain(note, 'isNoteOrigin')) break;
        if(change.value == true){
          applyToSelfAndDescendants(note, 'isNote', changeList);
          //if we changed anything from a todo to not a todo, we must now search for new possible todos in the chain above
          for(id in changeList){
            if(changeList.hasOwnProperty(id)){
              var changeItem = changeList[id];
              if(changeItem.hasOwnProperty('isTodo') && changeItem.isTodo == false){
                activateAncestorTodo(model[note.parentId], note, changeList);
                break;
              }
            }
          }
        }
        //stopping to be a noteOrigin
        else{
          disApplyToSelfAndDescendants(note, 'isNote', 'isNoteOrigin', changeList);
        }
        break;
      case 'isNote':
        if(change.value == true){
          if(note.isTodo) new Change(note.id, [{prop:'isTodo', value:false}], changeList);
        }
        else{
          if(hasTodoPotentialEager(note)) new Change(note.id, [{prop:'isTodo', value:true}], changeList);
        }
      break;
      case 'isCompleteOrigin':
        if(higherInChain(note, 'isCompleteOrigin')) break;
        if(change.value == true){
          applyToSelfAndDescendants(note, 'isComplete', changeList);
        }
        else{
          disApplyToSelfAndDescendants(note, 'isComplete', 'isCompleteOrigin', changeList);
        }
      break;
      case 'isComplete':
        var parentNote = model[note.parentId];
        if(change.value == true){
          if(hasTodoPotential(parentNote)) new Change(parentNote.id, [{prop:'isTodo', value:true}], changeList);
        }
        else{
          if(note.isNote == false) new Change(note.id, [{prop:'isTodo', value:true}], changeList);
        }
      break;
      case 'isTodo':
        if(change.value == true){
          //this shouldn't happen in cases where parent should be a todo (completion of items causing multiple todos to be created)
          console.log(note.id);
          console.log('deactivating ancestor todos');
          deActivateAncestorTodo(model[note.parentId], changeList);
        }
      break;

    }
  });

  if(topLevel){
    return changeList;
  }
}

module.exports = Change;

function higherInChain(origin, property){
  var item = origin;
  while(item = model[item.parentId]){
    if(item[property]) return true;
  }
  return false;
}

function applyToSelfAndDescendants(note, prop, changeList){
  if(note[prop]) return;
  else{
    new Change(note.id, [{prop:prop, value:true}], changeList);
    modelRaw.filter(x=> x.parentId == note.id).forEach(function(child){
      applyToSelfAndDescendants(child, prop, changeList);
    });
  }
}

function disApplyToSelfAndDescendants(note, prop, sourceProp, changeList){
  if(note[sourceProp]) return;
  else{
    new Change(note.id, [{prop:prop, value:false}], changeList);
    modelRaw.filter(x=> x.parentId == note.id).forEach(function(child){
      disApplyToSelfAndDescendants(child, prop, sourceProp, changeList);
    });
  }
}

function activateAncestorTodo(note, ignoreChildNote, changeList){
  if(note === undefined) return;
  //make it so
  if(hasTodoPotential(note)) new Change(note.id, [{prop:'isTodo', value:true}], changeList);
  //or look further up the chain
  else activateAncestorTodo(model[note.parentId], note, changeList);
}

function deActivateAncestorTodo(note, changeList){
  if(note === undefined) return;
  if(note.isTodo && hasTodoPotential(note) == false) new Change(note.id, [{prop:'isTodo', value:false}], changeList);
  else deActivateAncestorTodo(model[note.parentId], changeList);
}

function hasTodoPotential(note){
  if(note === undefined) return;
  if(note.isNote) return false;
  if(modelRaw.find(x=> x.parentId == note.id && x.isComplete == false && x.isNote == false) != undefined) return false;
  else return true;
}

function hasTodoPotentialEager(note){
  if(note === undefined) return;
  if(modelRaw.find(x=> x.parentId == note.id && x.isComplete == false && x.isNoteOrigin == false) != undefined) return false;
  else return true;
}
