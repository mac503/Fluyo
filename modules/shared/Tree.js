const Tree = function(model, modelRaw){
  this.model = model;
  this.modelRaw = modelRaw;
};

Tree.prototype.set = set;
Tree.prototype.move = move;
Tree.prototype.commit = commit;
Tree.prototype.children = children;
Tree.prototype.next = next;
Tree.prototype.next = prev;
Tree.prototype.next = parent;

//OPERATIONS
set = function(obj, prop, value, changes = {}){
  if(obj){
    if(!changes[obj.id]) changes[obj.id] = {};
    changes[obj.id][prop] = value;
  }
  return changes;
}

move = function(obj, parentId, precedingId, changes = {}){
  changes = remove(obj, changes);
  changes = insert(obj, parentId, precedingId, changes);
  return changes;
}

commit = function(changes){
  for(var id in changes){
    for(var prop in changes[id]){
      this.model[id][prop] = changes[id][prop];
    }
  }
}

//NAVIGATION
next = function(obj){
  return this.modelRaw.find(x=> x.parentId == obj.parentId && x.precedingId == obj.id);
}

prev = function(obj){
  return this.modelRaw.find(x=> x.parentId == obj.parentId && x.id == obj.precedingId);
}

parent = function(obj){
  return this.modelRaw.find(x=> x.id == obj.parentId);
}

children = function(obj){
  return order(this.modelRaw.filter(x=> x.parentId == obj.id));
}

order = function(arr){
  var arr2 = []
  var next = arr.find(x=> x.precedingId == null);
  while(next != undefined){
    arr2.push(next);
    next = arr.find(x=> x.precedingId == arr2[arr2.length -1].id);
  }
  return arr2;
}

//SUPPORTING OPERATIONS
get = function(obj, prop){
  if(obj != null && obj != undefined) return obj[prop];
}

remove = function(obj, changes){
  if(children(parent(obj)).length == 1) changes = set(parent(obj), 'isParent', false, changes);
  changes = set(next(obj), 'precedingId', get(prev(obj), 'id'), changes);
  changes = set(obj, 'parentId', null, changes);
  return changes;
}

insert = function(obj, parentId, precedingId, changes){
  changes = set(obj, 'parentId', parentId, changes);
  changes = set(obj, 'precedingId', precedingId, changes);
  //anything which is currently occupying the space of the current node, needs to have its precedingId changed to this id
  changes = set(this.modelRaw.find(x=> x.precedingId == precedingId && x.parentId == parentId), 'precedingId', obj.id, changes);
  changes = set(this.modelRaw.find(x=> x.id == parentId), 'isParent', true, changes);
  return changes;
}

deleteNode = function(obj, changes){
  changes = remove(obj, changes);
  changes = set(obj, 'parentId', 'deleted', changes);
  return changes;
}

module.exports = Tree;
