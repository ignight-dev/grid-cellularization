import {Tiles, Tile, WaveColapseRule} from './types'
import { WaveColapser } from './WaveColapser';
import { giveNumber } from './rnjesus';

for (let i =0; i < 100; i++){
    console.log(giveNumber());
}

// Create canvas
const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 800;
document.body.appendChild(canvas);

const rules : WaveColapseRule[] = [
    {
        tile: 'water',
        bordering: ['water', 'sand', 'deepwater']
    },
    {
        tile: 'grass',
        bordering: ['grass', 'sand', 'forest', 'mountain']
    },
    {
        tile: 'sand',
        bordering: ['sand', 'grass', 'water'],
        weight: 1.5,
    },
    {
        tile: 'deepwater',
        bordering: ['deepwater', 'water', 'deepOcean'],
        weight: 1.2,
    },
    {
        tile: 'deepOcean',
        bordering: ['deepOcean', 'deepwater'],
    },
    {
        tile: 'mountain',
        bordering: ['mountain', 'grass', 'snow']
    },
    {
        tile: 'snow',
        bordering: ['snow', 'mountain'],
        weight: 0.5,
    },
    {
        tile: 'forest',
        bordering: ['forest', 'grass', 'deepforest1', 'deepforest2'],
        weight: 1.5,
    },
    {
        tile: 'deepforest1',
        bordering: ['deepforest1', 'forest'],
    },
    {
        tile: 'deepforest2',
        bordering: ['deepforest2', 'deepforest1'],
    },

]
const tileMap : string[][] = new WaveColapser(rules).colapse()

// Get context
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// Render canvas
const interval = setTimeout(() => {
    
    // Clear canvas with white
    ctx.fillStyle = "grey";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // Render tile map
    for (let x = 0; x < tileMap.length; x++) {
        for (let y = 0; y < tileMap[x].length; y++) {
            ctx.fillStyle = Tiles[tileMap[x][y]].color;
            ctx.fillRect(x * 8, y * 8, 8, 8);
        }
    }

}, 2)