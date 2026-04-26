export function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]
}

export function showErrors(form, errors) {
    form.querySelectorAll('.error').forEach(e => e.remove())

    for (const field in errors) {
        const input = form.querySelector(`[name="${field}"]`)
        if (!input) continue

        const message = errors[field]?.[0]?.message || 'Invalid value'

        const error = document.createElement('div')
        error.className = 'error'
        error.textContent = message

        input.parentNode.appendChild(error)
    }
}