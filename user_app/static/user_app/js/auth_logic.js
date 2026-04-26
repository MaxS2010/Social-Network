import { showLoginForm } from './auth.js'

let isLoggingOut = false

function getCSRFToken() {
    const cookies = document.cookie.split(';')

    for (let c of cookies) {
        c = c.trim();
        if (c.startsWith('csrftoken=')) {
            return decodeURIComponent(c.slice(10));
        }
    }
}

const registerForm = document.querySelector('.section-register form')

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(registerForm)

    const response = await fetch(registerForm.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
        },
        body: formData,
        credentials: 'same-origin'
    })
    
    const data = await response.json()
    

    if (data.success) {
        console.log("success")
    } else {
        // showErrors(registerForm, data.errors)
        console.log("1")
    }
    
})

const confirmForm = document.querySelector('.section-confirm form')

confirmForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(confirmForm)

    const response = await fetch('/user/confirm/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
        },
        body: formData,
        credentials: 'same-origin'
    })

    const data = await response.json()

    if (data.success) {
        document.querySelector('.section-confirm').style.display = "none"
        showLoginForm()
    } else {
        // showErrors(confirmForm, data.errors)
        console.log("0")
    }
})

const loginForm = document.querySelector('.section-login form')

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(loginForm)

    const response = await fetch(loginForm.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
        },
        body: formData,
        credentials: 'same-origin'
    }) 

    const data = await response.json()

    if (data.success) {
        window.location.href = '/'
        
    }

    // if (!data.success) {
    //     showErrors(loginForm, data.errors)
    // }
})


function showErrors(form, errors) {
    form.querySelectorAll('.error').forEach(e => e.remove())

    for (const field in errors) {
        const input = form.querySelector(`[name="${field}"]`)
        if (!input) continue

        const error = document.createElement('div')
        error.className = 'error'
        error.innerText = errors[field][0].message

        input.parentNode.appendChild(error)
    }
}