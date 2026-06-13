import { getCSRFToken } from "/static/user_app/js/utils.js"
import { loadChatHistory } from "../chat_history.js"
import { findPersonalChatItem, setActiveChat, setActiveContact } from "../ui/active_chat.js"
import { getDefaultGroupAvatar } from "../ui/group_avatar.js"
import { renderMessages } from "../ui/message_renderer.js"
import { clearChatUnreadBadges, updateSectionUnreadBadges } from "../ui/unread_badges.js"
import { connectWebSocket } from "./chat_socket.js"
import { setCurrentChatIsGroup, setCurrentUserUsername } from "./state.js"

const chatTitle = document.getElementById("chat-title")
const chatStatus = document.getElementById("chat-status")
const chatHeaderImage = document.querySelector('.chat-header img')
const DEFAULT_GROUP_AVATAR = getDefaultGroupAvatar()
const DEFAULT_USER_AVATAR = '/static/chat_app/images/Avatar-1.png'
const contactsContainer = document.getElementById('contactsContainer')
const chatsSection = document.querySelector('.chats-section')

let onlineUserIds = new Set()

// Update global online user ids list
export function setOnlineUserIds(userIds) {
    onlineUserIds = new Set((userIds || []).map(String))
}

// Check if a user is online
export function isUserOnline(userId) {
    return onlineUserIds.has(String(userId))
}

// Update chat status display
export function updateChatStatus(userId = null, isGroup = false) {
    if (!chatStatus) return

    if (isGroup) {
        chatStatus.textContent = "Груповий чат"
        chatStatus.classList.remove("online")
    } else if (userId) {
        const online = isUserOnline(userId)
        if (online) {
            chatStatus.textContent = "В мережі"
            chatStatus.classList.add("online")
        } else {
            chatStatus.textContent = "Не в мережі"
            chatStatus.classList.remove("online")
        }
    }
}


export async function openChatWithUser(userId, username) {
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
        const messageInfoContainer = document.querySelector("#message-info-container")
        const messagesContainer = document.querySelector("#messages-container")
        if (messageInfoContainer) messageInfoContainer.style.display = "none"
        if (messagesContainer) messagesContainer.style.display = "flex"
    }
    if (chatTitle) chatTitle.textContent = `Чат з ${data.username || username}`
    updateChatStatus(userId, false)
    setCurrentUserUsername(data.current_user)

    const personalAvatar = document.querySelector(`.people-contact-plain[data-chat-user="${userId}"] img`)?.src
        || findPersonalChatItem(userId)?.querySelector('.chat-avatar-wrapper img')?.src

    setChatHeaderAvatar(personalAvatar, DEFAULT_USER_AVATAR)
    setCurrentChatIsGroup(false)
    connectWebSocket(data.chat_id, false)
    await loadChatHistory(data.chat_id, 1)
    clearChatUnreadBadges(data.chat_id)
    updateSectionUnreadBadges()
}

export async function handleChatOpen(event) {
    if (event.target.closest('.people-contact-modal, .group-container')) return

    const target = event.target.closest('[data-chat-user]') || event.target.closest('.container-chat')
    if (!target) return

    const userId = target.dataset.chatUser
    const username = target.dataset.chatUsername
    const chatId = target.dataset.chatId

    const chatItem = target.closest('.container-chat')
        || findPersonalChatItem(userId)
        || (chatId ? document.querySelector(`.content-chats .container-chat[data-chat-id="${chatId}"]`) : null)

    if (userId) {
        if (typeof window.ensureContactVisible === 'function') {
            try {
                await window.ensureContactVisible(userId)
            } catch (err) {
                console.warn('ensureContactVisible failed', err)
            }
        }
        setActiveContact(userId)

        const personalChatItem = chatItem || findPersonalChatItem(userId)
        if (personalChatItem) {
            setActiveChat(personalChatItem)
        }

        openChatWithUser(userId, username)
        return
    }

    if (chatItem) {
        setActiveChat(chatItem)
    }

    if (chatId && !userId) {
        const titleEl = chatItem ? (chatItem.querySelector('h2') || chatItem.querySelector('h1') || chatItem.querySelector('.chat-info h2')) : null
        const title = titleEl ? titleEl.textContent.trim() : 'Груповий чат'
        const listAvatar = chatItem?.querySelector('.chat-avatar-wrapper img')?.src

        if (chatTitle) chatTitle.textContent = title
        updateChatStatus(null, true)
        setChatHeaderAvatar(listAvatar, DEFAULT_GROUP_AVATAR)
        const messageInfoContainer = document.querySelector("#message-info-container")
        const messagesContainer = document.querySelector("#messages-container")
        if (messageInfoContainer) messageInfoContainer.style.display = "none"
        if (messagesContainer) messagesContainer.style.display = "flex"
        setCurrentChatIsGroup(true)
        connectWebSocket(chatId, true)

        try {
            const data = await loadChatHistory(chatId, 1)
            if (data.success) {
                setChatHeaderAvatar(data.avatar || listAvatar, DEFAULT_GROUP_AVATAR)
                clearChatUnreadBadges(chatId)
                updateSectionUnreadBadges()
            }
        } catch (err) {
            console.warn('failed to fetch chat history', err)
            renderMessages([])
        }

        return
    }
}

if (contactsContainer) {
    contactsContainer.addEventListener("click", handleChatOpen)
}

if (chatsSection) {
    chatsSection.addEventListener("click", handleChatOpen)
}

export function setChatHeaderAvatar(avatarUrl, fallback = DEFAULT_GROUP_AVATAR) {
    if (!chatHeaderImage) return

    chatHeaderImage.src = avatarUrl || fallback
}
