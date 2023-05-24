// TODO
// 1. Randomly select a word from the JSON file.
// 2. Open the current guess row for input
// 3. When hitting enter, check to see if the word is a real word.
// 4. If the word is a real word, check each letter to see if it's in the word or in the right place
// 5. Run animation on each letter and update class.
// 6. Update the keyboard button classes.
// 7. If the user has anymore guesses, start back at the beginning
// 8. If the user correctly guessed the word, game over!

// Post MVP
// 1. Light/Dark Mode
// 2. Statistics
// 3. Help
// 4. Word History

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

                let partialIndex = wordArray.indexOf(letter);
                wordArray[partialIndex] = "";
            } else {
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
        } else if (guessNum === 6) {
            return console.log("You lose, the word was: " + targetWord);
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

// Event Listeners
[...document.getElementsByTagName("button")].forEach((element) => {
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

gameStart();
