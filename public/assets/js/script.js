"use strict";
let answerArray = [];
let targetWord;
const keyboardBtns = [...document.getElementsByTagName("button")];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
keyboardBtns.forEach((element) => {
    element.addEventListener("click", async (event) => {
        const button = event.target;
        if ((button.getAttribute("id") === "backspace" || button.getAttribute("id") === "backspace-icon") && answerArray.length > 0) {
            const targetRow = document.getElementById("row1");
            const targetBox = targetRow.children[answerArray.length - 1];
            targetBox.innerHTML = "";
            answerArray.pop();
        }
        else if (button.innerText === "ENTER") {
            if (answerArray.length === 5) {
                const targetRow = document.getElementById("row1");
                for (let i = 0; i < answerArray.length; i++) {
                    const targetBox = targetRow.children[i];
                    if (answerArray[i] === targetWord[i]) {
                        targetBox.classList.add("correct");
                    }
                    else if (targetWord.includes(answerArray[i])) {
                        targetBox.classList.add("partial");
                    }
                    else {
                        targetBox.classList.add("incorrect");
                    }
                    targetBox.setAttribute("style", "animation: flip-in 0.5s");
                    await delay(500);
                }
            }
        }
        else if (answerArray.length < 5) {
            answerArray.push(button.innerText.toLowerCase());
            const targetRow = document.getElementById("row1");
            const targetBox = targetRow.children[answerArray.length - 1];
            targetBox.innerHTML = `<p>${button.innerText}</p>`;
        }
    });
});
document.addEventListener("keydown", async (event) => {
    if (event.key.charCodeAt(0) > 96 && event.key.charCodeAt(0) < 123 && answerArray.length < 5) {
        answerArray.push(event.key);
        const targetRow = document.getElementById("row1");
        const targetBox = targetRow.children[answerArray.length - 1];
        targetBox.innerHTML = `<p>${event.key}</p>`;
    }
    else if (event.key === "Backspace" && answerArray.length > 0) {
        const targetRow = document.getElementById("row1");
        const targetBox = targetRow.children[answerArray.length - 1];
        targetBox.innerHTML = "";
        answerArray.pop();
    }
    else if (event.key === "Enter") {
        if (answerArray.length === 5) {
            const targetRow = document.getElementById("row1");
            for (let i = 0; i < answerArray.length; i++) {
                const targetBox = targetRow.children[i];
                if (answerArray[i] === targetWord[i]) {
                    targetBox.classList.add("correct");
                }
                else if (targetWord.includes(answerArray[i])) {
                    targetBox.classList.add("partial");
                }
                else {
                    targetBox.classList.add("incorrect");
                }
                targetBox.setAttribute("style", "animation: flip-in 0.5s");
                await delay(500);
            }
        }
    }
});
const randomWord = async () => {
    const response = await fetch("./assets/utils/words.json");
    const data = await response.json();
    targetWord = data[Math.floor(Math.random() * data.length)].toLowerCase();
    console.log(targetWord);
};
randomWord();
