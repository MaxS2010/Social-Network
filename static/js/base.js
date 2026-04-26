const urlLinks = document.querySelectorAll('.url')

for (let link of urlLinks) {
    if (link.href === window.location.href) {
        link.style.backgroundColor = '#E9E5EE'
        link.style.cursor = 'default'
        link.addEventListener('click', function(event) {
            event.preventDefault()
        })
    }
}

function getCSRFToken() {
    const cookies = document.cookie.split(';')

    for (let c of cookies) {
        c = c.trim();
        if (c.startsWith('csrftoken=')) {
            return decodeURIComponent(c.slice(10));
        }
    }
}

async function logoutUser() {
    console.log("CLICK WORKED");

    const response = await fetch('/user/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'same-origin'
    });

    if (!response.ok) {
        console.error("HTTP ERROR:", response.status);
        const text = await response.text();
        console.error(text);
        return;
    }

    const data = await response.json();

    if (data.success) {
        window.location.href = "/user/auth/";
    }
}

// document.querySelector("#button-exit").addEventListener(
//     'click',
//     logoutUser
// )

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector("#button-exit")

    if (btn) {
        btn.addEventListener('click', logoutUser)
    }
    else {
        console.error("no btn")
    }
})