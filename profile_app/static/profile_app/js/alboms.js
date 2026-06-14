document.querySelector(".alboms").addEventListener("click", function() {
    document.querySelector(".settings-container").style.display = "none"
    document.querySelector(".alboms-container").style.display = "flex"
    const element = document.querySelector(".alboms")
    element.style.borderBottom = '2px solid black'
    document.querySelector(".personal-information").style.color = '#81818D'
})

const fileInput = document.getElementById('file-input')

let selectedFiles = []

fileInput.addEventListener('change', function() {
    const files = this.files

    if (files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                selectedFiles.push(file)

                const reader = new FileReader()

                reader.onload = function(e) {
                    const imgDiv = document.createElement('div')
                    imgDiv.className = "img-container"
                    imgDiv.style.backgroundImage = `url('${e.target.result}')`

                    const buttonRemove = document.createElement('button')
                    buttonRemove.type = "button"
                    buttonRemove.className = "button-remove"

                    const imgRemove = document.createElement('img')
                    imgRemove.src = "/static/profile_app/icons/remove-image.svg"

                    buttonRemove.appendChild(imgRemove)
                    imgDiv.appendChild(buttonRemove)
                    previewContainer.appendChild(imgDiv)

                    buttonRemove.addEventListener(
                        'click',
                        function (){
                            const index = selectedFiles.indexOf(file)
                            if (index > -1) {
                                selectedFiles.splice(index, 1)
                                updateFileInput()
                            }
                            imgDiv.remove()
                        }
                    )
            }
            reader.readAsDataURL(file)
        }
    })
}})

function updateFileInput() {
    const dt = new DataTransfer()
    selectedFiles.forEach(file => dt.items.add(file))
    fileInput.files = dt.files
}