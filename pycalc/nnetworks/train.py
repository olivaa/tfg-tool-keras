import os
from sklearn.preprocessing import LabelEncoder
from sklearn.cross_validation import train_test_split
from keras.models import Sequential
from keras.layers import Activation
from keras.optimizers import SGD
from keras.layers import Dense
from keras.utils import np_utils
from imutils import paths
import numpy as np
import argparse
import cv2
import keras
import random
import zmq
import time
import json
from tensorflow.python.client import device_lib


class TestCallback(keras.callbacks.Callback):
    def __init__(self, test_data):
        self.test_data = test_data

    def on_epoch_end(self, epoch, logs={}):
        print(logs)
        x, y = self.test_data
        loss, acc = self.model.evaluate(x, y, verbose=0)
        context = zmq.Context()
        worker = context.socket(zmq.DEALER)
        worker.setsockopt(zmq.IDENTITY, b'usuari1')
        worker.connect("tcp://localhost:9001")
        start = False
        dades={"accuracy":logs.get('acc'),"loss":logs.get('loss'),"val_acc":logs.get('val_acc'),"val_loss":logs.get('val_loss')}
        js=json.dumps(dades)
        worker.send_string(js)
        print('\nTesting loss: {}, acc: {}\n'.format(loss, acc))

def img_to_feature_vector(image,size=(32,32)):
	return cv2.resize(image,size).flatten()

data=[]
labels=[]

imgPaths=list(paths.list_images('/home/alejandro/Images_Hojas/Datos_tomate_naranja'))
#imgPaths.append(list(paths.list_images('/media/alejandro/Dades Ubunt/TFG/Keras/Train_keras_2/Images_Hojas/Tomato___Leaf_Mold/Train')))


for(i,imgPath) in enumerate(imgPaths):
	image=cv2.imread(imgPath)
	label=imgPath.split(os.path.sep)[-1].split(".")[0]

	features=img_to_feature_vector(image)
	data.append((features,imgPath))
	labels.append(label)

#print(len(data))

print(data[0][0])

#separamos los datos de los path
imgData=[dat[0] for dat in data]
dataPaths=[dat[1] for dat in data]

#Escalamos la imagen a 0,1, y despues transformamos loa lasbels en un vector de clases
imgData=np.array(imgData)/255.0
labels=np_utils.to_categorical(labels,2)

#dividimos los datos en training/testing, 75-25
((trainData, testData, trainLabels, testLabels,trainPaths,testPaths))=train_test_split(imgData,labels,dataPaths,test_size=0.15,random_state=42)



####ENTRENAMIENTO######
#Arquitectura de la red
model=Sequential()
model.add(Dense(64,input_dim=3072,kernel_initializer="uniform",activation="relu"))
model.add(Dense(32,kernel_initializer="uniform",activation="relu"))
model.add(Dense(2))
#para ver probabilidades utilizar Softmax
model.add(Activation("softmax"))
#entrenar con SGD (gradient descendent)
sgd=SGD(lr=0.01)
model.compile(loss="binary_crossentropy",optimizer=sgd,metrics=["acc"])

#entremamiento
model.fit(trainData,trainLabels,callbacks=[TestCallback((trainData,trainLabels))],epochs=150,batch_size=120,verbose=1)

(loss,accuracy)=model.evaluate(testData,testLabels,batch_size=128,verbose=1)
print("loss={:.4f}, accuracy={:.4f}%".format(loss,accuracy*100))

#Predicciones con probabilidades
batch_size=128
predictions=model.predict(testData[0:batch_size],batch_size=batch_size)
real=[np.argmax(label) for label in testLabels]
for i in real:
    print(i,'--',predictions[i])
