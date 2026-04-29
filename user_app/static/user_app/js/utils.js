export function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]
}

export function showErrors(containerId, errors) {
    const errorsContainer = document.getElementById(containerId)
    if (!errorsContainer) return

    errorsContainer.innerHTML = ""

    for (let fieldName in errors) {
        errors[fieldName].forEach(errorObj => {
            let p = document.createElement('p')
            p.textContent = errorObj.message
            errorsContainer.appendChild(p)
        })
    }
}