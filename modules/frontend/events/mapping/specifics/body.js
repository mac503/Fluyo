new Mapping('body', {
  'keydown': function(e){
    console.log(e.target);
    console.log(e);
    switch(e.keyCode){
      //ctrl+z
      case 90:
        if(e.ctrlKey){
          actions['UNDO'](e, model);
        }
      break;
      //ctrl+y
      case 89:
        if(e.ctrlKey){
          actions['REDO'](e, model);
        }
      break;
      //ctrl+s
      case 83:
        if(e.ctrlKey){
          //just do nothing to prevent save window
          e.preventDefault();
          e.stopPropagation();
        }
      break;
    }
  }
});
