# -*- coding: utf-8 -*-
# Module: default
# Author: defu
# Created on: 29.12.2017

# ---- codigo
import urllib2
import sys
import datetime
import os
import time
# ---- codigo

# ---- codigo
def getBandwidth():

	filename = "crab.mp4"
	logfile = "D:\\Speed.txt"
	curTime = datetime.datetime.now()
	
	if os.path.isfile(logfile):
		file = open( logfile, "r")
	else:
		file = None
		
	oldTime = curTime.replace(year=curTime.year -1 )
	velocidad = 0
	if file is not None:
		for line in file:
			if line.strip().startswith('Date:'):
				line = line.strip().replace('Date:', '')
				try:
					oldTime = datetime.datetime.strptime(line.strip(), '%Y-%m-%d %H:%M:%S')
				except TypeError:
					oldTime = datetime.datetime.fromtimestamp(time.mktime(time.strptime(line.strip(), '%Y-%m-%d %H:%M:%S')))
			elif line.strip().startswith('Download Speed:'):
				velocidad = line.strip().replace('Download Speed:', '')
				velocidad = float(line)
		
		file.close()
	
	difference = (curTime - oldTime).total_seconds() / 3600
	if difference < 4:
		return velocidad
		
	u = urllib2.urlopen('http://seasonlegion.ddns.net/downloads/' + filename)
	f = open(filename, 'wb')
	while True:
		buffer = u.read(8192)
		if not buffer:
			break
		f.write(buffer)
	f.close()
	
	elapsedTime = (datetime.datetime.now() - curTime).total_seconds()

	size = os.path.getsize(filename) # en bytes
	os.remove(filename)

	velocidad = size * 8 / (elapsedTime * 1000) # Para que sea en kB/s 

	file = open(logfile, "w")
	file.writelines('Date: ' + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + '\n')
	file.writelines('Size:  ' + str(size) + ' bytes\n')
	file.writelines('Elapsed Time: ' + str(elapsedTime) + ' seconds\n')
	file.writelines("Download Speed: " + str(velocidad) + ' kb/s\n')
	file.close()
	
	return velocidad

velocidad = getBandwidth()
# ---- codigo
	
getBandwidth()