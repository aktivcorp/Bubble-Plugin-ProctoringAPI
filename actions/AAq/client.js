function(properties, context) {
	var xhr = new XMLHttpRequest();

    var body = '';   
  
  	var date = new Date(properties.start_date);

    body = 'exam='+encodeURIComponent(properties.exam);
    body += '&client='+encodeURIComponent(properties.client);
    body += '&wf_url='+encodeURIComponent(window.location.origin+
                                          (window.location.pathname.match(/version-test/) ? '/version-test':'')+
                                         '/api/1.1/wf/');

    xhr.open("POST", 'https://'+context.keys.api_host+'/exam/start', true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(body);
    xhr.onload = function () {
        if (xhr.readyState === xhr.DONE) {
            console.log('API','EXAMSTART',xhr.status,xhr.response);
        }
    };
}