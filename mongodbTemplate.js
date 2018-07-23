var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017';


MongoClient.connect(url, function(err, db) {
	//Quite simple, if there is something wrong, throw an exception.
	if (err) throw err;

	// we declare the name of the database
	var dbo = db.db("mydb");

	// an empty object is create to make the query
	var query = {};

	dbo.collection("BeaconsInPlay").find(query).toArray(function(err,result){
		if(err) throw err;

		result.forEach(function(x){console.log(x)});

		db.close();
	});//End of "find" callback

	// var newValues = {$set:objeto};
	// dbo.collection("BeaconsInPlay").updateOne(query,newValues,function(err,res){
	// 	if(err) throw err;

	// 	db.close();
	// });//End of "update" callback


});//End of "on-connect" callback