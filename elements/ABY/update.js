function(instance, properties, context) {

  var xhr = new XMLHttpRequest();

  var body = '';   

  body = 'client='+properties.client;    
  body += '&exam='+properties.exam;
  
  if (instance.data.tmInterval != null) clearInterval(instance.data.tmInterval);
  for (var t in instance.data.tmTo) {
    clearTimeout(instance.data.tmTo[t]);
  }
  instance.data.tmInterval = null;
  instance.data.tmTo = [];  
  
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
          if (!start_ts) {
            start_ts = resp[i].ts;
            var seconds_Counter = 0;
            instance.data.tmInterval = setInterval(function() {
              seconds_Counter++;
              instance.publishState('current_second', ''+seconds_Counter);              
            }, 1000);
          }
          var state = resp[i].role+'_'+resp[i].content;
          var token = resp[i].extra;
          var delay = parseInt(resp[i].ts) - parseInt(start_ts);
          console.log('!',state,token,delay);
          (function(st,tk,dl) {
            instance.publishState(st+'_wait', ''+delay);
            console.log(st+'_wait', ''+delay);
            instance.data.tmTo.push(setTimeout(function() {
              instance.publishState(st+'_wait', null);
              instance.publishState(st, tk+(st.match('media')?'_aac.mp4':'_screen.mp4'));
            }, dl));  
          })(state,token,delay*1000);          
        }
      }                  
    } 
  };  

  xhr.send(body);

}