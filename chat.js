createFullChat();
showChat();
closeFullChat();

const URL = 'http://127.0.0.1:8000/send_voice';
let div = document.createElement('div');
div.id = 'msg';
let start = document.createElement('button');
start.id = 'start';
start.innerHTML = 'Start';
let stop = document.createElement('button');
stop.id = 'stop';
stop.innerHTML = 'Stop';
document.getElementById('place_for_btns').appendChild(div);
document.getElementById('place_for_btns').appendChild(start);
document.getElementById('place_for_btns').appendChild(stop);
navigator.mediaDevices.getUserMedia({ audio: true})
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);

        document.querySelector('#start').addEventListener('click', function(){
            mediaRecorder.start();
        });
        let audioChunks = [];
        mediaRecorder.addEventListener("dataavailable",function(event) {
            audioChunks.push(event.data);
        });

        document.querySelector('#stop').addEventListener('click', function(){
            mediaRecorder.stop();
        });

        mediaRecorder.addEventListener("stop", function() {
            const audioBlob = new Blob(audioChunks, {
                type: 'audio/wav'
            });

            let fd = new FormData();
            fd.append('voice', audioBlob);
            sendVoice(fd);
            audioChunks = [];
        });
    });


function showChat(){
    let chat = document.createElement('button');
    chat.classList.add('open-button');
    // chat.textContent = 'Chat';
    chat.addEventListener('click', () => showFullChat());
    chat.addEventListener('click', () => showForm());

    let my_div = document.getElementsByClassName("page__body")[0];
    my_div.parentNode.insertBefore(chat, my_div);
    

}
function createFullChat(){
    let chat = document.createElement('div');
    chat.id = 'myForm';
    chat.innerHTML = `\
                        <div class="chat__header">\
                            <p class="header__title">Ассистент</p>\
                            <button class="header__close" onclick="closeFullChat()">X</button>
                        </div>
                        <div class="chat__body">
                            <ul class="body__items" id="messages">
                            </ul>
                        </div>
                        <div class="chat__input">
                            <div class="input__area">
                                <input id="txtInput" type="text placeholder="Печатать здесь" autofocus">
                            </div>
                            <div id="place_for_btns" class="input__send">
                                <button id="sendBtn" onclick="sendMessage(event)"><img width="30px" height="30px" src="src/send.svg"></button>
                            </div>
                        </div>`;
    chat.classList.add('container__chat');
    
    let my_div = document.getElementsByClassName("page__body")[0];
    my_div.parentNode.insertBefore(chat, my_div);
    console.log('full');
}
function showFullChat(){
    document.getElementById("myForm").style.display = "block";
}
    

function closeFullChat(){
    document.getElementById("myForm").style.display = "none";
}
// -------------------------------------------------RECORDER----------------------------------------
var clientID = Date.now();
var ws = new WebSocket(`ws://127.0.0.1:8000/ws/${clientID}`);
console.log(clientID)

function processMessage(event) {
    var messages = document.getElementById('messages')
    var message = document.createElement('li')
    var content = document.createTextNode(event.data)
    message.appendChild(content);
    messages.appendChild(message);
}

ws.onmessage = processMessage;

function sendMessage(event) {
    var input = document.getElementById("txtInput")
    var message = document.createElement('li')
    var content = document.createTextNode(input.value)
    message.classList.add('items__item')
    message.appendChild(content);
    // message.appendChild(message);
    ws.send(input.value);

    input.value = ''
    event.preventDefault()
}

function showForm(event) {
    var button = document.getElementById("connect");
    var form = document.getElementById("form");
    console.log(button)
    
    button.style.display = "none";
    form.style.display = "block";
}

async function sendVoice(form) {
    let promise = await fetch(URL+"/"+clientID, {
    method: 'POST',
    body: form});
    if (promise.ok) {
        let response =  await promise.json();
        console.log(response);
    }
}