"use strict";
let answerArray;
let targetWord;
let guessNum;
let userInput = false;
const gameStart = async () => {
    await randomWord();
    answerArray = [];
    guessNum = 1;
    userInput = true;
};
const getLetterBox = (num) => {
    const targetRow = document.getElementById(`row${guessNum}`);
    return targetRow.children[num === undefined ? answerArray.length - 1 : num];
};
const deleteLetter = () => {
    if (answerArray.length > 0) {
        getLetterBox().innerHTML = "";
        answerArray.pop();
    }
};
const typeLetter = (letter) => {
    if (answerArray.length < 5) {
        answerArray.push(letter.toLowerCase());
        getLetterBox().innerHTML = `<p>${letter}</p>`;
    }
};
const submitWord = async () => {
    if (answerArray.length === 5) {
        let correctCount = 0;
        let wordArray = targetWord.split("");
        userInput = false;
        for (let i = 0; i < answerArray.length; i++) {
            const targetBox = getLetterBox(i);
            const letter = answerArray[i];
            const letterBox = document.getElementById(letter);
            if (letter === wordArray[i]) {
                targetBox.classList.add("correct");
                letterBox.classList.add("correct");
                correctCount++;
                wordArray[i] = "";
            }
            else if (wordArray.includes(letter)) {
                targetBox.classList.add("partial");
                letterBox.classList.add("partial");
                let partialIndex = wordArray.indexOf(letter);
                wordArray[partialIndex] = "";
            }
            else {
                targetBox.classList.add("incorrect");
                letterBox.classList.add("incorrect");
            }
            console.log(wordArray);
            targetBox.setAttribute("style", "animation: flip-in 0.5s");
            await delay(500);
            targetBox.removeAttribute("style");
        }
        if (correctCount === 5) {
            return console.log("You win!");
        }
        else if (guessNum === 6) {
            return console.log("You lose, the word was: " + targetWord);
        }
        else {
            guessNum++;
            answerArray = [];
            userInput = true;
        }
    }
};
const randomWord = async () => {
    const response = await fetch("./assets/utils/words.json");
    const data = await response.json();
    const randomIdx = Math.floor(Math.random() * data.length);
    targetWord = data[randomIdx].toLowerCase();
    console.log(targetWord);
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
[...document.getElementsByTagName("button")].forEach((element) => {
    element.addEventListener("click", () => {
        if (userInput) {
            if (["backspace", "backspace-icon"].includes(element.getAttribute("id"))) {
                return deleteLetter();
            }
            else if (element.innerText === "ENTER") {
                return submitWord();
            }
            else {
                return typeLetter(element.innerText);
            }
        }
    });
});
document.addEventListener("keydown", ({ key }) => {
    if (userInput) {
        if (key.charCodeAt(0) > 96 && key.charCodeAt(0) < 123) {
            return typeLetter(key);
        }
        else if (key === "Backspace") {
            return deleteLetter();
        }
        else if (key === "Enter") {
            return submitWord();
        }
    }
});
gameStart();
