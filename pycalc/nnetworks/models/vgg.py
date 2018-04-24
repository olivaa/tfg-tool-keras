import numpy as np
import matplotlib.pyplot as plt
import keras
from keras.utils import to_categorical
import os
from keras.preprocessing.image import ImageDataGenerator, load_img
from keras.applications import VGG16
import random
import zmq
import time
import json
from keras import models
from keras import layers
from keras import optimizers
import callbacks as c


vgg_conv = VGG16(weights='imagenet',
                  include_top=False,
                  input_shape=(224, 224, 3))

print(vgg_conv.get_config())
