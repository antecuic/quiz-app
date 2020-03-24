const signupForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');
const btnLogout = document.querySelector('#logout');
let loggedUsername = null;
  
//state changed
auth.onAuthStateChanged(user => {
    if(user) {
        //user logout
        btnLogout.addEventListener('click', () => auth.signOut());

        dataBase.collection("users").get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                //getting logged user username from firestore database 
                Object.keys(doc.data().newUser).forEach(key => {

                    if(user.email === doc.data().newUser[key]) {
                        loggedUsername = doc.id
                        console.log('Logged username => ' + loggedUsername)
                    };
                });
 
            });
        });
           
    } else {
        loggedUsername = null;
        console.log('user logged out');
        console.log('Logged username => ' + loggedUsername);
    }

   
});

//login
loginForm.addEventListener('submit', e => {
    e.preventDefault()
    const email = loginForm['emailLogin'].value;
    const password = loginForm['passwordLogin'].value;
    auth.signInWithEmailAndPassword(email, password).then(loginForm.reset());
});

//signup
signupForm.addEventListener('submit', e => {
    e.preventDefault()
    const usrName = signupForm['usernameSignup'].value;
    const email = signupForm['emailSignup'].value;
    const password = signupForm['passwordSignup'].value;

    const newUser = {
        username: usrName,
        mail: email,
        password: password
    }
    auth.createUserWithEmailAndPassword(email, password)
        .then(dataBase.collection('users').doc(usrName).set({ newUser }))
});