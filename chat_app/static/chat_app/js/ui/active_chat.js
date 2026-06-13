export function findPersonalChatItem(userId) {
    if (!userId) return null

    const personalChatsList = document.querySelector(
        '.chats-section .messages-container:first-child .content-chats'
    )

    return personalChatsList?.querySelector(`.container-chat[data-chat-user="${userId}"]`) ?? null
}

export function scrollChatIntoView(chatElement) {
    if (!chatElement) return

    chatElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
    })
}

export function setActiveChat(element) {
    document.querySelectorAll('.content-chats .container-chat.active').forEach(chat => {
        chat.classList.remove('active')
    })

    if (element) {
        element.classList.add('active')
        scrollChatIntoView(element)
    }
}

export function setActiveContact(userId) {
    document.querySelectorAll('.people-contact-plain.active').forEach(contact => {
        contact.classList.remove('active')
    })

    const contact = document.querySelector(`.people-contact-plain[data-chat-user="${userId}"]`)
    if (contact) {
        contact.classList.add('active')
        contact.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
}

