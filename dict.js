var dict = {
    'messages' : 'Ассистент',
}


for (let key in dict) {
    document.getElementById(key).setAttribute('data-tippy-content', dict[key])
  }

