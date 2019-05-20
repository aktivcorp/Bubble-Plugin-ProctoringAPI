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
    body += '&wf_url='+encodeURIComponent(window.location.origin+
                                          (window.location.pathname.match(/version-test/) ? '/version-test':'')+
                                         '/api/1.1/wf/');


    xhr.open("POST", 'https://'+context.keys.api_host+'/exam/create', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(body);
    xhr.onload = function () {
        if (xhr.readyState === xhr.DONE) {
            console.log('API','EXAMCREATE',xhr.status,xhr.response);
        }
    };
}