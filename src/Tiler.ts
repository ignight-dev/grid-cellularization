import * as T from './types'
import { InitializeArray, ChooseWeightedIndex} from './utils'

export class Tiler {

    private static tileId :number
    private static tileArray: T.Tile[]
    private static tiles: { [key: string]: T.Tile }
    private static map: number[][]
    private static width: number
    private static height: number
    private static maxArea: number
    private static maxAreaRatio: number
    private static computeProbability: (x: number, y: number) => number

    public static ComputeTiling (config: T.TilerConfig) {

        // Setup the class
        Tiler.width = config.mapSize[0]
        Tiler.height = config.mapSize[1]
        Tiler.maxArea = config.maxArea
        Tiler.maxAreaRatio = config.maxAreaRatio
        Tiler.computeProbability = config.computeProbability

        Tiler.tileId = 0
        Tiler.map = InitializeArray(Tiler.width, Tiler.height, -1)
        Tiler.tileArray = []
        Tiler.tiles = {}

        // Compute the tiling

        // Place the first tiles randomly
        for (let i = 0; i < 0.1 * Tiler.width * Tiler.height; i++) {
            Tiler.placeRandomTile()
        }

        // Place the remaining tiles
        for (let x = 0; x < Tiler.width; x++) {
            for (let y = 0; y < Tiler.height; y++) {
                if (Tiler.map[x][y] === -1) {
                    Tiler.placeTileAt(x, y)
                }
            }
        }

        const result : T.ResultTiles = {
            tiles: Tiler.tileArray,
            at: (x: number, y: number) => Tiler.tiles[Tiler.map[x][y]]
        }

        return result

    }

    private static placeRandomTile () {

        const x = Math.floor(Math.random() * Tiler.width)
        const y = Math.floor(Math.random() * Tiler.height)

        if (Tiler.map[x][y] !== -1) {
            return
        }

        Tiler.placeTileAt(x, y)

    }

    private static placeTileAt (x: number, y: number) {
        
        if (Tiler.map[x][y] !== -1) {
            return
        }

        const options = Tiler.getTileOptions(x, y)
        const weights = options.map(([i, j]) => Tiler.computeProbability(i, j))
        const chosen = ChooseWeightedIndex(weights)

        const [width, height] = options[chosen]
        const newTile = { x, y, width, height }

        Tiler.tiles[Tiler.tileId] = newTile
        Tiler.tileArray.push(newTile)
        Tiler.tileId++

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                if (Tiler.map[x + i][y + j] !== -1) {
                    throw new Error('Tile already placed')
                }
                Tiler.map[x + i][y + j] = Tiler.tileId
            }
        }

    }

    private static getTileOptions (x: number, y: number) {

        const options: number[][] = []

        let maxWidth = Tiler.maxArea;

        for (let i = 0; i < Tiler.maxArea; i++) {
            for (let j = 0; j < maxWidth; j++) {

                const width = i + 1
                const height = j + 1

                if (width * height > Tiler.maxArea) {
                    maxWidth = j
                    break
                }

                if (x + i >= Tiler.width || y + j >= Tiler.height){
                    maxWidth = j
                    break
                }

                if (Tiler.map[x + i][y + j] !== -1) {
                    maxWidth = j
                    break
                }

                if (width / height > Tiler.maxAreaRatio || height / width > Tiler.maxAreaRatio) {
                    continue
                }

                options.push([width, height])

            }
        }

        return options

    }



}