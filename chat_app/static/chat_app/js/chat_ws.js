import { getCSRFToken, showErrors } from '/static/user_app/js/utils.js'

let chatSocket = null
const chatTitle = document.getElementById("chat-title")
const chatStatus = document.getElementById("chat-status")
const chatButttons = document.querySelectorAll("[data-chat-user]")

function connectWebSocket(chatId) {
    if (chatSocket) {
        chatSocket.close()
    }

    chatSocket = new WebSocket(
        `ws://${window.location.host}/chat/${chatId}/`
    )

    chatSocket.onmessage = function(event) {
        const data = JSON.parse(event.data)
        chatStatus.textContent = data.onmessage
    }
}

async function openChatWithUser(userId, username) {
    const response = await fetch(`/chat/chat_with/${userId}/`, {
        method: 'POST',
        headers: {
            "X-CSRFToken": getCSRFToken(),
        }
    })
    const data = await response.json()
    if (!data.success) {
        // showErrors(data.errors)
        return
    }
    chatTitle.textContent = `Чат з ${data.username || username}`
    connectWebSocket(data.chat_id)
}

chatButttons.forEach(function(button){
    button.addEventListener(
        "click", 
        async function() {
            await openChatWithUser(button.dataset.chatUser, button.dataset.chatUsername)
        }
    )
})