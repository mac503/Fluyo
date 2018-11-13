module.exports = new Search();

function Search(){

}

Search.prototype.apply = function(){
  var founds = document.querySelectorAll('.found');
  for(var i = 0; i < founds.length; i++) {
    founds[i].classList.remove('found');
  }
  var foundAncestors = document.querySelectorAll('.foundAncestor');
  for(var i = 0; i < foundAncestors.length; i++) {
    foundAncestors[i].classList.remove('foundAncestor');
  }

  var val = document.querySelector('#searchBoxHolder input').value;

  if(val.trim() == '') document.body.classList.remove('searching');
  else document.body.classList.add('searching');

  var keys = val.split(' ');
  keys = keys.filter(x=> x!='');

  var founds = modelRaw.filter(function(x){
    for(var i = 0; i<keys.length; i++){
      if(x.content.includes(keys[i])) return true;
    }
  });

  var foundAncestors = [];

  founds.forEach(function(found){
    document.querySelector(`.note[data-id="${found.id}"]`).classList.add('found');
    var parent = model[found.parentId];
    while(parent !== undefined){
      if(foundAncestors.indexOf(parent.id) == -1) foundAncestors.push(parent.id);
      parent = model[parent.parentId];
    }
  });

  foundAncestors.forEach(function(foundAncestorId){
    document.querySelector(`.note[data-id="${foundAncestorId}"]`).classList.add('foundAncestor');
  });

}
