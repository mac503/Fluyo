var search = require('./search');
var noteEvents = require('./noteEvents');
var processText = require('./shared/processText');

window.addEventListener('click', function(e){
  var dateDiv = document.querySelector('.dateBox');
  if(dateDiv != null){
    if(dateDiv.contains(e.target) == false) dateDiv.parentNode.removeChild(dateDiv);
  }
  if(e.target.classList.contains('contentHolder')){
    var content = e.target.querySelector('.content');
    content.focus();
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
  if(e.target.dataset.hasOwnProperty('hashTarget')){
    //clicks to zoom from within the inbox are excluded, they are not supposed to work
    if(document.querySelector('#inbox').contains(e.target) == false){
      if(window.location.href.includes('#inbox') && e.target.parentNode.id != 'topbar') window.location.href = '#inbox'+e.target.dataset.hashTarget;
      else if(window.location.href.includes('#todo') && e.target.parentNode.id != 'topbar' && e.target.dataset.hashTarget != '') window.location.href = '#todo'+e.target.dataset.hashTarget;
      else window.location.href = '#'+e.target.dataset.hashTarget;
    }
  }
  else if(e.target == document.querySelector('#toggleCompleted')){
    document.querySelector('#holder').classList.toggle('showCompleted');
  }
  else if(e.target.classList.contains('toggle')){
    noteEvents(e.target.parentNode.parentNode.parentNode, 'toggle', e);
  }
});

window.addEventListener('click', function(e){
  if(e.target.classList.contains('tag')){
    e.preventDefault();
    e.stopPropagation();
    var searchInput = document.querySelector('#searchBoxHolder input');
    var tag = e.target.dataset.tag;
    if(searchInput.value.includes(tag)) searchInput.value = searchInput.value.replace(tag, '');
    else searchInput.value = searchInput.value.trim() + ' '+tag;
    search.apply();
    document.querySelector('#searchBoxHolder input').focus();
  }
}, true);

window.addEventListener('input', function(e){
  if(e.target.classList.contains('content')){
    if(document.querySelector('#searchBoxHolder input').value.trim() != '') search.apply();
    processContentInputSnap(e.target);
    throttle.input(e.target.parentNode.parentNode.parentNode.dataset.id, e.target.innerText);
  }
  else if(e.target.parentNode.id == 'searchBoxHolder'){
    search.apply();
  }
});

window.addEventListener('focusin', function(e){
  if(e.target.classList.contains('content')){
    //TODO get the location of the caret and maintain it
    e.target.innerHTML = model[e.target.parentNode.parentNode.parentNode.dataset.id].content;
  }
}, true);

window.addEventListener('focusout', function(e){
  if(e.target != window && e.target.classList.contains('content')){
    if(throttle.id) throttle.send();
    e.target.innerHTML = processText('blur', e.target.innerText, e.target.parentNode.parentNode.parentNode.dataset.id);
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
    if(e.keyCode == 38 && e.ctrlKey == false && e.shiftKey == false) noteEvents(noteDiv, 'navUp', e);
    if(e.keyCode == 40 && e.ctrlKey == false && e.shiftKey == false) noteEvents(noteDiv, 'navDown', e);
    if(e.keyCode == 37 && e.ctrlKey == false && e.shiftKey == false && ['start','empty'].includes(caret.pos(content))) noteEvents(noteDiv, 'navUpEnd', e);
    if(e.keyCode == 39 && e.ctrlKey == false && e.shiftKey == false && ['end','empty'].includes(caret.pos(content))) noteEvents(noteDiv, 'navDownStart', e);
    if(e.keyCode == 8 && caret.get(e.target) == 0 && window.getSelection().toString() == '') noteEvents(noteDiv, 'delete', e);
    if(e.keyCode == 13 && e.ctrlKey == false) noteEvents(noteDiv, 'new', e);
    if(e.keyCode == 9 && e.shiftKey) noteEvents(noteDiv, 'outdent', e);
    if(e.keyCode == 9 && e.shiftKey == false) noteEvents(noteDiv, 'indent', e);
    if(e.keyCode == 38 && e.ctrlKey) noteEvents(noteDiv, 'repositionUp', e);
    if(e.keyCode == 40 && e.ctrlKey) noteEvents(noteDiv, 'repositionDown', e);
  }
});


window.addEventListener('hashchange', function(e){
  console.log('HASSSH THAT WEVE GONE TO')
  console.log(location.hash)
  var comps = location.hash.match(/^#?([A-z0-9]*)\/?([A-z0-9]*)?/);
  var hashHead = comps[1];
  var id = comps[2];
  console.log('HASHHEAD')
  console.log(hashHead)

  document.querySelector('#breadcrumbs').innerHTML = '';
  if(document.querySelector('.zoom')) document.querySelector('.zoom').classList.remove('zoom');

  if(id != '' && model[id]){
    document.querySelector('body').classList.add('zooming');
    document.querySelector(`.note[data-id="${id}"]`).classList.add('zoom');
    if(hashHead == '') document.querySelector('#outlineIcon').dataset.hashTarget = '/'+id;
    if(hashHead == 'inbox') document.querySelector('#inboxIcon').dataset.hashTarget = 'inbox/'+id;
    if(hashHead == 'todo') document.querySelector('#todoIcon').dataset.hashTarget = 'todo/'+id;
    //add breadcrumbs
    var crumb = model[id];
    do{
      console.log(id)
      console.log('DOING BREADCRUMBS')
      var span = document.createElement('span');
      if(crumb.content.length > 30) span.innerHTML = crumb.content.substr(0, 30).trim()+' ...';
      else span.innerHTML = crumb.content;
      span.dataset.hashTarget = '/'+crumb.id;
      document.querySelector('#breadcrumbs').prepend(span);
      crumb = modelRaw.find(x => x.id == crumb.parentId);
    } while(crumb);
  }
  else if(hashHead != 'todo'){
    document.querySelector('body').classList.remove('zooming');
    document.querySelector('#breadcrumbs').innerHTML = '';
    if(hashHead == '') document.querySelector('#outlineIcon').dataset.hashTarget = '';
    if(hashHead == 'inbox') document.querySelector('#inboxIcon').dataset.hashTarget = 'inbox';
  }
  //todo view
  else if(id){
    var scheduleDate = id;
    document.querySelector('#todoIcon').dataset.hashTarget = 'todo/'+scheduleDate;
    document.querySelector(`.tab[data-date="${scheduleDate}"] input`).checked = true;
  }

  //display the appropriate components
  switch(hashHead){
    case "inbox":
        document.querySelector('body').dataset.display = 'inbox';
    break;
    case "todo":
        document.querySelector('body').dataset.display = 'todo';
    break;
    case "":
      document.querySelector('body').dataset.display = 'outline';
    break;
  }


});

function processContentInputSnap(el){
  var pos;
  var length = el.innerText.length;
  if(el == document.activeElement) pos = caret.get(el);
  el.innerHTML = processText('snap', el.innerText, el.parentNode.parentNode.parentNode.dataset.id);
  var newLength = el.innerText.length;
  if(pos && el == document.activeElement) caret.set(el, pos-(length-newLength));
}
