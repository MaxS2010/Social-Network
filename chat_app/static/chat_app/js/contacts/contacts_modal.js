import {
    saveCache,
    loadCache
} from "../utils/cache.js"

import {
    initModalContactsSearch,
    renderModalContacts,
    setContactsSearchUsers
} from "./contacts_search.js"

let allUsers = []
let page = 1
let loading = false
let hasNext = true

const contactsScroll = document.getElementById('contactsModalScroll')
const contactsContainer = document.getElementById('contactsModalContainer')
const contactsSearchInput = document.getElementById('contacts-search')
let modalObserver = null

async function loadPage(p = 1) {
    if (loading || !hasNext) return false

    loading = true

    try {
        const res = await fetch(`/chat/contacts-modal/?page=${p}`)
        const data = await res.json()

        if (!data.success) {
            hasNext = false
            return false
        }

        if (p == 1) {
            allUsers = data.results || []
        } else {
            allUsers.push(...(data.results || []))
        }

        hasNext = Boolean(data.has_next)
        page = p

        saveCache(allUsers)
        setContactsSearchUsers(allUsers)
        renderModalContacts()
        
        return true
    } catch (error) {
        console.error('Failed to load modal contacts page:', error)
        hasNext = false
        return false
    } finally {
        loading = false
    }
}

async function loadAllModalContacts() {
    if (!hasNext || loading) return

    while (hasNext) {
        const success = await loadPage(page + 1)
        if (!success) break
    }
}

initModalContactsSearch({ loadAllUsers: loadAllModalContacts })

function openContactsModal() {
    const groupContainer = document.querySelector(".group-container")
    if (groupContainer) {
        groupContainer.style.display = "flex"
    }
    const createGroupEl = document.getElementById("create-group")
    if (createGroupEl) createGroupEl.style.display = "flex"

    const cached = loadCache()

    if (cached && cached.length) {
        allUsers = cached
        hasNext = false
        
        setContactsSearchUsers(allUsers)
        renderModalContacts(contactsSearchInput?.value || '')
        
        const sentinel = document.getElementById('contactsModalSentinel')
        if (sentinel) sentinel.style.display = 'none'
        return
    }

    allUsers = []
    setContactsSearchUsers(allUsers)
    page = 1
    hasNext = true

    if (contactsContainer) contactsContainer.innerHTML = ""

    const sentinel = document.getElementById('contactsModalSentinel')
    if (sentinel && contactsScroll) {
        sentinel.style.cssText = 'display:block; width:100%; height:2px; min-height:2px; flex-shrink:0;'

        if (modalObserver) {
            modalObserver.disconnect()
        }

        modalObserver = new IntersectionObserver(async ([entry]) => {
            if (!entry.isIntersecting || loading || !hasNext) return
            await loadPage(page + 1)
        }, {
            root: contactsScroll,
            rootMargin: '150px'
        })

        try {
            modalObserver.observe(sentinel)
        } catch (error) {
            console.warn('modal observer observe failed', error, sentinel)
        }
    }

    loadPage(1)
}

document.addEventListener("click", (e) => {
    const modalContact = e.target.closest(".people-contact-modal")
    
    if (modalContact) {
        e.stopPropagation()

        const checkbox = modalContact.querySelector(".group-user-checkbox")
        if (checkbox && e.target !== checkbox) {
            e.preventDefault()
            checkbox.checked = !checkbox.checked
            
            checkbox.dispatchEvent(new Event("change", { bubbles: true }))
        }
        return
    }

    if (e.target.closest("#create-group-btn")) {
        openContactsModal()
    }
})
