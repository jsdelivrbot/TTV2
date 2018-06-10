//This file has the function of register all the changes recieved through MQTT protocol into the MongoDB database.

// Needed libraries in order to interact with both systems involved in this service.
var MongoClient = require('mongodb').MongoClient;// Library to make different queries to the data base in MongoDB
var mqtt = require('mqtt');//Library to interact with MQTT broker and messages

//this is url to connect to the MongoDB server.
var url = 'mongodb://localhost:27017';

//client obeject is declared, it will make all the interactions with the broker.
var client = mqtt.connect('http://10.42.0.1');

//In this "client" objetc all callbacks will be registered, firstone is "connect" callback, as it's name sais,
//this callback will be executed when the clien has a successfull connection.
client.on('connect',function(){
	client.publish('presence','Hello MQTT Server ok');// just a friendly hello for debugging
	client.subscribe('node/register')//this is the topic where the devices send their first message, where they register.
	client.subscribe('tugger');//this is the most important topic, this topic will have all the messages with the tugger possible positions
	console.log("****** MQTT CONNECTION ACHIEVED ******");//Debugging message.
});

/*This is a general function, it will contain other local functions for each topic that the client needs to 
suscribe. 

Any other function required for any other topic, need to be declar as local inside this main callback function*/
mqttCallBack = function(topic,message){

	//CallBack function for 'node/register' topic:
	var registerCallBack = function(){

		//local function used to register beacon, this function will be called in the code bellow
		var registerBeacon = function(chipid, mode, x, y, marj, mino)
		{
			/*First thing program does is trying to connect to the server:
				-> url, is a string that contains the link to the database, it is declared on the beginning of the code
				-> the anonimous function found next to the url parameter is the callback for the attempt of connection*/
			MongoClient.connect(url, function(err, db) {
				//Quite simple, if there is something wrong, throw an exception.
				if (err) throw err;

				// we declare the name of the database
				var dbo = db.db("mydb");

				// an empty object is create to make the query
				var objeto = {};

				/* In the new object all the fields are declared and asigned only if they are defined*/
				if(chipid)
					objeto.chipid = chipid;

				if(mode)
					objeto.mode = mode;

				if(x)
					objeto.x = x;

				if(y)
					objeto.y = y;

				if(marj)
					objeto.marj = marj;

				if(mino)
					objeto.mino = mino;

				//This variable is the query, it's used to locate the register in the database.
				var query = {chipid:objeto.chipid};

				dbo.collection("BeaconsInPlay").find(query).toArray(function(err,result){
					if(err) throw err;

					//If there is no previews register with that chipID, then we create a newone
					if(result.length<=0){
						dbo.collection("BeaconsInPlay").insertOne(objeto, function(err, res) {
							if (err) throw err;
							console.log("****** NEW DEVICE SUCCESSFULLY REGISTERED ******");
							//database access is closed, this one is a very important step.
							db.close();
						});//End of "insertOne" callback
					}
					else
					{
						console.log("UPDATE OBJECT IN $SET IS:",objeto);
						var newValues = {$set:objeto};
						dbo.collection("BeaconsInPlay").updateOne(query,newValues,function(err,res){
							if(err) throw err;
							console.log("****** DEVICE SUCCESSFULLY UPDATED ******!");
							db.close();
						});//End of "update" callback
					}
				});//End of "find" callback
			});//End of "on-connect" callback
		}


		//in this variable the object that cames out of the MQTT message will be saved.
		var messageObject;
		try
		{
			var str = ""+message;//parsing to string
			str = str.replace(/'/g,"\"");//formating the string for a proper parsing
			var correcciones = str.match(/:[^"]*.?[,}]/g,str)
			correcciones.forEach(function(x){
				var __temp = x.replace(/:/g,':"');
				__temp = __temp.replace(/}/g,'"}');
				__temp = __temp.replace(/,/g,'",');
				str = str.replace(x,__temp);
			})
			messageObject = JSON.parse(str);//once the string has been prepared, we try the parsing
		}catch(e)//any exception during the formatting or the parsing will be catched by catch block
		{
			console.log("ERROR: String recieved: "+message+" wasn't able to be parse",e.toString());
		}

		//if messageObject was properly created software proceed
		if(messageObject){
			//registerBeacon function is a local function declared and explained before in this code.
			registerBeacon(messageObject.chipid, messageObject.mmessageObjectde, messageObject.x, messageObject.y, messageObject.MARJ, messageObject.MINO);
		}
	}//End of registerCallBack function

	var tuggerCallBack = function(){

		// {"distancia":28.183829312645,"UUID":"00E21F12BEEC5C54ACFF72203E661005","minLoad":"E6E7","maxLoad":"0B10","chipid":3740195,"txPower":"06","signal":"-086"}
		var updateDevice = function(distancia, UUID, mino, marj,chipid){


			MongoClient.connect(url, function(err, db) {
				//Quite simple, if there is something wrong, throw an exception.
				if (err) throw err;

				// we declare the name of the database
				var dbo = db.db("mydb");

				var objeto = {}

				if(distancia)
					objeto.distancia = distancia;

				if(UUID)
					objeto.UUID = UUID;

				if(mino)
					objeto.mino = mino;

				if(marj)
					objeto.marj = marj;

				if(chipid)
					objeto.chipid = chipid

				objeto.registerTime = Date.now();
				objeto.registerDate = new Date();

				//This variable is the query, it's used to locate the register in the database.
				var query = {chipid:objeto.chipid};
				var tableName = "BeaconTable_"+marj+mino; 

				dbo.collection(tableName).find(query).toArray(function(err,result){
					if(err) throw err;

					//If there is no previews register with that chipID, then we create a newone
					if(result.length<=0){
						dbo.collection(tableName).insertOne(objeto, function(err, res) {
							if (err) throw err;
							console.log("****** NEW TABLE SUCCESSFULLY REGISTERED ******");
							//database access is closed, this one is a very important step.
							db.close();
						});//End of "insertOne" callback
					}
					else
					{
						console.log("UPDATE OBJECT IN $SET IS:",objeto);
						var newValues = {$set:objeto};
						dbo.collection(tableName).updateOne(query,newValues,function(err,res){
							if(err) throw err;
							console.log("****** BEACON TABLE: "+tableName+" UPDATED ******!");
							db.close();
						});//End of "update" callback
					}
				});//End of "find" callback
			});//End of "on-connect" callback
		}


		var messageObject;
		try
		{
			var str = ""+message;//parsing to string
			str = str.replace(/'/g,"\"");//formating the string for a proper parsing
			var correcciones = str.match(/:[^"]*.?[,}]/g,str)
			correcciones.forEach(function(x){
				var __temp = x.replace(/:/g,':"');
				__temp = __temp.replace(/}/g,'"}');
				__temp = __temp.replace(/,/g,'",');
				str = str.replace(x,__temp);
			})
			messageObject = JSON.parse(str);//once the string has been prepared, we try the parsing
		}catch(e)//any exception during the formatting or the parsing will be catched by catch block
		{
			console.log("ERROR: String recieved: "+message+" wasn't able to be parse",e.toString());
		}

		//if messageObject was properly created software proceed
		if(messageObject){
			//registerBeacon function is a local function declared and explained before in this code.
			updateDevice(messageObject.distancia, messageObject.UUID, messageObject.minLoad, messageObject.maxLoad,messageObject.chipid);
		}
	}

	switch(topic)
	{
		case "tugger":
			tuggerCallBack(message);
			break;

		case "node/register":
			registerCallBack(message);
			break;

		default:
			break;
	}
}


client.on('message',mqttCallBack);

client.on('error', function(err) {
    console.log(err);
});