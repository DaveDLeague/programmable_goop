var windowWidth;
var windowHeight;

var canvas;
var codeBox;
var codeButtonDiv;
var buttonDiv;
var g;

var commandQueue = [];
var intervalTimer;

var currentLevel;

var nextX = 0;
var nextY = 0;

var sx = 0;
var sy = 0;

var taskCtr = 0;

var goopImage;
var goopFrame = 0;
var goopAnimTimer = 0;

window.onload = function(){
    codeBox = document.getElementById("codeBoxID");
    canvas = document.getElementById("canvasID");
    goopImage = document.getElementById("goopImgID");
    codeButtonDiv = document.getElementById("codeButtonDivID");
    buttonDiv = document.getElementById("buttonDiv");
    buttonDiv.innerHTML += "<br><br><br><button onclick='undoLastCommand()'>Undo</button><br>";
    buttonDiv.innerHTML += "<button id='runButtonID' onclick='runProgram()'>Run Program</button>";
    g = canvas.getContext("2d");
    g.lineWidth = 1;
    currentLevel = new Level();
    currentLevel.startCode = "Goop goop = new Goop();<br>";
    var b1 = new CodeButton();
    b1.buttonText = "Move Up";
    b1.codeText = "goop.moveUp();";
    b1.performAction = function(){
        nextY = sy - canvas.height / currentLevel.maze.height;
        intervalTimer = setInterval(function(){
            movePlayer("up");
        }, 1000 / 60);
    };
    var b2 = new CodeButton();
    b2.buttonText = "Move Down";
    b2.codeText = "goop.moveDown();";
    b2.performAction = function(){
        nextY = sy + canvas.height / currentLevel.maze.height;
        intervalTimer = setInterval(function(){
            movePlayer("down");
        }, 1000 / 60);
    };
    var b3 = new CodeButton();
    b3.buttonText = "Move Left";
    b3.codeText = "goop.moveLeft();";
    b3.performAction = function(){
        nextX = sx - canvas.width / currentLevel.maze.width;
        intervalTimer = setInterval(function(){
            movePlayer("left");
        }, 1000 / 60);
    };
    var b4 = new CodeButton();
    b4.buttonText = "Move Right";
    b4.codeText = "goop.moveRight();";
    b4.performAction = function(){
        nextX = sx + canvas.width / currentLevel.maze.width;
        intervalTimer = setInterval(function(){
            movePlayer("right");
        }, 1000 / 60);
    };
    currentLevel.buttons.push(b1);
    currentLevel.buttons.push(b2);
    currentLevel.buttons.push(b3);
    currentLevel.buttons.push(b4);

    currentLevel.maze = generateMaze(randomInteger(11) + 2, randomInteger(11) + 2, new Date().getTime());
    currentLevel.px = currentLevel.maze.startCell.x;
    currentLevel.py = currentLevel.maze.startCell.y;

    currentLevel.draw = function(cnvs, gfx){
        drawMaze(canvas, g, currentLevel.maze);
        
        gfx.fillStyle = "red";
        let cw = cnvs.width / currentLevel.maze.width;
        let ch = cnvs.height / currentLevel.maze.height;
        switch(goopFrame){
            case 0:{
                gfx.drawImage(goopImage, 0, 0, 32, 32, sx, sy, cw, ch);
                break;
            }
            case 1:{
                gfx.drawImage(goopImage, 32, 0, 32, 32, sx, sy, cw, ch);
                break;
            }
            case 2:{
                gfx.drawImage(goopImage, 0, 32, 32, 32, sx, sy, cw, ch);
                break;
            }
            case 3:{
                gfx.drawImage(goopImage, 32, 32, 32, 32, sx, sy, cw, ch);
                break;
            }
        }
    };

    codeBox.innerHTML = currentLevel.startCode;

    setInterval(function(){
        idleAnimation();
    }, 100);

    resizeWindow();
}

function idleAnimation(){
    let d = new Date();
    if(d.getTime() - goopAnimTimer >= 100){
        goopFrame++;
        if(goopFrame > 3){
            goopFrame = 0;
        }
        goopAnimTimer = d.getTime();
        currentLevel.draw(canvas, g);
    }
}

function movePlayer(dir){
    let cl = currentLevel.maze.cells[currentLevel.px][currentLevel.py];
    if(dir == "up"){
        if(cl.northWall){
            sy--
            if(sy <= nextY + ((canvas.height / currentLevel.maze.height) / 2)){
                sy += (canvas.height / currentLevel.maze.height) / 2;
                clearInterval(intervalTimer);
                performNextTask();
            }
        }else{
            sy--;
            if(sy <= nextY){
                currentLevel.py = cl.y - 1;
                clearInterval(intervalTimer);
                performNextTask();
            }
        }
    }else if(dir == "down"){
        if(cl.southWall){
            sy++;
            if(sy >= nextY - ((canvas.height / currentLevel.maze.height) / 2)){
                sy -= (canvas.height / currentLevel.maze.height) / 2;
                clearInterval(intervalTimer);
                performNextTask();
            }
        }else{
            sy++;
            if(sy >= nextY){
                currentLevel.py = cl.y + 1;
                clearInterval(intervalTimer);
                performNextTask();
            }
        }
    }else if(dir == "left"){
        if(cl.westWall){
            sx--;
            if(sx <= nextX + ((canvas.width / currentLevel.maze.width) / 2)){
                sx += (canvas.width / currentLevel.maze.width) / 2;
                clearInterval(intervalTimer);
                performNextTask();
            }
        }else{
            sx--;
            if(sx <= nextX){
                currentLevel.px = cl.x - 1;
                clearInterval(intervalTimer);
                performNextTask();
            }
        }
    }else if(dir == "right"){
        if(cl.eastWall){
            sx++;
            if(sx >= nextX - ((canvas.width / currentLevel.maze.width) / 2)){
                sx -= (canvas.width / currentLevel.maze.width) / 2;
                clearInterval(intervalTimer);
                performNextTask();
            }
        }else{
            sx++;
            if(sx >= nextX){
                currentLevel.px = cl.x + 1;
                clearInterval(intervalTimer);
                performNextTask();
            }
        }
    }
    drawWindow();
}

function performNextTask(){
    if(commandQueue.length > taskCtr){
        if(taskCtr > 0){
            document.getElementById("codeLine" + (taskCtr - 1)).style.backgroundColor = "transparent";
        }
        document.getElementById("codeLine" + taskCtr).style.backgroundColor = "green";
        commandQueue[taskCtr++].performAction();
    }
}

function resizeWindow(){
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    canvas.width = windowWidth / 2;
    canvas.height = windowHeight;

    let cw = canvas.width / currentLevel.maze.width;
    let ch = canvas.height / currentLevel.maze.height;
    sx = (currentLevel.px * cw);
    sy = (currentLevel.py * ch);

    drawWindow();
}

function drawWindow(){
    codeBox.style.position = "absolute";
    codeBox.style.left = 0;
    codeBox.style.top = 0;
    codeBox.style.width = windowWidth / 3;
    codeBox.style.height = windowHeight;
    codeBox.style.borderStyle = "solid";

    codeButtonDiv.style.position = "absolute";
    codeButtonDiv.style.left = (windowWidth / 3) + 5;
    codeButtonDiv.style.top = 0;
    codeButtonDiv.style.width = windowWidth / 4;
    codeButtonDiv.style.height = windowHeight / 2;
    codeButtonDiv.innerHTML = "";
    for(let i = 0; i < currentLevel.buttons.length; i++){
        codeButtonDiv.innerHTML += "<button onclick='codeButtonClicked(currentLevel.buttons["+i+"])'>" + currentLevel.buttons[i].buttonText + "</button><br>";
    }

    buttonDiv.style.position = "absolute";
    buttonDiv.style.left = (windowWidth / 3) + 5;
    buttonDiv.style.top = windowHeight / 2;
    buttonDiv.style.width = windowWidth / 4;
    buttonDiv.style.height = windowHeight / 2;

    canvas.style.position = "absolute";
    canvas.style.left = windowWidth / 2;
    canvas.style.top = 0;

    currentLevel.draw(canvas, g);

    g.strokeStyle = "black";
    g.lineWidth = 1;
    g.strokeRect(0, 0, canvas.width, canvas.height);
}

function codeButtonClicked(button){
    codeBox.innerHTML += "<div id='codeLine"+ commandQueue.length +"'>" + button.codeText + "</div><br>";
    commandQueue.push(button);
}

function undoLastCommand(){
    commandQueue.pop();
    codeBox.innerHTML = currentLevel.startCode;
    for(let i = 0; i < commandQueue.length; i++){
        codeBox.innerHTML += "<div id='codeLine"+ i +"'>" + commandQueue[i].codeText + "</div><br>";
    }
}

function runProgram(){
    let butt = document.getElementById("runButtonID");
    butt.innerHTML = "Stop Program";
    butt.onclick = function(){
        stopProgram();
    };

    taskCtr = 0;
    performNextTask();
}

function stopProgram(){
    clearInterval(intervalTimer);
    let butt = document.getElementById("runButtonID");
    butt.innerHTML = "Run Program";
    butt.onclick = function(){
        runProgram();
    };
    taskCtr = 0;
    currentLevel.px = currentLevel.maze.startCell.x;
    currentLevel.py = currentLevel.maze.startCell.y;
    resizeWindow();
}

class CodeButton {
    buttonText;
    codeText;
    performAction;
}

class Level {
    buttons = [];
    startCode;
    draw;
    performTasks;
    maze;
    px;
    py;
    gx;
    gy;
}

