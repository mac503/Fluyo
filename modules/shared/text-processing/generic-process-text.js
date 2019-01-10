var undoRedo = require('../../frontend/operations-wrappers/undo-redo');

module.exports = function(id, text, cases){
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

  /*
  make a copy of the text
  make an empty
  for each case
    know what property to update
    run the regex
    if matches found
      run the function to figure out the update value
      add that to the list of operations
      run the function to figure out the replace value
      apply replace function to get the necessary replacement text
    else matches not found
      if there is a false value specified, apply that
  if the text differs at all from the original, add a content change operation to the array
  if there is anything in the array, send it to undoRedo
  */
  var processed = text;
  var operations = [];
  cases.forEach(rcase=>{
    var regex = rcase.regex;
    if(rcase.defaultWrap) regex = new RegExp('(^|\\s)'+regex.source+'(\\s|$)', regex.flags);
    if(regex.test(processed)){
      var result = regex.exec(processed);
      if(rcase.hasOwnProperty('prop')) do{
        var match = result[0];
        var groups = result.slice(1);
        var original = result.input;
        var value = rcase.getUpdateValue(match, groups, original);
        operations.push({id:id, operation:'setProp', data:{prop:rcase.prop, value:value}});
      } while(regex.flags.includes('g') && (result = regex.exec(processed)) !== null);
      if(rcase.hasOwnProperty('getReplaceValue')) processed = processed.replace(regex, (...arguments)=>{
        var match = arguments[0];
        var groups = arguments.slice(1, arguments.length-2);
        var original = arguments[arguments.length-1];
        return rcase.getReplaceValue(match, groups, original);
      });
    }
    else if(rcase.hasOwnProperty('noMatchUpdateValue')){
      operations.push({id:id, operation:'setProp', data:{prop:rcase.prop, value:rcase.noMatchUpdateValue}});
    }
  });
  if(processed != text) operations.push({id:id, operation:'setProp', data:{prop:'content', value:processed}});

  if(operations.length > 0) undoRedo.new(operations);
}
