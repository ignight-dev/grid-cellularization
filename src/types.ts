export interface TilerConfig {

    // Size of the map to be tiled
    mapSize: [number, number]

    // Max area of a tile
    maxArea: number
    maxAreaRatio: number

    // Determine the weight that is assigned to a tile of a given size
    computeProbability: (x: number, y: number) => number

}

export interface Tile {
    x: number
    y: number
    width: number
    height: number
}

export interface ResultTiles {
    tiles: Tile[]
    at: (x: number, y: number) => Tile | undefined
}