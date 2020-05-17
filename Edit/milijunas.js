let correctAnswerCounter = 0;
let totalMoney = 0;

async function sendApiRequest() {
    let response = await fetch("https://opentdb.com/api.php?amount=13&difficulty=hard&type=multiple%22);
    let data = await response.json()
    console.log(data.results);
    //useApiData(data)
    setQuestions(data.results);
}

shuffleAnswers = (array) => {
    array.sort(() => Math.random() - 0.5);
};

getAnswers = (questions) => {
    let answers = [];
    questions[0].incorrect_answers.forEach(el => {
        answers.push(el)
    })

    const correctAnswer = questions[0].correct_answer;
    answers.push(correctAnswer);
    shuffleAnswers(answers);
    return answers;
}

setQuestions = (questions) => {
    const questionContainer = document.querySelector("#question");
    const answerContainers = [document.querySelector('#answerA'), document.querySelector('#answerB'), document.querySelector('#answerC'), document.querySelector('#answerD')]
    const answers = getAnswers(questions);

        questionContainer.innerHTML = questions[0].question

    for (let i = 0; i < answerContainers.length; i++) {
        answerContainers[i].innerHTML = answers[i]
    }
}
}

correctAnswer.addEventListener("click",()=>{
    correctAnswerCounter = correctAnswerCounter + 1;
    if(correctAnswerCounter == 1){
        totalMoney = totalMoney + 100;
        document.getElementById("questionMark1").style.diplay="none";
        document.getElementById("true1").style.diplay="block";
    }
    if(correctAnswerCounter == 2){
        totalMoney = totalMoney + 200;
        document.getElementById("questionMark2").style.diplay="none";
        document.getElementById("true2").style.diplay="block";
    }
    if(correctAnswerCounter == 3){
        totalMoney = totalMoney + 500;
        document.getElementById("questionMark3").style.diplay="none";
        document.getElementById("true3").style.diplay="block";
    }
    if(correctAnswerCounter == 4){
        totalMoney = totalMoney + 1000;
        document.getElementById("questionMark4").style.diplay="none";
        document.getElementById("true4").style.diplay="block";
    }
    if(correctAnswerCounter == 5){
        totalMoney = totalMoney + 2000;
        document.getElementById("questionMark5").style.diplay="none";
        document.getElementById("true5").style.diplay="block";
    }
    if(correctAnswerCounter == 6){
        totalMoney = totalMoney + 5000;
        document.getElementById("questionMark6").style.diplay="none";
        document.getElementById("true6").style.diplay="block";
    }
    if(correctAnswerCounter == 7){
        totalMoney = totalMoney + 10000;
        document.getElementById("questionMark7").style.diplay="none";
        document.getElementById("true7").style.diplay="block";
    }
    if(correctAnswerCounter == 8){
        totalMoney = totalMoney + 20000;
        document.getElementById("questionMark8").style.diplay="none";
        document.getElementById("true8").style.diplay="block";
    }
    if(correctAnswerCounter == 9){
        totalMoney = totalMoney + 50000;
        document.getElementById("questionMark9").style.diplay="none";
        document.getElementById("true9").style.diplay="block";
    }
    if(correctAnswerCounter == 10){
        totalMoney = totalMoney + 100000;
        document.getElementById("questionMark10").style.diplay="none";
        document.getElementById("true10").style.diplay="block";
    }
    if(correctAnswerCounter == 11){
        totalMoney = totalMoney + 200000;
        document.getElementById("questionMark11").style.diplay="none";
        document.getElementById("true11").style.diplay="block";
    }
    if(correctAnswerCounter == 12){
        totalMoney = totalMoney + 500000;
        document.getElementById("questionMark12").style.diplay="none";
        document.getElementById("true12").style.diplay="block";
    }
    if(correctAnswerCounter == 13){
        totalMoney = totalMoney + 1000000;
        document.getElementById("questionMark13").style.diplay="none";
        document.getElementById("true13").style.diplay="block";
    }
    sendApiRequest()
})

incorrectAnswers.addEventListener("click", ()=>{
     if(correctAnswerCounter = 0){
         document.getElementById("questionMark1").style.diplay="none";
         document.getElementById("wrong1").style.diplay="block";
     }
     if(correctAnswerCounter = 1){
        document.getElementById("questionMark2").style.diplay="none";
        document.getElementById("wrong2").style.diplay="block";
    }
    if(correctAnswerCounter = 2){
        document.getElementById("questionMark3").style.diplay="none";
        document.getElementById("wrong3").style.diplay="block";
    }
    if(correctAnswerCounter = 3){
        document.getElementById("questionMark4").style.diplay="none";
        document.getElementById("wrong4").style.diplay="block";
    }
    if(correctAnswerCounter = 4){
        document.getElementById("questionMark5").style.diplay="none";
        document.getElementById("wrong5").style.diplay="block";
    }
    if(correctAnswerCounter = 5){
        document.getElementById("questionMark6").style.diplay="none";
        document.getElementById("wrong6").style.diplay="block";
    }
    if(correctAnswerCounter = 6){
        document.getElementById("questionMark7").style.diplay="none";
        document.getElementById("wrong7").style.diplay="block";
    }
    if(correctAnswerCounter = 7){
        document.getElementById("questionMark8").style.diplay="none";
        document.getElementById("wrong8").style.diplay="block";
    }
    if(correctAnswerCounter = 8){
        document.getElementById("questionMark9").style.diplay="none";
        document.getElementById("wrong9").style.diplay="block";
    }
    if(correctAnswerCounter = 9){
        document.getElementById("questionMark10").style.diplay="none";
        document.getElementById("wrong10").style.diplay="block";
    }
    if(correctAnswerCounter = 10){
        document.getElementById("questionMark11").style.diplay="none";
        document.getElementById("wrong11").style.diplay="block";
    }
    if(correctAnswerCounter = 11){
        document.getElementById("questionMark12").style.diplay="none";
        document.getElementById("wrong12").style.diplay="block";
    }
    if(correctAnswerCounter = 12){
        document.getElementById("questionMark13").style.diplay="none";
        document.getElementById("wrong13").style.diplay="block";
    }

    

})

