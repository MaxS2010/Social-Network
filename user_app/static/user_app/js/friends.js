document.addEventListener('DOMContentLoaded', function () {
    const home = document.getElementById('friends-home')
    const section = document.getElementById('friends-section')
    const sectionTitle = document.getElementById('friends-section-title')
    const sectionList = document.getElementById('friends-section-list')
    const backBtn = document.getElementById('friends-back-home')

    function showHome() {
        if (home) home.style.display = 'flex'
        if (section) section.style.display = 'none'
    }

    function showSection(title, html) {
        if (home) home.style.display = 'none'
        if (section) section.style.display = 'flex'
        if (sectionTitle) sectionTitle.textContent = title
        if (sectionList) sectionList.innerHTML = html
    }

    document.querySelectorAll('[data-section-link]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.sectionLink

            fetch(`/friends/section/${key}/`)
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        
                        showSection(data.title, data.html)
                    }
                })
                .catch(err => console.error(err))
        })
    })

    if (backBtn) {
        backBtn.addEventListener('click', showHome)
    }

    showHome()
})