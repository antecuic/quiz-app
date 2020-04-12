//*****APP*********
(function(){
 
    window.addEventListener('load', () => {
        render(loader, '.container')
    });

    const render = (template, selector, user) => {
        if (!selector) {return};
        const node = document.querySelector(selector);
        node.innerHTML = template;
        user ? showUserProfile(user) : null;
        M.AutoInit();
    };
    
    const getUserData = async (uid) => {
        const response = await axios.get(`https://quiz-game-b9909.firebaseio.com/users/${uid}.json`);
        const user = { ...response.data };
        return user;
    };

    //changes the order of answers randomly in an array
    const shuffle = (array) => {
        array.sort(() => Math.random() - 0.5);
    };

    const setUI = (answers, question) => {
        const answerFields = [document.querySelector('.ans1'), document.querySelector('.ans2'), document.querySelector('.ans3'), document.querySelector('.ans4')];
        const questionField = document.querySelector('.themeGame--question');

        questionField.innerHTML = question;

        //sets answers on UI
        for (let i = 0; i < answerFields.length; i++) {
            answerFields[i].innerHTML = answers[i]; 
        }
    };

    const setQuestion = (questions, questionCounter) => {
        const statusBar = document.querySelector('.progress--statusBarDiv');
        const question = questions[questionCounter].question;
        const correctAnswer = questions[questionCounter].correct_answer;
        let incorrectAnswers = [];

        questions[questionCounter].incorrect_answers.forEach(el => {
            if(incorrectAnswers.length < 3) {
                incorrectAnswers.push(el);
            };
        });

        let answers = [...incorrectAnswers, correctAnswer];
    
        shuffle(answers);
        setUI(answers, question);
        console.log('correct answer ==>>' + correctAnswer)

        document.querySelector('.progress--statusText').innerHTML = `Question ${questionCounter+ 1} / ${questions.length}`
        statusBar.style.width = `${(questionCounter+1) * 10}%`;
        

    };

    const displayThemeGame = (user) => {
        render(themeGame, '.container');
        document.querySelector('#btn--quitThemeGame').addEventListener('click', () => render(userProfileTemplate, '.container', user))
    };

    const checkCorrectAnswerContainer = (correctAnswer) => {
        const answerFields = [document.querySelector('.ans1'), document.querySelector('.ans2'), document.querySelector('.ans3'), document.querySelector('.ans4')];

        for (let i = 0; i < answerFields.length; i++) {

            if (answerFields[i].innerHTML === correctAnswer) {
                return answerFields[i];
            };
           
        };
    };

    const startThemeGame = (user) => {
        const btnPlay = document.querySelector('#btn--play');
        let questions = [];
        let questionCounter = 0;

        btnPlay.addEventListener('click', async () => {

            const category = document.querySelector('#gamecategory').value - 1;

            if (category < 9) {
                const response = await axios.get(`https://opentdb.com/api.php?amount=10&type=multiple`);
                questions =  [ ...response.data.results ] 
            } else {
                const response = await axios.get(`https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`);
                questions = [ ...response.data.results ]
            };
            
            displayThemeGame(user);
            setQuestion(questions, questionCounter);
            let answerContainers = document.getElementsByClassName('question--answer');

            Array.from(answerContainers).forEach(el => {

                el.addEventListener('click', event => {

                    const userAnswer = event.target;                    
                    const correctAnswer = questions[questionCounter].correct_answer;
                    const correctAnswerContainer = checkCorrectAnswerContainer(correctAnswer);

                    if(userAnswer.innerHTML !== correctAnswer) {
                        userAnswer.classList.add('incorrect');
                    }    

                    correctAnswerContainer.classList.toggle('correct')

                    setTimeout(() => {
                        questionCounter++;
                        if (questionCounter < questions.length) {
                            
                            setQuestion(questions, questionCounter);

                        } else {

                            render(userProfileTemplate, '.container', user);
                        };

                        correctAnswerContainer.classList.toggle('correct')
                        userAnswer.classList.contains('incorrect') ? userAnswer.classList.remove('incorrect') : null;
                    }, 500)
                });
                
            });

        });
        
    };

    const displayUser = async (user) => {
        
        const bestScore = document.querySelector('#best-score');
        const username = document.querySelector('#username');

        if (user) {
            //display stats
            user.score === 0 ? bestScore.innerHTML = `Stats are empty :(` : bestScore.innerHTML = `${user.score}`;
        
            //display username
            username.innerHTML = `${user.username}`
        } 
    };

    const showUserProfile =  async (user) => {
        render(userProfileTemplate, '.container');
        displayUser(user);
        document.querySelector('#btn-logout').addEventListener('click', () => auth.signOut());

        //on play button click get questions
        startThemeGame(user);
        
    };

    const addAuthFunctionalitiy = () => {   
        //login
        const loginForm = document.querySelector('#login-Form');
        const signupForm = document.querySelector('#signup-form');

        loginForm.addEventListener('submit', e => {
            e.preventDefault()
            const email = loginForm['emailLogin'].value;
            const password = loginForm['passwordLogin'].value;
    
            if (email === '' || password === '') {
                return;
            }
        
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

            auth.createUserWithEmailAndPassword(email, password)
            .then(result => {
                        signupForm.reset();
                        axios.put(`https://quiz-game-b9909.firebaseio.com/users/${result.user.uid}.json`, newUser);
                        return result.user.updateProfile({displayName: usrName})
                    })
                .catch(error => alert(error.message));
                    
           showUserProfile(newUser);
        });

        //password-reset
        document.querySelector('#btn-submitEmail').addEventListener('click', e => {
            e.preventDefault();
            let email = document.querySelector('#email-forReset').value;

            auth.sendPasswordResetEmail(email)
                .then(() => {
                    email = '';
                })
                .catch(error => {
                    alert(error.message);
                });
        })
    }

    // user log's in or out
    auth.onAuthStateChanged(async (user) => {
        
        if(user) {
            //get user data from database
            const loggedUser = await getUserData(user.uid); 

            //users data and profile display
            if( Object.keys(loggedUser).length !== 0) {
                showUserProfile(loggedUser);
            }
           
        } else {
            render(modals,'.container');
            document.querySelector('.container').contains(document.querySelector('.modals')) ? addAuthFunctionalitiy() : null;
        }
    }); 

}()); 