mqtt = require('mqtt');


var _commTools = {}

var _myProcess = undefined;

var updateBeacon = function(route, lastPosition){

	/*This function has the porpouse of sending all the data related with one beacon, this info is: 
		-> Corresponding beacon
		-> Last position
		-> Route progress
	*/

	/*Here we verify that the lastPosition to send is in the corresponding route.*/		
	if(route.beacons.includes(lastPosition.chipid)){

		/*If it is now we create de updating object and we make it equal to the route object*/
		var _updateBeacon = route;
		_updateBeacon.beaconsObj = [];//We add an empty array to store objects that will ease ops in the frontend
		//Now we create these objects.
		_updateBeacon.beacons.forEach(function(b){
			//We go and look for the object of the device in our route's list
			let myDevice = processingTools.beaconsInPlay.find(function(device){
				return device.chipid == b;
			})
			//Only if the device is found we proceed
			if(myDevice){
				// then we insert the object into the array "beaconsObj"
				_updateBeacon.beaconsObj.push({chipid:myDevice.chipid,x:myDevice.x,y:myDevice.y});
			}
		});

		/*The we assign the lastPosition object*/
		_updateBeacon.lastPosition = lastPosition;
		/*Finally we add the index of the last position in the route.*/
		_updateBeacon.lastPositionIndex = route.beacons.findIndex(function(item){return item.chipid == lastPosition.chipid;});
		//We make the string needed to be send through MQTT protocol.
		var _string = JSON.stringify(_updateBeacon);
		/*Iniciamos coneccion entre el broker y el cliente MQTT*/
		var client = mqtt.connect('http://10.42.0.1');
		/*En cuanto la conección es exitosa se realizan las operaciones*/
		client.on('connect',function(){
			/*Se envía en dos topicos para podere así ver el trafico general o solo el trafico de una ruta en particular*/
			client.publish('update/'+_updateBeacon.beaconMarj+_updateBeacon.beaconMino,_string);
			client.publish('update/general',_string);
			//Al finalizar los envios el cliente se cierra para evitar problemas.
			client.end();
		});
	}
}

var watchCommand = function(command, route){
	var client = mqtt.connect('http://10.42.0.1');

	client.on('connect', function(){
		client.publish('stopWatch',JSON.stringify({command:command,route:route}));
		client.end();
	});
}

var imAlive = function(){
	var client = mqtt.connect('http://10.42.0.1');
	var serviceObject = {service:_myProcess,
						 date:new Date()
						};

	serviceObject.time = serviceObject.date.getTime();

	//console.log("imalive called");

	client.on('connect', function(){

		let _oImA = {service:_myProcess,date:new Date()}
		_oImA.time = _oImA.date.getTime();
		// //console.log(_oImA);
		client.publish('imAlive',JSON.stringify(_oImA));
		client.publish('imAlive/'+_myProcess,JSON.stringify(_oImA));
		//console.log("-----> mensaje enviado <--------");
		client.end();
	})

	return serviceObject;
}

var setProcess = function(newProcess){
	_myProcess = newProcess;
}

var getProcess = function(){
	return _myProcess;
}

_commTools = {
	updateBeacon:updateBeacon,
	watchCommand:watchCommand,
	imAlive:imAlive,
	setProcess:setProcess,
	getProcess:getProcess
};

module.exports = _commTools;