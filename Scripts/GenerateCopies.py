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

from Functions import getVideoData
from Functions import getConfData
from pymongo import MongoClient
from copy import deepcopy

# funcion para insertar
def mongo_insert(video):
	if DBEnabled and collection.find_one(video) is None:
		collection.insert_one(video)

# 	Config
# Variables de configuración para la generación de las copias de vídeo
conf = getConfData()

FrameList = conf["FrameList"]
DivisorResolucion = conf["DivisorResolucion"]
CodecList = conf["CodecList"]
CodecFileExt = conf["CodecFileExt"]
ServerPath = conf["ServerPath"]
GOPList = conf["GOPList"]

# Puesta a punto

if len(sys.argv) != 3:
	print ('Número de argumentos incorrecto. Hace falta el nombre del archivo de video y un parametro de los siguientes:\n')
	print ('	-f	Conversión por FPS \n	-r	Conversión por resolucion \n	-rf	Conversión por FPS y resolucion (Híbrido) \n	-c	Conversion por codec\n	-g	Conversion por GOP\n	-i	Conversion por entrelazado y resolucion (Híbrido) \n	-all	Todas las conversiones	')
	print ('\npython GenerateCopies.py <NombreArchivoVideo> <párametro>\n')
	quit()

flag = sys.argv[2]

if flag == "-f":
	flag = 1
elif flag == "-r":
	flag = 2
elif flag == "-rf":
	flag = 4
elif flag == "-c":
	flag = 8
elif flag == "-g":
	flag = 16
elif flag == "-i":
	flag = 32
elif flag == "-all":
	flag = 2**6 - 1
	
print("El flag elegido es " + str(flag))


# Abrimos la base de datos
DBEnabled = True
try:
	client = MongoClient('localhost', 27017)
	client.server_info() 
except pymongo.errors.ServerSelectionTimeoutError:
	print("No se pudo conectar a la base de datos. \nSe harán las conversiones pero solo se guardaran los resultados tras volver a ejecutar con la DB activa")
	DBEnabled = False
	
db = client.peliculas
collection = db.peliculas

# Formateo del nombre
FileNameSplitted = sys.argv[1].split(".")
FileName = FileNameSplitted[0]
FileExt = "." + FileNameSplitted[1]
InputFileName = FileName + FileExt

# Cogemos los datos del video
videoOriginal = getVideoData(InputFileName)

# Añadimos el path
videoOriginal["path"] = ServerPath + InputFileName
	
mongo_insert(videoOriginal)
	
# Generación de videos por fps
# Las llamadas a comandos externos son secuenciales, lo cual facilita un poco el proceso
if flag & 1:
	for e in FrameList:
		FPS = str(round(e))
		OutputFileNameFPS = FileName + "_" + FPS + "fps" + FileExt
		
		# Si existe pasamos de lo demas
		if os.path.isfile(OutputFileNameFPS) is not True: 
			os.system("ffmpeg -i " + InputFileName + " -r " + FPS + " -y " + OutputFileNameFPS)
		
		# Preparamos la inserccion en la base de datos
		videoActual = copy.deepcopy(videoOriginal)
		videoActual["nombre"] = OutputFileNameFPS
		videoActual["path"] = "videos/" + OutputFileNameFPS
		videoActual["framerate"] = e;
		mongo_insert(videoActual)
	
# Generacion de videos por resolucion
if flag & 2:
	resolucionH_actual = videoOriginal["resolucionH"]
	resolucionV_actual = videoOriginal["resolucionV"]
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
		
		if os.path.isfile(OutputFileNameRes) is not True: 
			os.system("ffmpeg -i " + InputFileName + " -vf scale=" + str(resolucionH_actual) + ":" + str(resolucionV_actual) + " " + OutputFileNameRes)
		
		# Preparamos la inserccion en la base de datos
		videoActual = copy.deepcopy(videoOriginal)
		videoActual["nombre"] = OutputFileNameRes
		videoActual["path"] = "videos/" + OutputFileNameRes
		videoActual["resolucionH"] = resolucionH_actual;
		videoActual["resolucionV"] = resolucionV_actual;
		mongo_insert(videoActual)
	
# Generacion de videos por resolucion y FPS
if flag & 4:
	for e in FrameList:
		FPS = str(e)
		resolucionH_actual = videoOriginal["resolucionH"]
		resolucionV_actual = videoOriginal["resolucionV"]
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
			
			mongo_insert(videoActual)
			
# Generacion de video por codec
if flag & 8:
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
		
		mongo_insert(videoActual)
	
# Generacion de video por GOP
if flag & 16:
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
		
		mongo_insert(videoActual)
			
# Generacion de video por Entrelazado y resolucion
if flag & 32:
	resolucionH_actual = videoOriginal["resolucionH"]
	resolucionV_actual = videoOriginal["resolucionV"]
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
		
		mongo_insert(videoActual)
			
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
		
