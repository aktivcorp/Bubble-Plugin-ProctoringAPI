function(instance, properties, context) {
  console.log('ExamStudent init', properties.exam, properties.client);
  
  if (instance.data.client) {
    console.log('ExamStudent close old hub connection')
    instance.data.client.disconnect();
    instance.data.client = null;
  }

  instance.data.client = new BroadcastHubClient({
    server: 'https://'+context.keys.api_host+':8443/sockets/',
    auth: properties.student
  });  
  
  console.log('ExamStudent inited on', instance.data.client.client._server);
  setTimeout(function() {
    console.log('SockJS transport (ExamStudent)', instance.data.client.client.transport);
  }, 4000);
  
  if(properties.exam && properties.client) {
    if (!instance.data.client._channels[0]) {
      instance.data.client.on('message:'+properties.exam, function (message) {
        if (message.match(/online:/) && message.match(properties.proctor)) {
          //instance.publishState("actual_status", 'online');    
          //instance.triggerEvent("online");
          return;
        } else if (message.match(/offline:/) && message.match(properties.proctor)) {
          //instance.publishState("actual_status", 'offline');    
          //instance.triggerEvent("offline");    
          return;
        }
        received = JSON.parse(message);
        if(received.entity == 'exam' && received.content == 'start') {      
          instance.triggerEvent("started");
        } else if(received.entity == 'exam' && received.content == 'finished') {      
          instance.triggerEvent("finished");
        } else if (received.entity == 'message') {
          	instance.triggerEvent('newMessage');
        } else if(received.entity == 'stream' && received.user == properties.proctor) {    
          console.log('proctor stream received ',received.content,received.extra);
          instance.publishState('proctor_media', received.extra);
          if(received.extra) {
            setTimeout(function() {
              instance.triggerEvent("proctorMedia");
            }, 5000);
          } else {
            instance.triggerEvent("proctorMedia");
          }
        }
      });
      
      instance.data.client.subscribe(properties.exam);
    }    
  }

}