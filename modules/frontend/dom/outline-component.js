var filterComponent = require('./filter-component');

module.exports = function(topLevelId){
  var div = document.createElement('div');
  div.dataset.outlineComponent = true;
  div.dataset.topLevelId = topLevelId;
  div.dataset.id = topLevelId;
  div.innerHTML = `
    ${filterComponent}
    <div class='notesContainer' data-id='${topLevelId}'>
      <div class='children'></div>
    </div>
    <div class='holdingPen'></div>
  `;
  return div;
}
