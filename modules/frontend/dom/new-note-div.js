module.exports = function(id){
  var div = document.createElement('div');
  div.dataset.id = id;
  div.classList.add('note');
  div.innerHTML = `
    <div class='topLine'>
      <div class='dragDropHelperTop' data-events-handler-dragenter='drag-drop-helper'></div>
      <div class='dragDropHelperBottom' data-events-handler-dragenter='drag-drop-helper'></div>
      <div class='dragDropHelperFirstChild' data-events-handler-dragenter='drag-drop-helper'></div>
      <div class='left'>
        <div class='toggle' data-events-handler='toggle'></div>
        <div class='bullet' draggable='true' data-events-handler='bullet'></div>
      </div>
      <div class='contentHolder'>
        <div class='content' contenteditable='true' data-events-handler='note-content'></div>
        <div class='priority'><span class='clearPriority' data-events-handler='clear-priority'></span></div>
        <div class='dueDate' data-events-handler='date-indicator'><span class='clearDate' data-events-handler='clear-date'></span></div>
      </div>
    </div>
    <div class='children'></div>
  `;
  return div;
}
