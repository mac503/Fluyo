var pollSeconds = 5;

var operate = require('./operate');
var changeHistory = require('./change-history');
var ajax = require('../utils/ajax');

module.exports = sync = {};

sync.stack = [];
sync.syncing = false;

sync.add = function(operations){
  //apply the operations and get rollback changes
  var rollbackChanges = operate(operations);
  this.stack.push({operations:operations, rollbackChanges:rollbackChanges, status:'NEW'});
  changeHistory.add(operations, rollbackChanges);
  //whenever a new change is received, sync - for now. later could add throttling to this
  //in any case, below we set a 10-second regular sync
  //this.sync();
}

sync.sync = function(){
  //do not try to sync while another sync is in progress
  if(sync.syncing) return;
  sync.syncing = true;
  if(sync.stack.some(x=> x.status == 'NEW')) document.querySelector('#saveIndicator').classList.add('show');
  //set all items to pending status
  sync.stack = sync.stack.map(x=> {if(x.status == 'NEW') x.status = 'PENDING'; return x;});
  //send also the change id of the latest change that has been confirmed as in the right place by the server
  var lastConfirmed = changeHistory.getLastConfirmed();
  var data = {updates:sync.stack, lastConfirmed:lastConfirmed};
  //send the data
  ajax.post(data, function(results){
    var pendings = sync.stack.filter(x=> x.status == 'PENDING');
    if(results.hasOwnProperty('missingChanges')){
      //ask changeHistory to rollback to the index we sent
      changeHistory.rollback(lastConfirmed);
      //apply the missing changes, and add each one to the changeHistory
      results.missingChanges.forEach(function(missingChange, i){
        rollbackChanges = operate(JSON.parse(missingChange.operations));
        changeHistory.add(missingChange.operations, rollbackChanges, lastConfirmed+i);
      });
      //reapply the pendings, and overwrite their rollbackChanges in the changeHistory
      pendings.forEach(function(pending, i){
        rollbackChanges = operate(pending.operations);
        changeHistory.updateRollbackChanges(rollbackChanges, results.missingChanges.length+i);
      });
      changeHistory.setLastConfirmed(changeHistory.getLastConfirmed() + results.missingChanges.length + pendings.length);
    }
    //remember to increase the changeHistory lastConfirmed by the number of pendings that were sent
    //and for now, that were ASSUMED to have been dealt with
    //TODO When dealing with below (fact that all might not be complete), remember to change this bit too
    else{
      changeHistory.setLastConfirmed(changeHistory.getLastConfirmed() + pendings.length);
    }

    //TODO IMPORTANT for above and below: deal with the fact that some pendings might not be complete. only process up to last complete pending. others stay in error state

    //process the result of each update
    results.updates.forEach((result, i)=> {
      pendings[i].status = result.status;
    });
    sync.stack = sync.stack.filter(x=> x.status != 'COMPLETE');
    sync.syncing = false;
    document.querySelector('#saveIndicator').classList.remove('show');
  });
}

sync.isClear = function(){
  return sync.stack.some(x => x.status == 'NEW' || x.status == 'ERROR');
}

window.setInterval(sync.sync, pollSeconds * 1000);

window.sync = sync;
