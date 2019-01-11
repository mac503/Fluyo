module.exports = mapping = [];

Mapping = function(name, eventsToActions){
  mapping[name] = {};
  Object.getOwnPropertyNames(eventsToActions).forEach(function(prop){
    if(typeof eventsToActions[prop] == "string"){
      mapping[name][prop] = function(e, model){
        return actions[eventsToActions[prop]](e, model);
      }
    }
    else if(typeof eventsToActions[prop] == "function"){
      mapping[name][prop] = eventsToActions[prop];
    }
  });
}

//require all specific mapping files here
require('./specifics/note-content');
require('./specifics/toggle');
require('./specifics/panel');
require('./specifics/window');
require('./specifics/body');
require('./specifics/clear-priority');
require('./specifics/clear-date');
require('./specifics/date-indicator');
require('./specifics/date-box');
require('./specifics/bullet');
require('./specifics/drag-drop-helpers');

require('./actions/operation-actions');
require('./actions/superficial-actions');
require('./actions/drag-drop-actions');
actions = require('./actions/actions');

window.mapping = mapping;
