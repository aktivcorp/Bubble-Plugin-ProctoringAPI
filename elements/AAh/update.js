function(instance, properties, context) {
  console.log('Exam', !!SockJS, !!BroadcastHubClient);
  
	var xhr = new XMLHttpRequest();

    var body = '';   
 
    body = 'client='+properties.client;    
    body += '&exam='+properties.exam;
  	body += '&proctor='+properties.proctor;

    xhr.open("POST", 'https://'+context.keys.api_host+'/timeline/actual', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  
  	xhr.onload  = function() {
      var resp = '';
      if (xhr.response && xhr.response != '') {
      	resp = JSON.parse(xhr.response).response;
      }
      if (resp.length > 0) {
        for(var i in resp) {
          if(resp[i].entity=='status') {
              instance.publishState("actual_status", resp[i].content);
          }
        }                  
      } else {
        instance.publishState("actual_status", "offline");
      }
    };  
  
    xhr.send(body); 
  
  	var client = new BroadcastHubClient({server: 'https://'+context.keys.api_host+':8443/sockets/'});
    client.subscribe(properties.exam);
    client.on('message:'+properties.exam, function (message) {
        console.log('message:',message);
        received = JSON.parse(message);
        console.log(properties.exam, received);
      	if(received.entity == 'status' && received.content == 'offline' && received.extra == 'disconnect') {
      		var xhr = new XMLHttpRequest();
            var body = 'user='+properties.student;   
            body += '&client='+properties.client;	
            body += '&exam='+properties.exam;
            body += '&entity=status&content=offline&extra=byDisconnect';          

            xhr.open("POST", 'https://'+context.keys.api_host+'/timeline/add', true)
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
            xhr.send(body);
          	instance.publishState("actual_status", 'offline');
        } else if (received.entity == 'status' && received.content == 'online' ) {
            instance.publishState("actual_status", 'online');    
          	instance.triggerEvent("online");
        } else if (received.entity == 'message') {
          	instance.triggerEvent('newMessage');
        }
    });
}