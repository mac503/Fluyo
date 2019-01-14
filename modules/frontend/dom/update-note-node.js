var domHelpers = require('./dom-helpers');
var caret = require('../utils/caret');
var isVisible = require('../utils/is-visible');
var properCase = require('../utils/proper-case');
var friendlyDate = require('../utils/friendly-date');
var priority = require('../../shared/text-processing/properties/priority');

module.exports = function(div, changes, initialDraw=false){
  //list changes which get applied as class changes
  ['isParent', 'isCollapsed', 'isComplete', 'isDescendantOfComplete', 'effectiveIsTask'].forEach(function(prop){
    if(changes.hasOwnProperty(prop)){
      if(changes[prop] == true || changes[prop] == 1) div.classList.add(prop);
      else div.classList.remove(prop);
    }
  });
  //changes which get applied as class changes IF NOT NULL
  ['priority', 'dueDate'].forEach(function(prop){
    if(changes.hasOwnProperty(prop)){
      if(changes[prop] != null) div.classList.add('has'+prop);
      else div.classList.remove('has'+prop);
    }
  });
  //list changes which get applied as data properties, and which component they get applied to
  //e.g. [[prop, component]]
  [
    {
      prop:'effectivePriority',
      selector: '.priority',
      process: x=>priority[x]
    },
    {
      prop:'priority',
      selector: '.priority',
      process: x=>priority[x]
    },
    {
      prop:'effectiveDueDate',
      selector: '.dueDate',
      process: x=>friendlyDate(x)
    },
    {
      prop:'effectiveDueDate',
      selector: '.contentHolder',
      process: x=>{
        return (new Date(x) - new Date()) / 86400000 < 5 ? 'due' : '';
      }
    },
    {
      prop:'dueDate',
      selector: '.dueDate',
      process: x=>x
    },
    {
      prop:'timeEstimate',
      selector: '.timeEstimate',
      process: x=>{
        if(x>=60) return Math.round(x/60*10)/10 + 'h';
        else return x + 'm';
      }
    },
    {
      prop:'isTask',
      selector: '.isTask',
      process: x=>{
        if(x) return '[*]';
        else return '//';
      }
    }
  ].forEach(function(pcase){
    if(changes.hasOwnProperty(pcase.prop)){
      if(changes[pcase.prop] != undefined){
        if(div.querySelector(pcase.selector)) div.querySelector(pcase.selector).dataset['prop'+pcase.prop.substr(0,1).toUpperCase()+pcase.prop.substr(1)] = pcase.process(changes[pcase.prop]);
      }
      else{
        if(div.querySelector(pcase.selector)) delete div.querySelector(pcase.selector).dataset['prop'+pcase.prop.substr(0,1).toUpperCase()+pcase.prop.substr(1)];
      }
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
    if(parentDiv == null || changes.parentId == 'DELETED' || changes.parentId == 'NEW') parentDiv = div.closest('[data-outline-component]').parentNode.querySelector('.holdingPen');
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
