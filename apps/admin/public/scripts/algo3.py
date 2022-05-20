import time
from sys import *

def myfun(i=[0]):
	print(i[0])
	i[0]+=1
	time.sleep(2)
	return i[0]
	
if __name__ == '__main__':
	while True:
		myfun()