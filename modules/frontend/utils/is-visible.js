module.exports = function(el){
  if(el.closest('.holdingPen') == null){
    //make sure it's not a hidden child of a collapsed element
    if(el.closest('.isCollapsed') == null){
      //TODO replace || 1 with a test of if the current component is displaying completed elements or not
      if(el.classList.contains('.isComplete') == false || 1) return true;
    }
    else return false;
  }
  else return false;
}
