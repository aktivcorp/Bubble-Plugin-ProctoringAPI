function(properties, context) {
	var xhr = new XMLHttpRequest();

    var body = '';    

    body = 'username='+encodeURIComponent(properties.username);
    body += '&name='+encodeURIComponent(properties.name);
    body += '&phone='+encodeURIComponent(properties.phone);
    body += '&password='+encodeURIComponent(properties.password);
    body += '&role='+encodeURIComponent(properties.role);
    body += '&info='+encodeURIComponent(properties.info);
    body += '&country_id='+encodeURIComponent(properties.country_id);
    body += '&city='+encodeURIComponent(properties.city);
  	body += '&external_id='+encodeURIComponent(properties.external_id);
  	body += '&client='+encodeURIComponent(properties.client);

    xhr.open("POST", 'https://'+context.keys.api_host+'/auth/create', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(body);
    xhr.onload = function () {
        if (xhr.readyState === xhr.DONE) {
            console.log('API','AUTHCREATE',xhr.status,xhr.response,properties.username);
        }
    };

}