"use strict";
const randomWord = async () => {
    const response = await fetch("./assets/utils/words.json");
    const data = await response.json();
    return data[Math.floor(Math.random() * data.length)];
};
