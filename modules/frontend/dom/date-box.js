module.exports = {drawBox, updateBox, updateSelected, test};

function drawBox(date, target, selected){
  if(selected) selected.setHours(1,0,0,0);
  else selected = new Date(0);

  var div = document.createElement('div');
  div.classList.add('dateBox');

  updateBox(date, div, selected);

  target.appendChild(div);
}

function updateBox(date, div, selected){
  console.log(date);
  console.log('SELECTED')
  console.log(selected);
  if(selected == null){
    var selectedEl = div.querySelector('.selected');
    if(selectedEl) selected = new Date(parseInt(selectedEl.dataset.date));
    else selected = new Date(0);
  }
  console.log(selected);
  selected.setHours(1,0,0,0);

  var year = date.getFullYear();
  var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()];
  var days = ['M','T','W','H','F','S','U'];
  var today = new Date();
  today.setHours(1,0,0,0);
  var endDate = getEndDate(date);
  var startDate = getStartDate(date);
  console.log('START DATE')
  console.log(startDate);
  var dates = [];
  for(true; startDate<=endDate; startDate.setDate(startDate.getDate() +1)){
    console.log(startDate);
    console.log(selected);
    console.log(startDate.getTime());
    console.log(selected.getTime());
    if(startDate.getTime() == selected.getTime()) console.log('MATC!!!!')
    dates.push(new Date(startDate.getTime()));
  }
  console.log(dates);
  var prevMonthDate = getFirstDate(date);
  prevMonthDate.setDate(prevMonthDate.getDate() - 1);
  var nextMonthDate = getLastDate(date);
  nextMonthDate.setDate(nextMonthDate.getDate() + 1);

  console.log(div);

  div.innerHTML = `
  <div class='clickCover' data-events-handler='date-box-click-cover'></div>
  <div class='shell'>
    <div class='monthYear'><span class='changeMonth' data-date='${prevMonthDate.getTime()}' data-events-handler='date-box-change-month'>&#8592;</span>${month} ${year}<span class='changeMonth' data-date='${nextMonthDate.getTime()}' data-events-handler='date-box-change-month'>&#8594;</span></div>
    <div class='days'>
      ${days.map(x=> `<div>${x}</div>`).join('')}
    </div>
    <div class='dates'>
      ${dates.map((x,i) => `${i%7 == 0 ? `<div class="row">` : ''}<div data-date="${x.getTime()}" class="dateChoice ${x.getMonth() == date.getMonth() ? '' : ' otherMonth'}${(x.getTime() == today.getTime()) ? ' today' : ''}${(x.getTime() == selected.getTime()) ? ' selected' : ''}" data-events-handler='date-box-date'>${x.getDate()}</div>${i%7 == 6 ? `</div>` : ''}`).join('')}
    </div>
  </div>
  `;
}

function updateSelected(el){
  var selected = el.parentNode.parentNode.querySelector('.selected')
  if(selected) selected.classList.remove('selected');
  el.classList.add('selected');
}

function getFirstDate(date){
  var tempDate = new Date(date.getTime());
  tempDate.setDate(1);
  tempDate.setHours(1,0,0,0);
  return tempDate;
}

function getLastDate(date){
  var tempDate = new Date(date.getTime());
  tempDate.setDate(1);
  tempDate.setMonth(tempDate.getMonth()+1);
  tempDate.setDate(0);
  tempDate.setHours(1,0,0,0);
  return tempDate;
}

function getStartDate(date){
  var firstDate = getFirstDate(date);
  var firstDay = firstDate.getDay();
  var startDate = new Date(firstDate.getTime());
  startDate.setDate(startDate.getDate() - firstDay + 1);
  return startDate;
}

function getEndDate(date){
  var lastDate = getLastDate(date);
  var lastDay = lastDate.getDay();
  var endDate = new Date(lastDate.getTime());
  console.log(endDate);
  var toAdd = 7 - lastDay;
  endDate.setDate(endDate.getDate() + (toAdd == 7 ? 0 : toAdd));
  return endDate;
}

function test(){
  var tempDate = new Date();
  tempDate.setDate(tempDate.getDate() + 4)
  window.setTimeout(function(){drawBox(new Date(), document.querySelector('.contentHolder'), tempDate)}, 1000);
}
