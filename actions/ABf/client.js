function(properties, context) {
	var xhr = new XMLHttpRequest();

    var body = '';   
  
  	var date = new Date(properties.start_date);

    body = 'exam='+encodeURIComponent(properties.exam);
    body += '&client='+encodeURIComponent(properties.client);
    body += '&comment='+encodeURIComponent(properties.comment);

    xhr.open("POST", 'https://'+context.keys.api_host+'/exam/comment', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(body);
}