function ajax(method, callback, data){

  if(data == null) data = {};
  if(callback == null) callback = function(){};

  var xhr = new XMLHttpRequest();
  xhr.open(method, 'api/', true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          callback(json);
      }
  };
  if(method != 'GET') xhr.send(JSON.stringify(data));
  else xhr.send();
}

function get(callback){
  ajax('GET', callback);
}

function post(data, callback){
  ajax('POST', callback, data);
}

function put(data, callback){
  ajax('PUT', callback, data);
}

module.exports = {
  ajax,
  get,
  post,
  put
}
