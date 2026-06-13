import { getCSRFToken } from "/static/user_app/js/utils.js"

export function formatBadgeCount(count) {
    const value = Number(count) || 0
    return value > 99 ? '99+' : String(value)
}

export async function markChatAsRead(chatId) {
    if (!chatId) return

    try {
        const response = await fetch(`/chat/mark_read/${chatId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
        })
        const data = await response.json()

        clearChatUnreadBadges(chatId)

        if (data.success && typeof window.applyChatUnreadStatus === 'function') {
            window.applyChatUnreadStatus(data)
        } else {
            updateSectionUnreadBadges()
        }
    } catch (error) {
        console.warn('mark chat read failed', error)
    }
}

export function clearChatUnreadBadges(chatId) {
    document.querySelectorAll(`.container-chat[data-chat-id="${chatId}"]`).forEach((chatItem) => {
        chatItem.classList.remove('container-chat--unread')
        chatItem.querySelector('.chat-unread-badge')?.remove()
    })
}

export function updateSectionUnreadBadges() {
    document.querySelectorAll('.messages-container').forEach((section) => {
        const sectionBadge = section.querySelector('.chat-section-icon-badge')
        const chatBadges = section.querySelectorAll('.chat-unread-badge')

        if (!sectionBadge && chatBadges.length === 0) {
            return
        }

        let total = 0
        chatBadges.forEach((badge) => {
            const value = badge.textContent.trim()
            total += value.endsWith('+') ? 100 : Number(value) || 0
        })

        if (total > 0) {
            if (sectionBadge) {
                sectionBadge.textContent = total > 99 ? '99+' : String(total)
            }
            return
        }

        sectionBadge?.remove()
    })
}

export function applyBadgeText(badge, count) {
    if (!badge) return

    const text = formatBadgeCount(count)
    badge.textContent = text
    badge.classList.toggle('count-badge--multi', text.length > 1)
}

export function setOrRemoveBadge(avatarWrapper, count, badgeClass) {
    if (!avatarWrapper) return

    const existingBadge = avatarWrapper.querySelector(`.${badgeClass}`)

    if (count > 0) {
        const badge = existingBadge || document.createElement('span')
        badge.className = badgeClass
        applyBadgeText(badge, count)
        if (!existingBadge) {
            avatarWrapper.appendChild(badge)
        }
        return
    }

    existingBadge?.remove()
}

export function updateSectionBadge(section, count) {
    if (!section) return

    const wrapper = section.querySelector('.chat-section-icon-wrapper')
    if (!wrapper) return

    const existingBadge = wrapper.querySelector('.chat-section-icon-badge')

    if (count > 0) {
        const badge = existingBadge || document.createElement('span')
        badge.className = 'chat-section-icon-badge'
        applyBadgeText(badge, count)
        if (!existingBadge) {
            wrapper.appendChild(badge)
        }
        return
    }

    existingBadge?.remove()
}

export function updateHomeIconBadge(count) {
    const block = document.getElementById('sidePanelMessages')
    if (!block) return

    const iconWrapper = block.querySelector('.side-panel-icon-wrapper')
    if (!iconWrapper) return

    const existingBadge = iconWrapper.querySelector('.side-panel-icon-badge')

    if (count > 0) {
        const badge = existingBadge || document.createElement('span')
        badge.className = 'side-panel-icon-badge'
        applyBadgeText(badge, count)
        if (!existingBadge) {
            iconWrapper.appendChild(badge)
        }
        return
    }

    existingBadge?.remove()
}

export function updateHeaderMessagesBadge(count) {
    const iconWrapper = document.getElementById('headerMessagesIcon')
    if (!iconWrapper) return

    const existingBadge = iconWrapper.querySelector('.header-icon-badge')

    if (count > 0) {
        const badge = existingBadge || document.createElement('span')
        badge.className = 'header-icon-badge'
        applyBadgeText(badge, count)
        if (!existingBadge) {
            iconWrapper.appendChild(badge)
        }
        return
    }

    existingBadge?.remove()
}
