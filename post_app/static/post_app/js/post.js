const button = document.getElementById('create-post')
const imageButton = document.querySelector('#file-upload-button')
const modalCreatePost = document.querySelector('.modal-container')

button.addEventListener('click', () => {
    const textInput = document.querySelector('#post-text')
    const modalTextInput = document.querySelector('.create-post-container textarea')

    modalTextInput.value = textInput.value
    modalCreatePost.style.display = 'flex'

    const p = document.createElement("p")
    p.className = 'tags-inline'
    p.textContent = 'fff'

    document.querySelector("form div textarea").appendChild(p)
})

const closeCross = document.querySelector('.close-cross')

closeCross.addEventListener('click', () => {
    modalCreatePost.style.display = 'none'
})