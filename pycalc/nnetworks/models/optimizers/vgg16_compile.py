import keras
from keras.utils import to_categorical
from keras.applications import VGG16
from keras import models
from keras import layers
from keras import optimizers
from keras import backend as K

def compile(model,freeze):
	for layer in model.layers[:freeze]:
		layer.trainable = False

	model.compile(optimizer=optimizers.RMSprop(lr=2e-4),
						loss='categorical_crossentropy',
						metrics=['acc'])
	return model