createFullChat();
showChat();
closeFullChat();
// let isRecord = false;
// showForm();



function showChat(){
    let chat = document.createElement('button');
    chat.classList.add('open-button');
    // chat.textContent = 'Chat';
    chat.addEventListener('click', () => showFullChat());

    let my_div = document.getElementsByClassName("page__body")[0];
    my_div.parentNode.insertBefore(chat, my_div);
    

}
function createFullChat(){
    let chat = document.createElement('div');
    chat.id = 'myForm';
    // chat.innerHTML = `\
    //                     <form action="" class="form-container">\
    //                         <h1>Чат</h1>\
    //                         <button type="button" class="btn cancel" onclick="closeFullChat()">X</button>\
    //                         <ul class="message-box" id="message-list">
    //                         </ul>
    //                         <input id="textField" placeholder="Введите сообщение.." name="msg" required></input>\
    
    //                         <button id="record_stop_send" type="submit" class="btn">Отправить</button>\
    //                         <button onClick="showForm(event)" id="connect">Connect</button>
                            
    //                     </form>`;
    chat.innerHTML = ` \
                        <div class="form-container">
                        <h1>WebSocket Chat</h1>
                            <button onClick="showForm(event)" id="connect">Connect</button>
                            <ul class="message-box" id='messages'>
                            </ul>
                            <form action="" onsubmit="sendMessage(event)" id="form" style="display: none">
                                <input type="text" id="messageText" autocomplete="off"/>
                                <button>Send</button>
                            </form>
                        </div>`;
    // chat.innerHTML = 
    //   <div class="chat-header">
    //     <div class="title">Chat</div>
    //   </div>
    //   <div class="chat-body"></div>
    //   <div class="chat-input">
    //     <div class="input-sec">
    //       <input type="text" id="txtInput" placeholder="Typ here" autofocus />
    //     </div>
    //     <div class="send">
    //       <img src="images/send.svg" alt="send" />
    //     </div>
    //   </div>              
    // `
    chat.classList.add('chat-popup');
    
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
var ws = new WebSocket(`ws://eb0b-176-28-64-201.eu.ngrok.io/ws/${clientID}`);
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
    var input = document.getElementById("messageText")
    var message = document.createElement('li')
    var content = document.createTextNode(input.value)
    message.appendChild(content);
    message.appendChild(message);
    ws.send(input.value);

    input.value = ''
    event.preventDefault()
}

function showForm(event) {
    var button = document.getElementById("connect");
    var form = document.getElementById("form");
    
    button.style.display = "none";
    form.style.display = "block";
}

const URL = 'https://eb0b-176-28-64-201.eu.ngrok.io/send_voice';
let div = document.createElement('div');
div.id = 'messages';
let start = document.createElement('button');
start.id = 'start';
start.innerHTML = 'Start';
let stop = document.createElement('button');
stop.id = 'stop';
stop.innerHTML = 'Stop';
document.body.appendChild(div);
document.body.appendChild(start);
document.body.appendChild(stop);
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

async function sendVoice(form) {
let promise = await fetch(URL+"/"+clientID, {
method: 'POST',
body: form});
if (promise.ok) {
let response =  await promise.json();
console.log(response);
}
}