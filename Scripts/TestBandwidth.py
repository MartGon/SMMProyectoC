# -*- coding: utf-8 -*-
# Module: default
# Author: defu
# Created on: 29.12.2017

import urllib
import datetime
import os
import time
import sys
from urllib import request

def getBandwidth():

	filename = sys.argv[1]
	time.clock()

	response = urllib.request.urlretrieve('http://seasonlegion.ddns.net/downloads/' + filename, filename)

	elapsedTime = time.clock()

	size = os.path.getsize(filename) # en bytes
	#os.remove(filename)

	velocidad = size * 8 / (elapsedTime * 1000) # Para que sea en kB/s 

	print('El tamaño es ' + str(size) + ' bytes')
	print('El tiempo que ha tardado es ' + str(elapsedTime) + ' segundo')
	print('El ancho de banda es ' + str(velocidad) + ' kb/s')
	
	return velocidad
	
getBandwidth()