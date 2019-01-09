(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//initialise model
require('./modules/frontend/model/model').initialise(function(model){
  //then
  //setup event listeners
  require('./modules/frontend/events/listeners')(model);
  //draw the loaded data
  require('./modules/frontend/dom/initial-draw')(model);
  //set id of last confirmed change
  require('./modules/frontend/operations-wrappers/change-history').setOffset(model.currentChange);
  //pick up the required bullet from the url if necessary
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  //perhaps load any display settings saved in localstorage if necessary?
});

},{"./modules/frontend/dom/initial-draw":5,"./modules/frontend/events/listeners":10,"./modules/frontend/model/model":23,"./modules/frontend/operations-wrappers/change-history":24}],2:[function(require,module,exports){
module.exports = {
  prevSibling: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var siblings = el.closest('.notesContainer').querySelectorAll(`[data-id="${el.parentNode.parentNode.dataset.id}"]>.children>.note`);
    siblings = [...siblings];
    if(filters){
      filters.forEach(function(filter){
        siblings = siblings.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    var index = siblings.indexOf(el);
    if(index == 0) return null;
    else return siblings[index-1];
  },
  nextSibling: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var siblings = el.closest('.notesContainer').querySelectorAll(`[data-id="${el.parentNode.parentNode.dataset.id}"]>.children>.note`);
    siblings = [...siblings];
    if(filters){
      filters.forEach(function(filter){
        siblings = siblings.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    var index = siblings.indexOf(el);
    if(index == siblings.length-1) return null;
    else return siblings[index+1];
  },
  prevInView: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var cousins = el.closest('.notesContainer').querySelectorAll(`.note`);
    cousins = [...cousins];
    if(filters){
      filters.forEach(function(filter){
        cousins = cousins.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    var index = cousins.indexOf(el);
    if(index == 0) return null;
    else return cousins[index-1];
  },
  nextInView: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var cousins = el.closest('.notesContainer').querySelectorAll(`.note`);
    cousins = [...cousins];
    if(filters){
      filters.forEach(function(filter){
        cousins = cousins.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    var index = cousins.indexOf(el);
    if(index == cousins.length-1) return null;
    else return cousins[index+1];
  },
  firstInView: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var cousins = el.closest('.notesContainer').querySelectorAll(`.note`);
    cousins = [...cousins];
    if(filters){
      filters.forEach(function(filter){
        cousins = cousins.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    if(cousins.length > 0) return cousins[0];
    else return null;
  },
  lastInView: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var cousins = el.closest('.notesContainer').querySelectorAll(`.note`);
    cousins = [...cousins];
    if(filters){
      filters.forEach(function(filter){
        cousins = cousins.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    if(cousins.length > 0) return cousins[cousins.length-1];
    else return null;
  },
  children: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Children finder: Could not find a note element based on the element passed.');
      return null;
    }
    var children = document.querySelectorAll(`.note[data-id="${el.dataset.id}"]>.children>.note`);
    children = [...children];
    if(filters){
      filters.forEach(function(filter){
        children = children.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    return children;
  },
  flashHighlight(el){
    if(el.classList.contains('content') == false) el = el.querySelector('.content');
    if(el.classList.contains('flashHighlight')) el.classList.remove('flashHighlight');
    requestAnimationFrame(function(){
      el.classList.add('flashHighLight');
      window.setTimeout(function(){
        el.classList.remove('flashHighLight');
      }, 1000);
    });
  }

}

},{}],3:[function(require,module,exports){
var updateNoteInstances = require('./update-note-instances');

module.exports = function(changes){
  Object.getOwnPropertyNames(changes).forEach(function(id){
    updateNoteInstances(id, changes[id]);
  });
}

},{"./update-note-instances":8}],4:[function(require,module,exports){
module.exports = `
<div class='filterComponent'></div>
`;

/*

<div id='topbar'>
  <div id='navigation'>
    <div id='navigationHome' class="fas fa-home" data-hash-target=''></div>
    <div id='breadcrumbs'></div>
  </div>
  <div id='inboxIcon' class="fas fa-inbox" data-hash-target='inbox'></div>
  <div id='outlineIcon' class="fas fa-list-ul" data-hash-target=''></div>
  <div id='todoIcon' class="fas fa-clipboard-list" data-hash-target='todo'></div>
  <div id='toggleCompleted' class="far fa-check-square"></div>
  <div id='search'><div id='searchBoxHolder'><input type='text' placeholder='&#xF002;'></input></div></div>
</div>

*/

},{}],5:[function(require,module,exports){
var outlineComponent = require('./outline-component');
var newNoteDiv = require('./new-note-div');
var updateNoteNode = require('./update-note-node');

//create a new outline component in panel1
module.exports = function(model){

  document.querySelector('#panel1').appendChild(outlineComponent('OUTLINE'));
  document.querySelector('#panel2').appendChild(outlineComponent('OUTLINE'));

  //for each outline component, populate the notes which should be there
  [].forEach.call(document.querySelectorAll('[data-outline-component]'), function(component){
    var holdingPen = component.querySelector('.holdingPen');
    orderNotes(model.raw.filter(x => x.parentId == component.dataset.topLevelId)).forEach(function(note){
      drawNote(note, holdingPen, model);
    });
  });

  //TODO later here draw the priority view and todo view

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

function drawNote(note, holdingPen, model){
  var div = newNoteDiv(note.id);
  holdingPen.appendChild(div);
  updateNoteNode(div, note, true);
  var divChildrenHolder = div.querySelector('.children');
  var childrenRaw = model.raw.filter(x => x.parentId == note.id);
  var children = orderNotes(childrenRaw);
  children.forEach(function(child){
    drawNote(child, holdingPen, model);
  });
}

},{"./new-note-div":6,"./outline-component":7,"./update-note-node":9}],6:[function(require,module,exports){
module.exports = function(id){
  var div = document.createElement('div');
  div.dataset.id = id;
  div.classList.add('note');
  div.innerHTML = `
    <div class='topLine'>
      <div class='left'>
        <div class='toggle' data-events-handler='toggle'></div>
        <div class='bullet' draggable='true'></div>
      </div>
      <div class='contentHolder'><div class='dragDropTop'></div><div class='dragDropBottom'></div>
        <div class='content' contenteditable='true' data-events-handler='note-content'></div>
        <div class='dueDate' data-date=''><span class='clearDate'></span></div>
      </div>
    </div>
    <div class='children'></div>
  `;
  return div;
}

},{}],7:[function(require,module,exports){
var filterComponent = require('./filter-component');

module.exports = function(topLevelId){
  var div = document.createElement('div');
  div.dataset.outlineComponent = true;
  div.dataset.topLevelId = topLevelId;
  div.dataset.id = topLevelId;
  div.innerHTML = `
    ${filterComponent}
    <div class='notesContainer' data-id='${topLevelId}'>
      <div class='children'></div>
    </div>
    <div class='holdingPen'></div>
  `;
  return div;
}

},{"./filter-component":4}],8:[function(require,module,exports){
var newNoteDiv = require('./new-note-div');
var updateNoteNode = require('./update-note-node');
var model = require('../model/model');

module.exports = function(id, changes){
  //find all examples of the note within the DOM
  if(id != 'NEW' && document.querySelector(`[data-id="${id}"]`) == null){
    [].forEach.call(document.querySelectorAll(`:not(.notesContainer)[data-id="${model.names[id].parentId}"]`), function(parentDiv){
      var div = newNoteDiv(id);
      parentDiv.querySelector('.children').appendChild(div);
    });
  }
  [].forEach.call(document.querySelectorAll(`[data-id="${id}"]`), function(div){
    updateNoteNode(div, changes);
  });
}

},{"../model/model":23,"./new-note-div":6,"./update-note-node":9}],9:[function(require,module,exports){
var domHelpers = require('./dom-helpers');
var caret = require('../utils/caret');
var isVisible = require('../utils/is-visible');

module.exports = function(div, changes, initialDraw=false){
  //list changes which get applied as class changes
  ['isParent', 'isCollapsed', 'isComplete', 'isDescendantOfComplete'].forEach(function(prop){
    if(changes.hasOwnProperty(prop)){
      if(changes[prop] == true || changes[prop] == 1) div.classList.add(prop);
      else div.classList.remove(prop);
    }
  });
  //if we currently have focus on the content field, will need to reset the cursor after things have been changed
  var resetCursor = false;
  var contentEl = div.querySelector('.content');
  if(contentEl == document.activeElement){
    resetCursor = true;
    var pos = caret.get(contentEl);
    var prev = domHelpers.prevInView(div);
    var next = domHelpers.nextInView(div);
  }

  //list changes that get applied as dataset changes, if any?
  //additional changes, e.g. displaying the new date in a dateBox
  //position changes - what to do if div should no longer be there? (moved out of inbox, or is deleted) - move to holdingPen
  if(changes.hasOwnProperty('parentId')){
    var parentDiv = div.closest('[data-outline-component]').querySelector(`[data-id="${changes.parentId}"] .children`);
    if(changes.parentId == 'DELETED' || changes.parentId == 'NEW') parentDiv = div.closest('[data-outline-component]').parentNode.querySelector('.holdingPen');
    var precedingDiv = parentDiv.querySelector(`.note[data-id="${changes.precedingId}"]`);
    var nextDiv = parentDiv.querySelector('.note');
    if(precedingDiv) nextDiv = precedingDiv.nextSibling;
    parentDiv.insertBefore(div, nextDiv);
    if(initialDraw != true) domHelpers.flashHighlight(div);
  }
  else if(changes.hasOwnProperty('precedingId')){

  }
  //the content itself
  if(changes.hasOwnProperty('content')){
    div.querySelector('.content').innerHTML = changes.content;
  }
  //reset the cursor
  if(resetCursor){
    if(isVisible(div)){
      contentEl.focus();
      caret.set(contentEl, pos);
    }
    else if(prev){
      var content = prev.querySelector('.content');
      content.focus();
      caret.set(content, content.innerHTML.length);
      //TODO find the next nearest element (previous or following) - actually maybe this shouldn't happen here? if we are doing
      //something to an element which causes it to disappear (dragging and dropping), shouldn't focus pass to the element on the other side?
      //so it should be handled by whatever is causing that change?
      //or should be handled here depending on what's just happened
      //here we can do a generic solution, then anything that needs to can override that, e.g. dragging and dropping
    }
    else if(next){
      var content = next.querySelector('.content');
      content.focus();
      caret.set(content, content.innerHTML.length);
    }
  }
}

},{"../utils/caret":31,"../utils/is-visible":32,"./dom-helpers":2}],10:[function(require,module,exports){
//listen for these events
var events = ['click', 'input', 'focusin', 'focusout', 'beforeunload', 'keydown', 'hashchange'];

var properCase = require('../utils/proper-case');
var mapping = require('./mapping/mapping');

module.exports = function(model){

  //pass to relevant handlers
  events.forEach(function(event){
    window.addEventListener(event, function(e){
      var t = e.target;

      //catch unloading
      if(event == 'beforeunload' && mapping.window.beforeunload(e)){
        e.preventDefault();
        e.returnValue = '';
        return false;
      }

      var proper = properCase(event);
      if(t instanceof HTMLElement && t.dataset.hasOwnProperty('eventsHandler'+proper) && mapping.hasOwnProperty(t.dataset['eventsHandler'+proper])) mapping[t.dataset['eventsHandler'+proper]][event](e, model);
      else if(t instanceof HTMLElement && t.dataset.hasOwnProperty('eventsHandler') && mapping.hasOwnProperty(t.dataset.eventsHandler) && mapping[t.dataset.eventsHandler].hasOwnProperty(event)) mapping[t.dataset.eventsHandler][event](e, model);
    });
  });

}

},{"../utils/proper-case":33,"./mapping/mapping":17}],11:[function(require,module,exports){
module.exports = {};

},{}],12:[function(require,module,exports){
module.exports = function(element){
  var note = element.closest('.note');
  if(note != null){
    return note.dataset.id;
  }
  else return null;
}

},{}],13:[function(require,module,exports){
var actions = require('./actions');

module.exports = function(name, func){
  actions[name] = func;
}

},{"./actions":11}],14:[function(require,module,exports){
var Action = require('./new-action');
var undoRedo = require('../../../operations-wrappers/undo-redo');
var caret = require('../../../utils/caret');
var getId = require('./get-id-from-dom-element');
var throttle = require('./throttle');
var generateId = require('../../../../shared/operations/generate-id');
var domHelpers = require('../../../dom/dom-helpers');

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

new Action('OUTDENT', function(e){
  e.preventDefault();
  var id = getId(e.target);
  var parent = model.names[model.names[id].parentId];
  if(parent.id != 'OUTLINE' && parent.id != 'INBOX'){
    parentParent = model.names[parent.parentId];
    undoRedo.new([{id:id, operation:'move', data:{parentId:parentParent.id, precedingId:parent.id}}]);
  }
  e.target.focus();
});

new Action('REPOSITION_UP', function(e){
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

new Action('REPOSITION_DOWN', function(e){
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


new Action('TOGGLE_COMPLETE', function(e){
  e.preventDefault();
  var id = getId(e.target);
  var newValue = true;
  if(model.names[id].isComplete == true) newValue = false;
  undoRedo.new([{id:id, operation:'setProp', data:{prop:'isComplete', value:newValue}}]);
});

new Action('BACKSPACE_DELETE_NOTE', function(e){
  e.preventDefault();
  var id = getId(e.target);
  var prev = domHelpers.prevSibling(e.target);
  var prevCousin = domHelpers.prevInView(e.target);
  if(prev && prev.querySelector('.content').innerText == ''){
    undoRedo.new([{id:prev.dataset.id, operation:'move', data:{parentId:'DELETED', precedingId:null}}]);
    //NOW UNNECESSARY TODO REMOVE e.target.focus();
  }
  else if(e.target.innerText == ''){
    undoRedo.new([{id:id, operation:'move', data:{parentId:'DELETED', precedingId:null}}]);
    /*NOW UNNECESSARY TODO REMOVE
    if(prev) prev.querySelector('.content').focus();
    else if(prevCousin) prevCousin.querySelector('.content').focus();
    else actions['NAV_FIRST_NOTE'](e);
    */
  }
});

new Action('TOGGLE_CHILDREN', function(e){
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
  throttle.input(getId(e.target), e.target.innerText);
});

new Action('FORCE_THROTTLE', function(e){
  if(throttle.id) throttle.send();
});

},{"../../../../shared/operations/generate-id":36,"../../../dom/dom-helpers":2,"../../../operations-wrappers/undo-redo":28,"../../../utils/caret":31,"./get-id-from-dom-element":12,"./new-action":13,"./throttle":16}],15:[function(require,module,exports){
var sync = require('../../../operations-wrappers/sync-stack');
var domHelpers = require('../../../dom/dom-helpers');
var caret = require('../../../utils/caret');
var Action = require('./new-action');
//superficial actions like changes to the display

//operations which require to go through the operations-wrappers
new Action('PANEL_SLIDE', function(e){
  document.querySelector('#panelsHolder').className = e.target.dataset.panel;
});


new Action('NAV_UP', function(e){
  var prev = domHelpers.prevInView(e.target);
  if(prev) prev.querySelector('.content').focus();
});
new Action('NAV_UP_TO_END', function(e){
  e.preventDefault();
  var prev = domHelpers.prevInView(e.target);
  if(prev){
    var content = prev.querySelector('.content');
    content.focus();
    caret.set(content, content.innerText.length);
  }
});

new Action('NAV_DOWN', function(e){
  var next = domHelpers.nextInView(e.target);
  if(next) next.querySelector('.content').focus();
});
new Action('NAV_DOWN_TO_START', function(e){
  e.preventDefault();
  var next = domHelpers.nextInView(e.target);
  if(next){
    var content = next.querySelector('.content');
    content.focus();
    caret.set(content, 0);
  }
});

new Action('NAV_FIRST_NOTE', function(e){
  var first = domHelpers.firstInView(e.target);
  if(first) first.querySelector('.content').focus();
});

new Action('NAV_LAST_NOTE', function(e){
  var last = domHelpers.lastInView(e.target);
  if(last) last.querySelector('.content').focus();
});

new Action('ALERT', function(e){

});

new Action('BEFORE_UNLOAD', function(e){
  return sync.isClear();
});

},{"../../../dom/dom-helpers":2,"../../../operations-wrappers/sync-stack":27,"../../../utils/caret":31,"./new-action":13}],16:[function(require,module,exports){
var undoRedo = require('../../../operations-wrappers/undo-redo');

var timeoutSeconds = 1;

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
  //only make a change if there's really something to change
  if(self.content != model.names[self.id].content) undoRedo.new([{id:self.id, operation:'setProp', data:{prop:'content', value:self.content}}]);
  self.clear();
}

Throttle.prototype.clear = function(){
  var self = this;
  if(self.countdown) window.clearTimeout(self.countdown);
  self.id = undefined;
  self.content = undefined;
}

module.exports = new Throttle(timeoutSeconds);

},{"../../../operations-wrappers/undo-redo":28}],17:[function(require,module,exports){
module.exports = mapping = [];

Mapping = function(name, eventsToActions){
  mapping[name] = {};
  Object.getOwnPropertyNames(eventsToActions).forEach(function(prop){
    if(typeof eventsToActions[prop] == "string"){
      mapping[name][prop] = function(e, model){
        return actions[eventsToActions[prop]](e, model);
      }
    }
    else if(typeof eventsToActions[prop] == "function"){
      mapping[name][prop] = eventsToActions[prop];
    }
  });
}

//require all specific mapping files here
require('./specifics/note-content');
require('./specifics/toggle');
require('./specifics/panel');
require('./specifics/window');
require('./specifics/body');

require('./actions/operation-actions');
require('./actions/superficial-actions');
actions = require('./actions/actions');

window.mapping = mapping;

},{"./actions/actions":11,"./actions/operation-actions":14,"./actions/superficial-actions":15,"./specifics/body":18,"./specifics/note-content":19,"./specifics/panel":20,"./specifics/toggle":21,"./specifics/window":22}],18:[function(require,module,exports){
new Mapping('body', {
  'keydown': function(e){
    switch(e.keyCode){
      //ctrl+z
      case 90:
        if(e.ctrlKey){
          actions['UNDO'](e, model);
        }
      break;
      //ctrl+y
      case 89:
        if(e.ctrlKey){
          actions['REDO'](e, model);
        }
      break;
      //ctrl+s
      case 83:
        if(e.ctrlKey){
          //just do nothing to prevent save window
          e.preventDefault();
          e.stopPropagation();
        }
      break;
    }
  }
});

},{}],19:[function(require,module,exports){
var caret = require('../../../utils/caret');

new Mapping('note-content', {
  'click': 'ALERT',
  'keydown': function(e, model){
    switch(e.keyCode){
      //enter
      case 13:
        if(e.ctrlKey) actions['TOGGLE_COMPLETE'](e, model);
        else actions['ENTER_NEW_NOTE'](e, model);
      break;
      //backspace
      case 8:
        if(e.ctrlKey==false && e.shiftKey==false && caret.get(e.target) == 0 && window.getSelection().isCollapsed) actions['BACKSPACE_DELETE_NOTE'](e, model);
      break;
      //tab
      case 9:
        if(e.shiftKey) actions['OUTDENT'](e, model);
        else actions['INDENT'](e, model);
      break;
      //up
      case 38:
        if(e.ctrlKey) actions['REPOSITION_UP'](e, model);
        else actions['NAV_UP'](e, model);
      break;
      //down
      case 40:
        if(e.ctrlKey) actions['REPOSITION_DOWN'](e, model);
        else actions['NAV_DOWN'](e, model);
      break;
      //left
      case 37:
        if(e.ctrlKey == false && e.shiftKey == false && caret.pos(e.target) == 'start') actions['NAV_UP_TO_END'](e, model);
      break;
      //right
      case 39:
        if(e.ctrlKey == false && e.shiftKey == false && caret.pos(e.target) == 'end') actions['NAV_DOWN_TO_START'](e, model);
      break;
      //ctrl+home
      case 36:
        if(e.ctrlKey) actions['NAV_FIRST_NOTE'](e, model);
      break;
      //ctrl+end
      case 35:
        if(e.ctrlKey) actions['NAV_LAST_NOTE'](e, model);
      break;
      //Using default to redirect any keystrokes not caught to body listener
      default:
        mapping['body']['keydown'](e, model);
      break;
    }
  },
  'input': 'INPUT_CONTENT',
  'focusout': 'FORCE_THROTTLE'
});

},{"../../../utils/caret":31}],20:[function(require,module,exports){
new Mapping('panel', {
  'click': 'PANEL_SLIDE'
});

},{}],21:[function(require,module,exports){
new Mapping('toggle', {
  'click': 'TOGGLE_CHILDREN'
});

},{}],22:[function(require,module,exports){
var domHelpers = require('../../../dom/dom-helpers');

new Mapping('window', {
  'beforeunload': 'BEFORE_UNLOAD',
  'keydown': function(e){
    switch(e.keyCode){
      case 36:
        if(e.ctrlKey){
          //TODO figure out a way to choose which panel to select, if no note currently has cursor
          //TODO this event should go on the holder itself
        }
      break;
      case 90:
        if(e.ctrlKey){
          actions['UNDO'](e, model);
        }
      case 89:
        if(e.ctrlKey){
          actions['REDO'](e, model);
        }
      break;
    }
  }
});

},{"../../../dom/dom-helpers":2}],23:[function(require,module,exports){
var ajax = require('../utils/ajax');

module.exports = model = {};

model.initialise = function(callback){

  ajax.get(function(data){
    model.raw = data.model;
    model.names = {};
    model.raw.forEach(function(note){
      model.names[note.id] = note;
    });
    model.currentChange = data.currentChange;

    callback(model);

  });
}

model.update = function(newModel){
  model.raw = newModel.raw;
  model.names = {};
  model.raw.forEach(function(note){
    model.names[note.id] = note;
  });
}

},{"../utils/ajax":30}],24:[function(require,module,exports){
var Tree = require('../../shared/operations/Tree');

module.exports = changeHistory = {};

changeHistory.setOffset = function(lastConfirmed){
  this.offset = lastConfirmed;
  this.setLastConfirmed(lastConfirmed);
}

changeHistory.stack = [];

changeHistory.add = function(operations, rollbackChanges, index=this.stack.length+1){
  this.stack.splice(index, 0, {operations:operations, rollbackChanges:rollbackChanges});
}

changeHistory.updateRollbackChanges = function(rollbackChanges, index){
  this.stack[index].rollbackChanges = rollbackChanges;
}

changeHistory.setLastConfirmed = function(lastConfirmed){
  this.lastConfirmed = lastConfirmed;
}

changeHistory.getLastConfirmed = function(){
  return this.lastConfirmed;
}

changeHistory.rollback = function(index){
  if(this.stack.length == 0) return;
  index = index - this.offset;
  var tree = new Tree(model);
  for(i = this.stack.length-1; i--; i>=index){
    tree.apply(this.stack[i].rollbackChanges);
  }
  model.raw = tree.model.raw;
  model.names = tree.model.names;
}

},{"../../shared/operations/Tree":34}],25:[function(require,module,exports){
var model = require('../model/model');

module.exports = function(actions){
  return actions.map(x=> getInverse(x));
}

function getInverse(action){
  /*inverse of set, is set the value to its current value
  of move is move the item to where it is now
  of delete, is move the item to where it is now (because delete is the same as move)
  of new is ... move the item to 'uncreated'. then when creating items, just need to remember to check in 'uncreated' before creating if necessary
  */
  switch(action.operation){
    case 'setProp':
      var oldValue = null;
      if(model.names[action.id]) oldValue = model.names[action.id][action.data.prop];
      if(oldValue == undefined) oldValue = null;
      return {id:action.id, operation: 'setProp', data:{prop: action.data.prop, value: oldValue}};
    break;
    //these two are the same, so nothing for move and no break statement
    case 'move':
    case 'delete':
      return {id:action.id, operation: 'move', data:{parentId: model.names[action.id].parentId, precedingId: model.names[action.id].precedingId}};
    break;
    case 'create':
      return {id:action.id, operation: 'move', data:{parentId: 'NEW', precedingId: null}};
    break;
  }
}

},{"../model/model":23}],26:[function(require,module,exports){
//carry out the operation on the current model, update the results, and draw the results
var model = require('../model/model');
var Tree = require('../../shared/operations/Tree');
var getDeepInverse = require('../../shared/operations/get-deep-inverse');
var drawChanges = require('../dom/draw-changes');

var tempOrderNotes = require('../temp-order-notes');

module.exports = function(operations){

  var changes = {};
  var tree = new Tree(model);
  operations.forEach(function(operation){
    changes = tree[operation.operation](operation.id, operation.data, changes);
    //apply the changes to the temporary model created inside the tree
    tree.apply(changes);
  });

  var deepInverse = getDeepInverse(changes, model);

  //apply the changes to the real model
  model.update(tree.model);

  //draw the changes to the DOM
  drawChanges(changes);

  return deepInverse;
}

},{"../../shared/operations/Tree":34,"../../shared/operations/get-deep-inverse":37,"../dom/draw-changes":3,"../model/model":23,"../temp-order-notes":29}],27:[function(require,module,exports){
var pollSeconds = 5;

var operate = require('./operate');
var changeHistory = require('./change-history');
var ajax = require('../utils/ajax');

module.exports = sync = {};

sync.stack = [];
sync.syncing = false;

sync.add = function(operations){
  //apply the operations and get rollback changes
  var rollbackChanges = operate(operations);
  this.stack.push({operations:operations, rollbackChanges:rollbackChanges, status:'NEW'});
  changeHistory.add(operations, rollbackChanges);
  //whenever a new change is received, sync - for now. later could add throttling to this
  //in any case, below we set a 10-second regular sync
  //this.sync();
}

sync.sync = function(){
  //do not try to sync while another sync is in progress
  if(sync.syncing) return;
  sync.syncing = true;
  if(sync.stack.some(x=> x.status == 'NEW')) document.querySelector('#saveIndicator').classList.add('show');
  //set all items to pending status
  sync.stack = sync.stack.map(x=> {if(x.status == 'NEW') x.status = 'PENDING'; return x;});
  //send also the change id of the latest change that has been confirmed as in the right place by the server
  var lastConfirmed = changeHistory.getLastConfirmed();
  var data = {updates:sync.stack, lastConfirmed:lastConfirmed};
  //send the data
  ajax.post(data, function(results){
    var pendings = sync.stack.filter(x=> x.status == 'PENDING');
    if(results.hasOwnProperty('missingChanges')){
      //ask changeHistory to rollback to the index we sent
      changeHistory.rollback(lastConfirmed);
      //apply the missing changes, and add each one to the changeHistory
      results.missingChanges.forEach(function(missingChange, i){
        rollbackChanges = operate(JSON.parse(missingChange.operations));
        changeHistory.add(missingChange.operations, rollbackChanges, lastConfirmed+i);
      });
      //reapply the pendings, and overwrite their rollbackChanges in the changeHistory
      pendings.forEach(function(pending, i){
        rollbackChanges = operate(pending.operations);
        changeHistory.updateRollbackChanges(rollbackChanges, results.missingChanges.length+i);
      });
      changeHistory.setLastConfirmed(changeHistory.getLastConfirmed() + results.missingChanges.length + pendings.length);
    }
    //remember to increase the changeHistory lastConfirmed by the number of pendings that were sent
    //and for now, that were ASSUMED to have been dealt with
    //TODO When dealing with below (fact that all might not be complete), remember to change this bit too
    else{
      changeHistory.setLastConfirmed(changeHistory.getLastConfirmed() + pendings.length);
    }

    //TODO IMPORTANT for above and below: deal with the fact that some pendings might not be complete. only process up to last complete pending. others stay in error state

    //process the result of each update
    results.updates.forEach((result, i)=> {
      pendings[i].status = result.status;
    });
    sync.stack = sync.stack.filter(x=> x.status != 'COMPLETE');
    sync.syncing = false;
    document.querySelector('#saveIndicator').classList.remove('show');
  });
}

sync.isClear = function(){
  return sync.stack.some(x => x.status == 'NEW' || x.status == 'ERROR');
}

window.setInterval(sync.sync, pollSeconds * 1000);

window.sync = sync;

},{"../utils/ajax":30,"./change-history":24,"./operate":26}],28:[function(require,module,exports){
var syncStack = require('./sync-stack');
var getInverse = require('./get-inverse');

module.exports = undoRedo = {};

undoRedo.stack = [];
undoRedo.index = 0;

//add a new action to the stack
undoRedo.new = function(action){
  //remove any undone actions from the top of the stack - they get replaced by the new one
  this.stack.splice(0, this.index, {action:action, inverse:getInverse(action)});
  this.index = 0;
  //execute the action
  this.exec(this.index, 'action');
}
//execute an action
undoRedo.exec = function(index, direction){
  syncStack.add(this.stack[index][direction]);
}
//redo and step towards zero
undoRedo.redo = function(){
  if(this.stack[this.index-1]){
    this.exec(this.index-1, 'action');
    this.index --;
  }
}
//undo and step away from zero (even if there is no element in the next position)
undoRedo.undo = function(){
  if(this.stack[this.index]){
    this.exec(this.index, 'inverse');
    this.index ++;
  }
}

window.undoRedo = undoRedo;

},{"./get-inverse":25,"./sync-stack":27}],29:[function(require,module,exports){
module.exports = function(childrenRaw){
  var children = [];
  var precedingId = null;
  for(var i = 0; i<childrenRaw.length; i++){
    var nextChild = childrenRaw.find(x => x.precedingId == precedingId);
    children.push(nextChild);
    precedingId = nextChild.id;
  }
  return children;
}

},{}],30:[function(require,module,exports){
function ajax(method, callback, data){

  if(data == null) data = {};
  if(callback == null) callback = function(){};

  var xhr = new XMLHttpRequest();
  xhr.open(method, 'api/', true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          callback(json);
      }
  };
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

},{}],31:[function(require,module,exports){
module.exports = {
  get,
  set,
  pos
}

function get(el){
  if(el != document.activeElement) return null;
  var sel = window.getSelection();
  var range = new Range();
  range.setStart(el, 0);
  range.setEnd(sel.anchorNode, sel.anchorOffset);
  return range.toString().length;
}

function set(el, pos){

  if(pos == null) return;
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

},{}],32:[function(require,module,exports){
module.exports = function(el){
  if(el.closest('.holdingPen') == null){
    //make sure it's not a hidden child of a collapsed element
    if(el.closest('.isCollapsed') == null){
      //TODO replace || 1 with a test of if the current component is displaying completed elements or not
      if(el.classList.contains('.isComplete') == false || 1) return true;
    }
    else return false;
  }
  else return false;
}

},{}],33:[function(require,module,exports){
module.exports = function(string){
  return string[0].toUpperCase()+string.substr(1).toLowerCase();
}

},{}],34:[function(require,module,exports){
const defaultNoteObject = require('./default-note-object');

const waterfalls = {
  //triggerProp: waterfallProp,
  "isComplete": "isDescendantOfComplete"
}

const Tree = function(model){
  //make a deep copy of the model in order to not mutate it when using .apply()
  this.model = {};
  this.model.raw = JSON.parse(JSON.stringify(model.raw));
  this.model.names = {};
  var self = this;
  this.model.raw.forEach(function(note){
    self.model.names[note.id] = note;
  });
};

//OPERATIONS
Tree.prototype.setProp = function(id, data, changes = {}){
  var obj = this.getObj(id);
  changes = this.set(obj, data.prop, data.value, changes);
  return changes;
}

breakHere = function(){
  1;
  return 1;
}

Tree.prototype.move = function(id, data, changes = {}){
  var obj = this.getObj(id);
  changes = this.remove(obj, changes);
  changes = this.insert(obj, data.parentId, data.precedingId, changes);
  breakHere();
  return changes;
}

Tree.prototype.delete = function(id, data, changes = {}){
  var obj = this.getObj(id);
  changes = this.remove(obj, changes);
  changes = this.insert(obj, 'DELETED', null, changes);
  return changes;
}

Tree.prototype.create = function(id, data, changes = {}){
  //check if already exists in model
  if(this.model.names[id]){
    var obj = this.getObj(id);
  }
  else{
    noteObject = defaultNoteObject(id);
    this.model.raw.push(noteObject);
    this.model.names[id] = noteObject;
  }
  changes = this.move(id, data, changes);
  return changes;
}

//NAVIGATION
Tree.prototype.next = function(obj){
  return this.model.raw.find(x=> x.parentId == obj.parentId && x.precedingId == obj.id);
}

Tree.prototype.prev = function(obj){
  return this.model.raw.find(x=> x.parentId == obj.parentId && x.id == obj.precedingId);
}

Tree.prototype.parent = function(obj){
  return this.model.raw.find(x=> x.id == obj.parentId);
}

Tree.prototype.children = function(obj){
  return this.order(this.model.raw.filter(x=> x.parentId == obj.id));
}

Tree.prototype.order = function(arr){
  var arr2 = []
  var next = arr.find(x=> x.precedingId == null);
  while(next != undefined){
    arr2.push(next);
    next = arr.find(x=> x.precedingId == arr2[arr2.length -1].id);
  }
  return arr2;
}

//SUPPORTING OPERATIONS
Tree.prototype.getObj = function(id){
  return this.model.names[id] || null;
}

Tree.prototype.get = function(obj, prop){
  if(obj != null && obj != undefined) return obj[prop];
  else return null;
}

Tree.prototype.set = function(obj, prop, value, changes = {}){
  if(obj == null) return changes;
  var id = obj.id;
  if(!changes[id]) changes[id] = {};
  changes[id][prop] = value;
  if(waterfalls.hasOwnProperty(prop)){
    changes = this.waterfall(obj, waterfalls[prop], value, prop, changes);
  }
  return changes;
}

Tree.prototype.waterfall = function(obj, prop, value, triggerProp, changes = {}){
  if(obj == null) return changes;
  var id = obj.id;
  if(!changes[id]) changes[id] = {};
  changes[id][prop] = value;
  var self = this;
  this.children(obj).forEach(child =>{
    if(child[triggerProp] != 0 && child[triggerProp] != null) changes = self.waterfall(child, prop, value, triggerProp, changes);
  });
  return changes;
}

Tree.prototype.remove = function(obj, changes){
  if(this.children(this.parent(obj)).length == 1) changes = this.set(this.parent(obj), 'isParent', false, changes);
  changes = this.set(this.next(obj), 'precedingId', this.get(this.prev(obj), 'id'), changes);
  changes = this.set(obj, 'parentId', null, changes);
  return changes;
}

Tree.prototype.insert = function(obj, parentId, precedingId, changes){
  changes = this.set(obj, 'parentId', parentId, changes);
  changes = this.set(obj, 'precedingId', precedingId, changes);
  //anything which is currently occupying the space of the current node, needs to have its precedingId changed to this id
  changes = this.set(this.model.raw.find(x=> x.precedingId == precedingId && x.parentId == parentId), 'precedingId', obj.id, changes);
  changes = this.set(this.model.raw.find(x=> x.id == parentId), 'isParent', true, changes);
  return changes;
}

Tree.prototype.apply = function(changes){
  var model = this.model;
  Object.getOwnPropertyNames(changes).forEach(function(id){
    if(model.names.hasOwnProperty(id) == false){
      noteObject = defaultNoteObject(id);
      model.raw.push(noteObject)
      model.names[id] = noteObject;
    }
    Object.getOwnPropertyNames(changes[id]).forEach(function(prop){
      model.raw.find(x=> x.id == id)[prop] = changes[id][prop];
    });
  });
}

module.exports = Tree;

},{"./default-note-object":35}],35:[function(require,module,exports){
module.exports = function(id){
  return {
    id: id,
    parentId: 'NEW'
  };
}

},{}],36:[function(require,module,exports){
module.exports = function(){
  return btoa(Date.now().toString()+Math.round(Math.random()*100000).toString());
}

},{}],37:[function(require,module,exports){
module.exports = function(changes, model){
  var inverseChanges = {};
  Object.getOwnPropertyNames(changes).forEach(function(id){
    inverseChanges[id] = {};
    Object.getOwnPropertyNames(changes[id]).forEach(function(prop){
      if(model.names[id]) inverseChanges[id][prop] = model.names[id][prop];
      else inverseChanges[id].parentId = 'NEW';
    });
  });
  return inverseChanges;
}

},{}]},{},[1]);
