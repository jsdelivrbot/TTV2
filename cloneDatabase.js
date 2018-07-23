var MongoClient = require('mongodb').MongoClient;
var MongoClient2 = require('mongodb').MongoClient;
var localUrl = 'mongodb://localhost:27017';
var serverUrl = 'mongodb://10.42.0.1:27017';

//This script manages to transfer the database from development laptop to the server

//First of all we connect to the server
MongoClient.connect(localUrl, function(err, localDb) {
	//Quite simple, if there is something wrong, throw an exception.
	if (err) throw err;

	MongoClient2.connect(serverUrl,function(_err,serverDb){

		// we declare the name of the database
		var localDbo = localDb.db("mydb");
		var serverDbo = serverDb.db("mydb");

		// an empty object is create to make the query
		var query = {};

		//First we need to find all the tables in the database. 
		localDbo.collections(function(e, collectionsResult){
			if(e) throw e;

			let ready = [];

			collectionsResult.forEach(function(col){
				console.log(col.s.name);
				console.log("****************")

				/*Now that we have one name from the local database, we need to start reading all it's elements*/
				localDbo.collection(col.s.name).find({}).toArray(function(err,collectionsElements){
					if (err) throw err;

					serverDbo.collection(col.s.name).insertMany(collectionsElements,function(err,res){
						if(err) throw err;
						console.log("Number of documents inserted: ", res.insertedCount);
						ready.push(true);
						if(ready.length == collectionsResult.length){
							localDb.close();
							serverDb.close();
						}
					});//end of insertMany
				});//End of (col.s.name).find({});
			});//End of collectionsResult.forEach
		});//End of the collections query
	});//End of "on-connect" callback from MongoClient2
});//End of "on-connect" callback from MongoClient