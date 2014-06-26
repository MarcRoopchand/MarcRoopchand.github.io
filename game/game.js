var canvas = null;
var canvasLength = 601;
var context = null;

var images = [];
var grid = [[]];
var gridLength = 8;
var tileLength = 75;

var start = null
var end = null;

var score = 0;
var gameLength = 60;
var numImages = 9;
var timer;
var incrementTimerClicked = 3;
var hintClicked = 3;

var red = "#c0392b";
var green = "#27ae60";
var purple = "#8e44ad";

function onload() {
    canvas = document.getElementById('game-canvas');
    canvas.width = canvasLength;
    canvas.height = canvasLength;

    context = canvas.getContext("2d");
    canvas.addEventListener("click", canvasClick, false);

    //Put all images in array for easy access
    images[0] = document.getElementById('facebook');
    images[1] = document.getElementById('linkedin');
    images[2] = document.getElementById('twitter');
    images[3] = document.getElementById('amazon');
    images[4] = document.getElementById('google-plus');
    images[5] = document.getElementById('instagram');
    images[6] = document.getElementById('pinterest');
    images[7] = document.getElementById('skype');
    images[8] = document.getElementById('you-tube');

    grid = new Array(gridLength);
    //Set all values in grid to be initially -1. Used to indicate blank space
    for (var x = 0; x < gridLength; x++) {
        var height = new Array(gridLength);
        for (var y = 0; y < gridLength; y++) {
            height[y] = -1;
        }
        grid[x] = height;
    }

    drawGrid();

    var newGameButton = document.getElementById('new-game');
    newGameButton.addEventListener("click", newGameButtonClicked, false);
}

function canvasClick(evt) {
    var rect = canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left;
    var y = evt.clientY - rect.top;

    //Get the tile in the grid that was clicked
    var cell = [
        Math.floor(x / tileLength),
        Math.floor(y / tileLength)
    ];

    //Clicked on a blank space, nothing to be done
    if (grid[cell[0]][cell[1]] === -1) {
        return;
    }
    else { //Clicked on a valid tile, change color of tile
        highlightClickedTile(cell, red);
    }

    //First click on a tile
    if (start === null) {
        start = cell;
    }
    //Second click on a tile
    else if (end === null) {
        end = cell;
    }

    if (start !== null && end !== null) {
        var startVal = grid[start[0]][start[1]];
        var endVal = grid[end[0]][end[1]];

        //If tiles with same images clicked, check if there is path between them
        if (startVal === endVal) {
            //Check that same tile is not clicked twice
            if (start[0] === end[0] && start[1] === end[1]) {
                smoothRedraw();
                return;
            }

            var path = calculatePath(start, end);
            if (path.length > 0) {
                for (var i = 0; i < path.length; i++) {
                    highlightClickedTile(path[i], red);
                }

                grid[start[0]][start[1]] = -1;
                grid[end[0]][end[1]] = -1;
                score += 20;
                document.getElementById('score').innerHTML = score;

                if (gameFinished()) {
                    clearTimeout(timer);
                    document.getElementById('end-game-text').innerHTML = 'Winner!';
                    updateButtonStateGameFinished();
                }
            }
            smoothRedraw();
        }
        else { //if different images clicked, reset start, end
            smoothRedraw();
        }
    }
}

function updateButtonStateGameFinished() {
    document.getElementById('end-game-text').className = 'end-game';
    document.getElementById('game-canvas').className = "disabled";
    document.getElementById('increment-timer').className = "button disabled";
    document.getElementById('hint').className = "button disabled";
}

function smoothRedraw() {
    setTimeout(function(){
        redraw();
    }, 300);
}

function highlightClickedTile(cell, color) {
    context.beginPath();
    context.rect(0.5 + (tileLength * cell[0]), 0.5 + (tileLength * cell[1]), tileLength, tileLength);

    context.strokeStyle = color;
    context.stroke();
}

function drawGrid() {
    for (var x = 0; x <= canvasLength; x += tileLength) {
        context.moveTo(0.5 + x, 0);
        context.lineTo(0.5 + x, canvasLength);

        context.moveTo(0, 0.5 + x);
        context.lineTo(canvasLength, 0.5 + x);
    }
    context.strokeStyle = green;
    context.stroke();
}

function newGameButtonClicked(evt) {

    //Enable Grid
    document.getElementById('game-canvas').className = "";
    document.getElementById('end-game-text').className = 'end-game hidden';

    //Only allow Increment Timer button to be clicked when game is started
    var incrementTimerButton = document.getElementById('increment-timer');
    incrementTimerButton.addEventListener("click", incrementTimerButtonClicked, false);
    incrementTimerButton.className = "button";

    var hintButton = document.getElementById('hint');
    hintButton.addEventListener("click", hintButtonClicked, false);
    hintButton.className = "button";

    //Populate grid with images. There 9 different images, therefore there needs to be either
    //2 or 4 of each to ensure a solvable puzzle. I decided to use 4 of each
    var randomizedImages = [];
    for (var i = 0; i < numImages; i++) {
        randomizedImages.push(i);
        randomizedImages.push(i);
        randomizedImages.push(i);
        randomizedImages.push(i);
    }

    randomizedImages.sort(function() {
        return .5 - Math.random();
    });

    //Put images into grid
    var index = 0;
    for (var x = 1; x < gridLength-1; x++) {
        for (var y = 1; y < gridLength-1; y++) {
            grid[x][y] = randomizedImages[index];
            index++;
        }
    }
    redraw();

    //Reset Score
    score = 0;
    document.getElementById('score').innerHTML =  score;

    incrementTimerClicked = 3;
    document.getElementById('increment-timer').innerHTML =
        "Increment Timer x" + incrementTimerClicked;

    hintClicked = 3;
    document.getElementById('hint').innerHTML =
        "Hint x " + hintClicked;

    //Start timer for game round
    gameLength = 60;
    clearTimeout(timer);
    timer = setInterval(function(){
        document.getElementById('timer').innerHTML = gameLength;
        gameLength--;

        if (gameLength === -1) {
            clearTimeout(timer);

            //Disable Grid
            if (!gameFinished()) {
                document.getElementById('end-game-text').innerHTML = "Try Again!";
                updateButtonStateGameFinished();
            }
        }
    },1000);
}

function incrementTimerButtonClicked() {
    incrementTimerClicked--;
    var incrementTimer = document.getElementById('increment-timer');

    if (incrementTimerClicked > 0) {
        gameLength += 10;
        incrementTimer.innerHTML = "Increment Timer x" + incrementTimerClicked;
    }
    else {
        incrementTimer.innerHTML = "Increment Timer x0";
        incrementTimer.className = "button disabled";
    }
}

function hintButtonClicked() {
    hintClicked--;
    var hintButton = document.getElementById('hint');

    if (hintClicked > 0) {
        var result = hint();
        if (result.length >= 0) {
            highlightClickedTile(result[0], purple);
            highlightClickedTile(result[1], purple);
        }

        hintButton.innerHTML = "Hint x" + hintClicked;
    }
    else {
        hintButton.innerHTML = "Hint x0";
        hintButton.className = "button disabled";
    }
}

function redraw() {
    //Clear the screen
    context.fillStyle = '#2c3e50';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    //Redraw images based on what is changed in the grid
    for (var x = 1; x < gridLength-1; x++) {
        for (var y = 1; y < gridLength-1; y++) {
            var index = grid[x][y];
            if (index !== -1) {
                context.drawImage(images[index], (x * 75) + 18 , (y * 75) + 18, 40, 40);
            }
        }
    }

    start = null;
    end = null;
}

function calculatePath(start, end) {
    var	mypathStart = Node(null, {x:start[0], y:start[1]});
    var mypathEnd = Node(null, {x:end[0], y:end[1]});

    // create an array that will contain all grid cells
    var AStar = new Array(gridLength * gridLength);

    // list of currently open Nodes
    var Open = [mypathStart];

    // list of closed Nodes
    var Closed = [];

    var result = [];

    var myNeighbours;
    var myNode;
    var myPath;
    var length, max, min, i, j;

    while(length = Open.length) {
        max = gridLength * gridLength;
        min = -1;

        for(i = 0; i < length; i++) {
            if(Open[i].estCost < max) {
                max = Open[i].estCost;
                min = i;
            }
        }
        // grab the next node and remove it from Open array
        myNode = Open.splice(min, 1)[0];

        if(myNode.value === mypathEnd.value) {
            myPath = Closed[Closed.push(myNode) - 1];
            do {
                result.push([myPath.x, myPath.y]);
            }
            while (myPath = myPath.Parent);
            // clear the working arrays
            AStar = Closed = Open = [];
            result.reverse();
        }
        else {
            myNeighbours = Neighbours(myNode.x, myNode.y);
            // test each one that hasn't been tried already
            for(i = 0, j = myNeighbours.length; i < j; i++) {
                myPath = Node(myNode, myNeighbours[i]);
                if (!AStar[myPath.value]) {
                    // estimated cost of this particular route so far
                    myPath.distCost = myNode.distCost + ManhattanDistance(myNeighbours[i], myNode);
                    // estimated cost of entire guessed route to the destination
                    myPath.estCost = myPath.distCost + ManhattanDistance(myNeighbours[i], mypathEnd);
                    // remember this new path for testing above
                    Open.push(myPath);
                    // mark this node in the world graph as visited
                    AStar[myPath.value] = true;
                }
            }
            Closed.push(myNode);
        }
    }
    return result;
}

//Returns all available neighbours
function Neighbours(x, y){
    var	N = y - 1;
    var S = y + 1;
    var E = x + 1;
    var W = x - 1;
    var result = [];

    if(N > -1 && canWalkHere(x, N))
        result.push({x:x, y:N});

    if(E < gridLength && canWalkHere(E, y))
        result.push({x:E, y:y});

    if(S < gridLength && canWalkHere(x, S))
        result.push({x:x, y:S});

    if(W > -1 && canWalkHere(W, y))
        result.push({x:W, y:y});

    return result;
}

function canWalkHere(x, y) {
    return ((grid[x] != null) && (grid[x][y] != null) &&
        (grid[x][y] <= -1 || grid[x][y] === grid[start[0]][start[1]]));
};

function ManhattanDistance(Point, Goal) {
    //No diagonals
    return Math.abs(Point.x - Goal.x) + Math.abs(Point.y - Goal.y);
}

function Node(Parent, Point) {
    var newNode = {
        Parent:Parent,
        value:Point.x + (Point.y * gridLength),
        x:Point.x,
        y:Point.y,
        estCost:0, //Estimated cost using this node
        distCost:0 //Distance cost
    };

    return newNode;
}

function gameFinished() {
    for (var x = 0; x < gridLength; x++) {
        for (var y = 0; y < gridLength; y++) {
            if (grid[x][y] != -1) {
                return false;
            }
        }
    }
    return true;
}

function hint() {
    var result = [];

    for (var x = 0; x < gridLength; x++) {
        for (var y = 0; y < gridLength; y++) {
            if (grid[x][y] !== -1) {
                start = [];
                start.push(x);
                start.push(y);

                end = getPositionInGrid(grid[x][y], start);

                if (end.length > 0) {

                    var path = calculatePath(start, end);
                    if (path.length > 0) {
                        result.push(start);
                        result.push(end);

                        start = null
                        end = null;
                        return result;
                    }
                }
            }
        }
    }
    return result;
}

function getPositionInGrid(value, position) {
    var result = [];
    for (var x = 0; x < gridLength; x++) {
        for (var y = 0; y < gridLength; y++) {
            if (grid[x][y] == value && x != position[0] && y != position[1]) {
                result.push(x);
                result.push(y);
                return result;
            }
        }
    }
    return result;
}