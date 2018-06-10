

var client = mqtt.connect('http://10.42.0.1');

client.on('connect',function(){
	client.subscribe('presence');
	client.publish('presence','Hello mqtt');
	console.log("CONECCION MQTT REALIZADA**********")
});


var mqttCallback = function(topic, message){

	/*Here you do whatever you need to do with your messages*/

	switch(topic){
		case "topic1":
			console.log("here lays the code of topic1 RIP");
		break;
		case "topic2":
			console.log("beloved father of two small bytes, here lays the callback for topic2");
		break;
		default:
			console.log("Who know whose corps is this....");
		break;
	}

}

client.on('message',mqttCallback);