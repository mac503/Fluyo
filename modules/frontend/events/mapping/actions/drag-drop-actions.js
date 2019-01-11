var Action = require('./new-action');

new Action('DRAGSTART', function(e){
  document.body.classList.add('dragging');
});

new Action('DRAGEND', function(e){
  document.body.classList.remove('dragging');
  removeHovers();
});

new Action('DRAGENTER', function(e){
  removeHovers();
  e.target.classList.add('hover');
});

function removeHovers(){
  [].forEach.call(document.querySelectorAll('.hover'), function(el){
    el.classList.remove('hover');
  });
}
