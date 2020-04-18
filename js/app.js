//*****APP*********
(function(){

    document.onreadystatechange = () => {
        if(document.readyState !== "complete") {
            render(loader, '.container');
        } else {
            render(modals, '.container')
        }
    };

    render = (template, selector) => {
        if (!selector) {return};
        const node = document.querySelector(selector);
        node.innerHTML = template;

        //add auth if modals rendered
        node.contains(document.querySelector('.modals')) ? addAuthFunctionalitiy() : null;

        M.AutoInit();
    };
    

    getUserData = async (uid) => {
        const response = await axios.get(`https://quiz-game-b9909.firebaseio.com/users/${uid}.json`);
        const user = { ...response.data };
        return user;
    };

    //changes the order of answers randomly in an array
    shuffle = (array) => {
        array.sort(() => Math.random() - 0.5);
    };

    convertToSeconds = (s) => {
        let min = Math.floor(s / 60);
        let sec = s % 60;
        
        if(min < 10){min = "0" + min;}
        if(sec < 10){sec = "0" + sec;}
        return `${min} : ${sec}`;
    }

    setUI = (answers, question) => {
        const answerFields = [document.querySelector('.ans1'), document.querySelector('.ans2'), document.querySelector('.ans3'), document.querySelector('.ans4')];
        const questionField = document.querySelector('.themeGame--question');

        questionField.innerHTML = question;

        //sets answers on UI
        for (let i = 0; i < answerFields.length; i++) {
            answerFields[i].innerHTML = answers[i]; 
        };
    };

    setQuestion = (questions, questionCounter) => {
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
        document.querySelector('.category').innerHTML = `Category: "${questions[questionCounter].category}"`;
        document.querySelector('.difficulty').innerHTML = `Difficulty: "${questions[questionCounter].difficulty}"`;
        
    };

    changeAnswerSpecialChars = correctAnswer => {

        correctAnswer = correctAnswer.replace('&#039;', "'");
        correctAnswer = correctAnswer.replace('&#039;', "'");
        correctAnswer = correctAnswer.replace('&#039;', "'");
        correctAnswer = correctAnswer.replace('&ouml;', 'ö');
        correctAnswer = correctAnswer.replace('&auml;', "ä");
        correctAnswer = correctAnswer.replace('&uuml;', 'ü');
        correctAnswer = correctAnswer.replace('&Uuml;', 'Ü');
        correctAnswer = correctAnswer.replace('&quot;', '"');
        correctAnswer = correctAnswer.replace('&quot;', '"');
        correctAnswer = correctAnswer.replace('&eacute;', 'é');
        correctAnswer = correctAnswer.replace('&eacute;', 'é');
        correctAnswer = correctAnswer.replace('&aacute;', 'á');
        correctAnswer = correctAnswer.replace('&oacute;', 'ó');
        correctAnswer = correctAnswer.replace('&amp;', '&');
        correctAnswer = correctAnswer.replace('&amp;', '&');
        correctAnswer = correctAnswer.replace('&deg;', '°');
        correctAnswer = correctAnswer.replace('&prime;', '′');
        correctAnswer = correctAnswer.replace('&Prime;', '″');
        correctAnswer = correctAnswer.replace('&ntilde;', 'ñ');
        
        return correctAnswer;
    }

    checkCorrectAnswerContainer = (correctAnswer) => {
        const answerFields = [document.querySelector('.ans1'), document.querySelector('.ans2'), document.querySelector('.ans3'), document.querySelector('.ans4')];

        for (let i = 0; i < answerFields.length; i++) {

            if (answerFields[i].innerHTML === correctAnswer) {
                return answerFields[i];
            };
           
        };
    };

    //get questions from api
    getQuestions =async (category) => {

        let questions = [];

        if (category < 9) {
            const response = await axios.get(`https://opentdb.com/api.php?amount=50&type=multiple`);
            questions = [ ...response.data.results ];
        } else {
            const response = await axios.get(`https://opentdb.com/api.php?amount=50&category=${category}&type=multiple`);
            questions = [ ...response.data.results ];
        }

        return questions;
    }

    startThemeGame = (user) => {
        const btnPlay = document.querySelector('#btn--play');
        let incorrectAnswersCounter = 0;
        let correctAnswersCounter = 0;
        let questionCounter = 0;
        let gameOver = false;
        let counter = 0;

        btnPlay.addEventListener('click', async () => {


            const timeLeft = Number(document.querySelector('#gameTime').value);
            const category = document.querySelector('#gamecategory').value - 1;
            let questions = await getQuestions(category);       

            render(themeGame, '.container');
            setQuestion(questions, questionCounter);

            //timer
            const interval = setInterval(() => {
            counter++;
            document.querySelector('.timer').innerHTML = convertToSeconds(timeLeft - counter);

                if (counter == timeLeft) {
                    gameOver = true;
                    clearInterval(interval);
                }
            }, 1000);

            //quit game button
            document.querySelector('#btn--quitThemeGame').addEventListener('click', () => {
                clearInterval(interval);
                openModal('modal-confirmation');
                document.querySelector('#modal-confirmation').style.display = 'flex';
                
                document.querySelector('.btn-yes').addEventListener('click', () => {
                    render(userProfileTemplate, '.container')
                    displayUser(user);
                });

                document.querySelector('.btn-no').addEventListener('click', () => {
                    closeModal('modal-confirmation');
                });
            });

            let answerContainers = document.getElementsByClassName('question--answer');

            //showing questions
            Array.from(answerContainers).forEach(el => {

                el.addEventListener('click', async (event) => { 

                    const userAnswer = event.target;                    
                    const correctAnswer = changeAnswerSpecialChars(questions[questionCounter].correct_answer);

                    let correctAnswerContainer = checkCorrectAnswerContainer(correctAnswer);

                    if (userAnswer.innerHTML !== correctAnswer) {
                        incorrectAnswersCounter++;
                        document.querySelector('.incorrect--answers__display').style.height = `${(incorrectAnswersCounter / questions.length) * 100}%`;
                        userAnswer.classList.add('incorrect');
                    } else {
                        correctAnswersCounter++;
                        document.querySelector('.correct--answers__display').style.height = `${(correctAnswersCounter / questions.length) * 100}%`
                    }


                    correctAnswerContainer.classList.toggle('correct');

                    if(questionCounter === 48) {
                        let newQuestions = await getQuestions(category)
                        Array.prototype.push.apply(questions, newQuestions);
                    }    

                    setTimeout(() => {
                        questionCounter++;
                        if (questionCounter < questions.length) {
                            
                            setQuestion(questions, questionCounter);

                        } else {
                            gameOver = true;
                        };

                        if(gameOver) {
                            const result = correctAnswersCounter / questionCounter;
                            const showScore = `${correctAnswersCounter} / ${questionCounter}`;
                            alert('TIME IS UP!!!')
                            finishGame(user, result, showScore);
                        }

                        correctAnswerContainer.classList.toggle('correct')
                        userAnswer.classList.contains('incorrect') ? userAnswer.classList.remove('incorrect') : null;
                    }, 1000)
                });
                
            });

        });
        
    };

    checkForBestScore = async () => {
        const response = await axios.get(`https://quiz-game-b9909.firebaseio.com/users.json`);
        const users = {...response.data};
        const usersKeyes = Object.keys(users);
        let best = users[usersKeyes[0]].score
        let bestIndex = null;

        for(let i = 0; i < usersKeyes.length; i++) {
            if (users[usersKeyes[i]].score > best) {
                best = users[usersKeyes[i]].score;
                bestIndex = i;
            }
        }

        if(users[usersKeyes[bestIndex]].score !== 0) {
            document.querySelector('.best--score').innerHTML = `${users[usersKeyes[bestIndex]].showScore} by ${users[usersKeyes[bestIndex]].username}`;
        } else {
            document.querySelector('.best--score').innerHTML = `No data`;
        }
    }

    finishGame = (user, result, showScore) => {

        if(user.score < result) {
            axios.put(`https://quiz-game-b9909.firebaseio.com/users/${user.id}.json`, {...user, score: result, showScore: showScore})
               
                .catch(error => alert(error.message));
        }
        document.querySelector('.current--score').innerHTML = `${showScore}`;

        user.showScore === '' ? document.querySelector('.personalbest--score').innerHTML = `${showScore}` : document.querySelector('.personalbest--score').innerHTML = `${user.showScore}`;
        checkForBestScore();

        //add here personal best from db
        openModal('modal--stats');
        document.querySelector('.modal-overlay').addEventListener('click', () => {
            showUserProfile(user);
            location.reload()
        });
        document.querySelector('.btn-exit').addEventListener('click', () => {
            showUserProfile(user);
            location.reload()
        });
    };

    showUserProfile = (user) => {
        render(userProfileTemplate, '.container');
        displayUser(user);

        document.querySelector('#btn-logout').addEventListener('click', () => auth.signOut());

        //on play button click get questions
        startThemeGame(user);
    };

    displayUser = (user) => {
        const bestScore = document.querySelector('#best-score');
        const username = document.querySelector('#username');

         //display stats
        user.score === 0 ? bestScore.innerHTML = `Stats are empty :(` : bestScore.innerHTML = `${user.showScore}`;
        
        //display username
        username.innerHTML = `${user.username}`
        
    };

    addAuthFunctionalitiy = () => {   
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
                //.then(loginForm.reset())
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

            auth.createUserWithEmailAndPassword(email, password)
            .then((result) => {
                        signupForm.reset();
                        const id = result.user.uid;
                        const newUser = {
                            username: usrName,
                            email: email,
                            score: 0,
                            showScore: "",
                            id: id,
                        }
                        axios.put(`https://quiz-game-b9909.firebaseio.com/users/${id}.json`, newUser);
                        showUserProfile(newUser);
                        return result.user.updateProfile({displayName: usrName})
                    })
                .catch(error => alert(error.message));
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
        }
    }); 

}()); 