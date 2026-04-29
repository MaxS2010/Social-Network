import { getCSRFToken, showErrors } from './utils.js'

const expandForm = document.querySelector('#expand-info-form')

expandForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(expandForm)

    const response = await fetch(expandForm.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
        },
        body: formData,
    })

    const data = await response.json()

    if (data.success) {
        alert("Дані оновлено")
        window.location.reload()
    } else {
        console.log(data.errors)
        showErrors(expandForm, data.errors)
    }
})