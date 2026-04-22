let sectionRegister = document.querySelector('.section-register');
let registerSwitches = document.querySelectorAll('.register');
let buttonRegister = document.querySelector('.button-register');

let sectionLogin = document.querySelector('.section-login');
let loginSwitches = document.querySelectorAll('.login');

let sectionConfirm = document.querySelector('.section-confirm');
let buttonBack = document.querySelector('.back');


registerSwitches.forEach(registerSwitch => {
    registerSwitch.addEventListener('click', function() {
        sectionLogin.style.display = "none";
        sectionRegister.style.display = "flex";
        
        loginSwitches.forEach(login => login.classList.remove('select'));
        registerSwitches.forEach(regiter => regiter.classList.add('select'));
    });
});

loginSwitches.forEach(loginSwitch => {
    loginSwitch.addEventListener('click', function() {
        sectionRegister.style.display = "none";
        sectionLogin.style.display = "flex";
        
        registerSwitches.forEach(regiset => regiset.classList.remove('select'));
        loginSwitches.forEach(login => login.classList.add('select'));
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