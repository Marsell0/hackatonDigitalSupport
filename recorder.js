const constraints = { audio: true, video: false }
let stream = null
navigator.mediaDevices.getUserMedia(constraints)
 .then((_stream) => { stream = _stream })
 .catch((err) => { console.error(`error: ${err}`) })
let chunks = [];
let mediaRecorder = null;
let audioBlob = null;
let counter = 0;
let audioName = `audio_${counter++}`;

if (!navigator.mediaDevices && !navigator.mediaDevices.getUserMedia) {
    return console.warn('Not supported');
}

if (!mediaRecorder) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      })
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }
      mediaRecorder.onstop = mediaRecorderStop;
    } catch (e) {
      console.error(e);
    }
} else {
    mediaRecorder.stop()
}

function mediaRecorderStop() {
    if (audio_box.children[0]?.localName === 'audio') {
      audio_box.children[0].remove()
    }
   
    audioBlob = new Blob(chunks, { type: 'audio/wav' })
    const src = URL.createObjectURL(audioBlob)

    const audioEl = createEl({ tag: 'audio', src, controls: true })
   
    audio_box.append(audioEl)

    mediaRecorder = null
    chunks = []
}

async function saveRecord() {
    // данные должны иметь формат `multipart/form-data`
    const formData = new FormData()
    // запрашиваем у пользователя название для записи
    // формируем название записи
    audioName = audioName ? Date.now() + '-' + audioName : Date.now()
    // первый аргумент - это название поля, которое должно совпадать
    // с названием поля в посреднике `upload.single()`
    formData.append('audio', audioBlob, audioName)
   
    try {
      await fetch('/save', {
        method: 'POST',
        body: formData
      })
      console.log('Saved')
      // сброс
      resetRecord()
    } catch (e) {
      console.error(e)
    }
   }