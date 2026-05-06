const button = document.getElementById('create-post')
const imageButton = document.querySelector('#file-upload-button')
const modalCreatePost = document.querySelector('.create-post-container')

button.addEventListener('click', () => {
    const textInput = document.querySelector('#post-text')
    const modalTextInput = document.querySelector('.create-post-container textarea')

    modalTextInput.value = textInput.value
    modalCreatePost.style.display = 'flex'

    // if (imageButton) {
    //     imageButton.style.color = 'transparent'
        
    //     const imageIcon = document.createElement('img')
    //     imageIcon.src = "/static/post_app/icons/image-add.png"
    //     imageIcon.alt = "Image Icon"
    //     imageButton.appendChild(imageIcon)
    // }
    // else {
    //     console.error("Element 'file-upload-button' not found.")
    // }
})

const closeCross = document.querySelector('.close-cross')

closeCross.addEventListener('click', () => {
    modalCreatePost.style.display = 'none'
})