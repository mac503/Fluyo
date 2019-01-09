var syncStack = require('./sync-stack');
var getInverse = require('./get-inverse');

module.exports = undoRedo = {};

undoRedo.stack = [];
undoRedo.index = 0;

//add a new action to the stack
undoRedo.new = function(action){
  //remove any undone actions from the top of the stack - they get replaced by the new one
  this.stack.splice(0, this.index, {action:action, inverse:getInverse(action)});
  this.index = 0;
  //execute the action
  this.exec(this.index, 'action');
}
//execute an action
undoRedo.exec = function(index, direction){
  syncStack.add(this.stack[index][direction]);
}
//redo and step towards zero
undoRedo.redo = function(){
  if(this.stack[this.index-1]){
    this.exec(this.index-1, 'action');
    this.index --;
  }
}
//undo and step away from zero (even if there is no element in the next position)
undoRedo.undo = function(){
  if(this.stack[this.index]){
    this.exec(this.index, 'inverse');
    this.index ++;
  }
}

window.undoRedo = undoRedo;
