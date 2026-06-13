import { groupByLetter, renderGroups } from "./contacts_renderer.js"

const searchInput = document.getElementById('contacts-search')
let modalUsers = []
let loadAllModalUsers = null

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

export function filterContacts(searchText) {
    renderModalContacts(searchText)
}

searchInput?.addEventListener('input', async (e) => {
    if (normalizeSearchText(e.target.value) && typeof loadAllModalUsers === 'function') {
        await loadAllModalUsers()
    }

    filterContacts(e.target.value)
})
