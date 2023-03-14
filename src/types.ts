export interface Tile {
    color: string;
}

export interface WaveColapseRule {
    tile: string,
    bordering: string[],
    weight?: number
}

export const Tiles : {[id: string]: Tile}= {
    "grass": {
        color: "#00FF00"
    },
    "water": {
        color: "#0000FF"
    },
    "sand": {
        color: "#FFFF00"
    },
    "deepwater": {
        color: "#0000AA"
    },
    "mountain": {
        color: "#AAAAAA"
    },
    "snow": {
        color: "#FFFFFF"
    },
    "forest": {
        color: "#00AA00"
    },
    "deepforest1": {
        color: "#005500"
    },
    "deepforest2": {
        color: "#004400"
    },
    "deepOcean": {
        color: "#000044"
    },
}