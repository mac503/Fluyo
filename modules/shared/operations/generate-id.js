module.exports = function(){
  return btoa(Date.now().toString()+Math.round(Math.random()*100000).toString());
}
