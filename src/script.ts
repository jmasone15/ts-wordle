// ToDo
// 1. Animation on correct guess
// 2. Light/Dark Mode
// 3. Statistics
// 4. Help
// 5. Word History
// 6. Streak
// 7. Hard Mode

declare const JSConfetti: any;
const modalEl = document.getElementById("game-over") as HTMLElement;
const resultTitleEl = document.getElementById("result-title") as HTMLElement;
const resultMessageEl = document.getElementById("result-message") as HTMLElement;
const playAgainEl = document.getElementById("play-again") as HTMLElement;
const gameColumnEls = [...document.getElementsByClassName("game-col")] as HTMLElement[];
const keyboardBtnEls = [...document.getElementsByTagName("button")] as HTMLElement[];

// Game Variables
let answerArray: string[];
let targetWord: string;
let guessNum: number;
let userInput = false;

// Game Functions
const gameStart = async (): Promise<void> => {
    // Game Variables
    await randomWord();
    answerArray = [];
    guessNum = 1;
    userInput = true;
};
const getLetterBox = (num?: number): HTMLElement => {
    const targetRow = document.getElementById(`row${guessNum}`) as HTMLElement;
    return targetRow.children[num === undefined ? answerArray.length - 1 : num] as HTMLElement;
};
const deleteLetter = (): void => {
    if (answerArray.length > 0) {
        getLetterBox().innerHTML = "";
        answerArray.pop();
    }
};
const typeLetter = (letter: string): void => {
    if (answerArray.length < 5) {
        answerArray.push(letter.toLowerCase());
        getLetterBox().innerHTML = `<p>${letter}</p>`;
    }
};
const submitWord = async (): Promise<void> => {
    if (answerArray.length === 5) {
        const isDictionaryWord = await checkWord();

        if (!isDictionaryWord) {
            for (let i = 0; i < 5; i++) {
                const targetBox = getLetterBox(i);
                targetBox.removeAttribute("style");
                targetBox.offsetWidth;
                targetBox.setAttribute("style", "animation: shake 0.2s");
            }

            return;
        }

        let correctCount = 0;
        let wordArray = targetWord.split("");
        userInput = false;

        for (let i = 0; i < answerArray.length; i++) {
            const targetBox = getLetterBox(i);
            const letter = answerArray[i];
            const letterBox = document.getElementById(letter) as HTMLElement;

            if (letter === wordArray[i]) {
                targetBox.classList.add("correct");
                letterBox.classList.add("correct");

                correctCount++;
                wordArray[i] = "";
            } else if (wordArray.includes(letter)) {
                targetBox.classList.add("partial");
                letterBox.classList.add("partial");

                wordArray[wordArray.indexOf(letter)] = "";
            } else {
                targetBox.classList.add("incorrect");
                letterBox.classList.add("incorrect");
            }

            targetBox.setAttribute("style", "animation: flip-in 0.5s");
            await delay(500);
        }

        if (correctCount === 5) {
            return endGame(true);
        } else if (guessNum === 6) {
            return endGame(false);
        } else {
            guessNum++;
            answerArray = [];
            userInput = true;
        }
    }
};
const randomWord = async (): Promise<void> => {
    const response = await fetch("./assets/utils/words.json");
    const data = await response.json();
    const randomIdx = Math.floor(Math.random() * data.length);

    targetWord = data[randomIdx].toLowerCase();
    console.log(targetWord);
};
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const checkWord = async (): Promise<boolean> => {
    const response = await fetch("./assets/utils/dictionary.json");
    const data = await response.json();

    return data.includes(answerArray.join(""));
};
const endGame = async (win: boolean): Promise<void> => {
    // Show Modal and Update HTML
    modalEl.setAttribute("style", "display:flex");
    if (win) {
        resultTitleEl.textContent = "You win!";
        resultMessageEl.textContent = `You guessed the word in ${guessNum}/6 guesses.`;

        // Confetti toss
        const jsConfetti = new JSConfetti() as any;
        await jsConfetti.addConfetti({ confettiNumber: 500 });
        jsConfetti.clearCanvas();
    } else {
        resultTitleEl.textContent = "Good try!";
        resultMessageEl.textContent = `The word we were looking for was: ${targetWord}.`;
    }
};

// Event Listeners
keyboardBtnEls.forEach(element => {
    element.addEventListener("click", () => {
        if (userInput) {
            if (["backspace", "backspace-icon"].includes(element.getAttribute("id") as string)) {
                return deleteLetter();
            } else if (element.innerText === "ENTER") {
                return submitWord();
            } else {
                return typeLetter(element.innerText);
            }
        }
    });
});
document.addEventListener("keydown", ({ key }) => {
    if (userInput) {
        if (key.charCodeAt(0) > 96 && key.charCodeAt(0) < 123) {
            return typeLetter(key);
        } else if (key === "Backspace") {
            return deleteLetter();
        } else if (key === "Enter") {
            return submitWord();
        }
    }
});
playAgainEl.addEventListener("click", () => {
    // Clear game screen
    gameColumnEls.forEach(element => {
        element.innerHTML = "";
        element.removeAttribute("style");
        element.setAttribute("class", "game-col");
    });
    keyboardBtnEls.forEach(element => {
        element.removeAttribute("class");
    });
    modalEl.setAttribute("style", "display:none");

    return gameStart();
});

gameStart();
