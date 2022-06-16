import time
import sys
import logging
import os

cwd = os.getcwd()
print("Current working directory: {0}".format(cwd))

print("dio latte")
time.sleep(12)
print("dio latteX")
time.sleep(2)
print("dio latteX2")

logging.basicConfig(filename='./example.log', level=logging.INFO)
logging.info('dioooo')

sys.stdout.flush()
