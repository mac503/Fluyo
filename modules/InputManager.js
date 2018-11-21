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
