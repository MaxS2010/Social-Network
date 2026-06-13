import * as uiFunctions from "./ui/message_renderer.js"
import { getCurrentChatId, setCurrentUserUsername } from "./chat/state.js"

let historyObserver = null
const messagesContainer = document.getElementById("messages-users-container")
const historyState = {
    chatId: null,
    page: 1,
    hasOlder: false,
    loading: false,
}

export function resetHistoryState() {
    historyState.chatId = null
    historyState.page = 1
    historyState.hasOlder = false
    historyState.loading = false

    if (historyObserver) {
        historyObserver.disconnect()
        historyObserver = null
    }
}

export function ensureHistorySentinel() {
    let sentinel = document.getElementById('messages-history-sentinel')
    if (!sentinel) {
        sentinel = document.createElement('div')
        sentinel.id = 'messages-history-sentinel'
        sentinel.style.cssText = 'width:100%;height:1px;flex-shrink:0;'
    }
    if (messagesContainer && sentinel.parentElement !== messagesContainer) {
        messagesContainer.prepend(sentinel)
    }
    return sentinel
}

export function setupChatHistory(chatId, data) {
    historyState.chatId = chatId
    historyState.page = data.page || 1
    historyState.hasOlder = Boolean(data.has_older)
    historyState.loading = false
    initHistoryPagination()
}

export function initHistoryPagination() {
    const sentinel = ensureHistorySentinel()
    if (!sentinel) return

    if (historyObserver) {
        historyObserver.disconnect()
    }

    historyObserver = new IntersectionObserver(async ([entry]) => {
        if (!entry.isIntersecting || !historyState.hasOlder || historyState.loading) return
        const currentChatId = getCurrentChatId()
        if (historyState.chatId !== currentChatId) return

        historyState.loading = true
        try {
            await loadChatHistory(currentChatId, historyState.page + 1, { prepend: true })
        } finally {
            historyState.loading = false
        }
    }, {
        root: messagesContainer,
        rootMargin: '120px',
    })

    historyObserver.observe(sentinel)
}

export async function loadChatHistory(chatId, page = 1, { prepend = false } = {}) {
    const response = await fetch(`/chat/chat_history/${chatId}/?page=${page}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    const data = await response.json()

    if (!data.success) {
        console.warn('chat history error', data)
        if (!prepend) {
            uiFunctions.renderMessages([])
        }
        return data
    }

    setCurrentUserUsername(data.current_user)

    if (prepend) {
        uiFunctions.prependMessages(data.messages || [])
        historyState.page = data.page || page
        historyState.hasOlder = Boolean(data.has_older)
    } else {
        uiFunctions.renderMessages(data.messages || [])
        setupChatHistory(chatId, data)
    }

    return data
}
