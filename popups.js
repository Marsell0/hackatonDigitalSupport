function createPopup(text, button, list) {
    let popup = document.createElement("div");
    if (button == null && list == null) {
        popup.innerHTML = `\
                            <h1 class="popup__text">${text}</h1>\
                            <p>only text</p>`;
        popup.classList.add('popup');
    }
    else if (list == null) {
        popup.innerHTML = ` \
                                <h1 class="popup__text">${text}</h1>\
                                <p>text with button</p>\
                                <${button} class="popup__button">ok</${button}>\
                            `;
        popup.classList.add('popup');
    }
    let my_div = document.getElementsByClassName("nav__link")[0];
    my_div.parentNode.insertBefore(popup, my_div);
}
function deletePopup() {
}
function showPopup() {
}
function addLsnr(el, id, cb) {
    document.getElementsByClassName(el)[id].addEventListener("mouseover", cb);
}
