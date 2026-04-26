import { postForm } from './api_user.js'
import { showErrors } from './utils.js'
import {
    showRegisterForm,
    showLoginForm,
    showConfirmForm,
    hideConfirmForm,
} from './ui/authViews.js'

import { initCodeInputs } from './ui/codeInputs.js'

export function initAuth() {
    const codeInputs = initCodeInputs()

    // REGISTER
    const registerForm = document.querySelector('.section-register form')

    registerForm?.addEventListener('submit', async (event) => {
        event.preventDefault()

        const data = await postForm(registerForm.action, new FormData(registerForm))

        if (data.success) {
            console.log('register success')
        } else {
            showErrors(registerForm, data.errors)
        }
    })

    // CONFIRM
    const confirmForm = document.querySelector('.section-confirm form')

    confirmForm?.addEventListener('submit', async (event) => {
        event.preventDefault()

        const data = await postForm('/user/confirm/', new FormData(confirmForm))

        if (data.success) {
            hideConfirmForm()
            showLoginForm()
            codeInputs.clear()
        } else {
            console.log('confirm error')
        }
    })

    // LOGIN
    const loginForm = document.querySelector('.section-login form')

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault()

        const data = await postForm(loginForm.action, new FormData(loginForm))

        if (data.success) {
            window.location.href = '/'
        } else {
            showErrors(loginForm, data.errors)
        }
    })

    // UI buttons
    document.getElementById('register')?.addEventListener('click', showRegisterForm)
    document.getElementById('login')?.addEventListener('click', showLoginForm)

    document.querySelector('.button-register')
        ?.addEventListener('click', showConfirmForm)

    document.querySelector('.back')
        ?.addEventListener('click', () => {
            hideConfirmForm()
            showRegisterForm()
            codeInputs.clear()
        })
}