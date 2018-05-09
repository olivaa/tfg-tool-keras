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

data_train = json.loads(sys.argv[1])
data_model = json.loads(sys.argv[2])

#carregem moduls
models = imp.load_source(data_model["model"], os.path.dirname(os.path.abspath(__file__))+'/models/'+data_model["model"]+'.py')
modelTop = imp.load_source(data_model["name-fully"], os.path.dirname(os.path.abspath(__file__))+'/topLayer/'+data_model["name-fully"]+'.py')
modelCompile = imp.load_source("vgg16_compile", os.path.dirname(os.path.abspath(__file__))+'/optimizers/vgg16_compile.py')


train_dir=data_train["train_dir"]
validation_dir=data_train["validation_dir"]
nTrain = int(data_train["train_img"])
nVal = int(data_train["validation_img"])
freeze_layers=int(data_model["freeze_layers"])
type_learn=data_model["type"]
input_x=int(data_model["input_shape_x"])
input_y=int(data_model["input_shape_y"])

#Depenent la configuraci's'ha de cambiar l'entrada
if K.image_data_format() == 'channels_first':
	input_s=(3,input_x,input_y)
	train_f=(nTrain, 512, 7, 7)
	validation_f=(nVal, 512, 7, 7)
	print("FIRST")
else:
	input_s=(input_x,input_y,3)
	train_f=(nTrain, 7, 7, 512)
	validation_f=(nVal, 7, 7, 512)
	print("LAST")

datagen = ImageDataGenerator(rescale=1./255)
batch_size = int(data_train["batch_size"])

train_features = np.zeros(shape=train_f)
train_labels = np.zeros(shape=(nTrain,2))

train_generator = datagen.flow_from_directory(
    train_dir,
    target_size=(input_x, input_y),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True)

validation_features = np.zeros(shape=validation_f)
validation_labels = np.zeros(shape=(nVal,2))

validation_generator = datagen.flow_from_directory(
    validation_dir,
    target_size=(input_x, input_y),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=False)

if(type_learn=="transfer"):#transfer learning
	vgg_conv, model = models.create_model("transfer",input_x,input_y)


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
                    epochs=int(data_train["epochs"]),
                    batch_size=batch_size,
                    callbacks=[c.TestCallback(int(data_train["epochs"]))],
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
	model=models.create_model("Fine-Tune",input_x,input_y)
	model=modelTop.topLayers(model)
	model=modelCompile.compile(model,freeze_layers,data_model)

	model.summary()
	history = model.fit_generator(
      train_generator,
      steps_per_epoch=10,
      epochs=int(data_train["epochs"]),
      validation_data=validation_generator,
      validation_steps=10,
      callbacks=[c.TestCallback(int(data_train["epochs"]))],
      verbose=1)
