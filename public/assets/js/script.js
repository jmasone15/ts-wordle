"use strict";
let answerArray;
let targetWord;
let guessNum;
let userInput = false;
const gameStart = async () => {
    answerArray = [];
    guessNum = 1;
    userInput = true;
    await randomWord();
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
        for (let i = 0; i < answerArray.length; i++) {
            let targetBox = getLetterBox(i);
            const letter = answerArray[i];
            if (letter === targetWord[i]) {
                targetBox.classList.add("correct");
            }
            else if (targetWord.includes(letter)) {
                targetBox.classList.add("partial");
            }
            else {
                targetBox.classList.add("incorrect");
            }
            targetBox.setAttribute("style", "animation: flip-in 0.5s");
            await delay(500);
            targetBox.removeAttribute("style");
        }
    }
};
const randomWord = async () => {
    const response = await fetch("./assets/utils/words.json");
    const data = await response.json();
    const randomIdx = Math.floor(Math.random() * data.length);
    targetWord = data[randomIdx].toLowerCase();
};
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
[...document.getElementsByTagName("button")].forEach(element => {
    element.addEventListener("click", () => {
        if (["backspace", "backspace-icon"].includes(element.getAttribute("id"))) {
            return deleteLetter();
        }
        else if (element.innerText === "ENTER") {
            return submitWord();
        }
        else {
            return typeLetter(element.innerText);
        }
    });
});
document.addEventListener("keydown", ({ key }) => {
    if (key.charCodeAt(0) > 96 && key.charCodeAt(0) < 123) {
        return typeLetter(key);
    }
    else if (key === "Backspace") {
        return deleteLetter();
    }
    else if (key === "Enter") {
        return submitWord();
    }
});
gameStart();
