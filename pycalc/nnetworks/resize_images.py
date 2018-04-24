#!/usr/bin/python from PIL import Image import os, sys
import numpy as np #Math lib
import cv2 #Image manipulation lib
import os #Os commands
from PIL import Image

path = "/home/alejandro/Documentos/TFG/tfg-tool/tfg-tool-keras/pycalc/nnetworks/data/validation/cat/" 
dirs = os.listdir( path )
#Don't froget to change your path!
def resize():
    for item in dirs: #Iterates through each picture
        print(item)
        im = Image.open(path+item)
        f, e = os.path.splitext(path+item)
        imResize = im.resize((224,224), Image.ANTIALIAS)
        imResize.save(f + '.jpg', 'JPEG', quality=90)
resize()
