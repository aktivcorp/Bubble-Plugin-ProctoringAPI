function(instance, properties, context) {
  
  var xhr = new XMLHttpRequest();

  var body = '';   

  body = 'client='+properties.client;    
  body += '&exam='+properties.exam;

  xhr.open("POST", 'https://'+context.keys.api_host+'/timeline/chat', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.onload  = function() {
    instance.canvas.empty();
    if (xhr.response) {
      var resp = JSON.parse(xhr.response).response;
      if (resp.length > 0) {
        for(var i in resp) {
          instance.canvas.append($('<p><b>'+resp[i].extra+':</b> '+resp[i].content+'</p>'));
        }                  
      } 
    }
  };  

  xhr.send(body);

  var client = new BroadcastHubClient({server: 'https://'+context.keys.api_host+':8443/sockets/'});
  client.subscribe(properties.exam);
  client.on('message:'+properties.exam, function (message) {
      received = JSON.parse(message);
      if(received.entity == 'message') {      
        instance.canvas.append($('<p><b>'+received.extra+':</b> '+received.content+'</p>'));
      }
  });

}