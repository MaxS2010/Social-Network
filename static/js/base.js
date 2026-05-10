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


const needModal = sessionStorage.getItem("showProfileModal")
const modal = document.querySelector('.form-info-container')

if (needModal == "true") {
    
    const message = document.createElement('p')

    message.className = 'modal-message'
    message.innerHTML = `<span>Або оберіть:</span><span class="text-accent">Запропоновані варіанти відповідно до Ім’я та Прізвища</span>`
    

    document.querySelector('.form').appendChild(message)

    modal.style.display = 'flex'

    sessionStorage.removeItem("showProfileModal")
}
else{
    // modal.remove()
}