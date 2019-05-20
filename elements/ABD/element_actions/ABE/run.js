function(instance, properties, context) {
  console.log('init wowza action: ', properties.id, properties.type);  
    
  if (properties.id && properties.id != 'null') {
    instance.data.heightmyvideo = instance.canvas[0].offsetHeight;
    instance.data.widthmyvideo = instance.canvas[0].offsetWidth;

    if(instance.data.widthmyvideo) {
      if (!instance.data.videoLeft) {
        instance.data.videoLeft = $('<video></video>');
        instance.data.videoLeft.attr('autoplay', true);        
        instance.data.videoLeft.width(instance.data.widthmyvideo + 'px');
        instance.data.videoLeft.height(instance.data.heightmyvideo + 'px');    
        instance.data.videoLeft.attr('controls', properties.type == 'screen_in' || properties.type == 'media_in');      
        instance.canvas.append(instance.data.videoLeft);      
      }     
    } 

    instance.data.controller.init(properties.id, properties.type);
  } else {
    instance.canvas.empty();
    instance.data.videoLeft = null;
  }
}