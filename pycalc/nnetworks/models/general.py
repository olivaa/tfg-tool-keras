import sys
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
from keras import backend as K

import imp
models = imp.load_source(sys.argv[3], os.path.dirname(os.path.abspath(__file__))+'/models/'+sys.argv[3]+'.py')
modelTop = imp.load_source(sys.argv[8], os.path.dirname(os.path.abspath(__file__))+'/topLayer/'+sys.argv[8]+'.py')
modelCompile = imp.load_source(sys.argv[9], os.path.dirname(os.path.abspath(__file__))+'/optimizers/'+sys.argv[9]+'.py')

train_dir=sys.argv[1]
validation_dir=sys.argv[2]
nTrain = int(sys.argv[6])
nVal = int(sys.argv[7])
freeze_layers=int(sys.argv[10])

type_learn="fine"

#Depenent la configuraci's'ha de cambiar l'entrada
if K.image_data_format() == 'channels_first':
	input_s=(3,224,224)
	train_f=(nTrain, 512, 7, 7)
	validation_f=(nVal, 512, 7, 7)
	print("FIRST")
else:
	input_s=(224,224,3)
	train_f=(nTrain, 7, 7, 512)
	validation_f=(nVal, 7, 7, 512)
	print("LAST")

datagen = ImageDataGenerator(rescale=1./255)
batch_size = int(sys.argv[5])

train_features = np.zeros(shape=train_f)
train_labels = np.zeros(shape=(nTrain,2))

train_generator = datagen.flow_from_directory(
    train_dir,
    target_size=(224, 224),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True)

validation_features = np.zeros(shape=validation_f)
validation_labels = np.zeros(shape=(nVal,2))

validation_generator = datagen.flow_from_directory(
    validation_dir,
    target_size=(224, 224),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False)

if(type_learn=="transfer"):#transfer learning
	vgg_conv, model = models.create_model("transfer")


	i = 0
	for inputs_batch, labels_batch in train_generator:
	    features_batch = vgg_conv.predict(inputs_batch)
	    train_features[i * batch_size : (i + 1) * batch_size] = features_batch
	    train_labels[i * batch_size : (i + 1) * batch_size] = labels_batch
	    i += 1
	    if i * batch_size >= nTrain:
	        break

	train_features = np.reshape(train_features, (nTrain, 7 * 7 * 512))

	i = 0
	for inputs_batch, labels_batch in validation_generator:
	    features_batch = vgg_conv.predict(inputs_batch)
	    validation_features[i * batch_size : (i + 1) * batch_size] = features_batch
	    validation_labels[i * batch_size : (i + 1) * batch_size] = labels_batch
	    i += 1
	    if i * batch_size >= nVal:
	        break

	validation_features = np.reshape(validation_features, (nVal, 7 * 7 * 512))
	history = model.fit(train_features,
                    train_labels,
                    epochs=int(sys.argv[4]),
                    batch_size=batch_size,
                    callbacks=[c.TestCallback(int(sys.argv[4]))],
                    validation_data=(validation_features,validation_labels))
	
	fnames = validation_generator.filenames
	ground_truth = validation_generator.classes
	label2index = validation_generator.class_indices
	# Getting the mapping from class index to class label
	idx2label = dict((v,k) for k,v in label2index.items())
	predictions = model.predict_classes(validation_features)
	prob = model.predict(validation_features)
	errors = np.where(predictions != ground_truth)[0]
	print("No of errors = {}/{}".format(len(errors),nVal))

else:#fine-tune
	#carregem el model seleccionat
	model=models.create_model("fine")
	model=modelTop.topLayers(model)
	model=modelCompile.compile(model,freeze_layers)
	
	model.summary()
	history = model.fit_generator(
      train_generator,
      steps_per_epoch=10,
      epochs=int(sys.argv[4]),
      validation_data=validation_generator,
      validation_steps=10,
      callbacks=[c.TestCallback(int(sys.argv[4]))],
      verbose=1)
	


