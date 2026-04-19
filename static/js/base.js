const urlLinks = document.querySelectorAll('.url')

for (let link of urlLinks) {
    if (link.href === window.location.href) {
        link.style.backgroundColor = '#E9E5EE'
    }
}