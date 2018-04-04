function(properties, context) {
	var xhr = new XMLHttpRequest();

    var body = 'user='+encodeURIComponent(properties.user);   
    body += '&client='+encodeURIComponent(properties.client);	
    body += '&exam='+encodeURIComponent(properties.exam);
    body += '&entity='+encodeURIComponent(properties.entity);
    body += '&content='+encodeURIComponent(properties.content);
    body += '&extra='+encodeURIComponent(properties.extra);

    xhr.open("POST", 'https://'+context.keys.api_host+'/timeline/add', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(body);
}