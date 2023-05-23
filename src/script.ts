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
const randomWord = async (): Promise<string> => {
  const response = await fetch("./assets/utils/words.json");
  const data = await response.json();

  return data[Math.floor(Math.random() * data.length)];
};
