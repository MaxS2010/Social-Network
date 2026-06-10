import { getCSRFToken, showErrors } from '/static/user_app/js/utils.js'
import { updateSelectedCount } from './chat.js'

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

function setActiveContact(userId) {
    document.querySelectorAll('.people-contact-plain.active').forEach(contact => {
        contact.classList.remove('active')
    })

    const contact = document.querySelector(`.people-contact-plain[data-chat-user="${userId}"]`)
    if (contact) {
        contact.classList.add('active')
        contact.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
}

async function handleChatOpen(event) {
    const target = event.target.closest('[data-chat-user]') || event.target.closest('.container-chat')
    if (!target) return

    const userId = target.dataset.chatUser
    const username = target.dataset.chatUsername
    const chatId = target.dataset.chatId

    const chatItem = target.closest('.container-chat') || (userId ? document.querySelector(`.content-chats .container-chat[data-chat-user="${userId}"]`) : document.querySelector(`.content-chats .container-chat[data-chat-id="${chatId}"]`))
    if (chatItem) {
        setActiveChat(chatItem)
    }

    if (userId) {
        if (typeof window.ensureContactVisible === 'function') {
            try {
                await window.ensureContactVisible(userId)
            } catch (err) {
                console.warn('ensureContactVisible failed', err)
            }
        }
        setActiveContact(userId)
        openChatWithUser(userId, username)
        return
    }

    if (chatId) {
        const titleEl = chatItem ? (chatItem.querySelector('h2') || chatItem.querySelector('h1') || chatItem.querySelector('.chat-info h2')) : null
        const title = titleEl ? titleEl.textContent.trim() : 'Груповий чат'
        chatTitle.textContent = title
        document.querySelector("#message-info-container").style.display = "none"
        document.querySelector("#messages-container").style.display = "flex"
        try {
            const res = await fetch(`/chat/chat_history/${chatId}/`)
            const data = await res.json()
            if (data.success) {
                currentUserUsername = data.current_user
                renderMessages(data.messages || [])
            } else {
                console.warn('chat history error', data)
                renderMessages([])
            }
        } catch (err) {
            console.warn('failed to fetch chat history', err)
            renderMessages([])
        }

        connectWebSocket(chatId)
        return
    }
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

function getDateKey(datetime) {
    const date = new Date(datetime)
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function formatDateLabel(datetime) {
    return new Date(datetime).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
}

function createDateSeparator(datetime) {
    const separator = document.createElement('div')
    separator.className = 'chat-date-separator'
    separator.dataset.date = getDateKey(datetime)
    separator.innerHTML = `<span class="chat-date-separator-label">${formatDateLabel(datetime)}</span>`
    return separator
}

function appendDateSeparatorIfNeeded(datetime) {
    const dateKey = getDateKey(datetime)
    const lastMessage = messagesContainer.querySelector('.message:last-of-type')

    if (!lastMessage || lastMessage.dataset.date !== dateKey) {
        messagesContainer.appendChild(createDateSeparator(datetime))
    }
}

function renderMessage(message, options = {}) {
    const sender = message.message ? message.message.sender : message.sender
    const datetime = message.message ? message.message.datetime : message.datetime
    const text = message.message ? message.message.text : message.text

    if (!options.skipDateCheck) {
        appendDateSeparatorIfNeeded(datetime)
    }

    const messageElement = document.createElement("div")
    messageElement.classList.add("message")
    messageElement.dataset.date = getDateKey(datetime)
    
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
    let lastDateKey = null

    messages.forEach(message => {
        const datetime = message.message ? message.message.datetime : message.datetime
        const dateKey = getDateKey(datetime)

        if (dateKey !== lastDateKey) {
            messagesContainer.appendChild(createDateSeparator(datetime))
            lastDateKey = dateKey
        }

        renderMessage(message, { skipDateCheck: true })
    })

    messagesContainer.scrollTop = messagesContainer.scrollHeight
}

export function renderSelectedUsers(selectedCheckboxes) {
    const container = document.querySelector(".members-list-view")
    if (!container) {
        console.warn('renderSelectedUsers: .members-list-view not found')
        return
    }

    container.innerHTML = ""

    selectedCheckboxes.forEach(cb => {
        const card = cb.closest('.card-member, .people-contact-modal, .people-contact-plain')
        if (!card) {
            console.warn('renderSelectedUsers: card not found for checkbox', cb)
            return
        }

        const nameEl = card.querySelector('h1') || card.querySelector('.contact-name') || card.querySelector('p')
        const name = nameEl ? nameEl.textContent.trim() : null
        if (!name) {
            console.warn('renderSelectedUsers: name not found in card', card)
            return
        }
        const elContainer = document.createElement("div")
        elContainer.className = "member-group-container"
        
        const el = document.createElement("div")
        el.className = "member-group"
        
        const imageUser = document.createElement("img")
        imageUser.src = cb.dataset.avatar || '/static/chat_app/images/Avatar-1.png'
        imageUser.alt = name

        el.appendChild(imageUser)
        el.innerHTML += `<h2>${name}</h2>`

        const removeBtn = document.createElement("button")
        removeBtn.addEventListener("click", () => {
            cb.checked = false
            elContainer.remove()
            updateSelectedCount()
        })
        removeBtn.type = "button"
        removeBtn.className = "remove-member"

        elContainer.appendChild(el)
        elContainer.appendChild(removeBtn)
        container.appendChild(elContainer)
    })
}

document.getElementById("add-create-member")
.querySelector("button[type='submit']")
.addEventListener("click", async function (e) {
    e.preventDefault()

    let form = document.querySelector("#create-group-form")
    if (!form) form = e.target.closest('form')
    if (!form || !(form instanceof HTMLFormElement)) {
        console.warn('create-group submit: form not found or invalid', form)
        return
    }
        const formData = new FormData(form)

        const selected = document.querySelectorAll('.group-user-checkbox:checked')
        selected.forEach(cb => {
            if (cb.value) formData.append('users[]', cb.value)
        })

    const res = await fetch("/chat/create_group/", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRFToken()
        },
        body: formData
    })

    const data = await res.json()

    if (!data.success) {
        alert(data.error)
        return
    }

    location.reload()
})