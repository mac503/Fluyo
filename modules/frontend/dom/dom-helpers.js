module.exports = {
  prevSibling: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var siblings = el.closest('.notesContainer').querySelectorAll(`[data-id="${el.parentNode.parentNode.dataset.id}"]>.children>.note`);
    siblings = [...siblings];
    if(filters){
      filters.forEach(function(filter){
        siblings = siblings.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    var index = siblings.indexOf(el);
    if(index == 0) return null;
    else return siblings[index-1];
  },
  nextSibling: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var siblings = el.closest('.notesContainer').querySelectorAll(`[data-id="${el.parentNode.parentNode.dataset.id}"]>.children>.note`);
    siblings = [...siblings];
    if(filters){
      filters.forEach(function(filter){
        siblings = siblings.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    var index = siblings.indexOf(el);
    if(index == siblings.length-1) return null;
    else return siblings[index+1];
  },
  prevInView: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var cousins = el.closest('.notesContainer').querySelectorAll(`.note`);
    cousins = [...cousins];
    if(filters){
      filters.forEach(function(filter){
        cousins = cousins.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    var index = cousins.indexOf(el);
    if(index == 0) return null;
    else return cousins[index-1];
  },
  nextInView: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var cousins = el.closest('.notesContainer').querySelectorAll(`.note`);
    cousins = [...cousins];
    if(filters){
      filters.forEach(function(filter){
        cousins = cousins.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    var index = cousins.indexOf(el);
    if(index == cousins.length-1) return null;
    else return cousins[index+1];
  },
  firstInView: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var cousins = el.closest('.notesContainer').querySelectorAll(`.note`);
    cousins = [...cousins];
    if(filters){
      filters.forEach(function(filter){
        cousins = cousins.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    if(cousins.length > 0) return cousins[0];
    else return null;
  },
  lastInView: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Sibling finder: Could not find a note element based on the element passed.');
      return null;
    }
    var cousins = el.closest('.notesContainer').querySelectorAll(`.note`);
    cousins = [...cousins];
    if(filters){
      filters.forEach(function(filter){
        cousins = cousins.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    if(cousins.length > 0) return cousins[cousins.length-1];
    else return null;
  },
  children: function(el, filters){
    if(filters == 'visible'){
      filters = [{prop:'display', values:['block','inline-block']}];
    }
    if(el.classList.contains('note') == false) el = el.closest('.note');
    if(el == null){
      console.log('ERROR: Children finder: Could not find a note element based on the element passed.');
      return null;
    }
    var children = document.querySelectorAll(`.note[data-id="${el.dataset.id}"]>.children>.note`);
    children = [...children];
    if(filters){
      filters.forEach(function(filter){
        children = children.filter(x=> x==el || filter.values.some(y=> getComputedStyle(x)[filter.prop].includes(y)));
      });
    }
    return children;
  },
  flashHighlight(el){
    if(el.classList.contains('content') == false) el = el.querySelector('.content');
    if(el.classList.contains('flashHighlight')) el.classList.remove('flashHighlight');
    requestAnimationFrame(function(){
      el.classList.add('flashHighLight');
      window.setTimeout(function(){
        el.classList.remove('flashHighLight');
      }, 1000);
    });
  }

}
