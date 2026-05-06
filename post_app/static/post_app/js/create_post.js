import { getCSRFToken, showErrors } from '../user_app/js/utils.js'

// Кнопка плюс додає ще одне поле для посилання.
document.getElementById("add-link").addEventListener("click", function () {
    // У всіх полів однаковий name="links", тому Django може отримати їх через request.POST.getlist("links").
    const input = document.createElement("input")
    input.type = "url"
    input.name = "links"
    input.placeholder = "https://example.com"

    document.getElementById("links-list").appendChild(document.createElement("br"))
    document.getElementById("links-list").appendChild(input)
})

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
            showErrors(data.errors)
        }
    })
})
