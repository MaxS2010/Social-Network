import { filterUsers } from "./contacts_search.js"

const contactsScroll = document.querySelector('.contacts-scroll')
const contactsContainer = contactsScroll?.querySelector('#contactsContainer')
const contactsList = contactsScroll?.querySelector('#contactsList')
const sentinel = contactsScroll?.querySelector('#contacts-sentinel')
const contactsSearchInput = document.getElementById('contacts-list-search')

if (sentinel) {
    sentinel.style.display = 'block'
    sentinel.style.width = '100%'
    sentinel.style.height = '2px'
    sentinel.style.minHeight = '2px'
    sentinel.style.flexShrink = '0'
    console.log('contacts-sentinel computed', getComputedStyle(sentinel).width, getComputedStyle(sentinel).height)
} else {
    console.warn('contacts-sentinel not found')
}

let page = 1
let loading = false
let hasNext = true
let allUsers = []

function createContactItem(user) {
    const item = document.createElement('div')
    item.className = 'people-contact-plain'
    item.dataset.chatUser = user.id
    item.dataset.chatUsername = user.username
    item.innerHTML = `
        <div class="image-container">
            <img src="${user.avatar || '/static/chat_app/images/Avatar-1.png'}" alt="${user.username}">
        </div>
        <div class="contact-info">
            <p class="contact-name">${user.username}</p>
        </div>
    `
    return item
}

function render(users) {
    console.log('rendering users', users.length)
    if (!contactsList) {
        console.warn('contactsList container not found')
        return
    }
    contactsList.innerHTML = ''
    users.forEach(user => contactsList.appendChild(createContactItem(user)))
}

function renderSearchResults() {
    render(filterUsers(allUsers, contactsSearchInput?.value || ''))
}


async function loadInitial() {
    const res = await fetch(`/chat/contacts/?page=1`)
    const data = await res.json()

    if (!data.success) return

    allUsers = data.results
    hasNext = data.has_next
    page = 1

    renderSearchResults()
}

async function loadPage(nextPage, { renderAfterLoad = true } = {}) {
    console.log("FETCH PAGE:", nextPage, 'hasNext=', hasNext, 'loading=', loading)
    if (loading || !hasNext) return

    loading = true

    const res = await fetch(`/chat/contacts/?page=${nextPage}`)
    const data = await res.json()
    // console.log("BACKEND RESPONSE:", data)

    if (!data.success) {
        loading = false
        return
    }

    allUsers = [...allUsers, ...data.results]
    hasNext = data.has_next
    page = nextPage
    console.log("ALL USERS:", allUsers.length)
    if (renderAfterLoad) {
        renderSearchResults()
    }

    loading = false
}

async function loadAllContacts() {
    while (hasNext && !loading) {
        await loadPage(page + 1, { renderAfterLoad: false })
    }
}

const observer = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting || loading || !hasNext) return
    
    await loadPage(page + 1)

}, {
    root: contactsScroll,
    rootMargin: '150px'
})

if (sentinel instanceof Element) {
    console.log(sentinel.getBoundingClientRect())
    observer.observe(sentinel)
} else {
    console.warn('contacts-sentinel not found or not an Element', sentinel)
}

loadInitial()

contactsSearchInput?.addEventListener('input', async (event) => {
    if (event.target.value.trim()) {
        await loadAllContacts()
    }

    renderSearchResults()
})

window.ensureContactVisible = async function(userId) {
    if (!contactsList) return null

    const find = () => contactsList.querySelector(`[data-chat-user="${userId}"]`)
    if (find()) return find()

    while (hasNext) {
        await loadPage(page + 1)
        const el = find()
        if (el) {
            requestAnimationFrame(() => {
                try { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) } catch(e){}
            })
            return el
        }
    }

    return null
}
