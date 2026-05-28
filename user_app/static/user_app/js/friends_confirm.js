const profileContainer = document.querySelector(".profile-container")
const profileContent = document.getElementById("profileContent")


document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".open-profile-btn")
    const section = btn.dataset.section
    if (!btn) return

    const userId = btn.dataset.userId

    const response = await fetch(
        `/friends/profile/${userId}?section=${section}`
    )
    const data = await response.json()

    document.getElementById("friends-home").style.display = "none"
    document.querySelector(".friends-nav-content").style.display = "none"
    profileContent.innerHTML = data.html

    profileContainer.style.display = "flex"
})