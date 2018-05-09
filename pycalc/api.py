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
        
        data_train_encode = json.dumps(text["train_data"])
        model=json.dumps(text["model"])
        subprocess.Popen(["python", "pycalc/nnetworks/models/general.py",data_train_encode,model])
        #print(text)
        return 0
    def crop(self,text):
        #executa una el model de una capa
        print(text)
        subprocess.Popen(["python", "pycalc/click_and_crop.py","--image",text])
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
