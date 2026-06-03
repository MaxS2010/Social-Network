import { getCSRFToken } from "./utils.js";

const csrfToken = getCSRFToken()

const homeFriendsList = document.querySelector('[data-home-section= "friends"]')

async function handlerFriendAction(actionButton) {

    const response = await fetch(actionButton.dataset.url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
        },
    })

    const data = await response.json()

    if (data.success && data.redirect_url) {
        window.location.href = data.redirect_url
        return
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

const profileContainer = document.querySelector(".profile-container")
const profileContent = document.getElementById("profileContent")

function closeProfile() {
    profileContainer.style.display = "none"
    profileContent.innerHTML = ""
    
    document.getElementById("friends-home").style.display = "flex"
    document.querySelector(".friends-nav-content").style.display = "flex"
}