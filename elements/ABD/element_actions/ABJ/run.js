function(instance, properties, context) {
  console.log(properties.files);
  if(!properties.files) return;
  var xhr = new XMLHttpRequest();

  var body = '';
  console.log('upload',properties.files.get(0,properties.files.length()));
  if(properties.files) {
    body = 'filename[]='+properties.files.get(0,properties.files.length()).map(function(e){
      return e.replace(/.*\//,'');
    }).join('&filename[]=');
  }

  xhr.open("POST", 'https://'+context.keys.uploader_host+'/web/batch_upload.php', true)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.send(body);
}