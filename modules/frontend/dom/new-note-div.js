module.exports = function(id){
  var div = document.createElement('div');
  div.dataset.id = id;
  div.classList.add('note');
  div.innerHTML = `
    <div class='topLine'>
      <div class='left'>
        <div class='toggle' data-events-handler='toggle'></div>
        <div class='bullet' draggable='true'></div>
      </div>
      <div class='contentHolder'><div class='dragDropTop'></div><div class='dragDropBottom'></div>
        <div class='content' contenteditable='true' data-events-handler='note-content'></div>
        <div class='dueDate' data-date=''><span class='clearDate'></span></div>
      </div>
    </div>
    <div class='children'></div>
  `;
  return div;
}
