module.exports = function(date){
  var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var today = new Date();
  today.setHours(1,0,0,0);
  date.setHours(1,0,0,0);
  var fac = 86400000;
  var diff = Math.floor((date - today) / fac);
  if(diff == 0) return 'today';
  else if(diff == 1) return 'tomorrow';
  else if(diff == -1) return 'yesterday';
  else if(diff < -1){
    if(diff > -14){
      return -diff+' days ago';
    }
    else return Math.floor(-diff / 7)+' weeks ago';
  }
  else{
    if(diff >= 14) return 'in '+Math.round(diff / 7)+' weeks';
    else if((diff + day(today)) <= 6) return days[day(today, diff)];
    else if((diff + day(today)) <= 13) return 'next '+days[day(today, diff)];
    else return 'in '+diff+' days';
  }
}

function day(date, mod){
  if(!mod) mod = 0;
  date.setDate(date.getDate() + mod);
  var day = date.getDay();
  if(day == 0) day = 6;
  else day = day-1;
  return day;
}
