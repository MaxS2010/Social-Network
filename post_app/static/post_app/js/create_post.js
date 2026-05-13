import { getCSRFToken, showErrors } from '/static/user_app/js/utils.js'

// Відправляємо форму у фоновому режимі без перезавантаження сторінки.
document.getElementById("post-create-form").addEventListener("submit", function (event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)

    fetch(form.action, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRFToken(),
            "X-Requested-With": "XMLHttpRequest",
        },
        body: formData,
    })
    .then(async (response) => {
        // Спочатку читаємо JSON, а потім перевіряємо HTTP-статус.
        const data = await response.json()
        console.log(data)

        if (!response.ok) {
            throw data
        }

        return data
    })
    .then((data) => {
        // Після успішного створення переходимо на сторінку всіх постів.
        if (data.redirect_url) {
            window.location.href = data.redirect_url
        }
    })
    .catch((data) => {
        // Якщо Django повернув помилки форми, показуємо їх над формою.
        if (data.errors) {
            console.log(data.errors)
            showErrors(data.errors)
        }
    })
})

document.getElementById("add-tag-form").addEventListener("submit", function (event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)

    fetch(form.action, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRFToken(),
            "X-Requested-With": "XMLHttpRequest",
        },
        body: formData,
    })
    .then(async (response) => {
        const data = await response.json()
        console.log(data)

        if (!response.ok) {
            throw data
        }

        return data
    })
    .then((data) => {
        document.querySelector(".section-add-tag").style.display = "none"
        document.querySelector('.create-post-container').style.display = "flex"

        document
        .getElementById("add-tag")
        .insertAdjacentHTML("beforebegin", data.tag.html)

        updateTagsUI()
    })
    .catch((data) => {
        if (data.errors) {
            console.log(data.errors)
            showErrors(data.errors)
        }
    })
})