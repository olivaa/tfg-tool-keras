import keras
from keras.utils import to_categorical
from keras.applications import VGG16
from keras import models
from keras import layers
from keras import optimizers
from keras import backend as K

def create_model(type_learn):

#Depenent la configuraci's'ha de cambiar l'entrada
	if K.image_data_format() == 'channels_first':
		input_s=(3,224,224)
		print("FIRST")
	else:
		input_s=(224,224,3)
		print("LAST")

	vgg_conv = VGG16(weights='imagenet',
                  include_top=False,
                  input_shape=input_s)

	if(type_learn=="transfer"):
		model = models.Sequential()
		model.add(layers.Dense(512, activation='relu', input_dim=7 * 7 * 512))
		model.add(layers.Dropout(0.5))
		model.add(layers.Dense(2, activation='softmax'))

		model.compile(optimizer=optimizers.RMSprop(lr=2e-4),
						loss='categorical_crossentropy',
						metrics=['acc'])
		return vgg_conv,model
	else:
		model = models.Sequential()
		model.add(vgg_conv)
		print("entre")
		#descongelem capes
		#for layer in model.layers[:freeze]:
		#	layer.trainable = False
	return model