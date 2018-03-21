import os
import sys
import numpy as np
from keras.models import Sequential
from keras.layers import Activation,Dropout,Flatten,Dense
from keras.preprocessing.image import ImageDataGenerator
from keras.layers import Convolution2D,MaxPooling2D, ZeroPadding2D
from keras import optimizers
from keras import backend as k
import keras
from tensorflow.python.client import device_lib

class TestCallback(keras.callbacks.Callback):
    def __init__(self, test_data):
        self.test_data = test_data

    def on_epoch_end(self, epoch, logs={}):
        x, y = self.test_data
        loss, acc = self.model.evaluate(x, y, verbose=0)
        print('\nTesting loss: {}, acc: {}\n'.format(loss, acc))

print(device_lib.list_local_devices())

#tamaño de las imagenes de nuestro dataset
img_ancho,img_alto=150,150
cwd = os.getcwd()
print(cwd)

#la ruta viene desde la api en los argumentos
dir_train_data=sys.argv[1]
dir_validation_data=sys.argv[2]

#dir_test_data='data/test1'

#reescalamos el valor de pixel a escala de [0,1]
datagen=ImageDataGenerator(rescale=1./255)

# automagically retrieve images and their classes for train and validation sets
train_generator = datagen.flow_from_directory(
        dir_train_data,
        target_size=(img_ancho, img_alto),
        batch_size=16,
        class_mode='binary')

(X_train,Y_train)=train_generator

validation_generator = datagen.flow_from_directory(
        dir_validation_data,
        target_size=(img_ancho, img_alto),
        batch_size=32,
        class_mode='binary')


#Definimos la red
model=Sequential()
model.add(Convolution2D(32,3,3,input_shape=(img_ancho,img_alto,3)))
model.add(Activation('relu'))
model.add(MaxPooling2D(pool_size=(2,2)))

model.add(Flatten())
model.add(Dense(64))
model.add(Activation('relu'))
model.add(Dropout(0.5))
model.add(Dense(1))
model.add(Activation('sigmoid'))

model.compile(loss='binary_crossentropy',optimizer='rmsprop',metrics=['accuracy'])


#Entrenamiento
nb_epoch=5
nb_train_samples=100
nb_validation_samples=10

model.fit_generator(
        train_generator,
        samples_per_epoch=nb_train_samples,
        nb_epoch=nb_epoch,
        verbose=1,
        validation_data=validation_generator,
        callbacks=[TestCallback((X_train,Y_train))],
        nb_val_samples=nb_validation_samples)

#model.save_weights('models/basic_cnn_20_epochs.h5')

#Comprobamos el Entrenamiento
#model.evaluate_generator(validation_generator, nb_validation_samples)
