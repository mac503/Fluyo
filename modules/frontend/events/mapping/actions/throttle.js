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
