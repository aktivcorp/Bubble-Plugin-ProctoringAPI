function(properties, context) {
 	var xhr = new XMLHttpRequest();

    var body = '';   
  
  	var date = new Date(properties.start_date);

    body = 'student='+encodeURIComponent(properties.student);
    body += '&proctor='+encodeURIComponent(properties.proctor);
    body += '&title='+encodeURIComponent(properties.title);
    body += '&start_date='+date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    body += '&external_id='+encodeURIComponent(properties.external_id);
  	body += '&client='+encodeURIComponent(properties.client);

    xhr.open("POST", 'https://'+context.keys.api_host+'/exam/create', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(body);
}