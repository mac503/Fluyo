module.exports = `
<div class='filterComponent'>
  <div>
    Due Date<br>
    <input type='checkbox' data-events-handler='display-checkbox' data-display-class='displayDueDates'> <input type='checkbox' data-events-handler='display-checkbox' data-display-class='displayEffectiveDueDates'>
  </div>
  <div>
    Priority<br>
    <input type='checkbox' data-events-handler='display-checkbox' data-display-class='displayPriority'> <input type='checkbox' data-events-handler='display-checkbox' data-display-class='displayEffectivePriority'>
  </div>
  <div>
    Time Estimate<br>
    <input type='checkbox' data-events-handler='display-checkbox' data-display-class='displayTimeEstimate'>
  </div>
  <div>
    Project/Comment<br>
    <input type='checkbox' data-events-handler='display-checkbox' data-display-class='displayIsTask'>
  </div>
  <div>
    Reminder Date<br>
    <input type='checkbox' data-events-handler='display-checkbox' data-display-class='displayReminderDates'>
  </div>
  <div>
    Show Completed<br>
    <input type='checkbox' data-events-handler='display-checkbox' data-display-class='showCompleted'>
  </div>

</div>
`;

/*

<div id='topbar'>
  <div id='navigation'>
    <div id='navigationHome' class="fas fa-home" data-hash-target=''></div>
    <div id='breadcrumbs'></div>
  </div>
  <div id='inboxIcon' class="fas fa-inbox" data-hash-target='inbox'></div>
  <div id='outlineIcon' class="fas fa-list-ul" data-hash-target=''></div>
  <div id='todoIcon' class="fas fa-clipboard-list" data-hash-target='todo'></div>
  <div id='toggleCompleted' class="far fa-check-square"></div>
  <div id='search'><div id='searchBoxHolder'><input type='text' placeholder='&#xF002;'></input></div></div>
</div>

*/
