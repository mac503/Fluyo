module.exports = function(changes, model){
  var inverseChanges = {};
  Object.getOwnPropertyNames(changes).forEach(function(id){
    inverseChanges[id] = {};
    Object.getOwnPropertyNames(changes[id]).forEach(function(prop){
      if(model.names[id]) inverseChanges[id][prop] = model.names[id][prop];
      else inverseChanges[id].parentId = 'NEW';
    });
  });
  return inverseChanges;
}
