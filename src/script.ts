// TODO
// 1. Randomly select a word from the JSON file.
// 2. Open the current guess row for input
// 3. When typing the fifth letter, check to see if the word is a real word.
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
let answerArray: string[] = [];
let targetWord: string;
const keyboardBtns = [...document.getElementsByTagName("button")];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

keyboardBtns.forEach((element) => {
    element.addEventListener("click", async (event) => {
        const button = event.target as HTMLElement;

        if ((button.getAttribute("id") === "backspace" || button.getAttribute("id") === "backspace-icon") && answerArray.length > 0) {
            const targetRow = document.getElementById("row1") as HTMLElement;
            const targetBox = targetRow.children[answerArray.length - 1] as HTMLElement;
            targetBox.innerHTML = "";
            answerArray.pop();
        } else if (button.innerText === "ENTER") {
            if (answerArray.length === 5) {
                const targetRow = document.getElementById("row1") as HTMLElement;

                for (let i = 0; i < answerArray.length; i++) {
                    const targetBox = targetRow.children[i] as HTMLElement;
                    if (answerArray[i] === targetWord[i]) {
                        targetBox.classList.add("correct");
                    } else if (targetWord.includes(answerArray[i])) {
                        targetBox.classList.add("partial");
                    } else {
                        targetBox.classList.add("incorrect");
                    }

                    targetBox.setAttribute("style", "animation: flip-in 0.5s");
                    await delay(500);
                }
            }
        } else if (answerArray.length < 5) {
            answerArray.push(button.innerText.toLowerCase());
            const targetRow = document.getElementById("row1") as HTMLElement;
            const targetBox = targetRow.children[answerArray.length - 1] as HTMLElement;
            targetBox.innerHTML = `<p>${button.innerText}</p>`;
        }
    });
});

document.addEventListener("keydown", async (event) => {
    if (event.key.charCodeAt(0) > 96 && event.key.charCodeAt(0) < 123 && answerArray.length < 5) {
        answerArray.push(event.key);
        const targetRow = document.getElementById("row1") as HTMLElement;
        const targetBox = targetRow.children[answerArray.length - 1] as HTMLElement;
        targetBox.innerHTML = `<p>${event.key}</p>`;
    } else if (event.key === "Backspace" && answerArray.length > 0) {
        const targetRow = document.getElementById("row1") as HTMLElement;
        const targetBox = targetRow.children[answerArray.length - 1] as HTMLElement;
        targetBox.innerHTML = "";
        answerArray.pop();
    } else if (event.key === "Enter") {
        if (answerArray.length === 5) {
            const targetRow = document.getElementById("row1") as HTMLElement;

            for (let i = 0; i < answerArray.length; i++) {
                const targetBox = targetRow.children[i] as HTMLElement;
                if (answerArray[i] === targetWord[i]) {
                    targetBox.classList.add("correct");
                } else if (targetWord.includes(answerArray[i])) {
                    targetBox.classList.add("partial");
                } else {
                    targetBox.classList.add("incorrect");
                }

                targetBox.setAttribute("style", "animation: flip-in 0.5s");
                await delay(500);
            }
        }
    }
});

const randomWord = async (): Promise<void> => {
    const response = await fetch("./assets/utils/words.json");
    const data = await response.json();

    targetWord = data[Math.floor(Math.random() * data.length)].toLowerCase();
    console.log(targetWord);
};

randomWord();
