import keras
from keras.utils import to_categorical
from keras.applications import VGG16
from keras import models
from keras import layers
from keras import optimizers
from keras import backend as K

def topLayers(model):
	model.add(layers.Flatten())
	model.add(layers.Dense(1024, activation='relu'))
	model.add(layers.Dropout(0.5))
	model.add(layers.Dense(2, activation='softmax'))
	return model