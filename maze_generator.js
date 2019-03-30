var mazeGeneratorStack = [];

class MazeCell {
    x;
    y;
    color;

    northWall = true;
    southWall = true;
    eastWall = true;
    westWall = true;
    visited = false;
    constructor(x, y){
        this.x = x;
        this.y = y;
    }   
}

class Maze {
    width;
    height;
    seed;
    cells = [];
    startCell;
    endCell;
    constructor(w, h, seed){
        this.width = w;
        this.height = h;
        if(seed == 0){
            seed--;
        }
        this.seed = seed;
        for(let i = 0; i < w; i++){
            this.cells[i] = [];
            for(let j = 0; j < h; j++){
                this.cells[i][j] = new MazeCell(i, j);
                this.cells[i][j].color = generateRandomColorWithAlpha();
            }
        }
    }
}

function removeWalls(c1, c2){
    if(c1.x == c2.x){
        if(c1.y > c2.y){
            c1.northWall = false;
            c2.southWall = false;
        }else{
            c2.northWall = false;
            c1.southWall = false;
        }
    }else{
        if(c1.x > c2.x){
            c1.westWall = false;
            c2.eastWall = false;
        }else{
            c1.eastWall = false;
            c2.westWall = false;
        }
    }
}

function selectNextPath(maze, cell){
    cell.visited = true;
    let nbors = getUnvisitedCellNeighbors(maze, cell);
    if(nbors.length > 0){
        maze.seed = xorshift(maze.seed);
        let newCell = nbors[absoluteValue(maze.seed % nbors.length)];
        mazeGeneratorStack.push(newCell);

        removeWalls(cell, newCell);
        cell = newCell;
        selectNextPath(maze, cell);
    }else{
        if(mazeGeneratorStack.length > 0){
            cell = mazeGeneratorStack.pop();
            selectNextPath(maze, cell);
        }
    }
}

function generateMaze(numCols, numRows, seed = 1){
    let m = new Maze(numCols, numRows, seed);
    m.seed = xorshift(m.seed);
    let rx = absoluteValue(m.seed % numCols);
    m.seed = xorshift(m.seed);
    let ry = absoluteValue(m.seed % numRows);

    mazeGeneratorStack = [];

    let c = m.cells[rx][ry];
    selectNextPath(m, c);

    m.seed = xorshift(m.seed);
    let rv = absoluteValue(m.seed % 4);
    
    switch(rv){
        case 0:{
            m.startCell = m.cells[0][0];
            m.endCell = m.cells[numCols - 1][numRows - 1];
            break;
        }
        case 1:{
            m.startCell = m.cells[0][numRows - 1];
            m.endCell = m.cells[numCols - 1][0];
            break;
        }
        case 2:{
            m.startCell = m.cells[numCols - 1][0];
            m.endCell = m.cells[0][numRows - 1];
            break;
        }
        case 3:{
            m.startCell = m.cells[numCols - 1][numRows - 1];
            m.endCell = m.cells[0][0];
            break;
        }
    }
    
    return m;
}

function getUnvisitedCellNeighbors(maze, cell){
    let x = cell.x;
    let y = cell.y;
    let w = maze.width - 1;
    let h = maze.height - 1;
    let nbors = [];
    if(x > 0){
        let n = maze.cells[x - 1][y]
        if(!n.visited){
            nbors.push(n);
        }
    }
    if(x < w){
        let n = maze.cells[x + 1][y]
        if(!n.visited){
            nbors.push(n);
        }
    }
    if(y > 0){
        let n = maze.cells[x][y - 1]
        if(!n.visited){
            nbors.push(n);
        }
    }
    if(y < h){
        let n = maze.cells[x][y + 1]
        if(!n.visited){
            nbors.push(n);
        }
    }

    return nbors;
}

function drawMaze(canvas, gfx, maze){
    let cw = canvas.width / maze.width;
    let ch = canvas.height / maze.height;
    let ww = cw / 8;
    let wh = ch / 8;

    gfx.fillStyle = "white";
    gfx.fillRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < maze.width; i++){
        for(let j = 0; j < maze.height; j++){
            let cx = i * cw;
            let cy = j * ch;
            gfx.fillStyle = maze.cells[i][j].color;
            gfx.fillRect(cx, cy, cw, ch);
            gfx.fillStyle = "black";
            gfx.strokeRect(cx, cy, cw, ch)
            let cell = maze.cells[i][j];
            if(cell.westWall){
                gfx.fillRect(cx, cy, ww, ch);
            }
            if(cell.northWall){
                gfx.fillRect(cx, cy, cw, wh);
            }
            if(cell.eastWall){
                gfx.fillRect((cx + cw) - ww, cy, ww, ch);
            }
            if(cell.southWall){
                gfx.fillRect(cx, (cy + ch) - wh, cw, wh);
            }
           
        }
    }

    gfx.fillStyle = "green";
    gfx.beginPath();
    let ps = cw > ch ? ch : cw;
    gfx.arc((maze.endCell.x * cw) + (cw / 2), (maze.endCell.y * ch) + (ch / 2), ps / 3, 0, 2 * Math.PI);
    gfx.fill();
    gfx.stroke();
    gfx.closePath();
}