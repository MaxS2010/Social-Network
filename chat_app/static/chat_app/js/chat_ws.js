import { getCSRFToken, showErrors } from '/static/user_app/js/utils.js'

let chatSocket = null
const chatTitle = document.getElementById("chat-title")
const chatStatus = document.getElementById("chat-status")
const messagesContainer = document.getElementById("messages-users-container")
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

        if (data.type === "connection_established") {
            chatStatus.textContent = data.message
            return
        }

        chatStatus.textContent = ""
        renderMessage(data)
    }
}

let currentUserUsername = null

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
    currentUserUsername = data.current_user
    connectWebSocket(data.chat_id)
    renderMessages(data.messages || [])
}

const contactsContainer = document.getElementById('contactsContainer')
const chatsSection = document.querySelector('.chats-section')

function setActiveChat(element) {
    document.querySelectorAll('.content-chats .container-chat.active').forEach(chat => {
        chat.classList.remove('active')
    })

    if (element) {
        element.classList.add('active')
    }
}

function handleChatOpen(event) {
    const target = event.target.closest('[data-chat-user]') || event.target.closest('.container-chat')
    if (!target) return

    const chatItem = target.closest('.container-chat')
    if (chatItem) {
        setActiveChat(chatItem)
    }

    const userId = target.dataset.chatUser
    const username = target.dataset.chatUsername
    if (!userId) return

    openChatWithUser(userId, username)
}

if (contactsContainer) {
    contactsContainer.addEventListener("click", handleChatOpen)
}

if (chatsSection) {
    chatsSection.addEventListener("click", handleChatOpen)
}

ChatForm.addEventListener("submit", function(event) {
    event.preventDefault()

    const formData = new FormData(ChatForm)
    const fromObject = Object.fromEntries(formData)
    chatSocket.send(JSON.stringify(fromObject))
    ChatForm.reset()
})

function renderMessage(message) {
    const sender = message.message ? message.message.sender : message.sender
    const datetime = message.message ? message.message.datetime : message.datetime
    const text = message.message ? message.message.text : message.text

    const messageElement = document.createElement("div")
    messageElement.classList.add("message")
    
    // Add class based on who sent the message
    if (sender === currentUserUsername) {
        messageElement.classList.add("message-sent")
    } else {
        messageElement.classList.add("message-received")
    }
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p class="message-sender">${sender}</p>
            <div class="message-text-time">
                <div class="message-text">${text}</div>
                <p class="message-datetime">${new Date(datetime).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    `
    messagesContainer.appendChild(messageElement)
}

function renderMessages(messages) {
    messagesContainer.innerHTML = ""
    messages.forEach(message => renderMessage(message))
}