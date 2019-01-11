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

new Action('PANEL_FLIP', function(e){
  e.target.closest('.panel').classList.toggle('flipped');
});
