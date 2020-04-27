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
        node.contains(document.querySelector('.modals')) ? addAuthFunctionalitiy() : document.querySelector('.wrapper').classList.remove('background');;


        M.AutoInit();
    };

    
    addAuthFunctionalitiy = () => {   

        //add background to wrapper

        document.querySelector('.wrapper').classList.add('background');

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
    };

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
    

    getUserData = async (uid) => {
        const response = await axios.get(`https://quiz-game-b9909.firebaseio.com/users/${uid}.json`);
        const user = { ...response.data };
        return user;
    };

    showUserProfile = (user) => {
        render(userProfileTemplate, '.container');
        displayUser(user);
        checkForBestScore(user);

        document.querySelector('#btn-logout').addEventListener('click', () => auth.signOut());

        //on play button click get questions
        document.querySelector('#btn--play').addEventListener('click', () => {

            if(document.querySelector('#gameTheme-radio').checked) {
                startThemeGame(user);
            } else {
                alert("Game still in development!");
            }

        });
    };

    displayUser = (user) => {
        const bestScore = document.querySelector('#best-score');
        const username = document.querySelector('#username');

         //display stats
        user.score === 0 ? bestScore.innerHTML = `Stats are empty :(` : bestScore.innerHTML = `${user.showScore}`;
        
        //display username
        username.innerHTML = `${user.username}`;
        
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

    //get questions from api
    getQuestions = async (category) => {

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

        //console.log('correct answer ==>>' + correctAnswer)
        document.querySelector('.category').innerHTML = `Category: "${questions[questionCounter].category}"`;
        document.querySelector('.difficulty').innerHTML = `Difficulty: "${questions[questionCounter].difficulty}"`;
        
    };

    startThemeGame = async (user) => {

        let incorrectAnswersCounter = 0;
        let correctAnswersCounter = 0;
        let questionCounter = 0;
        let gameOver = false;
        let counter = 0;

        const timeLeft = 90;
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
                showUserProfile(user);
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

                if(questionCounter === questions.length - 2) {
                    let newQuestions = await getQuestions(category)
                    Array.prototype.push.apply(questions, newQuestions);
                }    

                setTimeout(() => {
                    questionCounter++;
                    setQuestion(questions, questionCounter);
                    if(gameOver) {
                        const result = Math.round((correctAnswersCounter / questionCounter) * 100) / 100;
                        const showScore = `${correctAnswersCounter} / ${questionCounter}`;
                        finishGame(user, result, showScore, questionCounter);
                    }

                    correctAnswerContainer.classList.toggle('correct')
                    userAnswer.classList.contains('incorrect') ? userAnswer.classList.remove('incorrect') : null;
                }, 850)
            });
                
        });
        
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

    checkForBestScore = async (user) => {
        const response = await axios.get(`https://quiz-game-b9909.firebaseio.com/users.json`);
        const users = {...response.data};
        const usersKeyes = Object.keys(users);
        let best = users[usersKeyes[0]];

        for(let i = 0; i < usersKeyes.length; i++) {
            if (users[usersKeyes[i]].score > best.score) {
                best = users[usersKeyes[i]];
            } 
            
            if (users[usersKeyes[i]].score === best.score) {
                //provjerit koji user ima veci question counter
                if (users[usersKeyes[i]].questionsAnswered > best.questionsAnswered) {
                    best = users[usersKeyes[i]];
                }
            }
        }

        if (user) {
           
            if (user.id === best.id) {
                document.querySelector('.bestToBeat-score_container').innerHTML = `<span class="congratulations-message">Congratulations! You set Best to Beat Score!</span>`;
            } else {
                document.querySelector('#bestToBeat-score').innerHTML = `${best.showScore} by ${best.username}`; 
            }

        } else { //if user isn't passed as argument then updating showscore modal 

            if(best.score !== 0) {
                document.querySelector('.best--score').innerHTML = `${best.showScore} ( ${best.score} )  by ${best.username}`;
            } else {
                document.querySelector('.best--score').innerHTML = `No data`;
            }
        }

    }

    finishGame = (user, result, showScore, questionCounter) => {

        if(user.score < result) {

            axios.put(`https://quiz-game-b9909.firebaseio.com/users/${user.id}.json`, {...user, score: result, showScore: showScore, questionsAnswered: questionCounter})
               
                .catch(error => alert(error.message));
        } 
        document.querySelector('.current--score').innerHTML = `${showScore} ( ${result} )`;

        user.showScore === '' ? document.querySelector('.personalbest--score').innerHTML = `${showScore}` : document.querySelector('.personalbest--score').innerHTML = `${user.showScore}`;
        checkForBestScore();

        openModal('modal--stats');
        document.querySelector('.modal-overlay').addEventListener('click', () => {
            showUserProfile(user);
            location.reload();
        });
        document.querySelector('.btn-exit').addEventListener('click', () => {
            showUserProfile(user);
            location.reload();
        });
    };

}()); 