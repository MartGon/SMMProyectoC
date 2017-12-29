import urllib
import datetime
import os
import time
import sys
from urllib import request

def getBandwith():

	filename = sys.argv[1]
	time.clock()

	response = urllib.request.urlretrieve('http://seasonlegion.ddns.net/downloads/' + filename, filename)

	elapsedTime = time.clock()

	size = os.path.getsize(filename) # en bytes
	#os.remove(filename)

	velocidad = size / (elapsedTime * 1000) # Para que sea en kB/s 

	print('El tamaño es ' + str(size))
	print('El tiempo que ha tardado es ' + str(elapsedTime))
	print('El ancho de banda es ' + str(velocidad) + ' kB/s')
	
	return velocidad