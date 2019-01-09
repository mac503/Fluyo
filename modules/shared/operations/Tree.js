const defaultNoteObject = require('./default-note-object');

const waterfalls = {
  //triggerProp: waterfallProp,
  "isComplete": "isDescendantOfComplete"
}

const Tree = function(model){
  //make a deep copy of the model in order to not mutate it when using .apply()
  this.model = {};
  this.model.raw = JSON.parse(JSON.stringify(model.raw));
  this.model.names = {};
  var self = this;
  this.model.raw.forEach(function(note){
    self.model.names[note.id] = note;
  });
};

//OPERATIONS
Tree.prototype.setProp = function(id, data, changes = {}){
  var obj = this.getObj(id);
  changes = this.set(obj, data.prop, data.value, changes);
  return changes;
}

breakHere = function(){
  1;
  return 1;
}

Tree.prototype.move = function(id, data, changes = {}){
  var obj = this.getObj(id);
  changes = this.remove(obj, changes);
  changes = this.insert(obj, data.parentId, data.precedingId, changes);
  breakHere();
  return changes;
}

Tree.prototype.delete = function(id, data, changes = {}){
  var obj = this.getObj(id);
  changes = this.remove(obj, changes);
  changes = this.insert(obj, 'DELETED', null, changes);
  return changes;
}

Tree.prototype.create = function(id, data, changes = {}){
  //check if already exists in model
  if(this.model.names[id]){
    var obj = this.getObj(id);
  }
  else{
    noteObject = defaultNoteObject(id);
    this.model.raw.push(noteObject);
    this.model.names[id] = noteObject;
  }
  changes = this.move(id, data, changes);
  return changes;
}

//NAVIGATION
Tree.prototype.next = function(obj){
  return this.model.raw.find(x=> x.parentId == obj.parentId && x.precedingId == obj.id);
}

Tree.prototype.prev = function(obj){
  return this.model.raw.find(x=> x.parentId == obj.parentId && x.id == obj.precedingId);
}

Tree.prototype.parent = function(obj){
  return this.model.raw.find(x=> x.id == obj.parentId);
}

Tree.prototype.children = function(obj){
  return this.order(this.model.raw.filter(x=> x.parentId == obj.id));
}

Tree.prototype.order = function(arr){
  var arr2 = []
  var next = arr.find(x=> x.precedingId == null);
  while(next != undefined){
    arr2.push(next);
    next = arr.find(x=> x.precedingId == arr2[arr2.length -1].id);
  }
  return arr2;
}

//SUPPORTING OPERATIONS
Tree.prototype.getObj = function(id){
  return this.model.names[id] || null;
}

Tree.prototype.get = function(obj, prop){
  if(obj != null && obj != undefined) return obj[prop];
  else return null;
}

Tree.prototype.set = function(obj, prop, value, changes = {}){
  if(obj == null) return changes;
  var id = obj.id;
  if(!changes[id]) changes[id] = {};
  changes[id][prop] = value;
  if(waterfalls.hasOwnProperty(prop)){
    changes = this.waterfall(obj, waterfalls[prop], value, prop, changes);
  }
  return changes;
}

Tree.prototype.waterfall = function(obj, prop, value, triggerProp, changes = {}){
  if(obj == null) return changes;
  var id = obj.id;
  if(!changes[id]) changes[id] = {};
  changes[id][prop] = value;
  var self = this;
  this.children(obj).forEach(child =>{
    if(child[triggerProp] != 0 && child[triggerProp] != null) changes = self.waterfall(child, prop, value, triggerProp, changes);
  });
  return changes;
}

Tree.prototype.remove = function(obj, changes){
  if(this.children(this.parent(obj)).length == 1) changes = this.set(this.parent(obj), 'isParent', false, changes);
  changes = this.set(this.next(obj), 'precedingId', this.get(this.prev(obj), 'id'), changes);
  changes = this.set(obj, 'parentId', null, changes);
  return changes;
}

Tree.prototype.insert = function(obj, parentId, precedingId, changes){
  changes = this.set(obj, 'parentId', parentId, changes);
  changes = this.set(obj, 'precedingId', precedingId, changes);
  //anything which is currently occupying the space of the current node, needs to have its precedingId changed to this id
  changes = this.set(this.model.raw.find(x=> x.precedingId == precedingId && x.parentId == parentId), 'precedingId', obj.id, changes);
  changes = this.set(this.model.raw.find(x=> x.id == parentId), 'isParent', true, changes);
  return changes;
}

Tree.prototype.apply = function(changes){
  var model = this.model;
  Object.getOwnPropertyNames(changes).forEach(function(id){
    if(model.names.hasOwnProperty(id) == false){
      noteObject = defaultNoteObject(id);
      model.raw.push(noteObject)
      model.names[id] = noteObject;
    }
    Object.getOwnPropertyNames(changes[id]).forEach(function(prop){
      model.raw.find(x=> x.id == id)[prop] = changes[id][prop];
    });
  });
}

module.exports = Tree;
