const process = require('./generic-process-text');
const priority = require('./properties/priority');
const emotion = require('./properties/emotion');
const energy = require('./properties/energy');

module.exports = function(id, text, model){
  return process(id, text, cases, model);
}
/*EXAMPLE CASE:
  {
    prop: //property to update based on text found,
    regex: //regexp to match, include /g if necessary,
    defaultWrap: //boolean, if true regex gets wrapped in space/start ... space/end,
    getUpdateValue: //function(match, groups, original) to return value to set update prop to,
    getReplaceValue: //function(match, groups, original) to return value to replace match with in string,
    noMatchUpdateValue: //value to update update prop to if no match found,
    accumulate: //boolean to indicate whether to accumulate values (e.g. tags) or overwrite
  }
*/
var cases = [
  {
    prop: 'priority',
    regex: new RegExp(`\\*(-|${priority.join('|')})`),
    defaultWrap: true,
    getUpdateValue: (match, groups, original)=>{
      var i = priority.indexOf(groups[1]);
      if(i>-1) return i;
      else return null;
    },
    getReplaceValue: (match, groups, original)=>{
      return '';
    }
  },
  {
    prop: 'dueDate',
    regex: /due (?:(today|tomorrow)|(next )?((?:mon|tues|wednes|thurs|fri|satur|sun)day)|(next week|next month)|in (?:(1) (week|day|month)|(\d*) (days|weeks|months)))/,
    defaultWrap: true,
    getUpdateValue: (match, groups, original)=>{
      console.log(groups);
      var date = new Date();
      date.setHours(2,0,0,0);
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
        return date.toISOString();
      }
    },
    getReplaceValue: (match, groups, original)=>{
      return '';
    }
  },
  {
    prop: 'reminderDate',
    regex: /remind me (?:(today|tomorrow)|(next )?((?:mon|tues|wednes|thurs|fri|satur|sun)day)|(next week|next month)|in (?:(1) (week|day|month)|(\d*) (days|weeks|months)))/,
    defaultWrap: true,
    getUpdateValue: (match, groups, original)=>{
      console.log(groups);
      var date = new Date();
      date.setHours(2,0,0,0);
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
        return date.toISOString();
      }
    },
    getReplaceValue: (match, groups, original)=>{
      return '';
    }
  },
  {
    prop: 'timeEstimate',
    regex: /(^|\s)(?:~(?:(?:(\d+(?:.\d+)?)h)|((?:\d+|-))))(\s)/,
    defaultWrap: false,
    getUpdateValue: function(match, groups, original){
      if(groups[1]) return parseFloat(groups[1]) * 60;
      else if(groups[2] == '-') return null;
      else return groups[2];
    },
    getReplaceValue: ()=>'',
  },
  {
    prop: 'isTask',
    regex: /(?:(\[\*\])|(\/\/)|(\[-\])|(-\/\/))/,
    defaultWrap: true,
    getUpdateValue: function(match, groups, original){
      if(groups[3]||groups[4]) return null;
      else if(groups[1]) return 1;
      else return 0;
    },
    getReplaceValue: ()=>'',
  },
  {
    prop: 'tags',
    regex: /#(\S+)\s/,
    defaultWrap: true,
    getUpdateValue: (match, groups) => groups[1],
    getReplaceValue: ()=>'',
    accumulate: true
  },
  {
    prop: 'context',
    regex: /@(\S+)\s/,
    defaultWrap: true,
    getUpdateValue: (match, groups) => groups[1],
    getReplaceValue: ()=>''
  },
  {
    prop: 'emotionalQuality',
    regex: new RegExp(`\\?(-|${emotion.join('|')})`),
    defaultWrap: true,
    getUpdateValue: (match, groups, original)=>{
      var i = emotion.indexOf(groups[1]);
      if(i>-1) return groups[1];
      else return null;
    },
    getReplaceValue: (match, groups, original)=>{
      return '';
    }
  },
  {
    prop: 'energyRequired',
    regex: new RegExp(`>(-|${energy.join('|')})`),
    defaultWrap: true,
    getUpdateValue: (match, groups, original)=>{
      var i = energy.indexOf(groups[1]);
      if(i>-1) return i;
      else return null;
    },
    getReplaceValue: (match, groups, original)=>{
      return '';
    }
  },


];


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
