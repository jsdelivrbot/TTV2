
mqtt = require('mqtt')


safePublish = function(mensaje){
	var client = mqtt.connect("http://localhost");

	client.on("connect", function(){

		console.log("connected");
		client.publish("demo_file",mensaje);
		client.end();
		console.log("client done");
	});
}


completePublish = function(mensaje){
	// var client = mqtt.connect("http://10.42.0.1");
	var client = mqtt.connect("http://localhost");

	client.on("connect", function(){

		client.publish("demo_file","complete: "+mensaje);
		client.end();
	});
}


