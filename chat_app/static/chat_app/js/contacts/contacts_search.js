import { groupByLetter, renderGroups } from "./contacts_renderer.js"

const searchInput = document.getElementById('contacts-search')
let modalUsers = []
let loadAllModalUsers = null
let searchTimeoutId = null

export function setContactsSearchUsers(users) {
    modalUsers = users || []
}

export function normalizeSearchText(value) {
    return (value || '').trim().toLowerCase()
}

export function filterUsers(users, searchText) {
    const query = normalizeSearchText(searchText)
    if (!query) return users || []

    return (users || []).filter((user) => {
        return (user.username || '').toLowerCase().includes(query)
    })
}

export function renderModalContacts(searchText = searchInput?.value || '') {
    renderGroups(
        groupByLetter(filterUsers(modalUsers, searchText)),
        'contactsModalContainer',
    )
}

export function initModalContactsSearch({ loadAllUsers } = {}) {
    loadAllModalUsers = loadAllUsers || null
}

searchInput?.addEventListener('input', (e) => {
    const targetValue = e.target.value

    renderModalContacts(targetValue)

    if (searchTimeoutId) {
        clearTimeout(searchTimeoutId)
    }

    searchTimeoutId = setTimeout(async () => {
        if (normalizeSearchText(targetValue) && typeof loadAllModalUsers === 'function') {
            try {
                await loadAllModalUsers()
            } catch (error) {
                console.warn('Failed to pre-load all modal users during search:', error)
            } finally {
                renderModalContacts(targetValue)
            }
        }
    }, 350)
})
