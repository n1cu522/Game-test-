import { Engine } from './Engine.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = new Engine(canvas, ctx);
game.start();