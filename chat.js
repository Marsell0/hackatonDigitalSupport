createFullChat();
showChat();
closeFullChat();

document.getElementById('txtInput').addEventListener('input', ()=>{
    document.getElementById('start').style.display = 'none'
    document.getElementById('sendBtn').style.display = 'inline-flex'
})
document.getElementById('txtInput').addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
      sendMessage();
    }
  });

const chatBody = document.querySelector(".chat__body");
const URL = 'http://127.0.0.1:8000/send_voice';
let img = document.createElement('img')
img.setAttribute('src', 'src/mic.svg')
let start = document.createElement('button');
start.id = 'start';
start.appendChild(img)
let img1 = document.createElement('img')
img1.setAttribute('src', 'src/stop.svg')
let stop = document.createElement('button');
stop.id = 'stop';
stop.appendChild(img1)
// document.getElementById('place_for_btns').appendChild(div);
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

document.getElementById('start').addEventListener('click', ()=>{
    document.getElementById('start').style.display = 'none'
    document.getElementById('stop').style.display = 'inline-flex'
})
document.getElementById('stop').addEventListener('click', ()=>{
    document.getElementById('start').style.display = 'inline-flex'
    document.getElementById('stop').style.display = 'none'
})

function showChat(){
    let chat = document.createElement('button');
    chat.classList.add('open-button');
    // chat.textContent = 'Chat';
    chat.addEventListener('click', () => showFullChat());
    // chat.addEventListener('click', () => showForm());

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
                        <div class="chat__body" id="messages">
                            <div class="items__answers">
                                User, я чат-бот конкурса Росмолодёжь.Гранты. Приятно познакомиться!
                                Я могу помочь вам подать заявку, подготовить проект к очной защите, сделать отчёт по реализации проекта или ответить на другой ваш вопрос о грантовом конкурсе.
                            </div>
                        </div>
                        
                        <div class="chat__faq">
                            <a onclick="showHelp('Гранты')" class="faq__item">Гранты</a>
                            <a onclick="showHelp('Как подать заявку')" class="faq__item">Как подать заявку</a>
                            <a onclick="showHelp('Куда нажимать')" class="faq__item">Куда нажимать</a>
                            <a onclick="showHelp('Как подать заявку')" class="faq__item">Как подать заявку</a>
                        </div>
                        <div class="chat__input">
                            <div class="input__area">
                                <input id="txtInput" type="text" placeholder="Печатать здесь" autofocus">
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
    var message = document.createElement('div')
    var content = document.createTextNode(event.data)
    message.classList.add('items__answers')
    message.appendChild(content);
    messages.appendChild(message);
    setTimeout(() => {
        setScrollPosition();
      }, 600);
}

ws.onmessage = processMessage;

function sendMessage(event) {
    var messages = document.getElementById('messages')
    var input = document.getElementById("txtInput")
    var message = document.createElement('div')
    var content = document.createTextNode(input.value)
    message.classList.add('items__questions')
    message.appendChild(content);
    messages.appendChild(message);
    document.getElementById('start').style.display = 'inline-flex'
    document.getElementById('sendBtn').style.display = 'none'
    ws.send(input.value);
    setTimeout(() => {
        setScrollPosition();
      }, 600);

    input.value = ''
    event.preventDefault()
}

// function showForm(event) {
    
//     var form = document.getElementById("form");
    
    
    
//     form.style.display = "block";
// }

async function sendVoice(form) {
    var messages = document.getElementById('messages')
    let message = document.createElement('div')
    let img = document.createElement('img')
    img.classList.add('items__questions_voice')
    img.setAttribute('src', 'src/mic.svg')
    message.appendChild(img)
    messages.appendChild(message)
    let promise = await fetch(URL+"/"+clientID, {
    method: 'POST',
    body: form});
    if (promise.ok) {
        let response =  await promise.json();
        console.log(response);
    }
}
function setScrollPosition(){
    if (chatBody.scrollHeight > 0) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  };

function showHelp(text){
    var messages = document.getElementById('messages')
    var message = document.createElement('div')
    var content = document.createTextNode(text)
    message.classList.add('items__questions')
    message.appendChild(content);
    console.log(content)
    messages.appendChild(message);
    document.getElementById('start').style.display = 'inline-flex'
    document.getElementById('sendBtn').style.display = 'none'
    ws.send(text);
    setTimeout(() => {
        setScrollPosition();
      }, 600);

    input.value = ''
    event.preventDefault()
}