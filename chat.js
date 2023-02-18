createFullChat();
showChat();
closeFullChat();
showForm();


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
                            <div class="input__send">
                                <button id="sendBtn" onclick="sendMessage()"><img width="30px" height="30px" src="src/send.svg"></button>
                            </div>
                        </div>`;
                        
    // chat.innerHTML = `
    //                     <div id="chat" class="chat">
    //                     </div>
    //                     <div class="flex">
    //                         <input id="message" type="text" class="px-3 w-full border-t border-gray-300 outline-none text-gray-700" placeholder="Type your message..." />
    //                         <button class="px-8 py-3 bg-green-500 text-white hover:bg-green-600 transition-colors" onclick="sendMessage()">Send</button>
    //                     </div>`;
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
    message.classList.add('items__item')
    message.appendChild(content);
    message.appendChild(message);
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