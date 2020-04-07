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
    const btnPlay = document.querySelector('#btn--play');
    const btnQuitMill = document.querySelector('#btn--quitMillionaire');
    const btnQuitQuickOne = document.querySelector('#btn--quitQuickOne');
    const gameMillionaire = document.querySelector('#game--millionaire');
    const gameQuickOne = document.querySelector('#game--quickOne');
    const gameContainer = document.querySelector('#game');

    const quitGame = () => {

        gameContainer.style.display = 'none';

        gameMillionaire.style.display == 'flex' ? gameMillionaire.style.display = 'none' : gameQuickOne.style.display = 'none';

        userTemplate.style.display = 'flex';
       
    }

    btnQuitQuickOne.addEventListener('click', quitGame)
    btnQuitMill.addEventListener('click', quitGame)
   

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

    const getQuestionsFromAPI = async () => {
        const response = await axios.get('https://opentdb.com/api.php?amount=10&type=multiple');
        const questions = { ...response.data.results }
        return questions;
    }

    //changes the order of answers randomly in an array
    const shuffle = (array) => {
        array.sort(() => Math.random() - 0.5);
    }

    const setUI = (answers, question) => {
        const answerFields = [document.querySelector('.ans1'), document.querySelector('.ans2'), document.querySelector('.ans3'), document.querySelector('.ans4')];
        const questionField = document.querySelector('.millionaire--question');
        questionField.innerHTML = '';
        questionField.innerHTML = question;

        for (let i = 0; i < answerFields.length; i++) {
            answerFields[i].innerHTML = answers[i];
        }
    };

    const setQuestions = (questionsArray, questionCounter) => {

            const question = questionsArray[questionCounter].question;
            const correctAnswer = questionsArray[questionCounter].correct_answer;
            let incorrectAnswers = [];
            questionsArray[questionCounter].incorrect_answers.forEach(el => {
                if(incorrectAnswers.length < 3) {
                    incorrectAnswers.push(el);
                };
            });

            let answers = [...incorrectAnswers, correctAnswer];
        
            shuffle(answers);
            setUI(answers, question);
    }

    const startMillionaireGame = async (questions) => {
        const answerContainers = document.getElementsByClassName('mill--answer');
        let gameOver = false;
        let questionsArray = [];
        let questionCounter = 0;
        Object.values(questions).forEach(el => {
            questionsArray.push(el)
        });

       setQuestions(questionsArray, questionCounter)

        Array.from(answerContainers).forEach(el => {
            el.addEventListener('click', event => {
                const userAnswer = event.target.innerHTML;
                const correctAnswer = questionsArray[questionCounter].correct_answer;
                console.log('correct answer ==> ' + correctAnswer)

                if(userAnswer === correctAnswer) {
                    console.log('correct')
                } else {
                    console.log('incorrect')
                }            

                questionCounter++;
                if (questionCounter < questionsArray.length) {
                    console.log(questionsArray.length)
                    console.log(questionCounter)
                    setQuestions(questionsArray, questionCounter);
                } else {
                    console.log('game over')
                    gameOver = true;
                }
            })

        })
    };

    btnPlay.addEventListener('click', async () => {

        gameContainer.style.display = 'block';

        if(millRadio.checked) {
            userTemplate.style.display = 'none';
            //get questions and start game
            const questions = await getQuestionsFromAPI();
            console.log(questions)
            startMillionaireGame(questions);

            
            gameMillionaire.style.display = 'flex';

        } else if (quickradio.checked) {
            gameQuickOne.style.display = 'flex';
            userTemplate.style.display = 'none';
        } 
    });

})();