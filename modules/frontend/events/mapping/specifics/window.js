var domHelpers = require('../../../dom/dom-helpers');

new Mapping('window', {
  'beforeunload': 'BEFORE_UNLOAD',
  'keydown': function(e){
    switch(e.keyCode){
      case 36:
        if(e.ctrlKey){
          //TODO figure out a way to choose which panel to select, if no note currently has cursor
          //TODO this event should go on the holder itself
        }
      break;
      case 90:
        if(e.ctrlKey){
          actions['UNDO'](e, model);
        }
      case 89:
        if(e.ctrlKey){
          actions['REDO'](e, model);
        }
      break;
    }
  }
});
