(() => {
  // src/utils.ts
  function InitializeArray(width, height, value) {
    const map = [];
    for (let x = 0; x < width; x++) {
      map[x] = [];
      for (let y = 0; y < height; y++) {
        map[x][y] = value;
      }
    }
    return map;
  }
  function ChooseWeightedIndex(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    const r = Math.random() * total;
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (r <= sum) {
        return i;
      }
    }
    return weights.length - 1;
  }

  // src/Tiler.ts
  var Tiler = class {
    static ComputeTiling(config) {
      Tiler.width = config.mapSize[0];
      Tiler.height = config.mapSize[1];
      Tiler.maxArea = config.maxArea;
      Tiler.maxAreaRatio = config.maxAreaRatio;
      Tiler.computeProbability = config.computeProbability;
      Tiler.tileId = 0;
      Tiler.map = InitializeArray(Tiler.width, Tiler.height, -1);
      Tiler.tileArray = [];
      Tiler.tiles = {};
      for (let i = 0; i < 0.1 * Tiler.width * Tiler.height; i++) {
        Tiler.placeRandomTile();
      }
      for (let x = 0; x < Tiler.width; x++) {
        for (let y = 0; y < Tiler.height; y++) {
          if (Tiler.map[x][y] === -1) {
            Tiler.placeTileAt(x, y);
          }
        }
      }
      const result = {
        tiles: Tiler.tileArray,
        at: (x, y) => Tiler.tiles[Tiler.map[x][y]]
      };
      return result;
    }
    static placeRandomTile() {
      const x = Math.floor(Math.random() * Tiler.width);
      const y = Math.floor(Math.random() * Tiler.height);
      if (Tiler.map[x][y] !== -1) {
        return;
      }
      Tiler.placeTileAt(x, y);
    }
    static placeTileAt(x, y) {
      if (Tiler.map[x][y] !== -1) {
        return;
      }
      const options = Tiler.getTileOptions(x, y);
      const weights = options.map(([i, j]) => Tiler.computeProbability(i, j));
      const chosen = ChooseWeightedIndex(weights);
      const [width, height] = options[chosen];
      const newTile = { x, y, width, height };
      Tiler.tiles[Tiler.tileId] = newTile;
      Tiler.tileArray.push(newTile);
      Tiler.tileId++;
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          if (Tiler.map[x + i][y + j] !== -1) {
            throw new Error("Tile already placed");
          }
          Tiler.map[x + i][y + j] = Tiler.tileId;
        }
      }
    }
    static getTileOptions(x, y) {
      const options = [];
      let maxWidth = Tiler.maxArea;
      for (let i = 0; i < Tiler.maxArea; i++) {
        for (let j = 0; j < maxWidth; j++) {
          const width = i + 1;
          const height = j + 1;
          if (width * height > Tiler.maxArea) {
            maxWidth = j;
            break;
          }
          if (x + i >= Tiler.width || y + j >= Tiler.height) {
            maxWidth = j;
            break;
          }
          if (Tiler.map[x + i][y + j] !== -1) {
            maxWidth = j;
            break;
          }
          if (width / height > Tiler.maxAreaRatio || height / width > Tiler.maxAreaRatio) {
            continue;
          }
          options.push([width, height]);
        }
      }
      return options;
    }
  };

  // website/index.ts
  var doing = false;
  var MaxArea = 9;
  var TileSizePixels = 20;
  var MaxAreaRatio = [1, 1];
  function toFraction(x, tolerance) {
    if (x == 0)
      return [0, 1];
    if (x < 0)
      x = -x;
    if (!tolerance)
      tolerance = 1e-4;
    var num = 1, den = 1;
    function iterate() {
      var R = num / den;
      if (Math.abs((R - x) / x) < tolerance)
        return;
      if (R < x)
        num++;
      else
        den++;
      iterate();
    }
    iterate();
    return [num, den];
  }
  function setLabel(id, value) {
    const element = document.getElementById(id);
    if (element === null) {
      throw new Error("Element not found");
    }
    element.innerText = value;
  }
  function fromInput(id) {
    const element = document.getElementById(id);
    if (element === null) {
      throw new Error("Element not found");
    }
    return +element.value;
  }
  function fromSelect(id) {
    const element = document.getElementById(id);
    if (element === null) {
      throw new Error("Element not found");
    }
    return element.value;
  }
  function run() {
    MaxArea = Math.floor(fromInput("size"));
    MaxAreaRatio = toFraction(fromInput("ratio"), 0.1);
    TileSizePixels = Math.floor(fromInput("tile-size"));
    const weightOption = fromSelect("weight-option");
    const computeProbability = [
      (x, y) => 1 / (x * y),
      (x, y) => 1,
      (x, y) => x * y,
      (x, y) => {
        if (x == 1 || y == 1) {
          return 1e-6;
        }
        return (x * y) ** 3;
      }
    ][weightOption];
    const mapSize = Math.floor(800 / TileSizePixels);
    TileSizePixels = 800 / mapSize;
    setLabel("size-label", `Maximum Size of ${MaxArea} tiles`);
    setLabel("ratio-label", `Maximum Ratio of ${MaxAreaRatio[0]} to ${MaxAreaRatio[1]}`);
    setLabel("tile-size-label", `Base Tile Size of ${mapSize} pixels`);
    const canvas = document.getElementById("canvas");
    const tileSize = 20;
    const tiles = Tiler.ComputeTiling({
      mapSize: [mapSize, mapSize],
      maxArea: MaxArea,
      maxAreaRatio: MaxAreaRatio[0] / MaxAreaRatio[1],
      computeProbability
    });
    if (canvas === null) {
      throw new Error("Canvas not found");
    }
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 800);
    for (const tile of tiles.tiles) {
      ctx.strokeStyle = "white";
      ctx.strokeRect(1 + tile.x * TileSizePixels, 1 + tile.y * TileSizePixels, tile.width * TileSizePixels, tile.height * TileSizePixels);
      ctx.fillStyle = "#040414";
      ctx.fillRect(1 + tile.x * TileSizePixels + 3, 1 + tile.y * TileSizePixels + 3, tile.width * TileSizePixels - 7, tile.height * TileSizePixels - 7);
    }
  }
  document._regenerateClick = run;
  document._moving = false;
  document.addEventListener("mousemove", function(e) {
    if (doing) {
      return;
    }
    if (document._moving) {
      doing = true;
      setTimeout(() => {
        doing = false;
        run();
      }, 40);
    }
  });
  run();
})();
