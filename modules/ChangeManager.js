var Change = require('./shared/Change');

function ChangeManager(){

}

ChangeManager.prototype.change = function(id, changes){

  changes.forEach(function(change){
    if(change.value === true) change.value = 1;
    if(change.value === false) change.value = 0;
  });

  changes.push({prop:'dateUpdated', value: Date.now()})

  //post the changes
  ajax.post({id:id, changes:changes}, function(success){
    console.log(`Successfully updated ${id} with ${JSON.stringify(changes)}`);
  });

  //TODO broadcast the changes via broadcastchannel api

  //create a Change object to calculate the subsequent changes here, and draw them to the screen
  var changeObject = new Change(id, changes);

  console.log(JSON.stringify(changeObject));

  drawUpdates(changeObject);

}

module.exports = new ChangeManager();

function drawUpdates(updates){
  Object.keys(updates).forEach(function(id){
    var div = document.querySelector(`.note[data-id="${id}"]`);
    if(div == undefined) return;
    var update = updates[id];
    if(update.hasOwnProperty('content')){
      var el = div.querySelector('.content');
      var pos;
      if(el == document.activeElement) pos = getCaretPosition(el);
      el.innerHTML = update.content;
      if(pos && el == document.activeElement) setCaretPosition(el, pos);
    }
    applyClasses.forEach(function(className){
      if(update.hasOwnProperty(className)){
        if(update[className] != false) div.classList.add(className)
        else div.classList.remove(className);
      }
    });
  });
}

function getCaretPosition(el){
  var sel = window.getSelection();
  var range = new Range();
  range.setStart(el, 0);
  range.setEnd(sel.anchorNode, sel.anchorOffset);
  return range.toString().length;
}

function setCaretPosition(el, pos){

    // Loop through all child nodes
    for(var node of el.childNodes){
        if(node.nodeType == 3){ // we have a text node
            if(node.length >= pos){
                // finally add our range
                var range = document.createRange(),
                    sel = window.getSelection();
                range.setStart(node,pos);
                range.collapse(true);

                sel.removeAllRanges();
                sel.addRange(range);

                return -1; // we are done
            }else{
                pos -= node.length;
            }
        }else{
            pos = setCaretPosition(node,pos);
            if(pos == -1){
                return -1; // no need to finish the for loop
            }
        }
    }
    return pos; // needed because of recursion stuff
}
