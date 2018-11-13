var Change = require('./Change');

var cases = [];

module.exports = function(text, id, changeList){
  cases.forEach(function(rcase){
    //check for match(es), if none apply the false value
    if(rcase.regexp.test(text) == false){
      if(id != undefined && rcase.prop) new Change(id, [{prop:rcase.prop, value:rcase.updateValueFalse}], changeList);
    }
    //replace matches
    else text = text.replace(rcase.regexp, function(match){
      var original = arguments[arguments.length-1];
      var groups = [];
      for(var x = 1; x < arguments.length-2; x++){
        groups.push(arguments[x]);
      }

      var processResult;
      if(rcase.processFunc) processResult = rcase.processFunc(match, groups, original);

      //make changes to other properties if required
      if(id != undefined && rcase.prop){
        var updateResult;
        if(typeof rcase.updateTemplate === 'string' || rcase.updateTemplate instanceof String) updateResult = fill(rcase.updateTemplate, match, groups, original, processResult);
        else updateResult = rcase.updateTemplate;
        new Change(id, [{prop:rcase.prop, value:updateResult}], changeList);
        model[id][rcase.prop]
      }

      return fill(rcase.replaceTemplate, match, groups, original, processResult);
    });
  });

  //always return manipulated text, even if it's not needed
  return text;
}

function fill(template, match, groups, original, processResult){
    return new Function("return `"+template+"`;").call({match:match, groups:groups, original:original, processResult:processResult});
}

function Case(options){
  var self = this;
  ['regexp', 'prop', 'updateTemplate', 'updateValueFalse', 'replaceTemplate', 'processFunc'].forEach(x=> self[x] = options[x]);
  cases.push(self);
}

// // = note
new Case({
  regexp: /^\/\/.*/,
  prop: 'isNoteOrigin',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.original}',
  processFunc: null
});

// *-***** = project priority
new Case({
  regexp: /(^|\s)(\*{1,5})(\s|$)/,
  prop: 'isProjectPriority',
  updateTemplate: '${this.processResult}',
  updateValueFalse: false,
  replaceTemplate: '${this.groups[0]}<span class=\'priority\'>${this.groups[1]}</span>${this.groups[2]}',
  processFunc: function(match, groups, original){
    return groups[1].length;
  }
});

// ! = important
new Case({
  regexp: /(^|\s)(!)(\s|$)/,
  prop: 'isImportant',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.groups[0]}<span class=\'important\'>${this.groups[1]}</span>${this.groups[2]}',
  processFunc: null
});

// [+] = workable
new Case({
  regexp: /\[\+\]/,
  prop: 'isWorkable',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.match}',
  processFunc: null
});

// https://mail.google.com/mail/?=? = email icon link
new Case({
  regexp: /(https\:\/\/mail\.google\.com\/mail\/\S*)=(\S+)\s/g,
  prop: null,
  updateTemplate: null,
  updateValueFalse: null,
  replaceTemplate: '<span class="email fas fa-envelope"></span><a contenteditable=false href="${this.groups[0]}"><span contenteditable="false" class="hidden">${this.groups[0]}=</span>${this.groups[1]}</a>&nbsp;',
  processFunc: function(match, groups, original){

  }
});

// ?.?=? = link
new Case({
  regexp: /(\S+\.\S+)=(\S+)\s/g,
  prop: null,
  updateTemplate: null,
  updateValueFalse: null,
  replaceTemplate: '${this.processResult}',
  processFunc: function(match, groups, original){
    var proto = '';
    if(match.substr(0,5) != 'http:' && match.substr(0,6) != 'https:' && match.substr(0,5) != 'file:') proto = 'http://';
    return `<a contentEditable="false" href="${proto}${groups[0]}"><span class="hidden" contenteditable="false">${groups[0]}=</span>${groups[1]}</a>&nbsp;`;
  }
});

// #tag
new Case({
  regexp: /#(\S+)(\s|$)/g,
  prop: null,
  updateTemplate: null,
  updateValueFalse: null,
  replaceTemplate: '<span class=\'tag\' data-tag=\'#${this.groups[0]}\'>#${this.groups[0]}</span>${this.groups[1]}',
  processFunc: null
});

new Case({
  regexp: /(^|\s)~(?!(?:\s|$))((?:\d?\d(?:\.\d)?h)?(?:\d?\dm)?)(\s|$)/,
  prop: 'hasTimeEstimate',
  updateTemplate: '${this.groups[1]}',
  updateValueFalse: null,
  replaceTemplate: '${this.groups[0]}<span class=\'timeEstimate\'>~${this.groups[1]}</span>${this.groups[2]}',
  processFunc: null
});


/*
new Case({
  regexp: ,
  prop: ,
  updateTemplate: ,
  updateValueFalse: ,
  replaceTemplate: ,
  processFunc:
});
*/

var dateRegexes = [
  /a/,
  /b/
];

dateRegexes.forEach(function(regex){

});
