import keras
from keras.utils import to_categorical
from keras.applications import VGG16
from keras import models
from keras import layers
from keras import optimizers
from keras import backend as K

def compile(model,freeze,data_model):

    for layer in model.layers[:freeze]:
        layer.trainable = False

    print(data_model["select_optimizer"])
    if (data_model["select_optimizer"]=="RMSprop"):
        eps=data_model["RMSprop"]["epsilon"]
        if data_model["RMSprop"]["epsilon"]=="0": eps=0
        print("AAAAAAAAAA")
        print(float(data_model["RMSprop"]["lr"]))
        print("BBBBBBBBBBB")
        print(float(data_model["RMSprop"]["rho"]))
        model.compile(optimizer=optimizers.RMSprop(lr=float(data_model["RMSprop"]["lr"]), rho=float(data_model["RMSprop"]["rho"]), epsilon=float(eps), decay=float(data_model["RMSprop"]["decay"])),
                        loss='categorical_crossentropy',
                        metrics=['acc'])
    elif (data_model["select_optimizer"]=="SGD"):
        nes=True
        if data_modeldata_model["SGD"]["epsilon"]=="0": nes=False
        model.compile(optimizer=optimizers.SGD(lr=float(data_model["SGD"]["lr"]), decay=float(data_model["SGD"]["decay"]), momentum=float(data_model["SGD"]["momentum"]), nesterov=nes),
                     loss='categorical_crossentropy',
                     metrics=['acc'])
    elif (data_model["select_optimizer"]=="Adagrad"):
        eps=data_model["Adagrad"]["epsilon"]
        if data_modeldata_model["Adagrad"]["epsilon"]=="0": eps=None
        model.compile(optimizer=optimizers.Adagrad(lr=float(data_model["Adagrad"]["lr"]), epsilon=eps, decay=float(data_model["Adagrad"]["decay"])),
                     loss='categorical_crossentropy',
                     metrics=['acc'])
    elif (data_model["select_optimizer"]=="Adadelta"):
        eps=data_model["Adadelta"]["epsilon"]
        if data_modeldata_model["Adadelta"]["epsilon"]=="0": eps=None
        model.compile(optimizer=optimizers.Adadelta(lr=float(data_model["Adadelta"]["lr"]) ,rho=float(data_model["Adadelta"]["rho"]), epsilon=None, decay=float(data_model["Adadelta"]["decay"])),
                     loss='categorical_crossentropy',
                     metrics=['acc'])
    elif (data_model["select_optimizer"]=="Adam"):
        eps=data_model["Adam"]["epsilon"]
        if data_modeldata_model["Adam"]["epsilon"]=="0": eps=None
        ams=True
        if data_modeldata_model["Adam"]["amsgrad"]=="0": ams=False
        model.compile(optimizer=optimizers.Adam(lr=float(data_model["Adam"]["lr"]), beta_1=float(data_model["Adam"]["beta_1"]), beta_2=float(data_model["Adam"]["beta_2"]), epsilon=eps, decay=float(data_model["Adam"]["decay"]), amsgrad=ams),
                     loss='categorical_crossentropy',
                     metrics=['acc'])
    elif (data_model["select_optimizer"]=="Adamax"):
        eps=data_model["Adamax"]["epsilon"]
        if data_modeldata_model["Adamax"]["epsilon"]=="0": eps=None
        model.compile(optimizer=optimizers.Adamax(lr=float(data_model["Adamax"]["lr"]), beta_1=float(data_model["Adamax"]["beta_1"]), beta_2=float(data_model["Adamax"]["beta_2"]), epsilon=eps, decay=float(data_model["Adamax"]["decay"])),
                     loss='categorical_crossentropy',
                     metrics=['acc'])
    elif (data_model["select_optimizer"]=="Nadam"):
        eps=data_model["Nadam"]["epsilon"]
        if data_modeldata_model["Nadam"]["epsilon"]=="0": eps=None
        model.compile(optimizer=optimizers.Nadam(lr=float(data_model["Nadam"]["lr"]), beta_1=float(data_model["Nadam"]["beta_1"]), beta_2=float(data_model["Nadam"]["beta_2"]), epsilon=eps, schedule_decay=float(data_model["Nadam"]["decay"])),
                     loss='categorical_crossentropy',
                     metrics=['acc'])

    return model
