function(instance, properties, context) {
    var img = new Image();
    img.src = "chrome-extension://ajhifddimkapgcifgcodmmfdlknahffk/icon.png";  
    img.onerror = function() {
      instance.triggerEvent('noExtension');
    }
    img.onload = function() {
      console.log('Screensharing extension OK');
    }
}