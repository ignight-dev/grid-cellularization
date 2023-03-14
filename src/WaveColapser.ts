import { giveNumber } from "./rnjesus";
import { WaveColapseRule } from "./types";

const neighbours = [ [0, -1], [0, 1], [-1, 0], [1, 0] ];

export class WaveColapser {

    private possibilityMap : (Set<WaveColapseRule> | string)[][] = [];
    private mapSize : number;
    private unassignedTiles : number;

    constructor (private rules: WaveColapseRule[]) {

        this.mapSize = 100;
        this.unassignedTiles = this.mapSize * this.mapSize;

        for (let i = 0; i < this.mapSize; i++) {
            this.possibilityMap.push([]);
            for (let j = 0; j < this.mapSize; j++) {
                this.possibilityMap[i].push(new Set<WaveColapseRule>([...this.rules]));
            }
        }

    }

    public colapse() {

        for (let i = 0; i < 30; i++) {
            this.collapseAny();
        }

        while (this.unassignedTiles > 0) {
            this.collapseLowest();
        }

        return this.possibilityMap as string[][];

    }

    private collapseAny() {

        let randomX = Math.floor(giveNumber() * this.mapSize);
        let randomY = Math.floor(giveNumber() * this.mapSize);

        if (typeof this.possibilityMap[randomX][randomY] === "string") {
            return this.collapseAny();
        }

        this.collapseTile(randomX, randomY);
        
    }

    private collapseLowest() {

        let smallest = Infinity;
        let smallests : [number, number][]= [];

        for (let i = 0; i < this.mapSize; i++) {
            for (let j = 0; j < this.mapSize; j++) {
                const value = this.possibilityMap[i][j];
                if (typeof value === "string") {
                    continue;
                }
                if (value.size < smallest) {
                    smallest = value.size;
                    smallests = [[i, j]];
                }
                else if (value.size === smallest) {
                    smallests.push([i, j]);
                }

            }
        }

        if (smallest == 0){
            throw new Error("Tile has no possibilities");
        }

        const [x, y] = smallests[Math.floor(giveNumber() * smallests.length)];
        this.collapseTile(x, y);

    }

    private chooseOneOf (possibilities: Set<WaveColapseRule>) : WaveColapseRule {

        const totalWeight = [...possibilities].reduce((acc, rule) => acc + (rule.weight || 1), 0);
        
        let chosen = giveNumber() * totalWeight;

        for (const rule of possibilities) {
            chosen -= rule.weight || 1;
            if (chosen < 0) {
                return rule;
            }
        }

        throw new Error("No rule chosen?");

    }

    private forEachNeighbour(x: number, y: number, callback: (x: number, y: number) => void) {
        const scrambled = [...neighbours].sort(() => giveNumber() - 0.5);
        for (const [dx, dy] of scrambled) {
            if (x + dx < 0 || x + dx >= this.mapSize || y + dy < 0 || y + dy >= this.mapSize) {
                continue;
            }
            callback(x + dx, y + dy);
        }
    }


    private collapseTile(x: number, y: number) {

        const possibilities = this.possibilityMap[x][y];

        if (typeof possibilities === "string") {
            throw new Error("Tile already collapsed");
        }

        const chosen = this.chooseOneOf(possibilities);

        this.possibilityMap[x][y] = chosen.tile
        this.unassignedTiles--;

        this.forEachNeighbour(x, y, (x, y) => this.updatePossibilities(x, y));

    }

    private updatePossibilities(x: number, y: number) {

        const possibilities = this.possibilityMap[x][y];

        if (typeof possibilities === "string") {
            return;
        }

        const allNeighbours : Set<string>[] = [];

        this.forEachNeighbour(x, y, (x, y) => {
            const value = this.possibilityMap[x][y ];
            if (typeof value === "string") {
                allNeighbours.push(new Set<string>([value]));
            }
            else {
                allNeighbours.push(new Set<string>([...value].map(rule => rule.tile)));
            }
        })

        let validRules = new Set<WaveColapseRule>([...possibilities].filter(rule => this.isRuleValid(rule, allNeighbours)));

        if (validRules.size == 0) {
            throw new Error("No valid rules");
        }

        if (validRules.size == possibilities.size) {
            return;
        }

        this.possibilityMap[x][y] = validRules;

        this.forEachNeighbour(x, y, (x, y) => this.updatePossibilities(x, y));

    }

    private isRuleValid(rule: WaveColapseRule, neighbours: Set<String>[]) : boolean {

        // Its valid if the neighbor set is a superset of the rule bordering set
        for (const neighbor of neighbours) 
            if (!rule.bordering.some(r => neighbor.has(r)))
                return false

        return true;
    }

}