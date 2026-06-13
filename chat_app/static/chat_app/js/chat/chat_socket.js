import { resetHistoryState } from "../chat_history.js"
import { getMessageData, renderMessage } from "../ui/message_renderer.js"
import { markChatAsRead } from "../ui/unread_badges.js"
import {
    getChatSocket,
    getCurrentChatId,
    getCurrentChatIsGroup,
    setChatSocket,
    setCurrentChatId,
    setCurrentChatIsGroup,
} from "./state.js"

export function connectWebSocket(chatId, isGroup = getCurrentChatIsGroup()) {
    setCurrentChatId(chatId)
    setCurrentChatIsGroup(isGroup)

    const existingSocket = getChatSocket()
    if (existingSocket) {
        resetHistoryState()
        existingSocket.close()
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const socket = new WebSocket(`${protocol}//${window.location.host}/chat/${chatId}/`)
    setChatSocket(socket)

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data)
        const currentChatId = getCurrentChatId()

        if (data.type === "connection_established") {
            return
        }

        renderMessage(data)

        const messageData = getMessageData(data)
        window.bumpChatInList?.(currentChatId, messageData, getCurrentChatIsGroup())

        markChatAsRead(currentChatId)
    }
}

export function sendChatMessage(message) {
    const socket = getChatSocket()
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message))
    }
}
