const contactsScroll = document.querySelector('.contacts-scroll')
const contactsContainer = document.getElementById('contactsContainer')
const sentinel = document.getElementById('contactsSentinel')

let page = 1
let loading = false

async function loadInitial() {
    const res = await fetch(`/chat/contacts/?page=1`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })

    const data = await res.json()

    if (data.success) {
        contactsContainer.insertAdjacentHTML('beforeend', data.html)
    }
}

loadInitial()

const observer = new IntersectionObserver(async ([entry]) => {

    if (!entry.isIntersecting || loading) return

    loading = true
    page += 1

    const res = await fetch(`/chat/contacts/?page=${page}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })

    const data = await res.json()

    if (data.success && data.html.trim()) {
        contactsContainer.insertAdjacentHTML('beforeend', data.html)
    } else {
        observer.disconnect()
    }

    loading = false

}, {
    root: contactsScroll,
    rootMargin: '150px'
})

observer.observe(sentinel)