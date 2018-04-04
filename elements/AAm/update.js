function(instance, properties, context) {
  console.log('ES', !!SockJS, !!BroadcastHubClient);
  
var client = new BroadcastHubClient({server: 'https://'+context.keys.api_host+':8443/sockets/'});
client.subscribe(properties.exam);
client.on('message:'+properties.exam, function (message) {
  	received = JSON.parse(message);
  	if(received.entity == 'exam' && received.content == 'start') {      
      instance.triggerEvent("started");
    } else if(received.entity == 'exam' && received.content == 'finished') {      
      instance.triggerEvent("finished");
    }
})

}