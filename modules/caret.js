module.exports = {
  get,
  set,
  pos
}

function get(el){
  if(el != document.activeElement) return null;
  var sel = window.getSelection();
  var range = new Range();
  range.setStart(el, 0);
  range.setEnd(sel.anchorNode, sel.anchorOffset);
  return range.toString().length;
}

function set(el, pos){

  if(pos == null) return;
    // Loop through all child nodes
    for(var node of el.childNodes){
        if(node.nodeType == 3){ // we have a text node
            if(node.length >= pos){
                // finally add our range
                var range = document.createRange(),
                    sel = window.getSelection();
                range.setStart(node,pos);
                range.collapse(true);

                sel.removeAllRanges();
                sel.addRange(range);

                return -1; // we are done
            }else{
                pos -= node.length;
            }
        }else{
            pos = set(node,pos);
            if(pos == -1){
                return -1; // no need to finish the for loop
            }
        }
    }
    return pos; // needed because of recursion stuff
}

function pos(el){
  var pos = get(el);
  if(el.innerText.length == 0) return 'empty';
  else if(pos == el.innerText.length) return 'end';
  else if(pos == 0) return 'start';
  else return 'middle';
}

function caretInMiddle(div){
  return (caretAtStart(div) == false && caretAtEnd(div) == false);
}

function caretAtStart(div){
  if(getCaret(div) == 0) return true;
  else return false;
}

function caretAtEnd(div){
  if(getCaret(div) == div.innerText.length) return true;
  else return false;
}
