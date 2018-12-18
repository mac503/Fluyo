var Change = require('./Change');

var casesOriginal = [];

module.exports = function(mode, text, id, changeList, useChangeManager = true){

  if(text == null) text = '';

  var cases = casesOriginal.filter(x=> x.modes.includes(mode));

  cases.forEach(function(rcase){
    //check for match(es), if none apply the false value
    if(mode == 'normal' && rcase.regexp.test(text) == false){
      //only make the update if it's not already that value
      if(rcase.updateValueFalse != undefined && model[id][rcase.prop] != rcase.updateValueFalse) new Change(id, [{prop:rcase.prop, value:rcase.updateValueFalse}], changeList);
    }
    //replace matches
    else text = text.replace(rcase.regexp, function(match){
      //prepare original, groups for other functions
      var original = arguments[arguments.length-1];
      var groups = [];
      for(var x = 1; x < arguments.length-2; x++){
        groups.push(arguments[x]);
      }

      var processResult;
      if(rcase.processFunc) processResult = rcase.processFunc(match, groups, original);

      //make changes to other properties if required
      if(mode == 'normal' || mode == 'snap'){
        var updateResult;
        if(typeof rcase.updateTemplate === 'string' || rcase.updateTemplate instanceof String) updateResult = fill(rcase.updateTemplate, match, groups, original, processResult);
        else updateResult = rcase.updateTemplate;
        //only make changes if we need to
        if(model[id][rcase.prop] != updateResult){
          if(mode == 'snap' && useChangeManager != false){
            changeManager.change(id, [{prop:rcase.prop, value:updateResult}], changeList);
          }
          else new Change(id, [{prop:rcase.prop, value:updateResult}], changeList);
        }
      }

      if(mode == 'blur') return fill(rcase.blurReplaceTemplate, match, groups, original, processResult);
      else return fill(rcase.replaceTemplate, match, groups, original, processResult);
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
  ['regexp', 'prop', 'updateTemplate', 'updateValueFalse', 'replaceTemplate', 'blurReplaceTemplate', 'processFunc', 'modes'].forEach(x=> self[x] = options[x]);
  casesOriginal.push(self);
}


// // = memo
new Case({
  modes: ['normal','blur'],
  regexp: /^\/\/(.*)/,
  prop: 'isMemo',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.match}',
  blurReplaceTemplate: '${this.processResult}',
  processFunc: function(match, groups, original){
    return groups[0];
  }
});

// *-***** = project priority
new Case({
  modes: ['normal','blur'],
  regexp: /(^|\s)(\*{1,25})(\s|$)/,
  prop: 'isProjectAndIfSoPriority',
  updateTemplate: '${this.processResult}',
  updateValueFalse: 0,
  replaceTemplate: '${this.match}',
  blurReplaceTemplate: '${this.groups[0]}<span class=\'priority\'>${this.groups[1]}</span>${this.groups[2]}',
  processFunc: function(match, groups, original){
    return groups[1].length;
  }
});

// ! = important
new Case({
  modes: ['normal','blur'],
  regexp: /(^|\s)(\[!\])(\s|$)/,
  prop: 'isImportant',
  updateTemplate: true,
  updateValueFalse: false,
  replaceTemplate: '${this.match}',
  blurReplaceTemplate: '',
  processFunc: null
});

// https://mail.google.com/mail/?=? = email icon link
new Case({
  modes: ['blur'],
  regexp: /(^|\s)(https\:\/\/mail\.google\.com\/mail\/\S*)=(\S+)(\s|$)/g,
  blurReplaceTemplate: '${this.groups[0]}<span class="email fas fa-envelope"></span><a contenteditable=false href="${this.groups[1]}">${this.groups[2]}</a>${this.groups[3]}',
});

// ?.?=? = link
new Case({
  modes: ['blur'],
  regexp: /(^|\s)(\S+\.\S+)=(\S+)(\s|$)/g,
  blurReplaceTemplate: '${this.processResult}',
  processFunc: function(match, groups, original){
    var proto = '';
    if(match.substr(0,5) != 'http:' && match.substr(0,6) != 'https:' && match.substr(0,5) != 'file:') proto = 'http://';
    return `${groups[0]}<a contenteditable=false href="${proto}${groups[1]}">${groups[2]}</a>${groups[3]}`;
  }
});

// #tag
new Case({
  modes: ['blur'],
  regexp: /(^|\s)#(\S+)(\s|$)/g,
  blurReplaceTemplate: '${this.groups[0]}<a class="tag" href="" contenteditable=false data-tag=\'#${this.groups[1]}\'>#${this.groups[1]}</a>${this.groups[2]}',
});

//due date
new Case({
  modes: ['snap'],
  regexp: /(?:^|\s)due (?:(today|tomorrow)|(next )?((?:mon|tues|wednes|thurs|fri|satur|sun)day)|(next week|next month)|in (?:(1) (week|day|month)|(\d*) (days|weeks|months)))(?:\s|$)/,
  prop: 'dueDate',
  updateTemplate: '${this.processResult.toISOString()}',
  replaceTemplate: '',
  processFunc: function(match, groups, original){
    var date = new Date();
    date.setHours(9,0,0,0);
    groups.unshift('');
    console.log('HERE');
    console.log(groups);
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
    else if(groups[5]){
      if(groups[6] == 'day'){
        date.setDate(date.getDate()+1);
        return date;
      }
      if(groups[6] == 'week'){
        date.setDate(date.getDate()+7);
        return date;
      }
      if(groups[6] == 'month'){
        date.setDate(date.getDate()+30);
        return date;
      }
    }
    else{
      var quant = parseInt(groups[7]);
      var days;
      switch(groups[8]){
        case "days":
          days = quant;
        break;
        case "weeks":
          days = quant * 7;
        break;
        case "months":
          days = quant * 30;
        break;
      }
      date.setDate(date.getDate()+days);
      return date;
    }
  }
});

// ~4h time estimate
new Case({
  modes: ['normal','blur'],
  regexp: /(^|\s)~(\d+(?:.\d+)?)(h)?(\s|$)/,
  prop: 'timeEstimate',
  updateTemplate: '${this.processResult}',
  updateValueFalse: 15,
  replaceTemplate: '${this.match}',
  blurReplaceTemplate: '${this.groups[0]}<span class=\'timeEstimate\'>~${this.groups[1]}${this.groups[2] != undefined ? this.groups[2] : ``}</span>${this.groups[3]}',
  processFunc: function(match, groups, original){
    console.log('TIME ESTIMATE GRUOPS')
    console.log(groups);
    if(groups[2] != undefined) return Math.round(parseFloat(groups[1])*60);
    else return Math.round(parseFloat(groups[1]));
  }
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
