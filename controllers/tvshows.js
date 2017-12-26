//File: controllers/tvshows.js
var mongoose = require('mongoose');
var TVShow  = mongoose.model('TVShow');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/tvshows';

//GET - Return all tvshows in the DB
exports.findAllTVShows = function(req, res) 
{
	TVShow.find(function(err, tvshows) 
	{
		if(err) res.send(500, err.message);

		console.log('GET /tvshows')
		res.status(200).jsonp(tvshows);
	});
};

exports.HelloWorldFromTV = function(req, res)
{
	
	res.send("Hello world from TV Shows!");
	
}

//GET - Return a TVShow with specified ID
exports.findById = function(req, res) {
	TVShow.findById(req.params.id, function(err, tvshow) {
    if(err) return res.send(500, err.message);

    console.log('GET /tvshow/' + req.params.id);
		res.status(200).jsonp(tvshow);
	});
};

//POST - Insert a new TVShow in the DB
exports.addTVShow = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var tvshow = new TVShow({
		title:    req.body.title,
		year: 	  req.body.year,
		country:  req.body.country,
		poster:   req.body.poster,
		seasons:  req.body.seasons,
		genre:    req.body.genre,
		summary:  req.body.summary
	});
	
	MongoClient.connect(url, function(err, db) 
	{
		if (err) throw err;

		db.collection("tvshows").insertOne(req.body, function(err, res) 
		{
			if (err) throw err;
			console.log("1 document inserted");
			db.close();
		});
	}); 
	
	res.status(200).send({result: "Success"});
	/*
	tvshow.save(function(err, tvshow) 
	{
		if(err) 
		{
			Console.log('There were some errors')
			return res.send(500, err.message);
		}	
			
		res.status(200).jsonp(tvshow);
		Console.log('Saved sucessfully')
	});
	*/
};

//PUT - Update a register already exists
exports.updateTVShow = function(req, res) {
	TVShow.findById(req.params.id, function(err, tvshow) {
		tvshow.title   = req.body.petId;
		tvshow.year    = req.body.year;
		tvshow.country = req.body.country;
		tvshow.poster  = req.body.poster;
		tvshow.seasons = req.body.seasons;
		tvshow.genre   = req.body.genre;
		tvshow.summary = req.body.summary;

		tvshow.save(function(err) {
			if(err) return res.send(500, err.message);
      res.status(200).jsonp(tvshow);
		});
	});
};

//DELETE - Delete a TVShow with specified ID
exports.deleteTVShow = function(req, res) {
	TVShow.findById(req.params.id, function(err, tvshow) {
		tvshow.remove(function(err) {
			if(err) return res.send(500, err.message);
      res.status(200);
		})
	});
};
