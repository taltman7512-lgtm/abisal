import os,sys,glob,json,numpy as np,soundfile as sf
SP=os.path.join(os.path.dirname(sys.executable),'Lib','site-packages','nvidia')
for s in ('cublas','cudnn'):
    d=os.path.join(SP,s,'bin'); os.add_dll_directory(d); os.environ['PATH']=d+os.pathsep+os.environ['PATH']
from faster_whisper import WhisperModel
m=WhisperModel('large-v3',device='cuda',compute_type='float16')
L=json.load(open(sys.argv[1]+'/voz.json',encoding='utf-8')); out=[]
for i,f in enumerate(sorted(glob.glob(sys.argv[1]+'/voz/*.wav'))):
    a,sr=sf.read(f,dtype='float32'); a=a if a.ndim==1 else a.mean(1)
    ta=max(0, np.argmax(np.abs(a)>=.012)/sr-.01)          # mismo recorte que hace el motor al cargar la voz
    idx=np.round(np.arange(0,len(a),sr/16000)).astype(int); a16=a[idx[idx<len(a)]]
    # el texto del guion como guía, para que escriba las palabras igual que el guion
    segs=m.transcribe(a16,language='en',word_timestamps=True,initial_prompt=L[i])[0]
    ws=[[w.word.strip(),round(max(0,w.start-ta),3),round(max(0,w.end-ta),3)] for s in segs for w in s.words]
    out.append(ws)
json.dump(out,open(sys.argv[1]+'/palabras.json','w',encoding='utf-8'),ensure_ascii=False)
print('frases',len(out),'palabras',sum(len(x) for x in out)); print(out[0]); print(out[-1])
