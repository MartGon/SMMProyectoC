var express  = require("express"),
    app      = express(),
	bodyParser  = require("body-parser"),
	methodOverride = require("method-override");
    http     = require("http"),
    server   = http.createServer(app),
    mongoose = require('mongoose');
	fs = require ('fs')

db = mongoose.createConnection('mongodb://localhost:27017/peliculas', function(err, res) 
 {
  if(err) 
    console.log('ERROR: connecting to Database. ' + err);
 });
	// Middlewares
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(methodOverride());
	/*app.use(function (req, res, next) 
	{
		res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/peliculas');
		// Request methods you wish to allow
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	});*/

	// Import Models and controllers
	var models     = require('./models/peliculas')(app, mongoose);
	var TVShowCtrl = require('./controllers/peliculasController');

	// Example Route
	var peliculas = express.Router();
	
	peliculas.get('/test', function(req, res) 
	{
	  res.send("Hello world!");
	});
	
	// web routes
	peliculas.get('/web', function(req, resp) 
	{
	  fs.readFile("web/index.html", function (error, pgResp) {
		  
            if (error) {
                resp.writeHead(404);
                resp.write('Contents you are looking are Not Found');
            } else {
                resp.writeHead(200, { 'Content-Type': 'text/html' });
                resp.write(pgResp);
            }
             
            resp.end();
        });
	});
	
	
	peliculas.get('/web/style2.css', function(req, resp) 
	{
	  fs.readFile("web/style2.css", function (error, pgResp) {
            if (error) {
                resp.writeHead(404);
                resp.write('Contents you are looking are Not Found');
            } else {
                resp.writeHead(200, { 'Content-Type': 'text/html' });
                resp.write(pgResp);
            }
             
            resp.end();
        });
	});
	
	peliculas.get('/web/scripts.js', function(req, resp) 
	{
	  fs.readFile("web/scripts.js", function (error, pgResp) {
            if (error) {
                resp.writeHead(404);
                resp.write('Contents you are looking are Not Found');
            } else {
                resp.writeHead(200, { 'Content-Type': 'text/html' });
                resp.write(pgResp);
            }
             
            resp.end();
        });
	});
	
	// API routes

	peliculas.route('/peliculas')
	  .get(TVShowCtrl.findAllTVShows)
	  .post(TVShowCtrl.addTVShow);

	peliculas.route('/peliculas/:id')
	  .get(TVShowCtrl.findById)
	  .put(TVShowCtrl.updateTVShow)
	  .delete(TVShowCtrl.deleteTVShow);

	app.use(peliculas);
  
    app.listen(3000, function() 
    {
		console.log("Node server running on http://localhost:3000");
    });
