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
	spawn = require("child_process").spawn;
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
	
	
	peliculas.get('/web/style.css', function(req, resp) 
	{
	  fs.readFile("web/style.css", function (error, pgResp) {
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
			
			if((fields.resolucionH * fields.resolucionV * fields.duracion * fields.framerate * fields.gop * fields.bitrate) == 0  && fields.checkServer == 0)
			{
				res.write('Algún parámetro del vídeo es inválido');
				console.log('Algún parámetro del vídeo es inválido');
				res.end();
				return;
			}
			
			// Guardamos el archivo
			fs.rename(oldpath, newpath, function(err)
			{
				// Si se produce un error, es probable que el video ya exista
				if (err)
				{					
					console.log("Operation not permitted, probaably the file already exists");
					res.write('Ya existe un video con ese nombre');
					return;
				}
			});
			
			// Generamos los párametros nosotros
			console.log(fields.serverCheck)
			console.log(fields.nombreOriginal)
			if (fields.serverCheck)
			{
				var process = spawn('python',["Scripts/GenerateCopies.py", newpath, "-none"]);
				
				process.stdout.on('data', function (data)
				{
					console.log("Añadido a la base de datos")
					
					MongoClient.connect(url, function(err, db) 
					{
						console.log("connecting db");
						if (err) throw err;
						
						if(fields.nombreOriginal != "none")
						{
							var added;
							var query = { nombre: files.filetoupload.name};
							// Buscamos la añadida mediante el script
							db.collection("peliculas").findOne(query,function(err, pelicula)
							{
								if (pelicula != null)
									added = pelicula
								else
								{
									console.log("No se encontró la peli subida por la script")
									return;
								}
								query["nombre"] = fields.nombreOriginal;
								
								// Buscamos la original
								db.collection("peliculas").findOne(query,function(err, pelicula)
								{
									console.log("Buscando versión original");
									added["original"] = pelicula["_id"];
									
									query["nombre"] = files.filetoupload.name;
									// Updateamos la añadida por la script
									db.collection("peliculas").update(query, added, {assert: true},function(err, pelicula)
									{
										console.log("Updateando");
										res.write('Copia subida con éxito');
										res.end();
									});
								});
							});
							
						}
						else
						{
							res.write('Original file uploaded and moved!');
							res.end();
						}
						
					});
				});
				
				return;
			}
			// En caso contrario, nos fiamos del usuario
			else
			{
				var path = "http://localhost:8080/videos/"
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
				if(fields.entrelazado)
					peli["entrelazado"] = true;
				else
					peli["entrelazado"] = false;
				peli["original"] = 0
				
				// Conectamos con la DB
				MongoClient.connect(url, function(err, db) 
				{
					console.log("connecting db");
					if (err) throw err;
					
					if(fields.nombreOriginal != "none")
					{
						var query = { nombre: fields.nombreOriginal }
						db.collection("peliculas").findOne(query,function(err, pelicula)
						{
							console.log("Buscando versión original");
							peli["original"] = pelicula["_id"];
							
							console.log("finding peli " + JSON.stringify(peli));
							db.collection("peliculas").findOne(peli,function(err, pelicula)
							{
								if (err) throw err;
								
								// En caso de que no exista ya, la guardamos
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
					}
					else
					{
						db.collection("peliculas").findOne(peli,function(err, pelicula)
						{
							if (err) throw err;
							
							// En caso de que no exista ya, la guardamos
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
					}
				});
			}	
			
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
