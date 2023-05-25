// ToDo
// 1. Settings Modal (Light/Dark Mode, Hard Mode, Links)
// 2. Statistics Modal (games played, win %, current streak, max streak)
// 3. Help Modal (how to play examples)
// 4. Hard Mode
// 5. Additional Words
// 6. Clean up code for TS

// DOM Elements
declare const JSConfetti: any;
const modalEl = document.getElementById("game-over") as HTMLElement;
const resultTitleEl = document.getElementById("result-title") as HTMLElement;
const resultMessageEl = document.getElementById("result-message") as HTMLElement;
const playAgainEl = document.getElementById("play-again") as HTMLElement;
const submitMessageEl = document.getElementById("submit-message") as HTMLElement;
const gameColumnEls = [...document.getElementsByClassName("game-col")] as HTMLElement[];
const miniGameColumnEls = [...document.getElementsByClassName("mini-col")] as HTMLElement[];
const keyboardBtnEls = [...document.getElementsByTagName("button")] as HTMLElement[];

// Interfaces
interface letterBoxResult {
    x: number;
    y: number;
    result: string;
}

// Game Variables
let answerArray: string[];
let targetWord: string;
let guessNum: number;
let userInput = false;
let guessesGrid: letterBoxResult[] = [];

// Game Functions
const gameStart = async (): Promise<void> => {
    // Game Variables
    await randomWord();
    answerArray = [];
    guessesGrid = [];
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
        const pTag = getLetterBox().children[0] as HTMLElement;
        pTag.textContent = letter;
    }
};
const submitWord = async (): Promise<void> => {
    if (answerArray.length === 5) {
        submitMessageEl.style.visibility = "hidden";
        const isDictionaryWord = await checkWord();

        if (!isDictionaryWord) {
            displaySubmitMessage(false);
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
            const result: letterBoxResult = { x: i, y: guessNum, result: "" };
            const classList = [...letterBox.classList];

            if (letter === wordArray[i]) {
                targetBox.classList.add("correct");

                if (classList.length > 1) {
                    if (classList.includes("partial") || classList.includes("incorrect")) {
                        letterBox.setAttribute("class", "letter-btn");
                        letterBox.classList.add("correct");
                    }
                } else {
                    letterBox.classList.add("correct");
                }

                result.result = "correct";
                correctCount++;
                wordArray[i] = "";
            } else if (wordArray.includes(letter)) {
                targetBox.classList.add("partial");

                if (classList.length > 1) {
                    if (classList.includes("incorrect")) {
                        letterBox.classList.remove("incorrect");
                        letterBox.classList.add("partial");
                    }
                } else {
                    letterBox.classList.add("partial");
                }

                result.result = "partial";
                wordArray[wordArray.indexOf(letter)] = "";
            } else {
                targetBox.classList.add("incorrect");

                if (classList.length === 1) {
                    letterBox.classList.add("incorrect");
                }

                result.result = "incorrect";
            }

            guessesGrid.push(result);
            targetBox.setAttribute("style", "animation: flip-in 0.5s");
            await delay(500);
        }

        if (correctCount === 5) {
            displaySubmitMessage(true);
            for (let i = 0; i < 5; i++) {
                const targetBox = getLetterBox(i);
                targetBox.removeAttribute("style");
                targetBox.offsetWidth;
                targetBox.setAttribute("style", "animation: jump 1s");
                await delay(100);
            }

            await delay(1000);
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
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const checkWord = async (): Promise<boolean> => {
    const response = await fetch("./assets/utils/dictionary.json");
    const data = await response.json();

    return data.includes(answerArray.join(""));
};
const displaySubmitMessage = (correct: boolean): void => {
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
    } else {
        submitMessageEl.textContent = "Not a valid word.";
    }

    submitMessageEl.style.visibility = "visible";
};
const endGame = async (win: boolean): Promise<void> => {
    // Show Modal and Update HTML
    modalEl.setAttribute("style", "display:flex");
    submitMessageEl.style.visibility = "hidden";

    guessesGrid.forEach(({ x, y, result }: letterBoxResult): void => {
        const targetRow = document.getElementById(`mini-row${y}`) as HTMLElement;
        const targetBox = targetRow.children[x] as HTMLElement;

        targetBox.classList.add(result);
    });

    if (win) {
        resultTitleEl.textContent = "You win!";
        resultMessageEl.textContent = `You guessed the word in ${guessNum}/6 guesses.`;

        // Confetti toss
        const jsConfetti = new JSConfetti() as any;
        await jsConfetti.addConfetti({ confettiNumber: 500 });
        jsConfetti.clearCanvas();
    } else {
        resultTitleEl.textContent = "Good try!";
        resultMessageEl.textContent = `The word we were looking for was: ${targetWord.toUpperCase()}.`;
    }
};

// Event Listeners
keyboardBtnEls.forEach((element) => {
    element.addEventListener("click", (event) => {
        if (userInput) {
            const target = event.target as HTMLElement;

            if (["backspace", "backspace-icon"].includes(target.getAttribute("id") as string)) {
                return deleteLetter();
            } else if (target.innerText === "ENTER") {
                return submitWord();
            } else {
                return typeLetter(target.textContent as string);
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
    gameColumnEls.forEach((element) => {
        element.innerHTML = "";
        element.removeAttribute("style");
        element.setAttribute("class", "game-col");
    });
    miniGameColumnEls.forEach((element) => {
        element.innerHTML = "";
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

gameStart();
