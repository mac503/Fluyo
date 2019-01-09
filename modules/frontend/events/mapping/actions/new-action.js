var actions = require('./actions');

module.exports = function(name, func){
  actions[name] = func;
}
