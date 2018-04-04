function(instance, properties, context) {
  
  var client = new BroadcastHubClient({server: "https://"+context.keys.api_host+":8443/sockets/"});
  client.subscribe('test');

}