from __future__ import print_function
#from calc import calc as real_calc
from calc import echo as real_echo
#from nnetworks.una_capa import entrenar as e
import sys
import os
import subprocess
import zerorpc
import json

class CalcApi(object):

    def echo(self,text):
        return real_echo(text)

    def entrenar(self,text):
        #executa una el model de una capa
        print(text)
        subprocess.Popen(["python", "pycalc/nnetworks/models/general.py",text["train_dir"],text["validation_dir"],text["model"],text["epochs"],text["batch_size"],text["train_img"],text["validation_img"]])
        #print(text)
        return 0

    def streaming_range(self):
        #Executa un script python en segon pla sense bloquejar el servidor API
        subprocess.Popen(["python", "pycalc/prueba.py"])
        return 0



def parse_port():
    port = 4242
    try:
        port = int(sys.argv[1])
    except Exception as e:
        pass
    return '{}'.format(port)

def main():
    addr = 'tcp://127.0.0.1:' + parse_port()
    s = zerorpc.Server(CalcApi())
    s.bind(addr)
    print('start running on {}'.format(addr))
    s.run()

if __name__ == '__main__':
    main()
