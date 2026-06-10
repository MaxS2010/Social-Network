document.querySelector(".personal-information").addEventListener("click", function() {
    document.querySelector(".settings-container").style.display = "flex"
    document.querySelector(".alboms-container").style.display = "none"
    document.querySelector(".alboms").style.color = '#81818D'
})


const editButton = document.getElementById("EditButton")
const saveButton = document.getElementById("SaveButton")
const modal = document.getElementById("profileModal")

editButton.addEventListener('click', () => {
    modal.showModal()
});

saveButton.addEventListener('click', () => {
    modal.close()
})
