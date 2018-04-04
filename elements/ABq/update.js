function(instance, properties, context) {

  var xhr = new XMLHttpRequest();

  var body = '';   

  body = 'client='+properties.client;    
  body += '&exam='+properties.exam;

  xhr.open("POST", 'https://'+context.keys.api_host+'/timeline/replay', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.onload  = function() {
    if (xhr.response == '') return;
    var resp = JSON.parse(xhr.response).response;
    if (resp.length > 0) {
      var start_ts = null;
      for(var i in resp) {        
        if(resp[i].entity == 'message') {
        	instance.canvas.append($('<p>'+resp[i].timestamp+' <b>'+resp[i].extra+':</b> '+resp[i].content+'</p>'));
        } else if (resp[i].entity == 'stream') {
          if (!start_ts) start_ts = resp[i].ts;
          var state = resp[i].role+'_'+resp[i].content;
          var token = resp[i].extra;
          var delay = parseInt(resp[i].ts) - parseInt(start_ts);
          console.log('!',state,token,delay);
          instance.data.timeline[delay] = {state: state, token: token};
        }
      }     
      instance.data.timer = setInterval(function() {
        if (!instance.data.paused) {
          var tState = instance.data.timeline[instance.data.currentTime];
          if(tState) {
            instance.publishState(tState.state, tState.token);
          }
          instance.data.currentTime++;
          instance.publishState('current_second', instance.data.currentTime);
        }
      }, 1000);
    } 
  };  

  xhr.send(body);

}