import { getCSRFToken, showErrors } from '/static/user_app/js/utils.js'

let chatSocket = null
const chatTitle = document.getElementById("chat-title")
const chatStatus = document.getElementById("chat-status")
const messagesContainer = document.getElementById("messages-container")
// const chatButttons = document.querySelectorAll("[data-chat-user]")

const ChatForm = document.getElementById("form-chat")

function connectWebSocket(chatId) {
    if (chatSocket) {
        messagesContainer.innerHTML = ""
        chatSocket.close()
    }

    chatSocket = new WebSocket(
        `ws://${window.location.host}/chat/${chatId}/`
    )

    chatSocket.onmessage = function(event) {
        const data = JSON.parse(event.data)
        chatStatus.textContent = data.onmessage
        renderMessage(data)
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
    if (data.success) {
        document.querySelector("#message-info-container").style.display = "none"
        document.querySelector("#messages-container").style.display = "flex"
    }
    chatTitle.textContent = `Чат з ${data.username || username}`
    connectWebSocket(data.chat_id)
}

document.getElementById('contactsContainer').addEventListener("click", async function(event) {
    const button = event.target.closest("[data-chat-user]")

    if (!button) return

    await openChatWithUser(
        button.dataset.chatUser,
        button.dataset.chatUsername
    )
})

ChatForm.addEventListener("submit", function(event) {
    event.preventDefault()

    const formData = new FormData(ChatForm)
    const fromObject = Object.fromEntries(formData)
    chatSocket.send(JSON.stringify(fromObject))
})

function renderMessage(message) {
    const messageElement = document.createElement("div")
    messageElement.classList.add("message")
    messageElement.innerHTML = `
        <div class="message-header">
            <p class="message-sender">${message.message.sender}</p>
            <p class="message-datetime">${new Date(message.message.datetime).toLocaleTimeString()}</p>
        </div>
        <div class="message-text">${message.message.text}</div>
    `
    messagesContainer.appendChild(messageElement)
}