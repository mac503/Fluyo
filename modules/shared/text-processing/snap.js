const process = require('./generic-process-text');
const priority = require('./properties/priority');

module.exports = function(id, text){
  return process(id, text, cases);
}
/*EXAMPLE CASE:
  {
    prop: //property to update based on text found,
    regex: //regexp to match, include /g if necessary,
    defaultWrap: //boolean, if true regex gets wrapped in space/start ... space/end,
    getUpdateValue: //function(match, groups, original) to return value to set update prop to,
    getReplaceValue: //function(match, groups, original) to return value to replace match with in string,
    noMatchUpdateValue: //value to update update prop to if no match found
  }
*/
var cases = [
  {
    prop: 'priority',
    regex: new RegExp(`\\*(${priority.join('|')})`),
    defaultWrap: true,
    getUpdateValue: (match, groups, original)=>{
      return priority.indexOf(groups[1]);
    },
    getReplaceValue: (match, groups, original)=>{
      return '';
    }
  }
];
