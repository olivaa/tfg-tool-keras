import random
import zmq
import time
import json
import os
import sys

"""
En aquest codi simplement fem la comunicacio que ve desde l'api de Python
fins al client am el id de usuari que ens tindria que aplegar. En aquest
cas el usuari es usuari1
"""

data = {
        'ids': [12, 3, 4, 5, 6],
        'id1': [15,1]
}

context = zmq.Context()
worker = context.socket(zmq.DEALER)
worker.setsockopt(zmq.IDENTITY, b'usuari1')
worker.connect("tcp://localhost:9001")
start = False
js=json.dumps(data)
worker.send_string(js)
