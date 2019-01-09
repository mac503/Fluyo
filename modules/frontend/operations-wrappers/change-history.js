var Tree = require('../../shared/operations/Tree');

module.exports = changeHistory = {};

changeHistory.setOffset = function(lastConfirmed){
  this.offset = lastConfirmed;
  this.setLastConfirmed(lastConfirmed);
}

changeHistory.stack = [];

changeHistory.add = function(operations, rollbackChanges, index=this.stack.length+1){
  this.stack.splice(index, 0, {operations:operations, rollbackChanges:rollbackChanges});
}

changeHistory.updateRollbackChanges = function(rollbackChanges, index){
  this.stack[index].rollbackChanges = rollbackChanges;
}

changeHistory.setLastConfirmed = function(lastConfirmed){
  this.lastConfirmed = lastConfirmed;
}

changeHistory.getLastConfirmed = function(){
  return this.lastConfirmed;
}

changeHistory.rollback = function(index){
  if(this.stack.length == 0) return;
  index = index - this.offset;
  var tree = new Tree(model);
  for(i = this.stack.length-1; i--; i>=index){
    tree.apply(this.stack[i].rollbackChanges);
  }
  model.raw = tree.model.raw;
  model.names = tree.model.names;
}
