import time
from sys import *
import logging
import numpy as np
from datetime import datetime
import json
from logging.handlers import TimedRotatingFileHandler
	

def myfun(i):
	

	logger = logging.getLogger()
	logging.basicConfig(filename='/Users/Orlando/dev/ra-tools/apps/admin/example.log', level=logging.DEBUG)


	log = {'time':str(datetime.now()),'arg':i}
	logger.info(log)
	
	time.sleep(1)
	
	return i
	
while True:
	myfun(10)
		
