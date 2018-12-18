//potential targets for events
var targets = ['general', 'content', 'bullet'];
//listen for these events
var events = ['click', 'input', 'focusin', 'focusout', 'beforeunload', 'keydown', 'hashchange'];

//require handlers for each target
var targetHandlers = {};
targets.forEach(function(target){
  targetHandlers[target] = require('./targets/'+target);
});

//set up event listeners to pass the events down to each target handler
events.forEach(function(event){
  window.addEventListener(event, function(e){
    targetHandlers[type(e)].pass(e);
  });
});

//return target type based on event target
function type(e){
  var type = 'general';
  var classes = e.target.classList;
  if(classes.contains('content')){
    type = 'content';
  }
  else if(classes.contains('')){

  }
  return type;
}
