const HEX_CHARS = "0123456789ABCDEF";

function randomInteger(val){
    return Math.floor(Math.random() * val);
}

function generateRandomColor(){
    let c = "#";
    for(let i = 0; i < 6; i++){
        c += HEX_CHARS[randomInteger(16)];
    }
    return c;
}

function generateRandomColorWithAlpha(){
    let c = generateRandomColor();
    c += HEX_CHARS[randomInteger(16)] + HEX_CHARS[randomInteger(16)];
    return c;
}

function xorshift(seed){
    seed ^= seed << 13;
	seed ^= seed >> 17;
	seed ^= seed << 5;
    return seed;
}

function absoluteValue(v){
    if(v < 0){
        return -v;
    }
    return v;
}