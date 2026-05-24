document.querySelector(".side-panel-container").style.display = "none" 

document.getElementById("create-group").addEventListener("click", function() {
    document.querySelector(".create-group-container").style.display = "flex"
})

document.querySelector(".close-cross-container").addEventListener("click", function() {
    document.querySelector(".create-group-container").style.display = "none"
})