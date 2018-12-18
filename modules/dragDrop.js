window.addEventListener('dragstart', function(e){
  console.log(e);
  document.body.classList.add('dragDropHappening');
  e.target.parentNode.parentNode.parentNode.classList.add('dragOrigin');
});

window.addEventListener('dragend', function(e){
  document.body.classList.remove('dragDropHappening');
  var origin = e.target.parentNode.parentNode.parentNode;
  origin.classList.remove('dragOrigin');
  console.log(origin);
  var target = document.querySelector('.hover');
  removeHovers();
  var note = model[origin.dataset.id];
  var targetNoteDiv = target.parentNode.parentNode.parentNode;
  console.log('INTERESTIG')
  console.log(target);
  console.log(targetNoteDiv);
  if(target.classList.contains('dragDropTop')){
    var newPrev = targetNoteDiv.previousElementSibling;
    var newPrevId = null;
    if(newPrev) newPrevId = newPrev.dataset.id;
    var newParent = targetNoteDiv.parentNode;
    if(newParent.classList.contains('children')) newParent = newParent.parentNode;
    var newParentId;
    if(newParent.dataset.id) newParentId = newParent.dataset.id;
    else if(newParent.id == 'notes') newParentId = null;
    else if(newParent.id == 'inbox') newParentId = 'INBOX';
    changeManager.change(note.id, [{prop:"parentId", value:newParentId}, {prop:"precedingId", value:newPrevId}]);
  }
  else if(target.classList.contains('dragDropBottom')){
    var newPrevId = targetNoteDiv.dataset.id;
    var newParent = targetNoteDiv.parentNode.parentNode;
    var newParentId;
    console.log(newParent);
    if(newParent.dataset.id) newParentId = newParent.dataset.id;
    else if(newParent.id == 'notes') newParentId = null;
    else if(newParent.id == 'inbox') newParentId = 'INBOX';
    changeManager.change(note.id, [{prop:"parentId", value:newParentId}, {prop:"precedingId", value:newPrevId}]);
  }
  else if(target.classList.contains('bullet')){
    changeManager.change(note.id, [{prop:"parentId", value:targetNoteDiv.dataset.id}, {prop:"precedingId", value:null}]);
  }
});

window.addEventListener('dragenter', function(e){
  var el = e.target;
  console.log(el);
  var origin = document.querySelector('.dragOrigin');
  console.log(origin);
  if((el.classList.contains('dragDropTop') || el.classList.contains('dragDropBottom')) && origin.contains(el) == false){
    removeHovers();
    el.classList.add('hover');
  }
  else if(origin.contains(el) && origin){
    removeHovers();
    origin.querySelector('.dragDropTop').classList.add('hover');
  }
  else if(el.classList.contains('bullet') && (el.classList.contains('isParent') == false || (el.classList.contains('isParent') && el.classList.contains('isCollapsed'))) && origin.contains(el) == false && el != origin){
    removeHovers();
    el.classList.add('hover');
  }
});

function removeHovers(){
  [].forEach.call(document.querySelectorAll('.hover'), function(hoverEl){
    hoverEl.classList.remove('hover');
  });
}
