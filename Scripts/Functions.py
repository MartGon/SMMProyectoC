
import sys
import string
import os
import subprocess
import pymongo
import copy
import os.path

from pymongo import MongoClient
from copy import deepcopy

def getVideoData(InputFileName):
	
	video = dict()
	video["nombre"] = InputFileName
		# Cogemos los datos del video
		# Cogemos los FPS iniciales

	resultadoFPS = subprocess.check_output("ffprobe " + InputFileName + " -v error -show_entries stream=avg_frame_rate -of default=noprint_wrappers=1", shell=True)
	resultadoFPS_Splitted = str(resultadoFPS).split("avg_frame_rate=")
	resultadoFPS_Dirty = resultadoFPS_Splitted[1]
	resultadoFPS_Final = resultadoFPS_Dirty.replace("\\r\\n", "").replace("'", "")

	if resultadoFPS_Final.strip() == '0/0':
		resultadoFPS_Dirty = resultadoFPS_Splitted[2]
		resultadoFPS_Final = resultadoFPS_Dirty.replace("\\r\\n", "").replace("'", "")

	if "/" in resultadoFPS_Final:
		resultadoFPS_Simplificado = int(round(int(resultadoFPS_Final.split("/")[0]) / int(resultadoFPS_Final.split("/")[1])))
	else:
		resultadoFPS_Simplificado = int(resultadoFPS_Final)
	
	video["framerate"] = resultadoFPS_Simplificado

		# Cogemos la resolucion Horizontal
	resultadoResolucionH = subprocess.check_output("ffprobe " + InputFileName + " -v error -of flat=s=_ -select_streams v:0 -show_entries stream=width", shell=True)
	resultadoResolucionH_Final = int(str(resultadoResolucionH).replace("streams_stream_0_width=", "").replace("b'","").replace("\\r\\n'", ""))
	
	video["resolucionH"] = resultadoResolucionH_Final

		# Cogemos la resolucion Vertical
	resultadoResolucionV = subprocess.check_output("ffprobe " + InputFileName + " -v error -of flat=s=_ -select_streams v:0 -show_entries stream=height", shell=True)
	resultadoResolucionV_Final = int(str(resultadoResolucionV).replace("streams_stream_0_height=", "").replace("b'","").replace("\\r\\n'", ""))
	
	video["resolucionV"] = resultadoResolucionV_Final

		# Cogemos la duracion
	resultadoDuracion = subprocess.check_output("ffprobe " + InputFileName + " -v error -show_entries format=duration -of default=noprint_wrappers=1", shell=True)
	resultadoDuracion_Final = float(str(resultadoDuracion).replace("duration=", "").replace("b'","").replace("\\r\\n'", ""))
	
	video["duracion"] = resultadoDuracion_Final

		# Cogemos el bitrate
	resultadoBitrate = subprocess.check_output("ffprobe " + InputFileName + " -v error -show_entries format=bit_rate -of default=noprint_wrappers=1", shell=True)
	resultadoBitrate_Final = round(int(str(resultadoBitrate).replace("bit_rate=", "").replace("b'","").replace("\\r\\n'", ""))/1000)
	
	video["bitrate"] = resultadoBitrate_Final

		# Cogemos el codec
	resultadoCodec = subprocess.check_output("ffprobe " + InputFileName + " -v error -show_entries stream=codec_name -of default=noprint_wrappers=1", shell=True)
	resultadoCodec_Final = str(resultadoCodec).replace("codec_name=", "").replace("b","").replace("\\r\\n", "").replace("'", "").replace("aac", "")

	video["codec"] = resultadoCodec_Final

		# Cogemos el GOP
	resultadoGOP_Final = 0
	if resultadoGOP_Final != -1:
		resultadoGOP = subprocess.check_output("ffprobe -show_frames " + InputFileName, shell=True)
		resultadoGOP_Array = str(resultadoGOP).split("pict_type=")

		for e in resultadoGOP_Array:
			if e == resultadoGOP_Array[0]:
				continue
			resultadoGOP_Final = resultadoGOP_Final + 1
			if e[0] == "I" and e != resultadoGOP_Array[1]:
				break
	
	video["gop"] = resultadoGOP_Final
	
	video["entrelazado"] = False
	
	return video;

def getConfData():
	
	file = open(os.path.join(sys.path[0], "GenerateCopies.conf"), "r")
	conf = dict()
	
	conf["FrameList"] = []
	conf["CodecList"] = []
	conf["GOPList"] = []

	for line in file:
		
		if line.strip().startswith("#"):
			continue
		# Handling FrameList
		elif line.strip().startswith("FrameList ="):
			line = line.replace("FrameList =", "")
			framerates = line.split(",")
			for frames in framerates:
				conf["FrameList"].append(round(float(frames.strip())))
		
		# Handling DivisorResolucion
		elif line.strip().startswith("DivisorResolucion ="):
			line = line.replace("DivisorResolucion =", "").strip()
			conf["DivisorResolucion"] = float(line)
			
		# Handling CodecList
		elif line.strip().startswith("CodecList ="):
			line = line.replace("CodecList =", "")
			codecs = line.strip().split(",")
			for codec in codecs:
				conf["CodecList"].append(codec.strip())
				
		# Handling CodecFileExt
		elif line.strip().startswith("CodecFileExt ="):
			line = line.replace("CodecFileExt =", "").strip()
			conf["CodecFileExt"] = line
			
		# Handling ServerPath
		elif line.strip().startswith("ServerPath ="):
			line = line.replace("ServerPath =", "").strip()
			conf["ServerPath"] = line
		
		# Handling GOPList
		elif line.strip().startswith("GOPList ="):
			line = line.replace("GOPList =", "")
			GOPs = line.strip().split(",")
			for GOP in GOPs:
				conf["GOPList"].append(GOP.strip())
	
	file.close()
	
	return conf

def getBitRate(InputFileName):
	# Cogemos el bitrate
	resultadoBitrate = subprocess.check_output("ffprobe " + InputFileName + " -v error -show_entries format=bit_rate -of default=noprint_wrappers=1", shell=True)
	resultadoBitrate_Final = round(int(str(resultadoBitrate).replace("bit_rate=", "").replace("b'","").replace("\\r\\n'", ""))/1000)
	
	return resultadoBitrate_Final
