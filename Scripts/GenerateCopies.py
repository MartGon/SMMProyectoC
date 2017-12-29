# -*- coding: utf-8 -*-
# Module: default
# Author: Defu
# Created on: 27.12.2017

import sys
import string
import os
import subprocess
import pymongo
import copy
import os.path

from pymongo import MongoClient
from copy import deepcopy
# 	Config
# Variables de configuración para la generación de las copias de vídeo

FrameList = [15, 20, 24, 29.97]
DivisorResolucion = 1.5
CodecList = ["vp9", "wmv2", "theora", "hevc" , "vp8", "mpeg2video", "asv2"]
CodecFileExt = ".mkv"
ServerPath = "";
GOPList = [1, 5, 10, 20, 25, 50, 100]

# Puesta a punto

if len(sys.argv) != 2:
	print ('Número de argumentos incorrecto. Sólo hace falta el path relativo al archivo de video')
	quit()

# Abrimos un log
serviceFile = open("log.txt", "w")
serviceFile.writelines("Video name: " + sys.argv[1] + "\n")

# Abrimos la base de datos
client = MongoClient('localhost', 27017)
db = client.peliculas
collection = db.peliculas

# Formateo del nombre
FileNameSplitted = sys.argv[1].split(".")
FileName = FileNameSplitted[0]
FileExt = "." + FileNameSplitted[1]
InputFileName = FileName + FileExt

# Cogemos los datos del video
	# Cogemos los FPS iniciales
resultadoFPS = subprocess.check_output("ffprobe " + InputFileName + " -v error -show_entries stream=avg_frame_rate -of default=noprint_wrappers=1")
resultadoFPS_Splitted = str(resultadoFPS).split("avg_frame_rate=")
resultadoFPS_Dirty = resultadoFPS_Splitted[1]
resultadoFPS_Final = resultadoFPS_Dirty.replace("\\r\\n", "")
if resultadoFPS_Final == '0/0':
	resultadoFPS_Dirty = resultadoFPS_Splitted[2]
	resultadoFPS_Final = resultadoFPS_Dirty.replace("\\r\\n'", "")

if "/" in resultadoFPS_Final:
	resultadoFPS_Simplificado = round(int(resultadoFPS_Final.split("/")[0]) / int(resultadoFPS_Final.split("/")[1]))
else:
	resultadoFPS_Simplificado = resultadoFPS_Final
	
		# Escribimos el resultado en el LOG
serviceFile.writelines("FPS: " + str(resultadoFPS_Simplificado) + "\n")

	# Cogemos la resolucion Horizontal
resultadoResolucionH = subprocess.check_output("ffprobe " + InputFileName + " -v error -of flat=s=_ -select_streams v:0 -show_entries stream=width")
resultadoResolucionH_Final = int(str(resultadoResolucionH).replace("streams_stream_0_width=", "").replace("b'","").replace("\\r\\n'", ""))

		# Escribimos el resultado en el LOG
serviceFile.writelines("ResolucionH: " + str(resultadoResolucionH_Final) + "\n")

	# Cogemos la resolucion Vertical
resultadoResolucionV = subprocess.check_output("ffprobe " + InputFileName + " -v error -of flat=s=_ -select_streams v:0 -show_entries stream=height")
resultadoResolucionV_Final = int(str(resultadoResolucionV).replace("streams_stream_0_height=", "").replace("b'","").replace("\\r\\n'", ""))

		# Escribimos el resultado en el LOG
serviceFile.writelines("ResolucionV: " + str(resultadoResolucionV_Final) + "\n")

	# Cogemos la duracion
resultadoDuracion = subprocess.check_output("ffprobe " + InputFileName + " -v error -show_entries format=duration -of default=noprint_wrappers=1")
resultadoDuracion_Final = float(str(resultadoDuracion).replace("duration=", "").replace("b'","").replace("\\r\\n'", ""))

		# Escribimos el resultado en el LOG
serviceFile.writelines("Duracion: " + str(resultadoDuracion_Final) + "\n")

	# Cogemos el bitrate
resultadoBitrate = subprocess.check_output("ffprobe " + InputFileName + " -v error -show_entries format=bit_rate -of default=noprint_wrappers=1")
resultadoBitrate_Final = int(str(resultadoBitrate).replace("bit_rate=", "").replace("b'","").replace("\\r\\n'", ""))

		# Escribimos el resultado en el LOG
serviceFile.writelines("Bitrate: " + str(resultadoBitrate_Final) + "\n")

	# Cogemos el codec
resultadoCodec = subprocess.check_output("ffprobe " + InputFileName + " -v error -show_entries stream=codec_name -of default=noprint_wrappers=1")
resultadoCodec_Final = str(resultadoCodec).replace("codec_name=", "").replace("b","").replace("\\r\\n", "").replace("'", "").replace("aac", "")

		# Escribimos el resultado en el LOG
serviceFile.writelines("Codec: " + str(resultadoCodec_Final) + "\n")

	# Cogemos el codec
resultadoGOP_Final = 0
if resultadoGOP_Final != -1:
	resultadoGOP = subprocess.check_output("ffprobe -show_frames " + InputFileName)
	resultadoGOP_Array = str(resultadoGOP).split("pict_type=")

	for e in resultadoGOP_Array:
		if e == resultadoGOP_Array[0]:
			continue
		resultadoGOP_Final = resultadoGOP_Final + 1
		if e[0] == "I" and e != resultadoGOP_Array[1]:
			break
		# Escribimos el resultado en el LOG
serviceFile.writelines("GOP: " + str(resultadoGOP_Final) + "\n")

# Parseamos todo a un documento
	
videoOriginal = {"nombre": InputFileName,
				 "path": "videos/" + InputFileName,
				 "resolucionH": resultadoResolucionH_Final,
				 "resolucionV": resultadoResolucionV_Final,
				 "duracion": resultadoDuracion_Final,
				 "framerate": resultadoFPS_Simplificado,
				 "codec": resultadoCodec_Final,
				 "bitrate": resultadoBitrate_Final,  # en kbps/s
				 "gop": resultadoGOP_Final,  # Número imágenes entre dos I. O sea un número y solo uno.
				 "entrelazado": False
				}
	
if collection.find_one(videoOriginal) is None:
	collection.insert_one(videoOriginal)
	
# Generación de videos por fps
# Las llamadas a comandos externos son secuenciales, lo cual facilita un poco el proceso
for e in FrameList:
	FPS = str(e)
	OutputFileNameFPS = FileName + "_" + FPS + "fps" + FileExt
	
	# Si existe pasamos de lo demas
	if os.path.isfile(OutputFileNameFPS) is not True: 
		os.system("ffmpeg -i " + InputFileName + " -r " + FPS + " -y " + OutputFileNameFPS)
	
	# Preparamos la inserccion en la base de datos
	videoActual = copy.deepcopy(videoOriginal)
	videoActual["nombre"] = OutputFileNameFPS
	videoActual["path"] = "videos/" + OutputFileNameFPS
	videoActual["framerate"] = e;
	if collection.find_one(videoActual) is None:
		collection.insert_one(videoActual)
	
# Generacion de videos por resolucion
resolucionH_actual = resultadoResolucionH_Final 
resolucionV_actual = resultadoResolucionV_Final 
while True:
	resolucionH_actual = round(resolucionH_actual / DivisorResolucion)
	resolucionV_actual = round(resolucionV_actual / DivisorResolucion)
	
	# Apaños para resoluciones pares
	if resolucionH_actual % 2 != 0:
		resolucionH_actual = resolucionH_actual + 1
	if resolucionV_actual % 2 != 0:
		resolucionV_actual = resolucionV_actual + 1
		
	# No seguimos de bajo de esa resolucion
	if(resolucionV_actual < 145):
		break
		
	OutputFileNameRes = FileName + "_" + str(resolucionH_actual) + "x" + str(resolucionV_actual) + FileExt
	
	if os.path.isfile(OutputFileNameFPS) is not True: 
		os.system("ffmpeg -i " + InputFileName + " -vf scale=" + str(resolucionH_actual) + ":" + str(resolucionV_actual) + " " + OutputFileNameRes)
	
	# Preparamos la inserccion en la base de datos
	videoActual = copy.deepcopy(videoOriginal)
	videoActual["nombre"] = OutputFileNameRes
	videoActual["path"] = "videos/" + OutputFileNameRes
	videoActual["resolucionH"] = resolucionH_actual;
	videoActual["resolucionV"] = resolucionV_actual;
	if collection.find_one(videoActual) is None:
		collection.insert_one(videoActual)
	
# Generacion de videos por resolucion y FPS

for e in FrameList:
	FPS = str(e)
	resolucionH_actual = resultadoResolucionH_Final 
	resolucionV_actual = resultadoResolucionV_Final 
	while True:
		resolucionH_actual = round(resolucionH_actual / DivisorResolucion)
		resolucionV_actual = round(resolucionV_actual / DivisorResolucion)
		
		# Apaños para resoluciones pares
		if resolucionH_actual % 2 != 0:
			resolucionH_actual = resolucionH_actual + 1
		if resolucionV_actual % 2 != 0:
			resolucionV_actual = resolucionV_actual + 1
			
		# No seguimos debajo de esa resolucion
		if(resolucionV_actual < 145):
			break
	
		OutputFileNameCombinado = FileName + "_" + str(resolucionH_actual) + "x" + str(resolucionV_actual) + "_" + FPS + "fps" + FileExt
	
		# Si no existe lo creamos
		if os.path.isfile(OutputFileNameCombinado) is not True: 
			os.system("ffmpeg -i " + InputFileName + " -vf scale=" + str(resolucionH_actual) + ":" + str(resolucionV_actual) + " " + " -r " + FPS + " " + OutputFileNameCombinado)
		
		# Preparamos la inserccion en la base de datos
		videoActual = copy.deepcopy(videoOriginal)
		videoActual["nombre"] = OutputFileNameCombinado
		videoActual["path"] = "videos/" + OutputFileNameCombinado
		videoActual["framerate"] = e;
		videoActual["resolucionH"] = resolucionH_actual;
		videoActual["resolucionV"] = resolucionV_actual;
		if collection.find_one(videoActual) is None:
			collection.insert_one(videoActual)
			
# Generacion de video por codec

for codec in CodecList:
	
	OutputFileNameCodec = FileName + "_" + codec + CodecFileExt
	
	# Si existe pasamos de lo demas
	if os.path.isfile(OutputFileNameCodec) is not True: 
		os.system("ffmpeg -i " + InputFileName + " -c:v " + codec + " -c:a libvorbis " + OutputFileNameCodec)
	
	# Preparamos la inserccion en la base de datos
	videoActual = copy.deepcopy(videoOriginal)
	videoActual["nombre"] = OutputFileNameCodec
	videoActual["path"] = "videos/" + OutputFileNameCodec
	videoActual["codec"] = codec;
	if collection.find_one(videoActual) is None:
		collection.insert_one(videoActual)
	
# Generacion de video por GOP

for GOP in GOPList:

	OutputFileNameGOP = FileName + "_" + str(GOP) + "GOP" + FileExt
	
	# Si existe pasamos de lo demas
	if os.path.isfile(OutputFileNameGOP) is not True: 
		os.system("ffmpeg -i " + InputFileName + " -g " + str(GOP) + " " + OutputFileNameGOP)
	
	# Preparamos la inserccion en la base de datos
	videoActual = copy.deepcopy(videoOriginal)
	videoActual["nombre"] = OutputFileNameGOP
	videoActual["path"] = "videos/" + OutputFileNameGOP
	videoActual["gop"] = GOP
	
	if collection.find_one(videoActual) is None:
		collection.insert_one(videoActual)
			
# Generacion de video por Entrelazado y resolucion
resolucionH_actual = resultadoResolucionH_Final 
resolucionV_actual = resultadoResolucionV_Final 
while True:
		
	OutputFileNameInterlace = FileName + "_" + str(resolucionH_actual) + "x" + str(resolucionV_actual) + "_" + "entrelazado" + FileExt
	
	# Si existe pasamos de lo demas
	if os.path.isfile(OutputFileNameInterlace) is not True: 
		os.system("ffmpeg -i " + InputFileName + " -vf tinterlace=5:flags=low_pass_filter -vf scale=" + str(resolucionH_actual) + ":" + str(resolucionV_actual) + " " + OutputFileNameInterlace)
	
	# Preparamos la inserccion en la base de datos
	videoActual = copy.deepcopy(videoOriginal)
	videoActual["nombre"] = OutputFileNameInterlace
	videoActual["path"] = "videos/" + OutputFileNameInterlace
	videoActual["entrelazado"] = True
	videoActual["resolucionH"] = resolucionH_actual;
	videoActual["resolucionV"] = resolucionV_actual;
	
	if collection.find_one(videoActual) is None:
		collection.insert_one(videoActual)
		
	resolucionH_actual = round(resolucionH_actual / (DivisorResolucion+0.5))
	resolucionV_actual = round(resolucionV_actual / (DivisorResolucion+0.5))
	
	# Apaños para resoluciones pares
	if resolucionH_actual % 2 != 0:
		resolucionH_actual = resolucionH_actual + 1
	if resolucionV_actual % 2 != 0:
		resolucionV_actual = resolucionV_actual + 1
		
	# No seguimos debajo de esa resolucion
	if(resolucionV_actual < 145):
		break
		
# Cerramos el Log
serviceFile.close()