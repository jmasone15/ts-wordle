"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const words_json_1 = __importDefault(require("./utils/words.json"));
const randomWord = () => {
    return words_json_1.default[Math.floor(Math.random() * words_json_1.default.length)];
};
