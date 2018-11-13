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
