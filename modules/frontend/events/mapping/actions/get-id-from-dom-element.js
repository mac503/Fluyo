module.exports = function(element){
  var note = element.closest('.note');
  if(note != null){
    return note.dataset.id;
  }
  else return null;
}
