"use strict";
const modalEl = document.getElementById("modal");
const modalContentEl = document.getElementById("modal-content");
const submitMessageEl = document.getElementById("submit-message");
const gameColumnEls = [...document.getElementsByClassName("game-col")];
const miniGameColumnEls = [...document.getElementsByClassName("mini-col")];
const keyboardBtnEls = [...document.getElementsByTagName("button")];
const settingsEl = document.getElementById("settings");
const statsEl = document.getElementById("stats");
const helpEl = document.getElementById("help");
const styleSheet = document.getElementById("style");
let answerArray;
let targetWord;
let guessNum;
let userInput = false;
let guessesGrid;
let isMobile = false;
let statsData;
let settingsData;
let revealedHints;
let currentGame;
const gameStart = async () => {
    answerArray = [];
    guessesGrid = [];
    revealedHints = [];
    guessNum = 1;
    await loadLocalStorage();
    userInput = true;
};
const runAnimation = async (element, animation, delayMS) => {
    element.removeAttribute("style");
    element.offsetWidth;
    element.setAttribute("style", animation);
    if (delayMS) {
        await delay(delayMS);
    }
};
const getLetterBox = (num) => {
    let targetRow = document.getElementById(`row${guessNum}`);
    let targetBox = targetRow.children[num];
    return targetBox;
};
const deleteLetter = () => {
    if (answerArray.length > 0) {
        const pTag = getLetterBox(answerArray.length - 1).children[0];
        pTag.textContent = "";
        answerArray.pop();
    }
};
const typeLetter = async (letter) => {
    if (answerArray.length < 5) {
        answerArray.push(letter.toLowerCase());
        const box = getLetterBox(answerArray.length - 1);
        const pTag = box.children[0];
        pTag.textContent = letter;
        return runAnimation(box, "animation: pop 150ms");
    }
};
const submitWord = async () => {
    if (answerArray.length === 5) {
        submitMessageEl.style.visibility = "hidden";
        const isDictionaryWord = await checkWord();
        if (!isDictionaryWord) {
            displaySubmitMessage(false);
            return runAnimation(document.getElementById(`row${guessNum}`), "animation: shake 0.2s");
        }
        if (settingsData.hardMode && revealedHints.length > 0) {
            for (let i = 0; i < revealedHints.length; i++) {
                const { letter, type, index } = revealedHints[i];
                if (type === "correct" && !(letter === answerArray[index])) {
                    displaySubmitMessage(false, type, letter);
                    return runAnimation(document.getElementById(`row${guessNum}`), "animation: shake 0.2s");
                }
                else if (type === "partial" && !answerArray.includes(letter)) {
                    displaySubmitMessage(false, type, letter);
                    return runAnimation(document.getElementById(`row${guessNum}`), "animation: shake 0.2s");
                }
            }
        }
        userInput = false;
        const splitWord = targetWord.split("");
        const correctIdxs = [];
        const matchedIdxs = [];
        answerArray.forEach((letter, index) => {
            if (letter === splitWord[index]) {
                correctIdxs.push(index);
                splitWord[index] = "";
            }
        });
        for (let i = 0; i < answerArray.length; i++) {
            const targetBox = getLetterBox(i);
            const targetButton = keyboardBtnEls.filter((element) => element.textContent?.toUpperCase() === answerArray[i].toUpperCase())[0];
            const result = {
                x: i,
                y: guessNum,
                result: "",
                letter: answerArray[i]
            };
            if (correctIdxs.includes(i)) {
                targetBox.classList.add("correct");
                targetButton.classList.add("correct");
                result.result = "correct";
                revealedHints.push({ letter: answerArray[i], type: "correct", index: i });
            }
            else {
                const partialIdx = splitWord.indexOf(answerArray[i]);
                if (partialIdx > -1 && !matchedIdxs.includes(partialIdx) && !correctIdxs.includes(partialIdx)) {
                    targetBox.classList.add("partial");
                    targetButton.classList.add("partial");
                    matchedIdxs.push(partialIdx);
                    result.result = "partial";
                    revealedHints.push({ letter: answerArray[i], type: "partial", index: i });
                    splitWord[partialIdx] = "";
                }
                else {
                    targetBox.classList.add("incorrect");
                    targetButton.classList.add("incorrect");
                    result.result = "incorrect";
                }
            }
            guessesGrid.push(result);
            await runAnimation(targetBox, "animation: flip-in 0.5s", 500);
        }
        if (correctIdxs.length === 5) {
            displaySubmitMessage(true);
            for (let i = 0; i < 5; i++) {
                const targetBox = getLetterBox(i);
                await runAnimation(targetBox, "animation: jump 1s", 100);
            }
            await delay(1000);
            return endGame(true);
        }
        else if (guessNum === 6) {
            return endGame(false);
        }
        else {
            guessNum++;
            answerArray = [];
            currentGame.currentGuess = guessNum;
            currentGame.gameGrid = guessesGrid;
            localStorage.setItem("jm-wordle-game", JSON.stringify(currentGame));
            userInput = true;
        }
    }
};
const randomWord = async () => {
    const response = await fetch("https://jordans-api-production.up.railway.app/word/single");
    const data = await response.json();
    targetWord = data.word;
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const checkWord = async () => {
    const response = await fetch("https://jordans-api-production.up.railway.app/word/valid/" + answerArray.join(""));
    const data = await response.json();
    return data;
};
const displaySubmitMessage = (correct, type, letter) => {
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
        if (type === "correct") {
            submitMessageEl.textContent = `Guess must include ${letter?.toUpperCase()} in the correct position.`;
        }
        else if (type === "partial") {
            submitMessageEl.textContent = `Guess must include ${letter?.toUpperCase()}.`;
        }
        else {
            submitMessageEl.textContent = "Not a valid word.";
        }
    }
    submitMessageEl.style.visibility = "visible";
};
const endGame = async (win) => {
    statsData.gamesPlayed++;
    if (win) {
        statsData.gamesWon++;
        statsData.streak++;
        if (statsData.streak > statsData.maxStreak) {
            statsData.maxStreak = statsData.streak;
        }
        statsData.distribution[guessNum - 1]++;
    }
    else {
        statsData.streak = 0;
    }
    localStorage.setItem("jm-wordle-statistics", JSON.stringify(statsData));
    localStorage.removeItem("jm-wordle-game");
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
        spanEl.addEventListener("click", async (event) => {
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
            await runAnimation(modalContentEl, "animation: drop-out 0.2s ease forwards;", 200);
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
        closeEl.addEventListener("click", async () => {
            await runAnimation(modalContentEl, "animation: drop-out 0.2s ease forwards;", 200);
            modalEl.setAttribute("style", "display:none");
        });
        if (type === "settings") {
            for (let i = 0; i < 3; i++) {
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
                if (i === 2) {
                    const aEl = document.createElement("a");
                    const iconEl = document.createElement("i");
                    aEl.setAttribute("href", "https://bmc.link/jordanmasoM");
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
                            sliderEl.checked = settingsData.hardMode;
                            break;
                        default:
                            h4El.textContent = "Dark Mode";
                            pEl.textContent = "Who doesn't love a good dark mode?";
                            sliderEl.checked = settingsData.darkMode;
                            break;
                    }
                    modalContentEl.appendChild(hrEl);
                    parentDivEl.appendChild(sliderDivEl);
                    sliderDivEl.appendChild(sliderEl);
                    sliderEl.addEventListener("click", () => {
                        switch (i) {
                            case 0:
                                settingsData.hardMode = !settingsData.hardMode;
                                sliderEl.checked = settingsData.hardMode;
                                break;
                            default:
                                settingsData.darkMode = !settingsData.darkMode;
                                sliderEl.checked = settingsData.darkMode;
                                if (settingsData.darkMode) {
                                    styleSheet?.setAttribute("href", "./assets/css/dark.css");
                                }
                                else {
                                    styleSheet?.setAttribute("href", "./assets/css/style.css");
                                }
                                break;
                        }
                        localStorage.setItem("jm-wordle-settings", JSON.stringify(settingsData));
                    });
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
                        h3El.textContent = statsData.gamesPlayed.toString();
                        pEl.textContent = "Played";
                        break;
                    case 1:
                        h3El.textContent = `${statsData.gamesWon === 0 ? 0 : Math.round((statsData.gamesWon / statsData.gamesPlayed) * 100)}`;
                        pEl.textContent = "Win %";
                        break;
                    case 2:
                        h3El.textContent = statsData.streak.toString();
                        pEl.textContent = "Current Streak";
                        break;
                    default:
                        h3El.textContent = statsData.maxStreak.toString();
                        pEl.textContent = "Max Streak";
                        break;
                }
                statDivEl.setAttribute("class", "stats-num");
                statDivEl.appendChild(h3El);
                statDivEl.appendChild(pEl);
                statsDivEl.appendChild(statDivEl);
            }
            for (let i = 0; i < 6; i++) {
                const statBarEl = document.createElement("div");
                const statBarLabelEl = document.createElement("p");
                const statBarValueEl = document.createElement("p");
                statBarEl.setAttribute("class", "stats-bar");
                statBarLabelEl.setAttribute("class", "stats-bar-label");
                statBarValueEl.setAttribute("class", "stats-bar-value");
                statBarLabelEl.textContent = (i + 1).toString();
                let guessPercentage;
                if (statsData.distribution[i] === undefined) {
                    guessPercentage = 0;
                }
                else {
                    guessPercentage = Math.round((statsData.distribution[i] / statsData.gamesPlayed) * 100);
                }
                switch (i) {
                    case 0:
                        statBarValueEl.textContent = (statsData.distribution[i] || 0).toString();
                        if (guessPercentage > 0) {
                            statBarValueEl.setAttribute("style", `width: ${guessPercentage}%`);
                        }
                        break;
                    case 1:
                        statBarValueEl.textContent = (statsData.distribution[i] || 0).toString();
                        if (guessPercentage > 0) {
                            statBarValueEl.setAttribute("style", `width: ${guessPercentage}%`);
                        }
                        break;
                    case 2:
                        statBarValueEl.textContent = (statsData.distribution[i] || 0).toString();
                        if (guessPercentage > 0) {
                            statBarValueEl.setAttribute("style", `width: ${guessPercentage}%`);
                        }
                        break;
                    case 3:
                        statBarValueEl.textContent = (statsData.distribution[i] || 0).toString();
                        if (guessPercentage > 0) {
                            statBarValueEl.setAttribute("style", `width: ${guessPercentage}%`);
                        }
                        break;
                    case 4:
                        statBarValueEl.textContent = (statsData.distribution[i] || 0).toString();
                        if (guessPercentage > 0) {
                            statBarValueEl.setAttribute("style", `width: ${guessPercentage}%`);
                        }
                        break;
                    default:
                        statBarValueEl.textContent = (statsData.distribution[i] || 0).toString();
                        if (guessPercentage > 0) {
                            statBarValueEl.setAttribute("style", `width: ${guessPercentage}%`);
                        }
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
    modalContentEl.removeAttribute("style");
    modalEl.setAttribute("style", "display: flex");
    submitMessageEl.style.visibility = "hidden";
    if (type === "end" && win) {
        const jsConfetti = new JSConfetti();
        await jsConfetti.addConfetti({ confettiNumber: 500 });
        jsConfetti.clearCanvas();
    }
};
const loadPreviousGame = async () => {
    targetWord = currentGame.targetWord;
    guessNum = currentGame.currentGuess;
    guessesGrid = currentGame.gameGrid;
    for (let i = 0; i < currentGame.gameGrid.length; i++) {
        const hint = currentGame.gameGrid[i];
        const targetRow = document.getElementById(`row${hint.y}`);
        const targetBox = targetRow.children[hint.x];
        const targetPtag = targetBox.children[0];
        targetPtag.textContent = hint.letter;
        targetBox.classList.add(hint.result);
        await runAnimation(targetBox, "animation: flip-in 0.2s", 75);
    }
};
const loadLocalStorage = async () => {
    const stats = localStorage.getItem("jm-wordle-statistics");
    const settings = localStorage.getItem("jm-wordle-settings");
    const game = localStorage.getItem("jm-wordle-game");
    if (settings === null) {
        settingsData = {
            hardMode: false,
            darkMode: false
        };
        localStorage.setItem("jm-wordle-settings", JSON.stringify(settingsData));
    }
    else {
        settingsData = JSON.parse(settings);
    }
    if (settingsData.darkMode) {
        styleSheet?.setAttribute("href", "./assets/css/dark.css");
    }
    else {
        styleSheet?.setAttribute("href", "./assets/css/style.css");
    }
    if (game === null) {
        await randomWord();
        currentGame = {
            targetWord: targetWord,
            currentGuess: 1,
            gameGrid: []
        };
        localStorage.setItem("jm-wordle-game", JSON.stringify(currentGame));
    }
    else {
        currentGame = JSON.parse(game);
        await loadPreviousGame();
    }
    if (stats === null) {
        statsData = {
            gamesPlayed: 0,
            gamesWon: 0,
            streak: 0,
            maxStreak: 0,
            distribution: [0, 0, 0, 0, 0, 0]
        };
        localStorage.setItem("jm-wordle-statistics", JSON.stringify(statsData));
        return populateModal("help");
    }
    else {
        statsData = JSON.parse(stats);
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
    if (userInput) {
        event.preventDefault();
        return populateModal("settings");
    }
});
statsEl?.addEventListener("click", async (event) => {
    if (userInput) {
        event.preventDefault();
        return populateModal("stats");
    }
});
helpEl?.addEventListener("click", async (event) => {
    if (userInput) {
        event.preventDefault();
        return populateModal("help");
    }
});
gameStart();
