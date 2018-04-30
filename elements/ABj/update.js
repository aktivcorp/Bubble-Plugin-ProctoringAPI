function(instance, properties, context) {
  if (!instance.data.videoP) {
    instance.data.heightmyvideo = properties.height || instance.canvas[0].offsetHeight;
    instance.data.widthmyvideo = properties.width || instance.canvas[0].offsetWidth;

    instance.data.videoP = $('<video></video>');
    instance.data.videoP.attr('autoplay', true);        
    instance.data.videoP.attr('controls', true);
    instance.data.videoP.width(instance.data.widthmyvideo + 'px');
    instance.data.videoP.height(instance.data.heightmyvideo + 'px');
    instance.canvas.append(instance.data.videoP);
  }
  var link = 'https://s3.eu-central-1.amazonaws.com/skillum.com/video/'+properties.record;
  console.log('show', link);
  instance.data.videoP.attr('src', properties.record ? link : null);
}