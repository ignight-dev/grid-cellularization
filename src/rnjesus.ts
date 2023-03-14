let seed = 0.2

export function giveNumber () {

    seed = Math.cos(Math.tanh(seed))*100000 % 1;
    return seed;

}

// 69
/*

0.23058681397378678 index.js:162:13
0.9233861654065549 index.js:162:13
0.23155779828084633

*/