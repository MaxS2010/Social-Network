import { renderSelectedUsers } from './chat_ws.js'

document.querySelector(".side-panel-container").style.display = "none"

document.getElementById("next-create").addEventListener("click", function () {

    const selected = document.querySelectorAll(".group-user-checkbox:checked")

    if (selected.length === 0) {
        alert("Виберіть хоча б одного користувача")
        return
    }

    renderSelectedUsers(selected)

    document.getElementById("create-group").style.display = "none"
    document.getElementById("add-create-member").style.display = "flex"
})

document.querySelectorAll(".close-cross-container").forEach(btn => {
    btn.addEventListener("click", function () {
        const group = this.closest(".group")
        document.querySelector(".group-container").style.display = "none"
        if (group) {
            group.style.display = "none"
        }
    })
})

document.getElementById("cancel-create").addEventListener("click", function() {
    const group = this.closest(".group")
    document.querySelector(".group-container").style.display = "none"
    if (group) {
        group.style.display = "none"
    }
})

document.getElementById("back-to-add-member").addEventListener("click", function() {
    const group = this.closest(".group")

    if (group) {
        group.style.display = "none"
    }

    document.getElementById("create-group").style.display = "flex"

    const membersList = document.querySelector(".members-list-view")
    if (membersList) {
        membersList.innerHTML = ""
    }

    document.querySelectorAll(".group-user-checkbox:checked").forEach(cb => {
        cb.checked = false
    })

    const container = document.querySelector(".members-list-view")
    if (container) container.innerHTML = ""

    updateSelectedCount()
})

export function openContactsModal() {

    document.querySelector(".group-container").style.display = "flex"
    document.getElementById("create-group").style.display = "flex"

    const cached = loadCache()

    if (cached && cached.length) {
        allUsers = cached
        renderGroups(groupByLetter(allUsers))
        return
    }

    allUsers = []
    page = 1
    loadPage(1)
}

export function updateSelectedCount() {
    const countEl = document.getElementById("selected-count")
    if (!countEl) return

    const selected = document.querySelectorAll(".group-user-checkbox:checked").length

    countEl.textContent = `Вибрано: ${selected}`
}

document.addEventListener("change", (e) => {
    if (e.target.classList.contains("group-user-checkbox")) {
        updateSelectedCount()
    }
})