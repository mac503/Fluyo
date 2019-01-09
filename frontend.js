//initialise model
require('./modules/frontend/model/model').initialise(function(model){
  //then
  //setup event listeners
  require('./modules/frontend/events/listeners')(model);
  //draw the loaded data
  require('./modules/frontend/dom/initial-draw')(model);
  //set id of last confirmed change
  require('./modules/frontend/operations-wrappers/change-history').setOffset(model.currentChange);
  //pick up the required bullet from the url if necessary
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  //perhaps load any display settings saved in localstorage if necessary?
});
