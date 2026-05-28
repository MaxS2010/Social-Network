document.querySelector(".side-panel-container").style.display = "none" 

document.getElementById("create-group-btn").addEventListener("click", function() {
    document.getElementById("create-group").style.display = "flex"
    document.querySelector(".group-container").style.display = "flex"
})

document.getElementById("next-create").addEventListener("click", function() {
    document.getElementById("create-group").style.display = "none"
    document.getElementById("add-create-member").style.display = "flex"
    document.querySelector(".group-container").style.display = "flex"
})

document.querySelectorAll(".close-cross-container").forEach(btn => {
    btn.addEventListener("click", function () {
        const group = this.closest(".group")
        document.querySelector(".group-container").style.display = "none"
        if (group) {
            group.style.display = "none"
        }
    })
})