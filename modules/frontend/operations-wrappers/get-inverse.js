var model = require('../model/model');

module.exports = function(actions){
  return actions.map(x=> getInverse(x));
}

function getInverse(action){
  /*inverse of set, is set the value to its current value
  of move is move the item to where it is now
  of delete, is move the item to where it is now (because delete is the same as move)
  of new is ... move the item to 'uncreated'. then when creating items, just need to remember to check in 'uncreated' before creating if necessary
  */
  switch(action.operation){
    case 'setProp':
      var oldValue = null;
      if(model.names[action.id]) oldValue = model.names[action.id][action.data.prop];
      if(oldValue == undefined) oldValue = null;
      return {id:action.id, operation: 'setProp', data:{prop: action.data.prop, value: oldValue}};
    break;
    //these two are the same, so nothing for move and no break statement
    case 'move':
    case 'delete':
      return {id:action.id, operation: 'move', data:{parentId: model.names[action.id].parentId, precedingId: model.names[action.id].precedingId}};
    break;
    case 'create':
      return {id:action.id, operation: 'move', data:{parentId: 'NEW', precedingId: null}};
    break;
  }
}
