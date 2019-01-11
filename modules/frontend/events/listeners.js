//listen for these events
var events = ['click', 'input', 'focusin', 'focusout', 'beforeunload', 'keydown', 'hashchange', 'mousemove'];

var properCase = require('../utils/proper-case');
var mapping = require('./mapping/mapping');

module.exports = function(model){

  //pass to relevant handlers
  events.forEach(function(event){
    window.addEventListener(event, function(e){
      //console.log(e);
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
