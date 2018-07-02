
mqtt = require('mqtt');

var route = [ "3739794", "7792632", "4371333", "1061037", "16639475", "8909802", "566770", "4440430", "3738973", "16638430", "3740195", "4427747" ];

var sendLocation = function(message){
	var client = mqtt.connect('http://localhost');

	client.on('connect', function(){
		client.publish('tugger',message);
		client.end();
	});
}

var startDemo = function(puntos,index,time){

	let i = 0;
	let t = 6000;

	if(time)
		t = time;
	console.log("iniciando, intervalos: ",t);
	if(index)
		i = index;

	if(!puntos)
		puntos = route;

	console.log("i vale: ",i);

	if(i<puntos.length){

		console.log("entro al if");
		let objeto = {}

		objeto.minLoad = "17C1";
		objeto.maxLoad = "000F";
		objeto.distancia = 1;
		objeto.chipid = puntos[i];

		let _string = JSON.stringify(objeto);

		sendLocation(_string);
		console.log("tugger:",_string);


		setTimeout(function(){
			startDemo(puntos,i+1,t);
		},t);
	}
}

var startRandomDemo = function(puntos,index,lapNo,stop,time){

	let i = 0;
	let t = Math.floor((Math.random()*2000)+4000);
	console.log("next time: ",t);
	let ln = 0;
	let s = 1;

	if(time)
		t = time;
	console.log("iniciando, intervalos: ",t);
	if(index)
		i = index;

	if(!puntos)
		puntos = route;

	if(lapNo)
		ln = lapNo;

	if(stop)
		s = stop;

	console.log("i vale: ",i);

	if(i<puntos.length){

		console.log("entro al if");
		let objeto = {}

		objeto.minLoad = "17C1";
		objeto.maxLoad = "000F";
		objeto.distancia = 1;
		objeto.chipid = puntos[i];

		let _string = JSON.stringify(objeto);

		sendLocation(_string);
		console.log("tugger:",_string);


		setTimeout(function(){
			startRandomDemo(puntos,i+1);
		},t);
	}else if(ln < s){
		ln++;
		startRandomDemo(puntos,undefined,ln,stop);
	}else{
		console.log("sim laps done!!");
	}
}

var newControledMove = function(routeToFollow){

	var i = 0;
	if(!routeToFollow)
		routeToFollow = route;
	var _next = function(){

		if(i<routeToFollow.length){

			console.log("entro al if");
			let objeto = {}

			objeto.minLoad = "17C1";
			objeto.maxLoad = "000F";
			objeto.distancia = 1;
			objeto.chipid = routeToFollow[i];

			let _string = JSON.stringify(objeto);

			sendLocation(_string);
			console.log("tugger:",_string);
			i++;

		}else{
			i = 0;
			_next(0);
		}
	}

	return _next;

}

simTools = {
	startDemo:startDemo,
	newControledMove:newControledMove,
	startRandomDemo:startRandomDemo
};

module.exports = simTools;