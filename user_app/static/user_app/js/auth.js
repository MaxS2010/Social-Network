let sectionRegister = document.querySelector('.section-register');
let registers = document.querySelectorAll('.register');
let buttonRegister = document.querySelector('.button-register');

let sectionLogin = document.querySelector('.section-login');
let logins = document.querySelectorAll('.login');

let sectionConfirm = document.querySelector('.section-confirm');
let buttonBack = document.querySelector('.back');


registers.forEach(reg => {
    reg.addEventListener('click', function() {
        sectionLogin.style.display = "none";
        sectionRegister.style.display = "flex";
        
        logins.forEach(login => login.classList.remove('select'));
        registers.forEach(reg => reg.classList.add('select'));
    });
});

logins.forEach(login => {
    login.addEventListener('click', function() {
        sectionRegister.style.display = "none";
        sectionLogin.style.display = "flex";
        
        registers.forEach(reg => reg.classList.remove('select'));
        logins.forEach(login => login.classList.add('select'));
    });
});


buttonRegister.addEventListener('click', function(event) {
    event.preventDefault();
    
    sectionRegister.style.display = "none";
    sectionConfirm.style.display = "flex";
});

buttonBack.addEventListener('click', function() {
    sectionConfirm.style.display = "none";
    sectionRegister.style.display = "flex";

});