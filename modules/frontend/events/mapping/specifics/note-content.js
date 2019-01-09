var caret = require('../../../utils/caret');

new Mapping('note-content', {
  'click': 'ALERT',
  'keydown': function(e, model){
    switch(e.keyCode){
      //enter
      case 13:
        if(e.ctrlKey) actions['TOGGLE_COMPLETE'](e, model);
        else actions['ENTER_NEW_NOTE'](e, model);
      break;
      //backspace
      case 8:
        if(e.ctrlKey==false && e.shiftKey==false && caret.get(e.target) == 0 && window.getSelection().isCollapsed) actions['BACKSPACE_DELETE_NOTE'](e, model);
      break;
      //tab
      case 9:
        if(e.shiftKey) actions['OUTDENT'](e, model);
        else actions['INDENT'](e, model);
      break;
      //up
      case 38:
        if(e.ctrlKey) actions['REPOSITION_UP'](e, model);
        else actions['NAV_UP'](e, model);
      break;
      //down
      case 40:
        if(e.ctrlKey) actions['REPOSITION_DOWN'](e, model);
        else actions['NAV_DOWN'](e, model);
      break;
      //left
      case 37:
        if(e.ctrlKey == false && e.shiftKey == false && caret.pos(e.target) == 'start') actions['NAV_UP_TO_END'](e, model);
      break;
      //right
      case 39:
        if(e.ctrlKey == false && e.shiftKey == false && caret.pos(e.target) == 'end') actions['NAV_DOWN_TO_START'](e, model);
      break;
      //ctrl+home
      case 36:
        if(e.ctrlKey) actions['NAV_FIRST_NOTE'](e, model);
      break;
      //ctrl+end
      case 35:
        if(e.ctrlKey) actions['NAV_LAST_NOTE'](e, model);
      break;
      //Using default to redirect any keystrokes not caught to body listener
      default:
        mapping['body']['keydown'](e, model);
      break;
    }
  },
  'input': 'INPUT_CONTENT',
  'focusout': 'FORCE_THROTTLE'
});
