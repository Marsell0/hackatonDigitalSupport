import json
import random
import string
import wave
import librosa
import soundfile as sf
import redis

from fastapi import FastAPI, WebSocket, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from vosk import Model, KaldiRecognizer

from responder import reply

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = Model(r"vosk-model-small-ru-0.22")

r = redis.StrictRedis(
    host='127.0.0.1',
    port=6379,
    charset='utf-8',
    decode_responses=True
)


class ConnectionManager:
    def __init__(self):
        self.connections: list[list[WebSocket | str]] = []

    async def connect(self, websocket: WebSocket, id: str):
        await websocket.accept()
        self.connections.append([websocket, id])

    async def broadcast(self, data: str, id: str):
        for connection in self.connections:
            if connection[1] == id:
                answer = reply(data)
                r.set(f'messages:{id}:bot:{len(r.keys(f"messages:{id}:*:*"))}', answer)
                await connection[0].send_text(answer)


manager = ConnectionManager()


@app.get('/get_id')
def get_id():
    id = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    r.rpush('users', id)
    return id


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    r.rpush('users', client_id)
    while True:
        data = await websocket.receive_text()
        r.set(f'messages:{client_id}:user:{len(r.keys(f"messages:{client_id}:*:*"))}', data)
        await manager.broadcast(data, client_id)


@app.get('/get_messages/{id}')
def get_messages(id: str):
    keys = r.keys(f'messages:{id}:*:*')
    messages = {}

    for key in keys:
        messages_, client_id, from_, id_ = key.split(':')
        messages[str(keys.index(key))] = {
            'from': from_,
            'text': r.get(key)
        }

    return messages


@app.post('/send_voice/{id}')
async def voice2text(voice: UploadFile, id: str):
    with open(f'{voice.filename}.wav', 'wb') as f:
        f.write(voice.file.read())

    x, _ = librosa.load(f'{voice.filename}.wav', sr=48000)
    sf.write(f'{voice.filename}.wav', x, 48000)

    wf = wave.open(f'{voice.filename}.wav', "rb")

    rec = KaldiRecognizer(model, 48000)
    result = ''
    last_n = False

    while True:
        data = wf.readframes(48000)
        if len(data) == 0:
            break

        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())

            if res['text'] != '':
                result += f" {res['text']}"
                last_n = False
            elif not last_n:
                result += '\n'
                last_n = True

    res = json.loads(rec.FinalResult())
    result += f" {res['text']}"

    r.set(f'messages:{id}:user:{len(r.keys(f"messages:{id}:*:*"))}', result)
    await manager.broadcast(result, id)
    return 200
