var express  = require("express"),
    app      = express(),
	bodyParser  = require("body-parser"),
	methodOverride = require("method-override");
    http     = require("http"),
    server   = http.createServer(app),
    mongoose = require('mongoose');
	fs = require ('fs')
	formidable = require('formidable'); 
	MongoClient = require('mongodb').MongoClient;
	url = 'mongodb://localhost:27017/peliculas';

dbMongoose = mongoose.createConnection(url, function(err, res) 
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
	
	peliculas.post('/fileupload', function(req, res) 
	{
		var form = new formidable.IncomingForm();
		
		form.parse(req, function (err, fields, files)
		{
			var oldpath = files.filetoupload.path;
			var newpath = "videos/"+files.filetoupload.name;
			
			if((fields.resolucionH * fields.resolucionV * fields.duracion * fields.framerate * fields.gop * fields.bitrate) == 0 )
			{
				res.write('Algún parámetro del vídeo es inválido');
				console.log('Algún parámetro del vídeo es inválido');
				res.end();
				return;
			}
			
			var path = "videos/"
			var peli = {}
			peli["nombre"] = files.filetoupload.name;
			peli["path"] = path + files.filetoupload.name;
			peli["resolucionH"] = fields.resolucionH
			peli["resolucionV"] = fields.resolucionV
			peli["duracion"] = fields.duracion
			peli["framerate"] = fields.framerate
			peli["codec"] = fields.codec
			peli["bitrate"] = fields.bitrate
			peli["gop"] = fields.gop
			peli["entrelazado"] = fields.entrelazado
			peli["original"] = 0
			
			// Guardamos el archivo
			fs.rename(oldpath, newpath, function(err)
			{
				if (err) console.log("Operation not permitted");
			});
			
			MongoClient.connect(url, function(err, db) 
			{
				console.log("connecting db");
				if (err) throw err;
				
				console.log("finding peli " + JSON.stringify(peli));
				db.collection("peliculas").findOne(peli,function(err, pelicula)
				{
					if (err) throw err;
					console.log("Contestando todas las pelis:");
					console.log(pelicula);
					
					if(pelicula == null)
					{
						console.log("peli not found");
						db.collection("peliculas").insertOne(peli, function(err) 
						{
							if (err) throw err;
							res.write('File uploaded and moved!');
							res.end();
							console.log(peli)
							db.close();
						});

					}
					else
					{
						res.write('File already exists on the servers database');
						res.end();
					}

				});
				
			});
			
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
