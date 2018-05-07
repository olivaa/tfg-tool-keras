import random
import zmq
import time
import json
import keras
class TestCallback(keras.callbacks.Callback):
    def __init__(self, test_data):
        self.test_data = test_data

    def on_epoch_end(self, epoch, logs={}):
        epochs = self.test_data
        #loss, acc = self.model.evaluate(x, y, verbose=0)
        context = zmq.Context()
        worker = context.socket(zmq.DEALER)
        worker.setsockopt(zmq.IDENTITY, b'usuari1')
        worker.connect("tcp://localhost:9001")
        start = False
        dades={"accuracy":logs.get('acc'),"loss":logs.get('loss'),"val_acc":logs.get('val_acc'),"val_loss":logs.get('val_loss'),"epoch":epoch}
        js=json.dumps(dades)
        worker.send_string(js)
        #print('\nTesting loss: {}, acc: {}\n'.format(loss, acc))
