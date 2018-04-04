function(instance, properties, context) {
  	instance.data.heightmyvideo = instance.canvas[0].offsetHeight;
    instance.data.widthmyvideo = instance.canvas[0].offsetWidth;

    if(instance.data.widthmyvideo) {
      if (!instance.data.videoLeft) {
        instance.data.videoLeft = $('<video></video>');
        instance.data.videoLeft.attr('autoplay', true);        
        instance.data.videoLeft.width(instance.data.widthmyvideo + 'px');
        instance.data.videoLeft.height(instance.data.heightmyvideo + 'px');
        instance.canvas.append(instance.data.videoLeft);
      } 
      instance.data.videoLeft.attr('controls', properties.type == 'screen_in' || properties.type == 'media_in');      
    }  
  
  	if(properties.type != 'media_out' && properties.type != 'screen_out'
      && properties.client && properties.exam && properties.proctor) {  
      var xhr = new XMLHttpRequest();
	  var body = '';

      body = 'client='+properties.client;    
      body += '&exam='+properties.exam;
      body += '&proctor='+properties.proctor;

      xhr.open("POST", 'https://'+context.keys.api_host+'/timeline/streams', true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      xhr.onload  = function() {
        if (xhr.response) {
          var resp = JSON.parse(xhr.response).response;
          if (resp.length > 0) {
            for(var i in resp) {
              if((resp[i].content=='media' && properties.type == 'media_in') || 
                 (resp[i].content=='screen' && properties.type == 'screen_in') ) {
                instance.data.controller.init(resp[i].extra, properties.type);
              }
            }                  
          } 
        }
      };  

      xhr.send(body);
    
      var client = new BroadcastHubClient({server: 'https://'+context.keys.api_host+':8443/sockets/'});
      client.subscribe(properties.exam);
      client.on('message:'+properties.exam, function (message) {
          received = JSON.parse(message);
          if(received.entity == 'stream') {      
            if((received.content=='media' && properties.type == 'media_in') || 
               (received.content=='screen' && properties.type == 'screen_in') ) {
              if (received.user == properties.id) {
              	instance.data.controller.init(received.extra, properties.type);
              }
            }
          }
      });	
    }
}