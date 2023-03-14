export function InitializeArray( width: number, height: number, value: number) {

    const map : number[][] = []

    // Initialize the map with -1
    for (let x = 0; x < width; x++) {
        map[x] = []
        for (let y = 0; y < height; y++) {
            map[x][y] = value;
        }
    }

    return map;

}

export function ChooseWeightedIndex(weights: number[]) {

    const total = weights.reduce((a, b) => a + b, 0)
    const r = Math.random() * total
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
        sum += weights[i]
        if (r <= sum) {
            return i
        }
    }

    return weights.length - 1

}