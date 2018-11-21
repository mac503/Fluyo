module.exports = function(noteDiv, action, e){
  console.log(e);
  e.preventDefault();
  var note = model[noteDiv.dataset.id];
  var content = noteDiv.querySelector('.content');
  switch(action){

    case 'toggle':
      var makeItCollapsed = null;
      if(note.isCollapsed) makeItCollapsed = false;
      else makeItCollapsed = true;
      changeManager.change(note.id, [{prop:"isCollapsed", value:makeItCollapsed}]);
    break;

    case 'toggleComplete':
      var prevEl = getPreviousNoteElement(noteDiv);
      changeManager.change(note.id, [{prop:"isComplete", value:(note.isComplete ? false : true)}]);
      if(document.querySelector('.showCompleted')) break;
      if(prevEl) prevEl.querySelector('.content').focus();
      else{
        var nextEl = getNextNoteElement(noteDiv);
        if(nextEl) nextEl.querySelector('.content').focus();
        else{
          var prevEl = getPrevNoteElement(noteDiv);
          if(prevEl) prevEl.querySelector('.content').focus();
        }
      }
    break;

    case 'navUp':
      var prevEl = getPreviousNoteElement(noteDiv);
      if(prevEl) prevEl.querySelector('.content').focus();
    break;
    case 'navUpEnd':
      var prevEl = getPreviousNoteElement(noteDiv);
      if(prevEl){
        var prevContent = prevEl.querySelector('.content');
        prevContent.focus();
        caret.set(prevContent, prevContent.innerText.length);
      }
    break;

    case 'navDown':
      var nextEl = getNextNoteElement(noteDiv);
      if(nextEl){
        var nextContent = nextEl.querySelector('.content');
        nextContent.focus();
        caret.set(nextContent, nextContent.innerText.length);
      }
    break;
    case 'navDownStart':
      var nextEl = getNextNoteElement(noteDiv);
      if(nextEl){
        var nextContent = nextEl.querySelector('.content');
        nextContent.focus();
        caret.set(nextContent, 0);
      }
    break;

    case 'new':
      var carPos = caret.pos(content);
      switch(carPos){
        case "start":
          var prevClose = noteDiv.previousSibling;
          if(prevClose && prevClose.nodeType == 3) prevClose = null;
          var prevCloseId = null;
          if(prevClose) prevCloseId = prevClose.dataset.id;
          newNote(note.parentId, prevCloseId);
        break;
        case "empty":
        case "end":
          var nextVisibleNote = getNextNoteElement(noteDiv);
          if(nextVisibleNote && nextVisibleNote.parentNode.parentNode == noteDiv) newNote(note.id, null);
          else newNote(note.parentId, note.id);
        break
        case "middle":
          var carLoc = caret.get(content);
          content.innerText = note.content.slice(0,carLoc);
          throttle.input(note.id, content.innerText);
          newNote(note.parentId, note.id, note.content.slice(carLoc));
        break;
      }
    break;

    case 'indent':
      var prev = getPreviousNoteSiblingElement(noteDiv);
      console.log(prev)
      if(prev && prev.parentNode == noteDiv.parentNode){
        var newSiblings = prev.querySelectorAll('.children .note');
        var newPreceding = {id: null};
        if(newSiblings.length) newPreceding = model[newSiblings[newSiblings.length -1].dataset.id];
        var newParent = model[prev.dataset.id];
        move(note, newPreceding.id, newParent.id);
      }
    break;

    case 'outdent':
      var parent = noteDiv.parentNode.parentNode;
      if(parent.classList.contains('note')){
        var newParentId = parent.parentNode.parentNode.dataset.id;
        if(newParentId == undefined) newParentId = null;
        move(note, parent.dataset.id, newParentId);
      }
    break;

    case 'repositionUp':
      var prev = getPreviousNoteSiblingElement(noteDiv);
      if(prev && prev.nodeType!=3 && prev.classList.contains('note')){
        var newPrev = prev.previousElementSibling;
        newPrevId = null;
        if(newPrev) newPrevId = newPrev.dataset.id;
        move(note, newPrevId);
      }
    break;

    case 'repositionDown':
      var next = getNextNoteSiblingElement(noteDiv);
      if(next && next.nodeType!=3 && next.classList.contains('note')){
        move(note, next.dataset.id)
      }
    break;

    case 'delete':
      if(content.innerText != ''){
        var prev = getPreviousNoteSiblingElement(noteDiv);
        if(prev == null) break;
        var prevContent = prev.querySelector('.content');
        var prevContentLength = prevContent.innerText.length;
        var prevNote = model[prev.dataset.id];
        var contentText = content.innerText;
        changeManager.change(prevNote.id, [{prop:'content', value:prevNote.content+contentText}], true);
        changeManager.change(note.id, [{prop:'parentId', value:'deleted'},{prop:'content', value:''}]);
      }
      else{
        var prev = getPreviousNoteElement(noteDiv);
        if(prev == null) break;
        var prevContent = prev.querySelector('.content');
        var prevContentLength = prevContent.innerText.length;
        changeManager.change(note.id, [{prop:'parentId', value:'deleted'}]);
      }
      prevContent.focus();
      caret.set(prevContent, prevContentLength);
    break;

  }
}

function getPreviousNoteElement(el){
  var noteEls = Array.prototype.slice.call(document.querySelectorAll(`.note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
  var collapsedEls = Array.prototype.slice.call(document.querySelectorAll(`.isCollapsed .note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
  var diffEls = noteEls.filter(x=> collapsedEls.includes(x) == false);
  return diffEls[diffEls.indexOf(el) -1];
}

function getPreviousNoteSiblingElement(el){
  var parentId = model[el.dataset.id].parentId;
  if(parentId){
    var noteEls = Array.prototype.slice.call(document.querySelectorAll(`.note[data-id="${parentId}"]>.children>.note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
  }
  else{
    var noteEls = Array.prototype.slice.call(document.querySelectorAll(`#notes>.note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
  }
  return noteEls[noteEls.indexOf(el) -1];
}

function getNextNoteElement(el){
  var noteEls = Array.prototype.slice.call(document.querySelectorAll(`.note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
  var collapsedEls = Array.prototype.slice.call(document.querySelectorAll(`.isCollapsed .note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
  var diffEls = noteEls.filter(x=> collapsedEls.includes(x) == false);
  return diffEls[diffEls.indexOf(el) +1];
}

function getNextNoteSiblingElement(el){
  var parentId = model[el.dataset.id].parentId;
  if(parentId){
    var noteEls = Array.prototype.slice.call(document.querySelectorAll(`.note[data-id="${parentId}"]>.children>.note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
  }
  else{
    var noteEls = Array.prototype.slice.call(document.querySelectorAll(`#notes>.note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
  }
  return noteEls[noteEls.indexOf(el) +1];
}

function move(note, precedingId, parentId){
  if(parentId === undefined) parentId = note.parentId;
  changeManager.change(note.id, [{prop:"parentId", value:parentId}, {prop:"precedingId", value:precedingId}]);
}

function newNote(parentId, precedingId, content){
  if(content == undefined) content = "";

  var now = new Date();
  var id = now.getTime().toString(16);

  modelRaw.push({
    "id": id,
    "dueDate": null
  });
  model[id] = modelRaw.find(x => x.id == id);

  var div = createNoteDiv(model[id]);
  holdingPen.appendChild(div);

  changeManager.change(id, [{prop:"dateCreated", value:now.toISOString()}, {prop:"parentId", value:parentId}, {prop:"precedingId", value:precedingId}, {prop:"content", value:content}]);
}
