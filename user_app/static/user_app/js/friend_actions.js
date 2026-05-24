import { getCSRFToken } from "./utils.js";

const csrfToken = getCSRFToken()

const homeFriendsList = document.querySelector('[data-home-section= "friends"]')

async function handlerFriendAction(actionButton) {
    const responce = await fetch(actionButton.dataset.url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
        },
    })
    const data = await responce.json()

    if (data.friend_html){
        addFriendToHome(data.friend_html)
    }
    if (data.label){
        actionButton.textContent = data.label
    }

    if (data.remove){ 
        actionButton.closest('article').remove()
    }
}

function addFriendToHome(frienHtml){
    const friendCount = homeFriendsList.querySelectorAll('article').length
    if (friendCount >= 6){
        return 
    }

    homeFriendsList.querySelector('p')?.remove()
    homeFriendsList.insertAdjacentHTML('beforeend', frienHtml)

    connectFRiendActionButtons(homeFriendsList)
}

function connectFRiendActionButtons(parent = document) {
    const actionButton = parent.querySelectorAll('[data-friend-action]')
    actionButton.forEach((actionbutton) => {
        if (actionbutton.dataset.actionbutton) {
            return
        }
        actionbutton.dataset.actionbutton = true
        actionbutton.addEventListener(
            'click', 
            () => handlerFriendAction(actionbutton)
        )
    })
}

window.connectFRiendActionButtons = connectFRiendActionButtons

connectFRiendActionButtons()