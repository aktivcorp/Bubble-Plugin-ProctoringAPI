function(instance, properties, context) {    
  if (properties.client && properties.exam && properties.proctor && properties.student) {
    console.log('Exam init(on update)', properties.exam);
    if (instance.data.inititialized) return;;    
    instance.data.inititialized = true;
    
    instance.data.fire = function(content, extra) {
      if(extra && extra != 'null') {
        setTimeout(function() {
          console.log('fire event', content);
          instance.triggerEvent(content);
        }, 5000);
      } else {
          instance.triggerEvent(content);
      }  
    }
  
	if (instance.data.client) {
      console.log('Exam close old hub connection')
      instance.data.client.disconnect();
      instance.data.client = null;
    }

    instance.data.client = new BroadcastHubClient({
      server: 'https://'+context.keys.api_host+':8443/sockets/',
      auth: 'Exam'
    });  

    console.log('Exam inited on', instance.data.client.client._server);
    setTimeout(function() {
      console.log('SockJS transport (Exam)', instance.data.client.client.transport);
    }, 4000);
    
    
    var xhr1 = new XMLHttpRequest();
    var body = '';

    body = 'client='+properties.client;    
    body += '&exam='+properties.exam;
    body += '&proctor='+properties.proctor;    

    xhr1.open("POST", 'https://'+context.keys.api_host+'/timeline/streams', true);
    xhr1.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr1.onload  = function() {
      if (xhr1.response) {
        var resp = JSON.parse(xhr1.response).response;
        if (resp.length > 0) {
          for(var i in resp) {
            if(resp[i].extra) {
              console.log('student stream loaded ', resp[i].content, resp[i].extra);
              instance.publishState(resp[i].content, resp[i].extra);                      
              instance.triggerEvent(resp[i].content);
            }
          }                  
        } 
      }
    };  

    xhr1.send(body);
    
    
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

   	  instance.data.client.on('message:'+properties.exam, function (message) {
        var received = JSON.parse(message);
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
        } else if(received.entity == 'stream'  && received.user == properties.student) {    
          console.log('student stream received ',received.content,received.extra);
          instance.publishState(received.content, received.extra);          
          if(received.extra) {
            instance.data.fire(received.content, received.extra);
          }
        }
      });
      instance.data.client.subscribe(properties.exam);
    };   
    xhr.send(body);           
  }
}