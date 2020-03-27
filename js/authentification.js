const signupForm = document.querySelector('#signup-form');
const btnSignup = document.querySelector('#btn-signup');
const loginForm = document.querySelector('#login-form');
const btnLogout = document.querySelector('#logout');
const modal = document.querySelector('.modal');

//state changed
auth.onAuthStateChanged(user => {
    if(user) {
        //user logout
        btnLogout.style.display = 'inline-block';
        btnLogout.addEventListener('click', () => auth.signOut());

    } else {
        btnLogout.style.display = 'none';
    }
   
});

//login
loginForm.addEventListener('submit', e => {
    e.preventDefault()
    const email = loginForm['emailLogin'].value;
    const password = loginForm['passwordLogin'].value;

    if (email === '' || password === '') {
        return;
    }

    closeModal();

    auth.signInWithEmailAndPassword(email, password)
        .then(loginForm.reset())
        .catch(error => alert(error.message));
});

//signup
signupForm.addEventListener('submit', e => {

    e.preventDefault()
    const usrName = signupForm['usernameSignup'].value;
    const email = signupForm['emailSignup'].value;
    const password = signupForm['passwordSignup'].value;    

    if((usrName === '') || (email === '') || (password === '')) {
        return;
    }

    const newUser = {
        username: usrName,
        mail: email,
        password: password
    }

    closeModal();

    auth.createUserWithEmailAndPassword(email, password)
        .then(result => {
                signupForm.reset()
                return result.user.updateProfile({displayName: usrName})
            })
        .catch(error => alert(error.message))
});