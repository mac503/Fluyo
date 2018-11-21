var Change = require('./Change');

var cases = [];

module.exports = function(text, id, changeList){
  cases.forEach(function(rcase){
    //check for match(es), if none apply the false value
    if(changeList == undefined && rcase.waitForThrottle) return;
    console.log('backend?')
    if(rcase.regexp.test(text) == false){
      //only make the update if it's not already that value
      if(id != undefined && rcase.prop && rcase.updateValueFalse && model[id][rcase.prop] != rcase.updateValueFalse) new Change(id, [{prop:rcase.prop, value:rcase.updateValueFalse}], changeList);
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
        //only make changes if we need to
        if(model[id][rcase.prop] != updateResult) new Change(id, [{prop:rcase.prop, value:updateResult}], changeList);
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
  ['regexp', 'prop', 'updateTemplate', 'updateValueFalse', 'replaceTemplate', 'processFunc', 'waitForThrottle'].forEach(x=> self[x] = options[x]);
  cases.push(self);
}


// // = memo
new Case({
  regexp: /^\/\/.*/,
  prop: 'isMemo',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.original}',
  processFunc: null
});

// *-***** = project priority
new Case({
  regexp: /(^|\s)(\*{1,25})(\s|$)/,
  prop: 'isProjectAndIfSoPriority',
  updateTemplate: '${this.processResult}',
  updateValueFalse: false,
  replaceTemplate: '${this.groups[0]}<span class=\'priority\'>${this.groups[1]}</span>${this.groups[2]}',
  processFunc: function(match, groups, original){
    return groups[1].length;
  }
});

// ! = important
/*new Case({
  regexp: /(^|\s)(!)(\s|$)/,
  prop: 'isImportant',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.groups[0]}<span class=\'important\'>${this.groups[1]}</span>${this.groups[2]}',
  processFunc: null
});
*/

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

//due date
new Case({
  waitForThrottle: true,
  regexp: /(?:^|\s)due (?:(today|tomorrow)|(next )?((?:mon|tues|wednes|thurs|fri|sat|sun)day)|(next week|next month)|(in) (?:(1) (week|day|month)|(\d*) (days|weeks|months)))(?:\s|$)/,
  prop: 'dueDate',
  updateTemplate: '${this.processResult.toISOString()}',
  updateValueFalse: undefined,
  replaceTemplate: '',
  replacePermanently: true,
  processFunc: function(match, groups, original){
    var date = new Date();
    date.setHours(9,0,0,0);
    groups.unshift('');
    if(groups[1]){
      if(groups[1] == 'today') return date;
      else{
        date.setDate(date.getDate()+1);
        return date;
      }
    }
    else if(groups[3]){
      var nextExplicit = false;
      if(groups[2] == 'next') nextExplicit = true;
      var day = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(groups[3].substr(0,1).toUpperCase()+groups[3].substr(1).toLowerCase());
      return getNextXDay(date, day, nextExplicit);
    }
    else if(groups[4]){
      if(groups[4] == 'next week'){
        return getNextXDay(date, 0);
      }
      else if(groups[4] == 'next month'){
        date.setMonth(date.getMonth()+1);
        date.setDate(1);
        return date;
      }
    }
    else if(groups[6]){
      if(groups[7] == 'day'){
        date.setDate(date.getDate()+1);
        return date;
      }
      if(groups[7] == 'week'){
        date.setDate(date.getDate()+7);
        return date;
      }
      if(groups[7] == 'month'){
        date.setDate(date.getDate()+30);
        return date;
      }
    }
    else{
      var quant = parseInt(groups[8]);
      var days;
      switch(groups[9]){
        case "days":
          days = quant;
        break;
        case "weeks":
          days = quant * 7;
        break;
        case "months":
          days = quant * 30;
        break;
        date.setDate(date.getDate()+days);
        return date;
      }
    }
  }
});

// ~4h time estimate
/*
new Case({
  regexp: /(^|\s)~(?!(?:\s|$))((?:\d?\d(?:\.\d)?h)?(?:\d?\dm)?)(\s|$)/,
  prop: 'hasTimeEstimate',
  updateTemplate: '${this.groups[1]}',
  updateValueFalse: null,
  replaceTemplate: '${this.groups[0]}<span class=\'timeEstimate\'>~${this.groups[1]}</span>${this.groups[2]}',
  processFunc: null
});
*/

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


function getDay(date, mod){
  if(!mod) mod = 0;
  date.setDate(date.getDate() + mod);
  var day = date.getDay();
  if(day == 0) day = 6;
  else day = day-1;
  return day;
}

function getNextXDay(date, day, explicitNext){ //0 = monday
  var dateDay = getDay(date);
  var diff;
  if(day==dateDay) diff = 7;
  if(day<dateDay) diff = 7-(dateDay-day);
  if(day>dateDay){
    if(explicitNext) diff = day-dateDay+7;
    else diff = day-dateDay;
  }
  var tempDate = new Date();
  tempDate.setDate(date.getDate() + diff);
  return tempDate;
}
