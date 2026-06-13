let chatSocket = null
let currentChatId = null
let currentUserUsername = null
let currentChatIsGroup = false

window.currentUserUsername = currentUserUsername
window.currentChatIsGroup = currentChatIsGroup
window.currentChatId = currentChatId

export function getChatSocket() {
    return chatSocket
}

export function setChatSocket(socket) {
    chatSocket = socket
}

export function getCurrentChatId() {
    return currentChatId
}

export function setCurrentChatId(chatId) {
    currentChatId = chatId
    window.currentChatId = chatId
}

export function getCurrentUserUsername() {
    return currentUserUsername
}

export function setCurrentUserUsername(username) {
    currentUserUsername = username
    window.currentUserUsername = username
}

export function getCurrentChatIsGroup() {
    return currentChatIsGroup
}

export function setCurrentChatIsGroup(isGroup) {
    currentChatIsGroup = Boolean(isGroup)
    window.currentChatIsGroup = currentChatIsGroup
}
