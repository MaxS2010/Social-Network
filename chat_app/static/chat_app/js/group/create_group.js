import { getCSRFToken } from "/static/user_app/js/utils.js"
import { resetGroupAvatarPreview } from "../ui/group_avatar.js"
import { renderSelectedUsers, updateSelectedCount } from "./selected_users.js"

const nextCreateButton = document.getElementById("next-create")
const cancelCreateButton = document.getElementById("cancel-create")
const backToAddMemberButton = document.getElementById("back-to-add-member")
const addCreateMember = document.getElementById("add-create-member")

// Submit group form function
async function submitGroupForm(selected) {
    let form = document.querySelector("#create-group-form")
    if (!form) {
        console.warn('Form not found')
        return
    }

    const formData = new FormData(form)
    selected.forEach(cb => {
        if (cb.value) formData.append('users[]', cb.value)
    })

    try {
        const res = await fetch("/chat/create_group/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken()
            },
            body: formData
        })

        const data = await res.json()

        if (!data.success) {
            alert(data.error)
            return
        }

        // If it's a personal chat (1 user), redirect to chat
        if (data.redirect || !data.is_group) {
            window.location.href = '/chat/'
        } else {
            location.reload()
        }
    } catch (error) {
        console.error('Error:', error)
        alert('Помилка при створенні чату')
    }
}

nextCreateButton?.addEventListener("click", function () {

    const selected = document.querySelectorAll(".group-user-checkbox:checked")

    if (selected.length === 0) {
        alert("Виберіть хоча б одного користувача")
        return
    }

    // If only 1 user selected, skip to form submission
    if (selected.length === 1) {
        submitGroupForm(selected)
        return
    }

    renderSelectedUsers(selected)

    const createGroup = document.getElementById("create-group")
    if (createGroup) createGroup.style.display = "none"
    if (addCreateMember) addCreateMember.style.display = "flex"
})

cancelCreateButton?.addEventListener("click", function() {
    const group = this.closest(".group")
    const groupContainer = document.querySelector(".group-container")
    if (groupContainer) groupContainer.style.display = "none"
    if (group) {
        group.style.display = "none"
    }
})

backToAddMemberButton?.addEventListener("click", function() {
    const group = this.closest(".group")

    if (group) {
        group.style.display = "none"
    }

    const createGroup = document.getElementById("create-group")
    if (createGroup) createGroup.style.display = "flex"

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
    resetGroupAvatarPreview()
})

document.querySelectorAll(".close-cross-container").forEach(btn => {
    btn.addEventListener("click", function () {
        const group = this.closest(".group")
        const groupContainer = document.querySelector(".group-container")
        if (groupContainer) groupContainer.style.display = "none"
        if (group) {
            group.style.display = "none"
        }
    })
})

addCreateMember
?.querySelector("button[type='submit']")
?.addEventListener("click", async function (e) {
    e.preventDefault()

    const selected = document.querySelectorAll('.group-user-checkbox:checked')

    if (!selected || selected.length === 0) {
        alert('Виберіть хоча б одного користувача')
        return
    }

    submitGroupForm(selected)
})

