//module to collect subsequent changes made based on a set of original changes
//once collected all together, they can then be applied to the DOM or written to the database

function Change(id, changes, changeList){

  var topLevel = false;
  if(changeList === undefined){
    topLevel = true;
    var changeList = {};
  }

  var note = model[id];

  //grab any old values we may need to keep hold of
  if(topLevel){
    var oldParent = model[note.parentId];
    var oldPreceding = model[note.precedingId];
    var oldNext = modelRaw.find(x=> x.precedingId == note.id);
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

    //return to prevent checking everything else every time we change text
    if(change.prop == 'content') return changeList;

    //now (for other types of changes) deal with any subsequent changes
    switch(change.prop){
      case 'isProjectAndIfSoPriority':
        if(change.value > 0){
          new Change(note.id, [{prop:'isTodo', value:true}], changeList);
        }
        else{
          if(model[note.parentId].isTodo == false) new Change(note.id, [{prop:'isTodo', value:false}], changeList);
        }
      break;

      case 'dueDate':
        if(note.effectiveDueDate != change.value){
          new Change(note.id, [{prop:'effectiveDueDate', value:change.value}], changeList);
        }
      break;

      case 'effectiveDueDate':
        trickleDown(note, change, x=> x.dueDate==null, changeList);
      break;

      case 'isMemo':
        if(change.value == true && note.isProjectAndIfSoPriority == 0){
          new Change(note.id, [{prop:'isTodo', value:false}], changeList);
        }
        else if(change.value == false && model[note.parentId].isTodo == 1){
          new Change(note.id, [{prop:'isTodo', value:true}], changeList);
        }
      break;

      case 'isTodo':
        trickleDown(note, change, x=> x.isProjectAndIfSoPriority == 0 && x.isMemo == 0, changeList);
      break;

      case 'effectiveDueDate':
        trickleDown(note, change, x=> x.dueDate == null, changeList);
      break;

      case 'dueDate':
        new Change(note.id, [{prop:'effectiveDueDate', value:change.value}], changeList);
      break;

      case 'isComplete':
        if(change.value == true){
          new Change(note.id, [{prop:'isDescendantOfComplete', value:true}], changeList);
        }
        else{
          new Change(note.id, [{prop:'isDescendantOfComplete', value:false}], changeList);
        }
      break;

      case 'isDescendantOfComplete':
        trickleDown(note, change, x=> x.isComplete == 0, changeList);
      break;

      case 'parentId':
        var newParent = modelRaw.find(x=> x.id == note.parentId);
        if(newParent){
          if(newParent.isParent == false) new Change(newParent.id, [{prop:'isParent', value:true}], changeList);
          if(newParent.isTodo != note.isTodo) new Change(note.id, [{prop:'isTodo', value:newParent.isTodo}], changeList);
        }
        //test if old parent still a parent or not and assign as appropriate
        console.log(oldParent);
        if(oldParent){
          var isParent = 0;
          if(modelRaw.filter(x=> x.parentId == oldParent.id).length) isParent = 1;
          if(oldParent.isParent != isParent) new Change(oldParent.id, [{prop:'isParent', value:isParent}], changeList);
        }
      break;

      case 'precedingId':
        //any notes which followed this one should no longer do so
        if(topLevel){
          if(oldNext) new Change(oldNext.id, [{prop:'precedingId', value:(oldPreceding?oldPreceding.id:null)}], changeList);
          var newNext = modelRaw.find(x => x.id != note.id && x.parentId == note.parentId && x.precedingId == note.precedingId);
          if(newNext) new Change(newNext.id, [{prop:'precedingId', value:note.id}], changeList);
        }
      break;

    }
  });

  if(topLevel){
    console.log(changeList);
    return changeList;
  }
}

module.exports = Change;

function trickleDown(note, change, stopPropTest, changeList){
  console.log('in the trickle down')
  var children = modelRaw.filter(x=> x.parentId == note.id);
  children.forEach(function(child){
    if(child[change.prop] != change.value && stopPropTest(child)){
      console.log('making a new change')
      new Change(child.id, [{prop:change.prop, value:change.value}], changeList);
    }
  });
}
