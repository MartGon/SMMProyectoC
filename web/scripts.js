
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
	writeSelectTag(originales)
	
	// Para cada original
	for(var i = 0; i < originales.length; i++)
	{
		// Cogemos sus replicas
		var replicas = getReplicasByOriginal(originales[i],peliculas)
		
		writeToVideoMenuDiv("<div class='video-header-div'><h3 class='video-header'>" + originales[i]["nombre"] + "</h3>\n")
		addLoadingVideoButton(originales[i])
		addHideShowButton(originales[i])
		addHideShowDiv(originales[i])
		
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
		
		writeToVideoMenuDiv("</div></div>")
	}
	
	doWriteToMenuDiv()
}

function printVideosByCategoria(replicas, categoria)
{
	
	writeToVideoMenuDiv("<h4 class='category-header'>"+ categoria +"</h4><fieldset>")
	writeToVideoMenuDiv('<table style="width:100%">')
	
	for (var i = 0; i < replicas.length; i++)
	{
		if((i%3) == 0)
			writeToVideoMenuDiv('<tr>')
		
		writeToVideoMenuDiv('<td>')
		writeToVideoMenuDiv('<div class="floating-box">')
		writeToVideoMenuDiv("<p class='video-name'>"+replicas[i]["nombre"]+"</p>")
		writeToVideoMenuDiv("<p>Duración:	" + replicas[i]["duracion"] + " segundos </p>")
		writeToVideoMenuDiv("<p>Bitrate:	" + replicas[i]["bitrate"] + " kbps</p>")
		writeToVideoMenuDiv("<p>Framerate:	" + replicas[i]["framerate"] + " fps</p>")
		writeToVideoMenuDiv("<p>Resolucion:	" + replicas[i]["resolucionH"] +"x"+ replicas[i]["resolucionV"] + "</p>")
		writeToVideoMenuDiv("<p>GOP:	" + replicas[i]["gop"] + "</p>")
		writeToVideoMenuDiv("<p>Codec:	" + replicas[i]["codec"] + "</p>")
		writeToVideoMenuDiv("<p>Entrelazado:	" + replicas[i]["entrelazado"] + "</p>")
		writeToVideoMenuDiv("<p style = 'color:red;'>Calidad: " + replicas[i]["calidad"] +  "</p>")
		addLoadingVideoButton(replicas[i])
		addCopyToClipboardButton(replicas[i])
		writeToVideoMenuDiv('</div>')
		writeToVideoMenuDiv('</td>')
		
		if((i%3) == 2)
			writeToVideoMenuDiv('</tr>')
	}
	writeToVideoMenuDiv('</table/>')
	writeToVideoMenuDiv("</fieldset>")

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
	var str = '<option value="none">Ninguno de los otros</option>'
	
	for(var i = 0; i < originales.length; i++)
	{
		str+=  '<option value=' + originales[i]["nombre"] + '>' + originales[i]["nombre"] + '</option>'
	}
	
	document.getElementById("select-upload-vid").innerHTML = str
}

function addLoadingVideoButton(video)
{
	str = "<button type='submit' onclick=\"var videoPlayer = document.getElementById('video-player');";
	str+= "var source = document.createElement('source');"
	str+="videoPlayer.pause();source.setAttribute('src','"+ /*videoURL +*/ video["path"] + "');	videoPlayer.innerHTML='';videoPlayer.appendChild(source);videoPlayer.load();videoPlayer.width =" + video["resolucionH"]+ ";videoPlayer.height =" + video["resolucionV"] + ';document.body.scrollTop = document.documentElement.scrollTop = 0' + ";\">Cargar video</button>  "
	writeToVideoMenuDiv(str)
}

function addCopyToClipboardButton(video)
{
	str = '<br/><br/>Enlace: <input type="text" value=' + video["path"] + ' id=' + video["nombre"] + ' size = "75"><br/></br>'
	str += '<button onclick="copyUrlToClipboard(\'' + video["nombre"] + '\')">Copiar link</button>'
	writeToVideoMenuDiv(str)
}

function copyUrlToClipboard(id)
{
	var copyText = document.getElementById(id);
	copyText.select();
	document.execCommand("Copy");
	alert("Copiado el siguiente enlace: " + copyText.value);
}

function hideShowSection(id) {
	console.log(id)
    var x = document.getElementById(id);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
} 

function addHideShowButton(original)
{
	var str = '<button onclick=hideShowSection(\'hide-show-div-' + original["nombre"] + '\');>Mostras/Ocultar Sección</button>'
	writeToVideoMenuDiv(str)

}

function addHideShowDiv(original)
{
	var str = "<div class='hide-show-div' + id='hide-show-div-" + original["nombre"] + "'>";
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
			   peli["calidad"] = Math.round(data[i].calidad)
			   
			   peliculas.push(peli)
			   addLineToLog(peliculas[i]["nombre"])
		   }
			  callbacked(peliculas);

		});
	
	});

	return peliculas
}
	
// 	Funciones relacionadas con el cáluclo de ancho de banda y recomendación	
	
	var imageAddr = "http://seasonlegion.ddns.net:/wallpaper.jpg";
	var startTime, endTime;
	var downloadSize = 395000; // 400 KB
	var download = new Image();

function testConnection()
{
	
	if (peliculasGlobal == null)
	{
		alert("¡Carga las pelis primero!");
		return
	}
	
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
	
	var peliBitRateMasBajo = peliculas[0];
	
	for(var i = 0; i < peliculas.length; i++)
	{
		if (peliBitRateMasBajo["bitrate"] > peliculas[i]["bitrate"])
			peliBitRateMasBajo = peliculas[i] 
	}
	
	var mejorPeli = peliBitRateMasBajo
	
	for(var i = 0; i < peliculas.length; i++)
	{
		if (mejorPeli["bitrate"] < peliculas[i]["bitrate"] && peliculas[i]["bitrate"] < speedKbps)
			mejorPeli = peliculas[i]
		
		console.log("se ha comparado " + mejorPeli["bitrate"] + " con " + peliculas[i]["bitrate"] + " y con el BW" + speedKbps) 
	}
	
	var mensaje = "Tu ancho de banda es: " + speedKbps + "kb/s \n"
	if(mejorPeli != peliBitRateMasBajo)
		alert(mensaje + "Te recomendadmos " + mejorPeli["nombre"]);
	else
		alert(mensaje + "Esta es la que tiene menor bitrate: " + mejorPeli["nombre"])
}