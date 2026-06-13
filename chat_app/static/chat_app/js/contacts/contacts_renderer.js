export function groupByLetter(users) {
    return users.reduce((acc, user) => {

        const letter = user.username[0].toUpperCase()

        if (!acc[letter]) {
            acc[letter] = []
        }

        acc[letter].push(user)

        return acc
    }, {})
}

export function renderGroups(grouped, containerId = "contactsContainer") {
    const container = document.getElementById(containerId)
    if (!container) {
        console.warn(`renderGroups: container ${containerId} not found`, {grouped, containerId})
        return
    }
    console.log(`renderGroups ${containerId}`, Object.keys(grouped).length)
    container.innerHTML = ""

    Object.keys(grouped)
        .sort()
        .forEach(letter => {

            const groupEl = document.createElement("div")
            groupEl.className = "contacts-group"

            groupEl.innerHTML = `<p class="contacts-letter">${letter}</p>`

            grouped[letter].forEach(user => {

                const el = document.createElement("div")
                el.className = "people-contact-modal"
                el.dataset.userId = user.id
                el.dataset.chatUsername = user.username

                el.innerHTML = `
                    <img src="${user.avatar || '/static/chat_app/images/Avatar-1.png'}">
                    <p class="contact-name">${user.username}</p>

                    <div class="checkbox-container">
                        <label class="input-checkbox">
                            <input type="checkbox"
                                class="group-user-checkbox"
                                name="users[]"
                                value="${user.id}"
                                data-avatar="${user.avatar || '/static/chat_app/images/Avatar-1.png'}">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                `

                groupEl.appendChild(el)
            })
            container.appendChild(groupEl)
        })
}
