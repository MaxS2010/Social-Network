const editButton = document.getElementById("editButton")
const saveButton = document.getElementById("saveButton")
const modalWindow = document.getElementById("modalWindow")
const profilePanel = document.getElementById("profilePanel")

editButton.addEventListener("click", () => {
    modalWindow.style.display = "flex"
    profilePanel.style.display = "none"
})

saveButton.addEventListener("click", () => {
    modalWindow.style.display = "none"
    profilePanel.style.display = "flex"
})

