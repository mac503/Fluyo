const highOperations = require('./../highOperations');

const events = {};
events.click = function(el, e){

};
events.keydown = {};
events.keydown[13] = function(ctrl, shift){ //enter
  if(ctrl){
    
  }
  else{

  }
}

module.exports = function(event, e){
  if(events[event] == undefined) return;
  var el = e.target.parentNode.parentNode.parentNode;
  var id = el.dataset.id;
  if(event == 'keydown'){
    var key = e.keyCode;
    var ctrl = e.ctrlKey;
    var shift = e.shiftKey;
    events.keydown[key](ctrl, shift);
  }
  else
}
