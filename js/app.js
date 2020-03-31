//MATERIALIZE-CSS INIT
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const elems = document.querySelectorAll('.modal');
        const instances = M.Modal.init(elems);
    });
})();

//*****APP********* 
(function() {

    const signupForm = document.querySelector('#signup-form');
    const loginForm = document.querySelector('#login-form');
    const userTemplate = document.querySelector('#user');
    const modals = document.querySelector('.modals');
    const btnForgotPass = document.querySelector('#btn-submitEmail');
    const millRadio = document.querySelector('#mill-radio');
    const quickradio = document.querySelector('#quick-radio');
    const btnPlay = document.querySelector('#btn-play');
    const gameMillionaire = document.querySelector('#game--millionaire');
    const gameQuickOne = document.querySelector('#game--quickOne');


    btnPlay.addEventListener('click', () => {

        if(millRadio.checked) {
            gameMillionaire.style.display = 'block';
            userTemplate.style.display = 'none';
        } else if (quickradio.checked) {
            gameQuickOne.style.display = 'block';
            userTemplate.style.display = 'none';
        } 
    });

    // user log's in or out
    auth.onAuthStateChanged(async (user) => {
        
        if(user) {
            //get user data from database

            const loggedUser = await getUserData(user.uid);

            //dispaly user profile
            userTemplate.style.display = 'flex';
            modals.style.display = 'none';
            document.querySelector('#btn-logout').addEventListener('click', () => auth.signOut());

            //users data display
            displayUser(loggedUser)

        } else {
            userTemplate.style.display = 'none';
            modals.style.display = 'block';
            displayUser()
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
            email: email,
            score: 0
        }

        closeModal();

        auth.createUserWithEmailAndPassword(email, password)
            .then(result => {
                    signupForm.reset();
                    axios.put(`https://quiz-game-b9909.firebaseio.com/users/${result.user.uid}.json`, newUser);
                    displayUser(newUser)
                    return result.user.updateProfile({displayName: usrName})
                })
            .catch(error => alert(error.message))
    });

    //password-reset

    btnForgotPass.addEventListener('click', e => {
        e.preventDefault();
        let email = document.querySelector('#email-forReset').value;

        auth.sendPasswordResetEmail(email)
            .then(() => {
                closeModal();
                email = '';
            })
            .catch(error => {
                alert(error.message);
            });

    })

    const getUserData = async (uid) => {
        const response = await axios.get(`https://quiz-game-b9909.firebaseio.com/users/${uid}.json`);
        const user = { ...response.data };
        return user;
    };

    const displayUser = async (user) => {
        
        const bestScore = document.querySelector('#best-score');
        const username = document.querySelector('#username');

        if (user) {
            //display stats
            bestScore.innerHTML = user.score === 0 ? bestScore.innerHTML.replace('%score%', 'Stats are empty') : bestScore.innerHTML.replace('%score%', user.score);
        
            //display username
            username.innerHTML = username.innerHTML.replace('%username%', user.username);
        } else {

            bestScore.innerHTML = '%score%';
            username.innerHTML = '%username%';
        }
    };

})();