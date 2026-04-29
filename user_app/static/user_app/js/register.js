import { getCSRFToken, showErrors } from "./utils.js"
import { showLoginForm } from "./ui/authViews.js"


document.querySelector('.section-register form').addEventListener('submit', function (event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)

    fetch(form.action, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRFToken(),
            "X-Requested-With": "XMLHttpRequest",
        },
        body: formData
    })
    .then(async response => {
        const data = await response.json()
        if (!response.ok) {
            throw data
        }
        return data
    })
    .then(data => {
        console.log('register success')
        document.querySelector('.section-register').style.display = 'none'
        showLoginForm()
    })
    .catch(data => {
        if (data?.errors) {
            showErrors('register-errors', data.errors)
        }
    })
})