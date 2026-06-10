import {
    saveCache,
    loadCache
} from "./localstorage_cache.js"

import {
    groupByLetter,
    renderGroups
} from "./modal_sort.js"

let allUsers = []
let page = 1
let loading = false
let hasNext = true

const contactsScroll = document.getElementById('contactsModalScroll')
const contactsContainer = document.getElementById('contactsModalContainer')
let modalObserver = null

console.log('modal_create root', contactsScroll)

async function loadPage(p = 1) {
    if (loading || !hasNext) return

    loading = true

    const res = await fetch(`/chat/contacts-modal/?page=${p}`)
    const data = await res.json()

    if (!data.success) {
        loading = false
        return
    }

    allUsers.push(...data.results)

    hasNext = data.has_next
    page = p

    saveCache(allUsers)

    renderGroups(groupByLetter(allUsers), 'contactsModalContainer')

    loading = false
}

function openContactsModal() {
    console.log('openContactsModal start')

    const groupContainer = document.querySelector(".group-container")
    if (groupContainer) {
        groupContainer.style.display = "flex"
    }
    const createGroupEl = document.getElementById("create-group")
    if (createGroupEl) createGroupEl.style.display = "flex"

    const cached = loadCache()

    if (cached && cached.length) {
        allUsers = cached
        hasNext = true
        renderGroups(groupByLetter(allUsers), 'contactsModalContainer')
        return
    }

    allUsers = []
    page = 1
    hasNext = true

    if (contactsContainer) contactsContainer.innerHTML = ""

    const sentinel = document.getElementById('contactsModalSentinel')
    if (sentinel && contactsScroll) {
        sentinel.style.display = 'block'
        sentinel.style.width = '100%'
        sentinel.style.height = '2px'
        sentinel.style.minHeight = '2px'
        sentinel.style.flexShrink = '0'

        if (!modalObserver) {
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
    }

    loadPage(1)
}

document.addEventListener("click", (e) => {

    if (e.target.closest("#create-group-btn")) {
        console.log('create-group-btn clicked', e.target)
        openContactsModal()
    }
})