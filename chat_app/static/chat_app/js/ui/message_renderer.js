import { ensureHistorySentinel } from "../chat_history.js"
import { formatDateLabel, getDateKey } from "../utils/date.js"
import { getCurrentUserUsername } from "../chat/state.js"

const messagesContainer = document.getElementById("messages-users-container")

export function createMessageElement(message) {
    const { sender, datetime, text, images, isNew } = getMessageData(message)
    const currentUserUsername = getCurrentUserUsername()

    const messageElement = document.createElement('div')
    messageElement.classList.add('message')
    messageElement.dataset.date = getDateKey(datetime)

    if (sender === currentUserUsername) {
        messageElement.classList.add('message-sent')
    } else {
        messageElement.classList.add('message-received')
        if (isNew) {
            messageElement.classList.add('message-new')
        }
    }

    const senderHtml = (sender === currentUserUsername) ? '' : `<p class="message-sender">${sender}</p>`

    const imagesHtml = images.map((src) => (
        `<img class="message-image" src="${src}" alt="">`
    )).join('')
    const textHtml = text ? `<div class="message-text">${text}</div>` : ''

    messageElement.innerHTML = `
        <div class="message-content">
            ${senderHtml}
            ${imagesHtml ? `<div class="message-images">${imagesHtml}</div>` : ''}
            <div class="message-text-time">
                ${textHtml}
                <p class="message-datetime">${new Date(datetime).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    `

    return messageElement
}

export function createDateSeparator(datetime) {
    const separator = document.createElement('div')
    separator.className = 'chat-date-separator'
    separator.dataset.date = getDateKey(datetime)
    separator.innerHTML = `<span class="chat-date-separator-label">${formatDateLabel(datetime)}</span>`
    return separator
}

export function createNewMessagesSeparator() {
    const separator = document.createElement('div')
    separator.className = 'chat-new-messages-separator'
    separator.innerHTML = '<span class="chat-new-messages-separator-label">Нові повідомлення</span>'
    return separator
}

export function appendDateSeparatorIfNeeded(datetime) {
    const dateKey = getDateKey(datetime)
    if (!messagesContainer) return
    const lastMessage = messagesContainer.querySelector('.message:last-of-type')

    if (!lastMessage || lastMessage.dataset.date !== dateKey) {
        messagesContainer.appendChild(createDateSeparator(datetime))
    }
}

export function appendNewMessagesSeparatorIfNeeded() {
    if (!messagesContainer) return
    if (!messagesContainer.querySelector('.chat-new-messages-separator')) {
        messagesContainer.appendChild(createNewMessagesSeparator())
    }
}

export function renderMessage(message, options = {}) {
    const messageData = getMessageData(message)
    const { datetime, isNew } = messageData
    const currentUserUsername = getCurrentUserUsername()

    if (messageData.sender === currentUserUsername) {
        clearNewMessagesUI()
    }

    if (!options.skipDateCheck) {
        appendDateSeparatorIfNeeded(datetime)
    }

    if (!options.skipNewCheck && isNew) {
        appendNewMessagesSeparatorIfNeeded()
    }

    messagesContainer.appendChild(createMessageElement(message))

    if (!options.skipScroll) {
        scrollToBottom()
    }
}

export function renderMessages(messages) {
    if (!messagesContainer) return
    messagesContainer.innerHTML = ""
    ensureHistorySentinel()

    let lastDateKey = null
    let newSeparatorAdded = false

    messages.forEach((message) => {
        const { datetime, isNew } = getMessageData(message)

        if (isNew && !newSeparatorAdded) {
            messagesContainer.appendChild(createNewMessagesSeparator())
            newSeparatorAdded = true
        }

        const dateKey = getDateKey(datetime)

        if (dateKey !== lastDateKey) {
            messagesContainer.appendChild(createDateSeparator(datetime))
            lastDateKey = dateKey
        }

        messagesContainer.appendChild(createMessageElement(message))
    })

    scrollToBottom(false)
}

export function prependMessages(messages) {
    if (!messages?.length || !messagesContainer) return

    const sentinel = ensureHistorySentinel()
    const insertBeforeNode = sentinel.nextSibling
    const scrollHeightBefore = messagesContainer.scrollHeight
    const scrollTopBefore = messagesContainer.scrollTop

    const firstExistingMessage = messagesContainer.querySelector('.message')
    const firstExistingDateKey = firstExistingMessage?.dataset.date

    const fragment = document.createDocumentFragment()
    let lastDateKey = null

    messages.forEach((message, index) => {
        const { datetime } = getMessageData(message)
        const dateKey = getDateKey(datetime)
        const isLastInBatch = index === messages.length - 1
        const needsDateSep = dateKey !== lastDateKey
            && !(isLastInBatch && dateKey === firstExistingDateKey)

        if (needsDateSep) {
            fragment.appendChild(createDateSeparator(datetime))
        }

        lastDateKey = dateKey
        fragment.appendChild(createMessageElement(message))
    })

    messagesContainer.insertBefore(fragment, insertBeforeNode)
    messagesContainer.scrollTop = scrollTopBefore + (messagesContainer.scrollHeight - scrollHeightBefore)
}

export function scrollToBottom(smooth = true) {
    if (!messagesContainer) return

    if (smooth) {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth',
        })
        return
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight
}

export function clearNewMessagesUI() {
    if (!messagesContainer) return

    messagesContainer.querySelectorAll('.chat-new-messages-separator').forEach((el) => el.remove())
    messagesContainer.querySelectorAll('.message-new').forEach((el) => {
        el.classList.remove('message-new')
    })
}

export function getMessageData(message) {
    const payload = message.message || message
    const currentUserUsername = getCurrentUserUsername()
    const isOwnMessage = payload.sender === currentUserUsername

    return {
        sender: payload.sender,
        datetime: payload.datetime,
        text: payload.text || '',
        images: payload.images || [],
        isNew: isOwnMessage
            ? false
            : (payload.is_new !== undefined && payload.is_new !== null
                ? Boolean(payload.is_new)
                : true),
    }
}
