"use strict";
const modalEl = document.getElementById("modal");
const modalContentEl = document.getElementById("modal-content");
const resultTitleEl = document.getElementById("result-title");
const resultMessageEl = document.getElementById("result-message");
const playAgainEl = document.getElementById("play-again");
const submitMessageEl = document.getElementById("submit-message");
const gameColumnEls = [...document.getElementsByClassName("game-col")];
const miniGameColumnEls = [...document.getElementsByClassName("mini-col")];
const keyboardBtnEls = [...document.getElementsByTagName("button")];
const settingsEl = document.getElementById("settings");
const statsEl = document.getElementById("stats");
const helpEl = document.getElementById("help");
let answerArray;
let targetWord;
let guessNum;
let userInput = false;
let guessesGrid = [];
let isMobile = false;
(function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
        isMobile = true;
})(navigator.userAgent || navigator.vendor);
const gameStart = async () => {
    await randomWord();
    answerArray = [];
    guessesGrid = [];
    guessNum = 1;
    userInput = true;
};
const getLetterBox = (num) => {
    let targetRow = document.getElementById(`row${guessNum}`);
    let targetBox = targetRow.children[num === undefined ? answerArray.length - 1 : num];
    return targetBox;
};
const deleteLetter = () => {
    if (answerArray.length > 0) {
        let pTag = getLetterBox().children[0];
        pTag.textContent = "";
        answerArray.pop();
    }
};
const typeLetter = (letter) => {
    if (answerArray.length < 5) {
        answerArray.push(letter.toLowerCase());
        let pTag = getLetterBox().children[0];
        pTag.textContent = letter;
    }
};
const submitWord = async () => {
    if (answerArray.length === 5) {
        submitMessageEl.style.visibility = "hidden";
        const isDictionaryWord = await checkWord();
        if (!isDictionaryWord) {
            displaySubmitMessage(false);
            if (!isMobile) {
                let targetRow = document.getElementById(`row${guessNum}`);
                targetRow.removeAttribute("style");
                targetRow.offsetWidth;
                targetRow.setAttribute("style", "animation: shake 0.2s");
            }
            return;
        }
        let correctCount = 0;
        let wordArray = targetWord.split("");
        userInput = false;
        for (let i = 0; i < answerArray.length; i++) {
            const targetBox = getLetterBox(i);
            const letter = answerArray[i];
            const letterBox = document.getElementById(letter);
            const result = { x: i, y: guessNum, result: "" };
            const classList = [...letterBox.classList];
            if (letter === wordArray[i]) {
                targetBox.classList.add("correct");
                if (classList.length > 1) {
                    if (classList.includes("partial") || classList.includes("incorrect")) {
                        letterBox.setAttribute("class", "letter-btn");
                        letterBox.classList.add("correct");
                    }
                }
                else {
                    letterBox.classList.add("correct");
                }
                result.result = "correct";
                correctCount++;
                wordArray[i] = "";
            }
            else if (wordArray.includes(letter)) {
                targetBox.classList.add("partial");
                if (classList.length > 1) {
                    if (classList.includes("incorrect")) {
                        letterBox.classList.remove("incorrect");
                        letterBox.classList.add("partial");
                    }
                }
                else {
                    letterBox.classList.add("partial");
                }
                result.result = "partial";
                wordArray[wordArray.indexOf(letter)] = "";
            }
            else {
                targetBox.classList.add("incorrect");
                if (classList.length === 1) {
                    letterBox.classList.add("incorrect");
                }
                result.result = "incorrect";
            }
            guessesGrid.push(result);
            if (!isMobile) {
                targetBox.removeAttribute("style");
                targetBox.offsetWidth;
                targetBox.setAttribute("style", "animation: flip-in 0.5s");
            }
            await delay(500);
        }
        if (correctCount === 5) {
            displaySubmitMessage(true);
            if (!isMobile) {
                for (let i = 0; i < 5; i++) {
                    const targetBox = getLetterBox(i);
                    targetBox.removeAttribute("style");
                    targetBox.offsetWidth;
                    targetBox.setAttribute("style", "animation: jump 1s");
                    await delay(100);
                }
                await delay(1000);
            }
            return endGame(true);
        }
        else if (guessNum === 6) {
            return endGame(false);
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
const checkWord = async () => {
    const response = await fetch("./assets/utils/dictionary.json");
    const data = await response.json();
    return data.includes(answerArray.join(""));
};
const displaySubmitMessage = (correct) => {
    if (correct) {
        switch (guessNum) {
            case 1:
                submitMessageEl.textContent = "AMAZING!!!";
                break;
            case 2:
                submitMessageEl.textContent = "Fantastic!";
                break;
            case 3:
                submitMessageEl.textContent = "Great!";
                break;
            case 4:
                submitMessageEl.textContent = "Nice!";
                break;
            case 5:
                submitMessageEl.textContent = "Alright!";
                break;
            default:
                submitMessageEl.textContent = "Phew!";
                break;
        }
    }
    else {
        submitMessageEl.textContent = "Not a valid word.";
    }
    submitMessageEl.style.visibility = "visible";
};
const endGame = async (win) => {
    await populateModal("end", win);
};
const populateModal = async (type, win) => {
    while (modalContentEl.firstChild) {
        modalContentEl.removeChild(modalContentEl.firstChild);
    }
    if (type === "end") {
        const h1El = document.createElement("h1");
        const h3El = document.createElement("h3");
        const divEl = document.createElement("div");
        const spanEl = document.createElement("span");
        modalContentEl.appendChild(h1El);
        modalContentEl.appendChild(h3El);
        modalContentEl.appendChild(divEl);
        modalContentEl.appendChild(spanEl);
        if (win) {
            h1El.textContent = "You win!";
            h3El.textContent = `You guessed the word in ${guessNum}/6 guesses.`;
        }
        else {
            h1El.textContent = "Good try!";
            h3El.textContent = `The word we were looking for was: ${targetWord.toUpperCase()}.`;
        }
        for (let i = 1; i < 7; i++) {
            const sectionEl = document.createElement("section");
            sectionEl.setAttribute("class", "mini-row");
            sectionEl.setAttribute("id", `mini-row${i}`);
            for (let j = 0; j < 5; j++) {
                const subDivEl = document.createElement("div");
                const isGuessBox = guessesGrid.filter((value) => value.x === j && value.y === i);
                subDivEl.setAttribute("class", isGuessBox.length > 0 ? `mini-col ${isGuessBox[0].result}` : "mini-col");
                sectionEl.appendChild(subDivEl);
            }
            divEl.appendChild(sectionEl);
        }
        spanEl.textContent = "Play Again?";
        spanEl.addEventListener("click", (event) => {
            event.preventDefault();
            gameColumnEls.forEach((element) => {
                element.children[0].textContent = "";
                element.removeAttribute("style");
                element.setAttribute("class", "game-col");
            });
            miniGameColumnEls.forEach((element) => {
                element.removeAttribute("style");
                element.setAttribute("class", "mini-col");
            });
            keyboardBtnEls.forEach((element) => {
                element.removeAttribute("class");
                element.setAttribute("class", "letter-btn");
            });
            modalEl.setAttribute("style", "display:none");
            return gameStart();
        });
    }
    else {
        const h1El = document.createElement("h1");
        const closeEl = document.createElement("i");
        switch (type) {
            case "settings":
                h1El.textContent = "Settings";
                break;
            case "stats":
                h1El.textContent = "Statistics";
                break;
            default:
                break;
        }
        closeEl.setAttribute("class", "fa-solid fa-xmark close");
        modalContentEl.appendChild(closeEl);
        modalContentEl.appendChild(h1El);
        closeEl.addEventListener("click", () => {
            modalEl.setAttribute("style", "display:none");
        });
        if (type === "settings") {
            for (let i = 0; i < 4; i++) {
                const parentDivEl = document.createElement("div");
                const subDivEl = document.createElement("div");
                const h4El = document.createElement("h4");
                const pEl = document.createElement("p");
                parentDivEl.setAttribute("class", "settings-div");
                subDivEl.setAttribute("class", "settings-div-text");
                modalContentEl.appendChild(parentDivEl);
                parentDivEl.appendChild(subDivEl);
                subDivEl.appendChild(h4El);
                subDivEl.appendChild(pEl);
                if (i === 3) {
                    const aEl = document.createElement("a");
                    const iconEl = document.createElement("i");
                    aEl.setAttribute("href", "https://www.jordanmasone.com");
                    aEl.setAttribute("target", "_blank");
                    iconEl.setAttribute("class", "fa-solid fa-arrow-up-right-from-square");
                    h4El.textContent = "Buy me a Coffee";
                    pEl.textContent = "I'm a nice dude I definitely deserve it.";
                    parentDivEl.appendChild(aEl);
                    aEl.appendChild(iconEl);
                }
                else {
                    const sliderDivEl = document.createElement("div");
                    const sliderEl = document.createElement("input");
                    const hrEl = document.createElement("hr");
                    sliderDivEl.setAttribute("class", "form-check form-switch");
                    sliderEl.setAttribute("class", "slider form-check-input");
                    sliderEl.setAttribute("type", "checkbox");
                    sliderEl.setAttribute("role", "switch");
                    sliderEl.setAttribute("id", "flexSwitchCheckDefault");
                    switch (i) {
                        case 0:
                            h4El.textContent = "Hard Mode";
                            pEl.textContent = "Any revealed hints must be used in subsequent guesses.";
                            break;
                        case 1:
                            h4El.textContent = "Dark Mode";
                            pEl.textContent = "Who doesn't love a good dark mode?";
                            break;
                        default:
                            h4El.textContent = "Surprise!";
                            pEl.textContent = "What could it be? You'll never know until you try :).";
                            break;
                    }
                    modalContentEl.appendChild(hrEl);
                    parentDivEl.appendChild(sliderDivEl);
                    sliderDivEl.appendChild(sliderEl);
                }
            }
        }
        else if (type === "stats") {
            const statsDivEl = document.createElement("div");
            const hrEl = document.createElement("hr");
            const h4El = document.createElement("h4");
            const graphDivEl = document.createElement("div");
            const hrTwoEl = document.createElement("hr");
            statsDivEl.setAttribute("class", "stats-div");
            graphDivEl.setAttribute("class", "stats-graph");
            hrTwoEl.setAttribute("style", "margin-bottom: 0;");
            h4El.setAttribute("style", "text-align: left;");
            h4El.textContent = "Guess Distribution";
            modalContentEl.appendChild(statsDivEl);
            modalContentEl.appendChild(hrEl);
            modalContentEl.appendChild(graphDivEl);
            modalContentEl.appendChild(hrTwoEl);
            graphDivEl.appendChild(h4El);
            for (let i = 0; i < 4; i++) {
                const statDivEl = document.createElement("div");
                const h3El = document.createElement("h3");
                const pEl = document.createElement("p");
                switch (i) {
                    case 0:
                        h3El.textContent = "8";
                        pEl.textContent = "Played";
                        break;
                    case 1:
                        h3El.textContent = "88";
                        pEl.textContent = "Win %";
                        break;
                    case 2:
                        h3El.textContent = "1";
                        pEl.textContent = "Current Streak";
                        break;
                    default:
                        h3El.textContent = "4";
                        pEl.textContent = "Max Streak";
                        break;
                }
                statDivEl.setAttribute("class", "stats-num");
                statDivEl.appendChild(h3El);
                statDivEl.appendChild(pEl);
                statsDivEl.appendChild(statDivEl);
            }
            for (let i = 1; i < 7; i++) {
                const statBarEl = document.createElement("div");
                const statBarLabelEl = document.createElement("p");
                const statBarValueEl = document.createElement("p");
                statBarEl.setAttribute("class", "stats-bar");
                statBarLabelEl.setAttribute("class", "stats-bar-label");
                statBarValueEl.setAttribute("class", "stats-bar-value");
                statBarLabelEl.textContent = i.toString();
                switch (i) {
                    case 0:
                        statBarValueEl.textContent = "0";
                        break;
                    case 1:
                        statBarValueEl.textContent = "0";
                        break;
                    case 2:
                        statBarValueEl.textContent = "2";
                        statBarValueEl.setAttribute("style", "width: 67%");
                        break;
                    case 3:
                        statBarValueEl.textContent = "3";
                        statBarValueEl.setAttribute("style", "width: 100%");
                        break;
                    case 4:
                        statBarValueEl.textContent = "1";
                        statBarValueEl.setAttribute("style", "width: 34%");
                        break;
                    default:
                        statBarValueEl.textContent = "1";
                        statBarValueEl.setAttribute("style", "width: 34%");
                        break;
                }
                graphDivEl.appendChild(statBarEl);
                statBarEl.appendChild(statBarLabelEl);
                statBarEl.appendChild(statBarValueEl);
            }
        }
        else {
            const divEl = document.createElement("div");
            const h2El = document.createElement("h2");
            const pEl = document.createElement("p");
            const ulEl = document.createElement("ul");
            const liEl = document.createElement("li");
            const liTwoEl = document.createElement("li");
            const h6El = document.createElement("h6");
            divEl.setAttribute("class", "how-to");
            h2El.textContent = "How to Play";
            pEl.textContent = "Guess the Wordle in 6 tries.";
            liEl.textContent = "Each guess must be a valid 5-letter-word.";
            liTwoEl.textContent = "The color of the tiles will change to show how close your guess was to the word.";
            h6El.textContent = "Examples";
            modalContentEl.appendChild(divEl);
            divEl.appendChild(h2El);
            divEl.appendChild(pEl);
            divEl.appendChild(ulEl);
            ulEl.appendChild(liEl);
            ulEl.appendChild(liTwoEl);
            divEl.appendChild(h6El);
            for (let i = 0; i < 3; i++) {
                const rowEl = document.createElement("div");
                const subDivEl = document.createElement("div");
                const formatDivEl = document.createElement("div");
                const flexDivEl = document.createElement("div");
                const descEl = document.createElement("p");
                rowEl.setAttribute("class", "example-row");
                flexDivEl.setAttribute("style", "display: flex;");
                if (i === 0) {
                    descEl.textContent = "W is in the word and in the correct spot.";
                }
                else if (i === 1) {
                    descEl.textContent = "I is in the word but in the wrong spot.";
                }
                else {
                    descEl.textContent = "U is not in the word in any spot.";
                }
                for (let j = 0; j < 5; j++) {
                    let targetIndex;
                    const boxDivEl = document.createElement("div");
                    if (i === 0) {
                        targetIndex = {
                            index: 0,
                            class: "correct"
                        };
                    }
                    else if (i === 1) {
                        targetIndex = {
                            index: 1,
                            class: "partial"
                        };
                    }
                    else {
                        targetIndex = {
                            index: 3,
                            class: "incorrect"
                        };
                    }
                    switch (j) {
                        case 0:
                            if (i === 0) {
                                boxDivEl.textContent = "W";
                            }
                            else if (i === 1) {
                                boxDivEl.textContent = "P";
                            }
                            else {
                                boxDivEl.textContent = "V";
                            }
                            break;
                        case 1:
                            if (i === 0) {
                                boxDivEl.textContent = "E";
                            }
                            else if (i === 1) {
                                boxDivEl.textContent = "I";
                            }
                            else {
                                boxDivEl.textContent = "A";
                            }
                            break;
                        case 2:
                            if (i === 0) {
                                boxDivEl.textContent = "A";
                            }
                            else if (i === 1) {
                                boxDivEl.textContent = "L";
                            }
                            else {
                                boxDivEl.textContent = "G";
                            }
                            break;
                        case 3:
                            if (i === 0) {
                                boxDivEl.textContent = "R";
                            }
                            else if (i === 1) {
                                boxDivEl.textContent = "L";
                            }
                            else {
                                boxDivEl.textContent = "U";
                            }
                            break;
                        default:
                            if (i === 0) {
                                boxDivEl.textContent = "Y";
                            }
                            else if (i === 1) {
                                boxDivEl.textContent = "S";
                            }
                            else {
                                boxDivEl.textContent = "E";
                            }
                            break;
                    }
                    if (j === 0) {
                        boxDivEl.setAttribute("class", "example-box");
                        boxDivEl.setAttribute("style", "margin-right: 2px");
                    }
                    else {
                        boxDivEl.setAttribute("class", "example-box example-margin");
                    }
                    if (j === targetIndex.index) {
                        boxDivEl.classList.add(`example-box-${targetIndex.class}`);
                    }
                    flexDivEl.appendChild(boxDivEl);
                }
                divEl.appendChild(rowEl);
                rowEl.appendChild(subDivEl);
                rowEl.appendChild(formatDivEl);
                subDivEl.appendChild(flexDivEl);
                subDivEl.appendChild(descEl);
            }
        }
    }
    modalEl.setAttribute("style", "display:flex");
    submitMessageEl.style.visibility = "hidden";
    if (type === "end" && win) {
        const jsConfetti = new JSConfetti();
        await jsConfetti.addConfetti({ confettiNumber: 500 });
        jsConfetti.clearCanvas();
    }
};
keyboardBtnEls.forEach((element) => {
    element.addEventListener("click", (event) => {
        event.preventDefault();
        if (userInput) {
            let target = event.target;
            if (["backspace", "backspace-icon"].includes(target.getAttribute("id"))) {
                return deleteLetter();
            }
            else if (target.textContent === "ENTER") {
                return submitWord();
            }
            else {
                return typeLetter(target.textContent);
            }
        }
    });
});
document.addEventListener("keydown", (event) => {
    event.preventDefault();
    if (userInput) {
        if (event.key.charCodeAt(0) > 96 && event.key.charCodeAt(0) < 123) {
            return typeLetter(event.key);
        }
        else if (event.key === "Backspace") {
            return deleteLetter();
        }
        else if (event.key === "Enter") {
            return submitWord();
        }
    }
});
settingsEl?.addEventListener("click", async (event) => {
    event.preventDefault();
    return populateModal("settings");
});
statsEl?.addEventListener("click", async (event) => {
    event.preventDefault();
    return populateModal("stats");
});
helpEl?.addEventListener("click", async (event) => {
    event.preventDefault();
    return populateModal("help");
});
gameStart();
