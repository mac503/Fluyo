//carry out the operation on the current model, update the results, and draw the results
var model = require('../model/model');
var Tree = require('../../shared/operations/Tree');
var getDeepInverse = require('../../shared/operations/get-deep-inverse');
var drawChanges = require('../dom/draw-changes');

var tempOrderNotes = require('../temp-order-notes');

module.exports = function(operations){

  var changes = {};
  var tree = new Tree(model);
  operations.forEach(function(operation){
    changes = tree[operation.operation](operation.id, operation.data, changes);
    //apply the changes to the temporary model created inside the tree
    tree.apply(changes);
  });

  var deepInverse = getDeepInverse(changes, model);

  //apply the changes to the real model
  model.update(tree.model);

  //draw the changes to the DOM
  drawChanges(changes);

  return deepInverse;
}
