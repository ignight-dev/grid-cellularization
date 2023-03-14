import { Tiler } from "../src/Tiler";

let doing = false;
let MaxArea = 9;
let TileSizePixels = 20;
let MaxAreaRatio : [number, number] = [1, 1];

function toFraction(x, tolerance) {
    if (x == 0) return [0, 1] as [number, number];
    if (x < 0) x = -x;
    if (!tolerance) tolerance = 0.0001;
    var num = 1, den = 1;

    function iterate() {
        var R = num/den;
        if (Math.abs((R-x)/x) < tolerance) return;

        if (R < x) num++;
        else den++;
        iterate();
    }

    iterate();
    return [num, den] as [number, number];
}

function setLabel (id: string, value: string) {
    const element = document.getElementById(id)
    if (element === null) { throw new Error('Element not found') }
    element.innerText = value
}

function fromInput (id: string) {
    const element = document.getElementById(id)
    if (element === null) { throw new Error('Element not found') }
    //@ts-ignore
    return +(element.value)
}

function fromSelect (id: string) {
    const element = document.getElementById(id)
    if (element === null) { throw new Error('Element not found') }
    //@ts-ignore
    return element.value
}

function run () {

    MaxArea = Math.floor(fromInput('size'))
    MaxAreaRatio = toFraction(fromInput('ratio'), 0.1)
    TileSizePixels = Math.floor(fromInput('tile-size'))

    const weightOption = fromSelect('weight-option')

    const computeProbability = [
        (x, y) => 1 / (x * y),
        (x, y) => 1,
        (x, y) => x * y,
        (x, y) => {
            if (x == 1 || y == 1) { return 0.000001 }
            return (x * y) ** 3
        }
    ][weightOption]

    const mapSize = Math.floor(800/TileSizePixels)
    TileSizePixels = 800 / mapSize

    setLabel('size-label', `Maximum Size of ${MaxArea} tiles`)
    setLabel('ratio-label', `Maximum Ratio of ${MaxAreaRatio[0]} to ${MaxAreaRatio[1]}`)
    setLabel('tile-size-label', `Base Tile Size of ${mapSize} pixels`)


    const canvas = document.getElementById('canvas');

    // Compute the tiling
    const tileSize = 20;

    const tiles = Tiler.ComputeTiling({
        mapSize: [mapSize,mapSize],
        maxArea: MaxArea,
        maxAreaRatio: (MaxAreaRatio[0] / MaxAreaRatio[1]) as number,
        computeProbability,
    })

    // Draw the tiling

    if (canvas === null) { throw new Error('Canvas not found') }

    //@ts-ignore
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 800);

    for (const tile of tiles.tiles) {
        ctx.strokeStyle = "white";
        ctx.strokeRect(1 + tile.x * TileSizePixels, 1 +tile.y * TileSizePixels, tile.width * TileSizePixels, tile.height * TileSizePixels);
        ctx.fillStyle = "#040414";
        ctx.fillRect(1 +tile.x * TileSizePixels + 3,1 + tile.y * TileSizePixels + 3, tile.width * TileSizePixels - 7, tile.height * TileSizePixels - 7);
    }

}

//@ts-ignore
document._regenerateClick = run

//@ts-ignore
document._moving = false

document.addEventListener('mousemove', function (e) {
    if (doing) { return }
    //@ts-ignore
    if (document._moving) {
        doing = true;
        setTimeout(() => {
            doing = false;
            run();
        }, 40);
    }
});

run()