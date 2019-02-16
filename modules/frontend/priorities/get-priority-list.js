var model = require('../model/model');

module.exports = function(){
  var contenders = model.raw.filter(x=> x.effectiveIsTask && x.isDescendantOfComplete == false);
  //shallow copy of endpoints
  var endpoints = JSON.parse(JSON.stringify(contenders.filter(x=> contenders.some(y=> y.parentId==x.id) == false)));

  var resultGroups = [];
  groups.forEach(function(group){
    var matchingNotes = endpoints.filter(group.test);
    resultGroups.push({name: group.name, notes: matchingNotes.sort(group.sort)});
    //remove from future endpoints
    endpoints = endpoints.filter(x=> matchingNotes.includes(x));
  });

}

var groups = [
  {
    name: 'Important and Urgent',
    test: function(x){

    },
    sort: function(a,b){

    }
  },
  {
    name: 'Important',
    test: function(x){

    }
  },



  {
    name: 'Anything else',
    test: (x)=>x,
    sort: (a,b)=>{
      return a;
    }
  }
]
