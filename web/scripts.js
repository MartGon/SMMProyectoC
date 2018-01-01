
var strToWrite = ""
var videoURL = "http://127.0.0.1:8080/"
var peliculasGlobal

function getOriginales(peliculas)
{
	var originales = []
	
	for(var i = 0; i < peliculas.length; i++)
    {
		// Si es una original
		if(peliculas[i]["original"] == 0)
			originales.push(peliculas[i])
    }
	
	return originales
}

function getReplicasByOriginal(original, peliculas)
{
	var replicas = []
	
	for(var i = 0; i < peliculas.length; i++)
	{
		// Si es original, continuamos
		if(peliculas[i]["original"] == 0)
			continue
		
		// Si es réplica de la original
		if(original["_id"] == peliculas[i]["original"])
			replicas.push(peliculas[i])
	}
	
	return replicas
}

function getReplicasByCategoria(categoria, original, replicas)
{
	var replicasByCategoria = []
	
	for(var i=0 ; i < replicas.length; i++)
	{
		if(replicas[i][categoria] != original[categoria])
		{
			replicasByCategoria.push(replicas[i])
		}
	}
	
	return replicasByCategoria
}

function printAvailableVideos(peliculas)
{
	//var peliculas = getPeliculasFromServer()
	addLineToLog(peliculas[0]["nombre"])
	var originales = getOriginales(peliculas)
	peliculasGlobal = peliculas;
	resetVideoMenuDiv()
	
	// Para cada original
	for(var i = 0; i < originales.length; i++)
	{
		// Cogemos sus replicas
		var replicas = getReplicasByOriginal(originales[i],peliculas)
		
		writeToVideoMenuDiv("<div><h3>" + originales[i]["nombre"] + "</h3>\n")
		addLoadingVideoButton(originales[i])
		
		// Para cada categoria
		for (var categoria in originales[i])
		{
			// Ignoramos estas categorias pues no son clasificatorios
			if(categoria == "nombre" || categoria == "original" || categoria=="bitrate" || categoria == "path" || categoria == "resolucionV" || categoria == "_id" || categoria == "duracion")
				continue
			
			// Cogemos la replicas para esa categoria
			var replicasByCategoria = getReplicasByCategoria(categoria, originales[i], replicas)
			
			// Printeamos
			printVideosByCategoria(replicasByCategoria, categoria)
		}
		
		writeToVideoMenuDiv("</div>")
	}
	
	doWriteToMenuDiv()
}

function printVideosByCategoria(replicas, categoria)
{
	
	writeToVideoMenuDiv("<fieldset><h4>"+ categoria +"</h4><fieldset>")
	
	for (var i = 0; i < replicas.length; i++)
	{
		writeToVideoMenuDiv("<p>"+replicas[i]["nombre"]+"</p>")
		addLoadingVideoButton(replicas[i])
	}
	writeToVideoMenuDiv("</fieldset></fieldset>")

}

function addLineToLog(line)
{
	var string = document.getElementById('answer').value
	string += line + "\n" 
	document.getElementById('answer').value = string
}

function resetVideoMenuDiv()
{
	strToWrite = ""
	document.getElementById("video-menu-div").innerHTML = ""
}

function writeToVideoMenuDiv(str)
{
	var text = document.getElementById("video-menu-div").innerHTML
	document.getElementById("video-menu-div").innerHTML += str
	strToWrite += str
}

function doWriteToMenuDiv()
{
	document.getElementById("video-menu-div").innerHTML = strToWrite
}

function writeSelectTag(originales)
{
	
}

function addLoadingVideoButton(video)
{
	str = "<button type='submit' onclick=\"var videoPlayer = document.getElementById('video-player');";
	str+= "var source = document.createElement('source');"
	str+="videoPlayer.pause();source.setAttribute('src','"+ videoURL + video["path"] + "');	videoPlayer.innerHTML='';videoPlayer.appendChild(source);videoPlayer.load();videoPlayer.width =" + video["resolucionH"]+ ";videoPlayer.height =" + video["resolucionV"]+ ";\">Cargar video</button>  "
	console.log(videoURL + video["path"]);
	console.log(str)
	writeToVideoMenuDiv(str)
}

function callbacked(pelis)
{
	printAvailableVideos(pelis);
}

function getPeliculasFromServer() 
{
	var peliculas = []
	
	// Solicitud REST
    $(document).ready(function() 
	{
		$.ajax({
			url: "http://127.0.0.1:3000/peliculas",
			
		}).then(function(data) 
		{
		   
		   for(var i = 0; i < data.length; i++)
		   {
			   var peli = {}
			   peli["_id"] = data[i]._id
			   peli["nombre"] = data[i].nombre
			   peli["path"] = data[i].path
			   peli["resolucionH"] = data[i].resolucionH
			   peli["resolucionV"] = data[i].resolucionV
			   peli["duracion"] = data[i].duracion
			   peli["framerate"] = data[i].framerate
			   peli["codec"] = data[i].codec
			   peli["bitrate"] = data[i].bitrate
			   peli["gop"] = data[i].gop
			   peli["entrelazado"] = data[i].entrelazado
			   peli["original"] = data[i].original
			   
			   peliculas.push(peli)
			   addLineToLog(peliculas[i]["nombre"])
		   }
			  callbacked(peliculas);

		});
	
	});

	return peliculas
}
	
	var imageAddr = "http://seasonlegion.ddns.net:/wallpaper.jpg";
	var startTime, endTime;
	var downloadSize = 395000;
	var download = new Image();

function testConnection()
{
	download.onload = function () {
		endTime = (new Date()).getTime();
		showResults();
	}
	
	startTime = (new Date()).getTime();
	download.src = imageAddr;
}

function showResults() 
{
    var duration = (endTime - startTime) / 1000;
    var bitsLoaded = downloadSize * 8;
	var speedBps = bitsLoaded / duration
    var speedKbps = (speedBps / 1024).toFixed(2);
	
	var peliculas = peliculasGlobal
	
	if (peliculas == null)
	{
		alert("¡Carga las pelis primero!");
		return
	}
	
	var mejorPeli = peliculas[0]
	
	for(var i = 0; i < peliculas.length; i++)
	{
		if (mejorPeli["bitrate"] < peliculas[i]["bitrate"] && peliculas[i]["bitrate"] < speedKbps)
			mejorPeli = peliculas[i]
	}
	
    alert("Te recomendadmos " + mejorPeli["nombre"]);
}