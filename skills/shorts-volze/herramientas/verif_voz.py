import os,sys,glob,json,numpy as np,soundfile as sf
SP=os.path.join(os.path.dirname(sys.executable),'Lib','site-packages','nvidia')
for s in ('cublas','cudnn'):
    d=os.path.join(SP,s,'bin'); os.add_dll_directory(d); os.environ['PATH']=d+os.pathsep+os.environ['PATH']
from faster_whisper import WhisperModel
import re
m=WhisperModel('large-v3',device='cuda',compute_type='float16')
L=json.load(open(sys.argv[1]+'/voz.json',encoding='utf-8'))
norm=lambda x: re.sub(r'[^a-z0-9 ]','',x.lower().replace('-',' ')).split()
bad=0
for i,f in enumerate(sorted(glob.glob(sys.argv[1]+'/voz/*.wav'))):
    a,sr=sf.read(f,dtype='float32'); a=a if a.ndim==1 else a.mean(1)
    idx=np.round(np.arange(0,len(a),sr/16000)).astype(int); a=a[idx[idx<len(a)]]
    t=' '.join(s.text for s in m.transcribe(a,language='en')[0]).strip()
    if norm(t)!=norm(L[i]): bad+=1; print(i,'| GUION:',L[i],'| OIDO:',t)
print('frases distintas:',bad,'de',len(L))
