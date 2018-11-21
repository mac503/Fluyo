(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
browser = true;

ajax = require('./modules/ajax');
var InputManager = require('./modules/InputManager');
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

var inputManager = new InputManager();
changeManager = require('./modules/ChangeManager');

holdingPen = document.createElement('div');

ajax.get(function(data){
  var notesDiv = document.querySelector('#notes');
  modelRaw = data;
  modelRaw.forEach(function(note){
    model[note.id] = note;
  });
  orderNotes(modelRaw.filter(x => x.parentId == null)).forEach(function(note){
    drawNote(note, notesDiv);
  });
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
        <div class='bullet'></div>
      </div>
      <div class='contentHolder'><div class='dragDropTop'></div><div class='dragDropBottom'></div>
        <div class='content' contenteditable>${processText(note.content)}</div>
        <div class='dueDate' data-date='${new Date(note.dueDate).getTime()}'>due ${friendlyDate(new Date(note.dueDate))} <span class='clearDate'></div>
      </div>
    </div>
    <div class='children'></div>
  `;
  div.querySelector('.bullet').dataset.hashTarget = '/'+note.id;
  return div;
}

},{"./modules/ChangeManager":2,"./modules/InputManager":3,"./modules/ajax":4,"./modules/caret":5,"./modules/dateBox":6,"./modules/friendlyDate":7,"./modules/shared/processText":11,"./modules/throttle":12}],2:[function(require,module,exports){
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

},{"./shared/Change":10}],3:[function(require,module,exports){
var search = require('./search');
var noteEvents = require('./noteEvents');

function InputManager(){

  window.addEventListener('click', function(e){
    var dateDiv = document.querySelector('.dateBox');
    if(dateDiv != null){
      if(dateDiv.contains(e.target) == false) dateDiv.parentNode.removeChild(dateDiv);
    }
    if(e.target.classList.contains('contentHolder')){
      var content = e.target.querySelector('.content');
      caret.set(content, content.innerText.length);
    }
    if(e.target.classList.contains('dueDate')){
      var date = new Date(parseInt(e.target.dataset.date));
      dateBox.drawBox(date, e.target, date);
    }
    if(e.target.classList.contains('changeMonth')){
      dateBox.updateBox(new Date(parseInt(e.target.dataset.date)), e.target.parentNode.parentNode.parentNode, new Date(parseInt(e.target.parentNode.parentNode.parentNode.parentNode.dataset.date)));
    }
    if(e.target.classList.contains('clearDate')){
      var noteDiv = e.target.parentNode.parentNode.parentNode.parentNode;
      changeManager.change(noteDiv.dataset.id, [{prop:'dueDate', value:null}]);
    }
    if(e.target.classList.contains('dateChoice')){
      dateBox.updateSelected(e.target);
      var noteDiv = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
      changeManager.change(noteDiv.dataset.id, [{prop:'dueDate', value:new Date(parseInt(e.target.dataset.date)).toISOString()}]);
    }
    if(e.target.classList.contains('tag')){
      var searchInput = document.querySelector('#searchBoxHolder input');
      var tag = e.target.dataset.tag;
      if(searchInput.value.includes(tag)) searchInput.value = searchInput.value.replace(tag, '');
      else searchInput.value = searchInput.value.trim() + ' '+tag;
      search.apply();
      document.querySelector('#searchBoxHolder input').focus();
    }
    if(e.target.dataset.hasOwnProperty('hashTarget')){
      window.location.href = '#'+e.target.dataset.hashTarget;
    }
    else if(e.target == document.querySelector('#toggleCompleted')){
      document.querySelector('#holder').classList.toggle('showCompleted');
    }
    else if(e.target.classList.contains('toggle')){
      noteEvents(e.target.parentNode.parentNode.parentNode, 'toggle', e);
    }
  });

  window.addEventListener('input', function(e){
    if(e.target.classList.contains('content')){
      if(document.querySelector('#searchBoxHolder input').value.trim() != '') search.apply();
      processContentInputSuperficial(e.target);
      throttle.input(e.target.parentNode.parentNode.parentNode.dataset.id, e.target.innerText);
    }
    else if(e.target.parentNode.id == 'searchBoxHolder'){
      search.apply();
    }
  });

  window.addEventListener('focusout', function(e){
    if(e.target != window && e.target.classList.contains('content')){
      if(throttle.id) throttle.send();
      
    }
  });

  window.addEventListener('beforeunload', function(e){
    if(throttle.content === undefined) return "Do you want to leave this site?\n\nChanges that you made may not be saved.";
    else return null;
  });

  window.addEventListener('keydown', function(e){
    if(e.keyCode == 36 && e.ctrlKey){
      var noteEls = Array.prototype.slice.call(document.querySelectorAll(`.note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
      noteEls[0].querySelector('.content').focus();
    }
    if(e.keyCode == 35 && e.ctrlKey){
      var noteEls = Array.prototype.slice.call(document.querySelectorAll(`.note${document.querySelectorAll('.showCompleted').length ? '':':not(.isComplete)' }`));
      var lastEl = noteEls[noteEls.length-1].querySelector('.content');
      lastEl.focus();
    }

    if(e.target.classList.contains('content')){
      var noteDiv = e.target.parentNode.parentNode.parentNode;
      var content = noteDiv.querySelector('.content');
      if(e.keyCode == 13 && e.ctrlKey) noteEvents(noteDiv, 'toggleComplete', e);
      if(e.keyCode == 13 && e.ctrlKey == false) noteEvents(noteDiv, 'new', e);
      if(e.keyCode == 38 && e.ctrlKey == false && e.shiftKey == false) noteEvents(noteDiv, 'navUp', e);
      if(e.keyCode == 40 && e.ctrlKey == false && e.shiftKey == false) noteEvents(noteDiv, 'navDown', e);
      if(e.keyCode == 37 && e.ctrlKey == false && e.shiftKey == false && ['start','empty'].includes(caret.pos(content))) noteEvents(noteDiv, 'navUpEnd', e);
      if(e.keyCode == 39 && e.ctrlKey == false && e.shiftKey == false && ['end','empty'].includes(caret.pos(content))) noteEvents(noteDiv, 'navDownStart', e);
      if(e.keyCode == 9 && e.shiftKey) noteEvents(noteDiv, 'outdent', e);
      if(e.keyCode == 9 && e.shiftKey == false) noteEvents(noteDiv, 'indent', e);
      if(e.keyCode == 38 && e.ctrlKey) noteEvents(noteDiv, 'repositionUp', e);
      if(e.keyCode == 40 && e.ctrlKey) noteEvents(noteDiv, 'repositionDown', e);
      if(e.keyCode == 8 && caret.get(e.target) == 0) noteEvents(noteDiv, 'delete', e);
    }
  });

  window.addEventListener('keypress', function(e){

  });

  window.addEventListener('hashchange', function(e){
    if(location.hash.substr(1,1) == '/'){
      document.querySelector('#breadcrumbs').innerHTML = '';
      if(document.querySelector('.zoom')) document.querySelector('.zoom').classList.remove('zoom');
      document.querySelector('body').dataset.display = 'outline';
      var id = location.hash.substr(2);
      if(model[id]){
        document.querySelector('body').classList.add('zooming');
        document.querySelector(`.note[data-id="${id}"]`).classList.add('zoom');
        document.querySelector('#outlineIcon').dataset.hashTarget = '/'+id;
        //add breadcrumbs
        var crumb = model[id];
        do{
          var span = document.createElement('span');
          if(crumb.content.length > 30) span.innerHTML = crumb.content.substr(0, 30).trim()+' ...';
          else span.innerHTML = crumb.content;
          span.dataset.hashTarget = '/'+crumb.id;
          document.querySelector('#breadcrumbs').prepend(span);
          crumb = modelRaw.find(x => x.id == crumb.parentId);
        } while(crumb);
      }
    }
    else if(location.hash == ''){
      document.querySelector('#breadcrumbs').innerHTML = '';
      document.querySelector('body').dataset.display = 'outline';
      document.querySelector('body').classList.remove('zooming');
      if(document.querySelector('.zoom')) document.querySelector('.zoom').classList.remove('zoom');
      document.querySelector('#outlineIcon').dataset.hashTarget = '';
    }
    else{
      switch(location.hash.substr(1)){
        case "inbox":
            document.querySelector('body').dataset.display = 'inbox';
        break;
        case "todo":
            document.querySelector('body').dataset.display = 'todo';
        break;
      }
    }

  });

}

var processText = require('./shared/processText');

function processContentInputSuperficial(el){
  var pos;
  if(el == document.activeElement) pos = caret.get(el);
  el.innerHTML = processText(el.innerText);
  if(pos && el == document.activeElement) caret.set(el, pos);
}

module.exports = InputManager;

},{"./noteEvents":8,"./search":9,"./shared/processText":11}],4:[function(require,module,exports){
function ajax(method, callback, data){

  if(data == null) data = {};
  if(callback == null) callback = function(){};

  var xhr = new XMLHttpRequest();
  xhr.open(method, 'api/', true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
          console.log(xhr.responseText);
          var json = JSON.parse(xhr.responseText);
          callback(json);
      }
  };
  if(data) console.log(data);
  if(method != 'GET') xhr.send(JSON.stringify(data));
  else xhr.send();
}

function get(callback){
  ajax('GET', callback);
}

function post(data, callback){
  ajax('POST', callback, data);
}

function put(data, callback){
  ajax('PUT', callback, data);
}

module.exports = {
  ajax,
  get,
  post,
  put
}

},{}],5:[function(require,module,exports){
module.exports = {
  get,
  set,
  pos
}

function get(el){
  var sel = window.getSelection();
  var range = new Range();
  range.setStart(el, 0);
  range.setEnd(sel.anchorNode, sel.anchorOffset);
  return range.toString().length;
}

function set(el, pos){

    // Loop through all child nodes
    for(var node of el.childNodes){
        if(node.nodeType == 3){ // we have a text node
            if(node.length >= pos){
                // finally add our range
                var range = document.createRange(),
                    sel = window.getSelection();
                range.setStart(node,pos);
                range.collapse(true);

                sel.removeAllRanges();
                sel.addRange(range);

                return -1; // we are done
            }else{
                pos -= node.length;
            }
        }else{
            pos = set(node,pos);
            if(pos == -1){
                return -1; // no need to finish the for loop
            }
        }
    }
    return pos; // needed because of recursion stuff
}

function pos(el){
  var pos = get(el);
  if(el.innerText.length == 0) return 'empty';
  else if(pos == el.innerText.length) return 'end';
  else if(pos == 0) return 'start';
  else return 'middle';
}

function caretInMiddle(div){
  return (caretAtStart(div) == false && caretAtEnd(div) == false);
}

function caretAtStart(div){
  if(getCaret(div) == 0) return true;
  else return false;
}

function caretAtEnd(div){
  if(getCaret(div) == div.innerText.length) return true;
  else return false;
}

},{}],6:[function(require,module,exports){
module.exports = {drawBox, updateBox, updateSelected, test};

function drawBox(date, target, selected){
  if(selected) selected.setHours(1,0,0,0);
  else selected = new Date(0);

  var div = document.createElement('div');
  div.classList.add('dateBox');

  updateBox(date, div, selected);

  target.appendChild(div);
}

function updateBox(date, div, selected){
  console.log(date);
  console.log('SELECTED')
  console.log(selected);
  if(selected == null){
    var selectedEl = div.querySelector('.selected');
    if(selectedEl) selected = new Date(parseInt(selectedEl.dataset.date));
    else selected = new Date(0);
  }
  console.log(selected);
  selected.setHours(1,0,0,0);

  var year = date.getFullYear();
  var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()];
  var days = ['M','T','W','H','F','S','U'];
  var today = new Date();
  today.setHours(1,0,0,0);
  var endDate = getEndDate(date);
  var startDate = getStartDate(date);
  console.log('START DATE')
  console.log(startDate);
  var dates = [];
  for(true; startDate<=endDate; startDate.setDate(startDate.getDate() +1)){
    console.log(startDate);
    console.log(selected);
    console.log(startDate.getTime());
    console.log(selected.getTime());
    if(startDate.getTime() == selected.getTime()) console.log('MATC!!!!')
    dates.push(new Date(startDate.getTime()));
  }
  console.log(dates);
  var prevMonthDate = getFirstDate(date);
  prevMonthDate.setDate(prevMonthDate.getDate() - 1);
  var nextMonthDate = getLastDate(date);
  nextMonthDate.setDate(nextMonthDate.getDate() + 1);

  console.log(div);

  div.innerHTML = `
  <div class='shell'>
    <div class='monthYear'><span class='changeMonth' data-date='${prevMonthDate.getTime()}'>&#8592;</span>${month} ${year}<span class='changeMonth' data-date='${nextMonthDate.getTime()}'>&#8594;</span></div>
    <div class='days'>
      ${days.map(x=> `<div>${x}</div>`).join('')}
    </div>
    <div class='dates'>
      ${dates.map((x,i) => `${i%7 == 0 ? `<div class="row">` : ''}<div data-date="${x.getTime()}" class="dateChoice ${x.getMonth() == date.getMonth() ? '' : ' otherMonth'}${(x.getTime() == today.getTime()) ? ' today' : ''}${(x.getTime() == selected.getTime()) ? ' selected' : ''}">${x.getDate()}</div>${i%7 == 6 ? `</div>` : ''}`).join('')}
    </div>
  </div>
  `;
}

function updateSelected(el){
  var selected = el.parentNode.parentNode.querySelector('.selected')
  if(selected) selected.classList.remove('selected');
  el.classList.add('selected');
}

function getFirstDate(date){
  var tempDate = new Date(date.getTime());
  tempDate.setDate(1);
  tempDate.setHours(1,0,0,0);
  return tempDate;
}

function getLastDate(date){
  var tempDate = new Date(date.getTime());
  tempDate.setDate(1);
  tempDate.setMonth(tempDate.getMonth()+1);
  tempDate.setDate(0);
  tempDate.setHours(1,0,0,0);
  return tempDate;
}

function getStartDate(date){
  var firstDate = getFirstDate(date);
  var firstDay = firstDate.getDay();
  var startDate = new Date(firstDate.getTime());
  startDate.setDate(startDate.getDate() - firstDay + 1);
  return startDate;
}

function getEndDate(date){
  var lastDate = getLastDate(date);
  var lastDay = lastDate.getDay();
  var endDate = new Date(lastDate.getTime());
  console.log(endDate);
  var toAdd = 7 - lastDay;
  endDate.setDate(endDate.getDate() + (toAdd == 7 ? 0 : toAdd));
  return endDate;
}

function test(){
  var tempDate = new Date();
  tempDate.setDate(tempDate.getDate() + 4)
  window.setTimeout(function(){drawBox(new Date(), document.querySelector('.contentHolder'), tempDate)}, 1000);
}

},{}],7:[function(require,module,exports){
module.exports = function(date){
  var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var today = new Date();
  today.setHours(1,0,0,0);
  date.setHours(1,0,0,0);
  var fac = 86400000;
  var diff = Math.floor((date - today) / fac);
  if(diff == 0) return 'today';
  else if(diff == 1) return 'tomorrow';
  else if(diff < 0){
    if(diff > -14){
      return -diff+' days ago';
    }
    else return Math.floor(-diff / 7)+' weeks ago';
  }
  else{
    if(diff >= 14) return 'in '+Math.round(diff / 7)+' weeks';
    else if((diff + day(today)) <= 6) return days[day(today, diff)];
    else if((diff + day(today)) <= 13) return 'next '+days[day(today, diff)];
    else return 'in '+diff+' days';
  }
}

function day(date, mod){
  if(!mod) mod = 0;
  date.setDate(date.getDate() + mod);
  var day = date.getDay();
  if(day == 0) day = 6;
  else day = day-1;
  return day;
}

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
module.exports = new Search();

function Search(){

}

Search.prototype.apply = function(){
  var founds = document.querySelectorAll('.found');
  for(var i = 0; i < founds.length; i++) {
    founds[i].classList.remove('found');
  }
  var foundAncestors = document.querySelectorAll('.foundAncestor');
  for(var i = 0; i < foundAncestors.length; i++) {
    foundAncestors[i].classList.remove('foundAncestor');
  }

  var val = document.querySelector('#searchBoxHolder input').value;

  if(val.trim() == '') document.body.classList.remove('searching');
  else document.body.classList.add('searching');

  var keys = val.split(' ');
  keys = keys.filter(x=> x!='');

  var founds = modelRaw.filter(function(x){
    for(var i = 0; i<keys.length; i++){
      if(x.content.includes(keys[i])) return true;
    }
  });

  var foundAncestors = [];

  founds.forEach(function(found){
    document.querySelector(`.note[data-id="${found.id}"]`).classList.add('found');
    var parent = model[found.parentId];
    while(parent !== undefined){
      if(foundAncestors.indexOf(parent.id) == -1) foundAncestors.push(parent.id);
      parent = model[parent.parentId];
    }
  });

  foundAncestors.forEach(function(foundAncestorId){
    document.querySelector(`.note[data-id="${foundAncestorId}"]`).classList.add('foundAncestor');
  });

}

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
var Change = require('./Change');

var cases = [];

module.exports = function(text, id, changeList){
  cases.forEach(function(rcase){
    //check for match(es), if none apply the false value
    if(changeList == undefined && rcase.waitForThrottle) return;
    console.log('backend?')
    if(rcase.regexp.test(text) == false){
      //only make the update if it's not already that value
      if(id != undefined && rcase.prop && rcase.updateValueFalse && model[id][rcase.prop] != rcase.updateValueFalse) new Change(id, [{prop:rcase.prop, value:rcase.updateValueFalse}], changeList);
    }
    //replace matches
    else text = text.replace(rcase.regexp, function(match){
      var original = arguments[arguments.length-1];
      var groups = [];
      for(var x = 1; x < arguments.length-2; x++){
        groups.push(arguments[x]);
      }

      var processResult;
      if(rcase.processFunc) processResult = rcase.processFunc(match, groups, original);

      //make changes to other properties if required
      if(id != undefined && rcase.prop){
        var updateResult;
        if(typeof rcase.updateTemplate === 'string' || rcase.updateTemplate instanceof String) updateResult = fill(rcase.updateTemplate, match, groups, original, processResult);
        else updateResult = rcase.updateTemplate;
        //only make changes if we need to
        if(model[id][rcase.prop] != updateResult) new Change(id, [{prop:rcase.prop, value:updateResult}], changeList);
      }

      return fill(rcase.replaceTemplate, match, groups, original, processResult);
    });
  });

  //always return manipulated text, even if it's not needed
  return text;
}

function fill(template, match, groups, original, processResult){
    return new Function("return `"+template+"`;").call({match:match, groups:groups, original:original, processResult:processResult});
}

function Case(options){
  var self = this;
  ['regexp', 'prop', 'updateTemplate', 'updateValueFalse', 'replaceTemplate', 'processFunc', 'waitForThrottle'].forEach(x=> self[x] = options[x]);
  cases.push(self);
}


// // = memo
new Case({
  regexp: /^\/\/.*/,
  prop: 'isMemo',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.original}',
  processFunc: null
});

// *-***** = project priority
new Case({
  regexp: /(^|\s)(\*{1,25})(\s|$)/,
  prop: 'isProjectAndIfSoPriority',
  updateTemplate: '${this.processResult}',
  updateValueFalse: false,
  replaceTemplate: '${this.groups[0]}<span class=\'priority\'>${this.groups[1]}</span>${this.groups[2]}',
  processFunc: function(match, groups, original){
    return groups[1].length;
  }
});

// ! = important
/*new Case({
  regexp: /(^|\s)(!)(\s|$)/,
  prop: 'isImportant',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.groups[0]}<span class=\'important\'>${this.groups[1]}</span>${this.groups[2]}',
  processFunc: null
});
*/

// https://mail.google.com/mail/?=? = email icon link
new Case({
  regexp: /(https\:\/\/mail\.google\.com\/mail\/\S*)=(\S+)\s/g,
  prop: null,
  updateTemplate: null,
  updateValueFalse: null,
  replaceTemplate: '<span class="email fas fa-envelope"></span><a contenteditable=false href="${this.groups[0]}"><span contenteditable="false" class="hidden">${this.groups[0]}=</span>${this.groups[1]}</a>&nbsp;',
  processFunc: function(match, groups, original){

  }
});

// ?.?=? = link
new Case({
  regexp: /(\S+\.\S+)=(\S+)\s/g,
  prop: null,
  updateTemplate: null,
  updateValueFalse: null,
  replaceTemplate: '${this.processResult}',
  processFunc: function(match, groups, original){
    var proto = '';
    if(match.substr(0,5) != 'http:' && match.substr(0,6) != 'https:' && match.substr(0,5) != 'file:') proto = 'http://';
    return `<a contentEditable="false" href="${proto}${groups[0]}"><span class="hidden" contenteditable="false">${groups[0]}=</span>${groups[1]}</a>&nbsp;`;
  }
});

// #tag
new Case({
  regexp: /#(\S+)(\s|$)/g,
  prop: null,
  updateTemplate: null,
  updateValueFalse: null,
  replaceTemplate: '<span class=\'tag\' data-tag=\'#${this.groups[0]}\'>#${this.groups[0]}</span>${this.groups[1]}',
  processFunc: null
});

//due date
new Case({
  waitForThrottle: true,
  regexp: /(?:^|\s)due (?:(today|tomorrow)|(next )?((?:mon|tues|wednes|thurs|fri|sat|sun)day)|(next week|next month)|(in) (?:(1) (week|day|month)|(\d*) (days|weeks|months)))(?:\s|$)/,
  prop: 'dueDate',
  updateTemplate: '${this.processResult.toISOString()}',
  updateValueFalse: undefined,
  replaceTemplate: '',
  replacePermanently: true,
  processFunc: function(match, groups, original){
    var date = new Date();
    date.setHours(9,0,0,0);
    groups.unshift('');
    if(groups[1]){
      if(groups[1] == 'today') return date;
      else{
        date.setDate(date.getDate()+1);
        return date;
      }
    }
    else if(groups[3]){
      var nextExplicit = false;
      if(groups[2] == 'next') nextExplicit = true;
      var day = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(groups[3].substr(0,1).toUpperCase()+groups[3].substr(1).toLowerCase());
      return getNextXDay(date, day, nextExplicit);
    }
    else if(groups[4]){
      if(groups[4] == 'next week'){
        return getNextXDay(date, 0);
      }
      else if(groups[4] == 'next month'){
        date.setMonth(date.getMonth()+1);
        date.setDate(1);
        return date;
      }
    }
    else if(groups[6]){
      if(groups[7] == 'day'){
        date.setDate(date.getDate()+1);
        return date;
      }
      if(groups[7] == 'week'){
        date.setDate(date.getDate()+7);
        return date;
      }
      if(groups[7] == 'month'){
        date.setDate(date.getDate()+30);
        return date;
      }
    }
    else{
      var quant = parseInt(groups[8]);
      var days;
      switch(groups[9]){
        case "days":
          days = quant;
        break;
        case "weeks":
          days = quant * 7;
        break;
        case "months":
          days = quant * 30;
        break;
        date.setDate(date.getDate()+days);
        return date;
      }
    }
  }
});

// ~4h time estimate
/*
new Case({
  regexp: /(^|\s)~(?!(?:\s|$))((?:\d?\d(?:\.\d)?h)?(?:\d?\dm)?)(\s|$)/,
  prop: 'hasTimeEstimate',
  updateTemplate: '${this.groups[1]}',
  updateValueFalse: null,
  replaceTemplate: '${this.groups[0]}<span class=\'timeEstimate\'>~${this.groups[1]}</span>${this.groups[2]}',
  processFunc: null
});
*/

/*
new Case({
  regexp: ,
  prop: ,
  updateTemplate: ,
  updateValueFalse: ,
  replaceTemplate: ,
  processFunc:
});
*/

var dateRegexes = [
  /a/,
  /b/
];

dateRegexes.forEach(function(regex){

});


function getDay(date, mod){
  if(!mod) mod = 0;
  date.setDate(date.getDate() + mod);
  var day = date.getDay();
  if(day == 0) day = 6;
  else day = day-1;
  return day;
}

function getNextXDay(date, day, explicitNext){ //0 = monday
  var dateDay = getDay(date);
  var diff;
  if(day==dateDay) diff = 7;
  if(day<dateDay) diff = 7-(dateDay-day);
  if(day>dateDay){
    if(explicitNext) diff = day-dateDay+7;
    else diff = day-dateDay;
  }
  var tempDate = new Date();
  tempDate.setDate(date.getDate() + diff);
  return tempDate;
}

},{"./Change":10}],12:[function(require,module,exports){
function Throttle(seconds){
  this.seconds = seconds;
}

Throttle.prototype.input = function(id, content){
  var self = this;
  self.clear();
  self.id = id;
  self.content = content;
  self.countdown = window.setTimeout(function(){self.send();}, self.seconds * 1000);
}

Throttle.prototype.send = function(){
  console.log('THROTTLE SENDING')
  var self = this;
  changeManager.change(self.id, [{prop:"content", value:self.content}]);
  self.clear();
}

Throttle.prototype.clear = function(){
  var self = this;
  if(self.countdown) window.clearTimeout(self.countdown);
  self.id = undefined;
  self.content = undefined;
}

module.exports = new Throttle(1);

},{}]},{},[1]);
