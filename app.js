var express  = require("express"),
    app      = express(),
	bodyParser  = require("body-parser"),
	methodOverride = require("method-override");
    http     = require("http"),
    server   = http.createServer(app),
    mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

db = mongoose.createConnection('mongodb://localhost:27017/tvshows', function(err, res) 
 {
  if(err) 
    console.log('ERROR: connecting to Database. ' + err);
 });
	// Middlewares
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// Import Models and controllers
	var models     = require('./models/tvshow')(app, mongoose);
	var TVShowCtrl = require('./controllers/tvshows');

	// Example Route
	var router = express.Router();
	router.get('/test', function(req, res) 
	{
	  res.send("Hello world!");
	});
	app.use(router);

	// API routes
	var tvshows = express.Router();

	tvshows.route('/tvshows')
	  .get(TVShowCtrl.findAllTVShows)
	  //.get(function(req, res) {res.send("Hello world!");})
	  .post(TVShowCtrl.addTVShow);

	tvshows.route('/tvshows/:id')
	  .get(TVShowCtrl.findById)
	  .put(TVShowCtrl.updateTVShow)
	  .delete(TVShowCtrl.deleteTVShow);

	app.use(tvshows);
  
    app.listen(3000, function() 
    {
		console.log("Node server running on http://localhost:3000");
    });
