(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./modules/ChangeManager":2,"./modules/InputManager":3,"./modules/ajax":4,"./modules/shared/processText":7}],2:[function(require,module,exports){
var Change = require('./shared/Change');

function ChangeManager(){

}

ChangeManager.prototype.change = function(id, changes){

  changes.forEach(function(change){
    if(change.value === true) change.value = 1;
    if(change.value === false) change.value = 0;
  });

  changes.push({prop:'dateUpdated', value: Date.now()})

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
    var div = document.querySelector(`.note[data-id="${id}"]`);
    if(div == undefined) return;
    var update = updates[id];
    if(update.hasOwnProperty('content')){
      var el = div.querySelector('.content');
      var pos;
      if(el == document.activeElement) pos = getCaretPosition(el);
      el.innerHTML = update.content;
      if(pos && el == document.activeElement) setCaretPosition(el, pos);
    }
    applyClasses.forEach(function(className){
      if(update.hasOwnProperty(className)){
        if(update[className] != false) div.classList.add(className)
        else div.classList.remove(className);
      }
    });
  });
}

function getCaretPosition(el){
  var sel = window.getSelection();
  var range = new Range();
  range.setStart(el, 0);
  range.setEnd(sel.anchorNode, sel.anchorOffset);
  return range.toString().length;
}

function setCaretPosition(el, pos){

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
            pos = setCaretPosition(node,pos);
            if(pos == -1){
                return -1; // no need to finish the for loop
            }
        }
    }
    return pos; // needed because of recursion stuff
}

},{"./shared/Change":6}],3:[function(require,module,exports){
var search = require('./search');

function InputManager(){

  window.addEventListener('click', function(e){
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
      var note = model[e.target.parentNode.parentNode.parentNode.dataset.id];
      var makeItCollapsed = null;
      if(note.isCollapsed) makeItCollapsed = false;
      else makeItCollapsed = true;
      changeManager.change(note.id, [{prop:"isCollapsed", value:makeItCollapsed}]);
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
    if(e.target.classList.contains('content')){
      if(e.keyCode == 13 && e.ctrlKey){
        var note = model[e.target.parentNode.parentNode.parentNode.dataset.id];
        changeManager.change(note.id, [{prop:"isCompleteOrigin", value:(note.isCompleteOrigin ? false : true)}]);
      }
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

var throttle = new Throttle(1);

var processText = require('./shared/processText');

function processContentInputSuperficial(el){
  var pos;
  if(el == document.activeElement) pos = getCaretPosition(el);
  el.innerHTML = processText(el.innerText);
  if(pos && el == document.activeElement) setCaretPosition(el, pos);
}

module.exports = InputManager;

function getCaretPosition(el){
  var sel = window.getSelection();
  var range = new Range();
  range.setStart(el, 0);
  range.setEnd(sel.anchorNode, sel.anchorOffset);
  return range.toString().length;
}

function setCaretPosition(el, pos){

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
            pos = setCaretPosition(node,pos);
            if(pos == -1){
                return -1; // no need to finish the for loop
            }
        }
    }
    return pos; // needed because of recursion stuff
}

},{"./search":5,"./shared/processText":7}],4:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
var Change = require('./Change');

var cases = [];

module.exports = function(text, id, changeList){
  cases.forEach(function(rcase){
    //check for match(es), if none apply the false value
    if(rcase.regexp.test(text) == false){
      if(id != undefined && rcase.prop) new Change(id, [{prop:rcase.prop, value:rcase.updateValueFalse}], changeList);
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
        new Change(id, [{prop:rcase.prop, value:updateResult}], changeList);
        model[id][rcase.prop]
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
  ['regexp', 'prop', 'updateTemplate', 'updateValueFalse', 'replaceTemplate', 'processFunc'].forEach(x=> self[x] = options[x]);
  cases.push(self);
}

// // = note
new Case({
  regexp: /^\/\/.*/,
  prop: 'isNoteOrigin',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.original}',
  processFunc: null
});

// *-***** = project priority
new Case({
  regexp: /(^|\s)(\*{1,5})(\s|$)/,
  prop: 'isProjectPriority',
  updateTemplate: '${this.processResult}',
  updateValueFalse: false,
  replaceTemplate: '${this.groups[0]}<span class=\'priority\'>${this.groups[1]}</span>${this.groups[2]}',
  processFunc: function(match, groups, original){
    return groups[1].length;
  }
});

// ! = important
new Case({
  regexp: /(^|\s)(!)(\s|$)/,
  prop: 'isImportant',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.groups[0]}<span class=\'important\'>${this.groups[1]}</span>${this.groups[2]}',
  processFunc: null
});

// [+] = workable
new Case({
  regexp: /\[\+\]/,
  prop: 'isWorkable',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.match}',
  processFunc: null
});

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

new Case({
  regexp: /(^|\s)~(?!(?:\s|$))((?:\d?\d(?:\.\d)?h)?(?:\d?\dm)?)(\s|$)/,
  prop: 'hasTimeEstimate',
  updateTemplate: '${this.groups[1]}',
  updateValueFalse: null,
  replaceTemplate: '${this.groups[0]}<span class=\'timeEstimate\'>~${this.groups[1]}</span>${this.groups[2]}',
  processFunc: null
});


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

},{"./Change":6}]},{},[1]);
