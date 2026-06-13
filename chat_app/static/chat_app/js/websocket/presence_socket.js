const PING_INTERVAL_MS = 20000
const STATUS_POLL_INTERVAL_MS = 30000
const RECONNECT_DELAY_MS = 3000

let presenceSocket = null
let pingIntervalId = null
let statusPollIntervalId = null
let shouldReconnect = true

export function updateUserOnlineStatus(userId, isOnline) {
    const userIdStr = String(userId)

    document.querySelectorAll('.container-chat[data-chat-user]').forEach((chatItem) => {
        if (chatItem.dataset.chatUser !== userIdStr) {
            return
        }

        const indicator = chatItem.querySelector('.online-indicator')
        if (!indicator) {
            return
        }

        indicator.classList.toggle('online-indicator--online', isOnline)
        indicator.classList.toggle('online-indicator--offline', !isOnline)
    })
}

export function applyInitialStatus(onlineUserIds) {
    const onlineSet = new Set((onlineUserIds || []).map(String))

    document.querySelectorAll('.container-chat[data-chat-user]').forEach((chatItem) => {
        const userId = chatItem.dataset.chatUser
        updateUserOnlineStatus(userId, onlineSet.has(userId))
    })
}

export async function pollOnlineStatus() {
    try {
        const response = await fetch('/online_status/')
        const data = await response.json()

        if (data.success) {
            applyInitialStatus(data.online_user_ids)
        }
    } catch (error) {
        console.warn('online status poll failed', error)
    }
}

export function clearPingTimer() {
    if (pingIntervalId) {
        clearInterval(pingIntervalId)
        pingIntervalId = null
    }
}

export function clearAllPresenceTimers() {
    clearPingTimer()

    if (statusPollIntervalId) {
        clearInterval(statusPollIntervalId)
        statusPollIntervalId = null
    }
}

export function connectPresenceWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    presenceSocket = new WebSocket(`${protocol}//${window.location.host}/presence/`)

    presenceSocket.onopen = () => {
        pingIntervalId = setInterval(() => {
            if (presenceSocket?.readyState === WebSocket.OPEN) {
                presenceSocket.send(JSON.stringify({ type: 'ping' }))
            }
        }, PING_INTERVAL_MS)
    }

    presenceSocket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'initial_status') {
            applyInitialStatus(data.online_user_ids)
            return
        }

        if (data.type === 'user_status') {
            updateUserOnlineStatus(data.user_id, Boolean(data.is_online))
        }
    }

    presenceSocket.onclose = () => {
        clearPingTimer()

        if (shouldReconnect) {
            setTimeout(connectPresenceWebSocket, RECONNECT_DELAY_MS)
        }
    }
}

window.addEventListener('beforeunload', () => {
    shouldReconnect = false
    clearAllPresenceTimers()

    if (presenceSocket && presenceSocket.readyState === WebSocket.OPEN) {
        presenceSocket.close()
    }
})

export function startPresencePolling() {
    if (!statusPollIntervalId) {
        statusPollIntervalId = setInterval(pollOnlineStatus, STATUS_POLL_INTERVAL_MS)
    }
}
