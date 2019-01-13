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

new Action('ZOOM', function(e){
  var container;
  if(e.target.classList.contains('bullet')) container = e.target.closest('.notesContainer');
  else{
    container = e.target.closest('[data-outline-component]').querySelector('.notesContainer');
    //if necessary, exit out of zooming mode
    if(e.target.dataset.target == ''){
      container.closest('[data-outline-component]').classList.remove('zooming');
      container.querySelector('.zoom').classList.remove('zoom');
      return;
    }
  }
  container.parentNode.classList.add('zooming');
  if(container.querySelector('.zoom')) container.querySelector('.zoom').classList.remove('zoom');
  var note;
  if(e.target.classList.contains('bullet')) note = e.target.closest('.note');
  else note = container.querySelector(`[data-id="${e.target.dataset.target}"]`);
  drawBreadcrumbs(note.querySelector('.bullet'), container);
  note.classList.add('zoom');
});

function drawBreadcrumbs(bullet, container){
  var crumb = bullet;
  output = '';
  while(crumb = crumb.parentNode.closest('.note')){
    output = `<span data-target='${crumb.dataset.id}' data-events-handler='crumb'>${crumb.querySelector('.content').innerHTML}</span>` + output;
  }
  output = `<span data-target='' data-events-handler='crumb'>…</span>` + output;
  bullet.closest('[data-outline-component]').querySelector('.breadcrumbs').innerHTML = output;
}
