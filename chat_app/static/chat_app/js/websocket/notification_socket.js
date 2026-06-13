import { updateChatPageListItem, reorderChatList, updateHomeSidePanelItem } from "../ui/chat_list.js"
import { updateHeaderMessagesBadge, updateHomeIconBadge, updateSectionBadge } from "../ui/unread_badges.js"

const RECONNECT_DELAY_MS = 3000
let notificationSocket = null
let shouldReconnect = true

export function connectNotificationWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    notificationSocket = new WebSocket(`${protocol}//${window.location.host}/notifications/`)

    notificationSocket.onmessage = (event) => {
        handleChatNotification(JSON.parse(event.data))
    }

    notificationSocket.onclose = () => {
        if (shouldReconnect) {
            setTimeout(connectNotificationWebSocket, RECONNECT_DELAY_MS)
        }
    }
}

export async function pollUnreadStatus() {
    try {
        const response = await fetch('/chat/unread_status/')
        const data = await response.json()
        applyUnreadStatus(data)
    } catch (error) {
        console.warn('unread status poll failed', error)
    }
}

export function applyUnreadStatus(status) {
    if (!status?.success) return

    updateHomeIconBadge(status.new_messages_count)
    updateHeaderMessagesBadge(status.new_messages_count)

    const sections = document.querySelectorAll('.chats-section .messages-container')
    if (sections[0]) {
        updateSectionBadge(sections[0], status.personal_unread_count)
    }
    if (sections[1]) {
        updateSectionBadge(sections[1], status.group_unread_count)
    }

    status.chats?.forEach((chatData) => {
        const payload = {
            ...chatData,
            new_messages_count: status.new_messages_count,
            personal_unread_count: status.personal_unread_count,
            group_unread_count: status.group_unread_count,
        }

        updateChatPageListItem(payload, { moveToTop: false })
        updateHomeSidePanelItem(payload)
    })

    reorderChatList(status.chats)
}

export function handleChatNotification(data) {
    if (!data || data.type !== 'chat_notification') return

    updateChatPageListItem(data)
    updateHomeSidePanelItem(data)
    updateHeaderMessagesBadge(data.new_messages_count)
}

window.addEventListener('beforeunload', () => {
    shouldReconnect = false
    if (notificationSocket && notificationSocket.readyState === WebSocket.OPEN) {
        notificationSocket.close()
    }
})
