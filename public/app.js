//LOAD EVERYTHING
document.addEventListener('DOMContentLoaded', () => {
    //GET ALL NEEDED DOCUMENT ELEMENTS
    const myGrid = document.querySelector('.my-grid');
    const readyButton = document.querySelector('#ready');
    const enemyGrid = document.querySelector('.enemy-grid');
    const shipGrid = document.querySelector('.ships-grid');
    const ships = document.querySelectorAll('.ship');
    const carrier = document.querySelector('.carrier-container');
    const battleship = document.querySelector('.battleship-container');
    const cruiser = document.querySelector('.cruiser-container');
    const submarine = document.querySelector('.submarine-container');
    const destroyer = document.querySelector('.destroyer-container');
    const rotateButton = document.querySelector('#rotate');
    const player = document.querySelector('#player');
    const pTurn = document.querySelector('#playerTurn');
    const status = document.querySelector('#status');
    const winner = document.querySelector('#winner');
    const sunkenShip = document.querySelector('#sunkenShip');
    //LOCAL VARIABLES
    let placedShips = 0;
    let draggedShip;
    let draggedShipName;
    let invalidPositions = []; //array to contain all invalid positions
    let invalidCount = 0; //number of invalids
    const shipLengths = { //respective ship lengths
        carrier: 5,
        battleship: 4,
        cruiser: 3,
        submarine: 3,
        destroyer: 2,
    }
    const mySquares = [];
    const enemySquares = [];
    const size = 10; //number of squares w*l
    let position = "horizontal"; //default position: horizontal
    let playerNum = 0;
    let playerTurn = 1;
    let ready = false;
    let removed = false;

    //PLAYER BOARD DATA (LOCAL)
    const player1Data = {
        win: false,
        playerNumber: 1,
        myGuess: [],
        playerGrid: {
            ships_placed: 0,
            "carrier": [],
            "battleship": [],
            "cruiser": [],
            "submarine": [],
            "destroyer": [],
            "enemy_guess": []
        },
        opponentGrid: {
            hits: [],
            misses: [],
            ships_sunk: 0,
            carrier: 5, 
            battleship: 4, 
            cruiser: 3, 
            submarine: 3, 
            destroyer: 2 
        }
    }

    const player2Data = {
        win: false,
        playerNumber: 2,
        myGuess: [],
        playerGrid: {
            ships_placed: 0,
            "carrier": [],
            "battleship": [],
            "cruiser": [],
            "submarine": [],
            "destroyer": [],
            "enemy_guess": []
        },
        opponentGrid: {
            hits: [],
            misses: [],
            ships_sunk: 0,
            carrier: 5, 
            battleship: 4, 
            cruiser: 3, 
            submarine: 3, 
            destroyer: 2 
        }
    }

    //DISPLAY THE HEADER PLAYER NUMBER
    let currentURL = window.location.search;
    let url = new URLSearchParams(currentURL);
    player.textContent += url.get("player");
    playerNum = url.get("player"); //get the player number

    //FUNCTION THAT CREATES BOTH BOARDS
    function createBoard(grid, squares, size) {
        for (let i = 0; i < size*size; i++) {
            const square = document.createElement('div');
            square.dataset.id = i;
            grid.appendChild(square);
            squares.push(square);
        }
    }

    const handleResponse = (response) => {
        if (response.ok) {
            if (response.headers.get('Content-Type') === 'application/json') {
                return response.json()
            } else {
                return response.text()
            }
        } 
        
        return Promise.reject(response.status)
    }
        
    const logData = (data) => {
        //console.log(data)
    }  

    //RESET OBJECTS IN PLAYER BOARDS
    try {
        fetch('/reset', {
            method: 'POST',  
            headers: {
                'Content-Type': "application/json"
            },  
            body: JSON.stringify(player1Data)
        }).then(handleResponse).then(logData)
    } catch (err) {
        console.log("Error!")
    }
    try {
        fetch('/reset', {
            method: 'POST',  
            headers: {
                'Content-Type': "application/json"
            },  
            body: JSON.stringify(player2Data)
        }).then(handleResponse).then(logData)
    } catch (err) {
        console.log("Error!")
    }

    //CREATE BOTH GRIDS
    createBoard(myGrid, mySquares, size);
    createBoard(enemyGrid, enemySquares, size);

    //ROTATE SHIP SQUARES
    function rotate() {
        if(position == "horizontal") {
            carrier.classList.toggle("carrier-container-rotated");
            battleship.classList.toggle("battleship-container-rotated");
            cruiser.classList.toggle("cruiser-container-rotated");
            submarine.classList.toggle("submarine-container-rotated");
            destroyer.classList.toggle("destroyer-container-rotated");
            shipGrid.classList.toggle("ships-grid-rotated");
            position = "vertical";
        }
        else {
            carrier.classList.toggle("carrier-container-rotated");
            battleship.classList.toggle("battleship-container-rotated");
            cruiser.classList.toggle("cruiser-container-rotated");
            submarine.classList.toggle("submarine-container-rotated");
            destroyer.classList.toggle("destroyer-container-rotated");
            shipGrid.classList.toggle("ships-grid-rotated");
            position = "horizontal";
        }
    }
    rotateButton.addEventListener('click', rotate);

    //PLACING SHIPS + ERROR CHECKING
    const dragstart_handler = function(ev) {
        ev.dataTransfer.effectAllowed = "move";
        draggedShip = this;
    }
    const drag_handler = function(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
      }
    const drop_handler = function(ev) {
        ev.preventDefault();
        let shipType = draggedShipName.split('-')[0]; //get the ship type
        let shipPosition = parseInt(this.dataset.id); //get the position the ship was dropped
        console.log(shipPosition)
        let draggedShipIndex = draggedShipName.split('-')[1]; //get the index of the ship picked up
        
        //check the position: horizontal or vertical
        //for horizontals, do shipPosition - draggedShipIndex
        //for verticals, do shipPosition - draggedShipIndex*size
        if (position == "horizontal") {
            //first make sure that the squares are even available
            for (let j = shipPosition - draggedShipIndex; j < shipPosition - draggedShipIndex + shipLengths[shipType]; j++) {
                if (invalidPositions.includes(j) == true)
                    return
            }
            //construct the invalid positions for horizontals based on the ship length
            let invalidHorizontals = [];
            let count = 0;
            let i = size - shipLengths[shipType] + 1;

            while (i <= 9) {
                for (let j = i; j <= 99; j += 10) {
                    invalidHorizontals[count] = j;
                    count++;
                }
                i++;
            }

            //check for valid position and place if valid, else return
            if (invalidHorizontals.includes(shipPosition - draggedShipIndex) == false && shipPosition - draggedShipIndex >= 0){ 
                for (let i=0; i < shipLengths[shipType]; i++) {
                    mySquares[shipPosition - draggedShipIndex + i].classList.add('ship', shipType) //add the ship part onto the square
                    invalidPositions[invalidCount] = shipPosition - draggedShipIndex + i; //add ship position into invalid positions
                    invalidCount++; //increment number of invalids

                    //Update the playerData object
                    if (playerNum == 1) {
                        player1Data.playerGrid[shipType].push(shipPosition - draggedShipIndex + i);
                    } else {
                        player2Data.playerGrid[shipType].push(shipPosition - draggedShipIndex + i);
                    }
                }
                if (playerNum == 1) {
                    player1Data.playerGrid.ships_placed++;
                } else {
                    player2Data.playerGrid.ships_placed++;
                }
                placedShips++;
                console.log(placedShips)
            } else
                return 
        } else if (position == "vertical") {
            console.log(draggedShipIndex)
            for (let j = shipPosition - draggedShipIndex*size; j < shipPosition - draggedShipIndex*size + shipLengths[shipType]*size; j += size) {
                console.log(j)
                if (invalidPositions.includes(j) == true)
                    return
            }

            let invalidVerticals = [];
            let count = 0;
            let i = (size - shipLengths[shipType] + 1) * size;

            for (let j = i; j <= 99; j++) {
                invalidVerticals[count] = j;
                count++;
            }

            if (invalidVerticals.includes(shipPosition  - draggedShipIndex*size) == false && shipPosition - draggedShipIndex*size >= 0){
                for (let i=0; i < shipLengths[shipType]; i++) {
                    mySquares[shipPosition - draggedShipIndex*size + i*size].classList.add('ship', shipType)
                    invalidPositions[invalidCount] = shipPosition  - draggedShipIndex*size+ i*size;
                    invalidCount++;

                    if (playerNum == 1) {
                        
                        player1Data.playerGrid[shipType].push(shipPosition - draggedShipIndex*size + i*size);
                    } else {
                        player2Data.playerGrid[shipType].push(shipPosition - draggedShipIndex*size + i*size);
                    }
                }
                if (playerNum == 1) {
                    player1Data.playerGrid.ships_placed++;
                } else {
                    player2Data.playerGrid.ships_placed++;
                }
                placedShips++;
                console.log(placedShips)
            } else
                return
        }
        shipGrid.removeChild(draggedShip); //remove the ship from the ship grid
        console.log(invalidPositions); 
    }

    //BOARD EVENTS + SHIP PLACEMENT
    ships.forEach(ship => ship.ondragstart = dragstart_handler) //dragstart handler
    ships.forEach(ship => ship.addEventListener('mousedown', (event) => { 
        draggedShipName = event.target.id; //set draggedShipName
        console.log(draggedShipName)
    }))
    mySquares.forEach(square => square.ondrop = drop_handler) //drop handler for all mySquares
    mySquares.forEach(square => square.ondragover = drag_handler) //drag handler for all mySquares

    //PLAYER ATTACKING
    enemySquares.forEach(square => square.addEventListener('click', (event) => {
        let hit = false;
        let hitShip;
        if (playerNum == 1) {
            for (let i = 0; i < player2Data.playerGrid.carrier.length; i++) {
                if (parseInt(event.target.dataset.id) == player2Data.playerGrid.carrier[i]) {
                    hit = true;
                    hitShip = "carrier";
                }
            }
            for (let i = 0; i < player2Data.playerGrid.battleship.length; i++) {
                if (parseInt(event.target.dataset.id) == player2Data.playerGrid.battleship[i]) {
                    hit = true;
                    hitShip = "battleship";
                }
            }
            for (let i = 0; i < player2Data.playerGrid.cruiser.length; i++) {
                if (parseInt(event.target.dataset.id) == player2Data.playerGrid.cruiser[i]) {
                    hit = true;
                    hitShip = "cruiser";
                }
            }
            for (let i = 0; i < player2Data.playerGrid.submarine.length; i++) {
                if (parseInt(event.target.dataset.id) == player2Data.playerGrid.submarine[i]) {
                    hit = true;
                    hitShip = "submarine";
                }
            }
            for (let i = 0; i < player2Data.playerGrid.destroyer.length; i++) {
                if (parseInt(event.target.dataset.id) == player2Data.playerGrid.destroyer[i]) {
                    hit = true;
                    hitShip = "destroyer";
                }
            }
            if (hit) {
                player1Data.opponentGrid.hits.push(parseInt(event.target.dataset.id));
                player1Data.opponentGrid[hitShip]--;
                console.log("Player 1 hit Player 2's " + hitShip + "!")

                if (player1Data.opponentGrid[hitShip] == 0) {
                    console.log("Player 1 destroyed Player 2's " + hitShip + "!")
                    sunkenShip.textContent = "You destroyed your enemy's " + hitShip + "!";
                    player1Data.opponentGrid.ships_sunk++;
                }

                event.target.style.backgroundColor = "red";

                if (player1Data.opponentGrid.ships_sunk == 5) {
                    player1Data.win = true;
                    winner.textContent = "Player 1 has won!"
                    console.log("Player 1 has won.")
                }
            } else {
                player1Data.opponentGrid.misses.push(parseInt(event.target.dataset.id));
                console.log("Player 1 missed!")
                event.target.style.backgroundColor = "#e6e6e6";
                
            }
            playerTurn++;
            player2Data.playerGrid.enemy_guess.push(parseInt(event.target.dataset.id)) 
            player1Data.myGuess.push(parseInt(event.target.dataset.id)) 
        } else {
            //do the same thing but wiht player 1 data (player 2 attacking)
            for (let i = 0; i < player1Data.playerGrid.carrier.length; i++) {
                if (parseInt(event.target.dataset.id) == player1Data.playerGrid.carrier[i]) {
                    hit = true;
                    hitShip = "carrier";
                }
            }
            for (let i = 0; i < player1Data.playerGrid.battleship.length; i++) {
                if (parseInt(event.target.dataset.id) == player1Data.playerGrid.battleship[i]) {
                    hit = true;
                    hitShip = "battleship";
                }
            }
            for (let i = 0; i < player1Data.playerGrid.cruiser.length; i++) {
                if (parseInt(event.target.dataset.id) == player1Data.playerGrid.cruiser[i]) {
                    hit = true;
                    hitShip = "cruiser";
                }
            }
            for (let i = 0; i < player1Data.playerGrid.submarine.length; i++) {
                if (parseInt(event.target.dataset.id) == player1Data.playerGrid.submarine[i]) {
                    hit = true;
                    hitShip = "submarine";
                }
            }
            for (let i = 0; i < player1Data.playerGrid.destroyer.length; i++) {
                if (parseInt(event.target.dataset.id) == player1Data.playerGrid.destroyer[i]) {
                    hit = true;
                    hitShip = "destroyer";
                }
            }
            if (hit) {
                player2Data.opponentGrid.hits.push(parseInt(event.target.dataset.id));
                player2Data.opponentGrid[hitShip]--;
                console.log("Player 2 hit Player 1's " + hitShip + "!")

                if (player2Data.opponentGrid[hitShip] == 0) {
                    console.log("Player 2 destroyed Player 1's " + hitShip + "!")
                    player2Data.opponentGrid.ships_sunk++;
                    sunkenShip.textContent = "You destroyed your enemy's " + hitShip + "!";
                }

                event.target.style.backgroundColor = "red";

                if (player2Data.opponentGrid.ships_sunk == 5) {
                    player2Data.win = true;
                    winner.textContent = "Player 2 has won!"
                    console.log("Player 2 has won.")
                }
            } else {
                player2Data.opponentGrid.misses.push(parseInt(event.target.dataset.id));
                console.log("Player 2 missed!")
                event.target.style.backgroundColor = "#e6e6e6";
                
            }
            playerTurn--; 
            player1Data.playerGrid.enemy_guess.push(parseInt(event.target.dataset.id)) 
            player2Data.myGuess.push(parseInt(event.target.dataset.id)) 
        }

        if (playerNum == 1) {
            try {
                fetch('/attack1', {
                    method: 'POST',  
                    headers: {
                        'Content-Type': "application/json"
                    },  
                    body: JSON.stringify(player1Data)
                }).then(handleResponse).then(logData)
            } catch (err) {
                console.log("Error!")
            }
            try {
                fetch('/setTurn', {
                    method: 'POST',  
                    headers: {
                        'Content-Type': "application/json"
                    },  
                    body: JSON.stringify({turn : 2})
                }).then(handleResponse).then(logData)
            } catch (err) {
                console.log("Error!")
            }
        } else {
            try {
                fetch('/attack2', {
                    method: 'POST',  
                    headers: {
                        'Content-Type': "application/json"
                    },  
                    body: JSON.stringify(player2Data)
                }).then(handleResponse).then(logData)
            } catch (err) {
                console.log("Error!")
            }
            try {
                fetch('/setTurn', {
                    method: 'POST',  
                    headers: {
                        'Content-Type': "application/json"
                    },  
                    body: JSON.stringify({turn : 1})
                }).then(handleResponse).then(logData)
            } catch (err) {
                console.log("Error!")
            }
        }
    }))

    //CLICKING THE READY BUTTON
    function getParams() {
        let currentURL = window.location.search;
        let url = new URLSearchParams(currentURL);
        
        playerNum = url.get("player"); //get the player number
        readyButton.parentNode.removeChild(readyButton)
        rotateButton.parentNode.removeChild(rotateButton)
        shipGrid.parentNode.removeChild(shipGrid)
        ready = true;
        
        if (playerNum == 1) {
            try {
                fetch('/setBoard', {
                    method: 'POST',  
                    headers: {
                        'Content-Type': "application/json"
                    },  
                    body: JSON.stringify(player1Data)
                }).then(handleResponse).then(logData)
            } catch (err) {
                console.log("Error!")
            }
        } else {
            try {
                fetch('/setBoard', {
                    method: 'POST',  
                    headers: {
                        'Content-Type': "application/json"
                    },  
                    body: JSON.stringify(player2Data)
                }).then(handleResponse).then(logData)
            } catch (err) {
                console.log("Error!")
            }
        }
    }
    readyButton.addEventListener('click', getParams);

    //CHECK IF PLAYERS ARE READY
    let readyCheck = setInterval(function() {
        if (placedShips == 5) {
            console.log("All ships placed.")
            readyButton.disabled = false; //only display ready button once all 5 ships are placed
            clearInterval(readyCheck);
        }
    }, 1000);

    //UPDATE PLAYER BOARDS
    setInterval(function () {
        let found = false;
        let foundIndex = 0;
        
        if (playerNum == 1) {
            for (let j = 0; j < player2Data.myGuess.length; j++) {
                found = false;
                foundIndex = player2Data.myGuess[j];
                for (let i = 0; i < player1Data.playerGrid.carrier.length; i++) {
                    if (player2Data.myGuess[j] == player1Data.playerGrid.carrier[i]) {
                        found = true;
                        foundIndex = player2Data.myGuess[j];
                    }
                }
                for (let i = 0; i < player1Data.playerGrid.battleship.length; i++) {
                    if (player2Data.myGuess[j] == player1Data.playerGrid.battleship[i]) {
                        found = true;
                        foundIndex = player2Data.myGuess[j];
                    }
                }
                for (let i = 0; i < player1Data.playerGrid.cruiser.length; i++) {
                    if (player2Data.myGuess[j] == player1Data.playerGrid.cruiser[i]) {
                        found = true;
                        foundIndex = player2Data.myGuess[j];
                    }
                }
                for (let i = 0; i < player1Data.playerGrid.submarine.length; i++) {
                    if (player2Data.myGuess[j] == player1Data.playerGrid.submarine[i]) {
                        found = true;
                        foundIndex = player2Data.myGuess[j];
                    }
                }
                for (let i = 0; i < player1Data.playerGrid.destroyer.length; i++) {
                    if (player2Data.myGuess[j] == player1Data.playerGrid.destroyer[i]) {
                        found = true;
                        foundIndex = player2Data.myGuess[j];
                    }
                }

                if (found) {
                    const search = ".my-grid [data-id=\"" + foundIndex + "\"]";
                    const temp = document.querySelector(search);
                    temp.style.backgroundColor = "red";

                }
                else {
                    const search = ".my-grid [data-id=\"" + foundIndex + "\"]";
                    const temp = document.querySelector(search);
                    temp.style.backgroundColor = "#e6e6e6";
                }
            }
        } else {
            for (let j = 0; j < player1Data.myGuess.length; j++) {
                foundIndex = player1Data.myGuess[j];
                found = false;
                for (let i = 0; i < player2Data.playerGrid.carrier.length; i++) {
                    if (player1Data.myGuess[j] == player2Data.playerGrid.carrier[i]) {
                        found = true;
                        foundIndex = player1Data.myGuess[j];
                    }
                }
                for (let i = 0; i < player2Data.playerGrid.battleship.length; i++) {
                    if (player1Data.myGuess[j] == player2Data.playerGrid.battleship[i]) {
                        found = true;
                        foundIndex = player1Data.myGuess[j];
                    }
                }
                for (let i = 0; i < player2Data.playerGrid.cruiser.length; i++) {
                    if (player1Data.myGuess[j] == player2Data.playerGrid.cruiser[i]) {
                        found = true;
                        foundIndex = player1Data.myGuess[j];
                    }
                }
                for (let i = 0; i < player2Data.playerGrid.submarine.length; i++) {
                    if (player1Data.myGuess[j] == player2Data.playerGrid.submarine[i]) {
                        found = true;
                        foundIndex = player1Data.myGuess[j];
                    }
                }
                for (let i = 0; i < player2Data.playerGrid.destroyer.length; i++) {
                    if (player1Data.myGuess[j] == player2Data.playerGrid.destroyer[i]) {
                        found = true;
                        foundIndex = player1Data.myGuess[j];
                    }
                }

                if (found) {
                    const search = ".my-grid [data-id=\"" + foundIndex + "\"]";
                    const temp = document.querySelector(search);
                    temp.style.backgroundColor = "red";
                    
                }
                else {
                    const search = ".my-grid [data-id=\"" + foundIndex + "\"]";
                    const temp = document.querySelector(search);
                    temp.style.backgroundColor = "#e6e6e6";
                }
            }
        }
    }, 1000)

    //GET PLAYER BOARDS FROM DATABASE
    setInterval(function() {
        if (playerNum == 1) {
            fetch("/updateBoards1")
            .catch((networkError) => {
                console.log('Could not connect to server, please try again later', {networkError})
            })
            .then((response) => {
                if (response.ok) {
                    if (response.headers.get('Content-Type') === 'application/json') {
                        return response.json()
                    } else {
                        return response.text()
                    }
                }    
                return Promise.reject(response.status)
            }).then((data) => {
                for (let i = 0; i < data.playerGrid.carrier.length; i++) {
                    player2Data.playerGrid.carrier[i] = data.playerGrid.carrier[i];
                }
                for (let i = 0; i < data.playerGrid.battleship.length; i++) {
                    player2Data.playerGrid.battleship[i] = data.playerGrid.battleship[i];
                }
                for (let i = 0; i < data.playerGrid.cruiser.length; i++) {
                    player2Data.playerGrid.cruiser[i] = data.playerGrid.cruiser[i];
                }
                for (let i = 0; i < data.playerGrid.submarine.length; i++) {
                    player2Data.playerGrid.submarine[i] = data.playerGrid.submarine[i];
                }
                for (let i = 0; i < data.playerGrid.destroyer.length; i++) {
                    player2Data.playerGrid.destroyer[i] = data.playerGrid.destroyer[i];
                }
                for (let i = 0; i < data.myGuess.length; i++) {
                    player2Data.myGuess[i] = data.myGuess[i];
                }
                player2Data.win = data.win;
                player2Data.playerGrid.ships_placed = data.playerGrid.ships_placed;
            }).catch((serverError) => {
                if (serverError instanceof SyntaxError) {
                    console.log('Server sent back malformed JSON')                
                } else {
                    console.log()
                    if (serverError === 400) {
                    console.log('Server did not accept our request')
                    } else if (serverError === 404) {
                    console.log('Server did not find the resource')
                    } 
                }
            })
        } else {
            fetch("/updateBoards2")
            .catch((networkError) => {
                console.log('Could not connect to server, please try again later', {networkError})
            })
            .then((response) => {
                if (response.ok) {
                    if (response.headers.get('Content-Type') === 'application/json') {
                        return response.json()
                    } else {
                        return response.text()
                    }
                }    
                return Promise.reject(response.status)
            }).then((data) => {
                for (let i = 0; i < data.playerGrid.carrier.length; i++) {
                    player1Data.playerGrid.carrier[i] = data.playerGrid.carrier[i];
                }
                for (let i = 0; i < data.playerGrid.battleship.length; i++) {
                    player1Data.playerGrid.battleship[i] = data.playerGrid.battleship[i];
                }
                for (let i = 0; i < data.playerGrid.cruiser.length; i++) {
                    player1Data.playerGrid.cruiser[i] = data.playerGrid.cruiser[i];
                }
                for (let i = 0; i < data.playerGrid.submarine.length; i++) {
                    player1Data.playerGrid.submarine[i] = data.playerGrid.submarine[i];
                }
                for (let i = 0; i < data.playerGrid.destroyer.length; i++) {
                    player1Data.playerGrid.destroyer[i] = data.playerGrid.destroyer[i];
                }
                for (let i = 0; i < data.myGuess.length; i++) {
                    player1Data.myGuess[i] = data.myGuess[i];
                }
                player1Data.win = data.win;
                player1Data.playerGrid.ships_placed = data.playerGrid.ships_placed;
            }).catch((serverError) => {
                if (serverError instanceof SyntaxError) {
                    console.log('Server sent back malformed JSON')                
                } else {
                    console.log()
                    if (serverError === 400) {
                    console.log('Server did not accept our request')
                    } else if (serverError === 404) {
                    console.log('Server did not find the resource')
                    } 
                }
            })
        }
    }, 1000)


    //DISPLAY THE TURN
    setInterval(function() {
        if (player1Data.playerGrid.ships_placed == 5 && player2Data.playerGrid.ships_placed == 5 && ready) {
            if (playerTurn == 1) {
                if (playerNum == 1) {
                    pTurn.textContent = "Your Turn"
                } else {
                    pTurn.textContent = "Opponent's Turn"
                }
            } else {
                if (playerNum == 1) {
                    pTurn.textContent = "Opponent's Turn"
                } else {
                    pTurn.textContent = "Your Turn"
                }
            }
        }
    }, 1000)

    //MISC SET INTERVAL UPDATES
    setInterval(function() {
        if (player1Data.playerGrid.ships_placed == 5 && player2Data.playerGrid.ships_placed == 5 && ready && !removed) {
            status.parentNode.removeChild(status)
            removed = true;
        }
        if (player1Data.win) {
            winner.textContent = "Player 1 has won!"
        }
        if (player2Data.win) {
            winner.textContent = "Player 2 has won!"
        }
        fetch("/getTurn")
            .catch((networkError) => {
                console.log('Could not connect to server, please try again later', {networkError})
            })
            .then((response) => {
                if (response.ok) {
                    if (response.headers.get('Content-Type') === 'application/json') {
                        return response.json()
                    } else {
                        return response.text()
                    }
                }    
                return Promise.reject(response.status)
            }).then((data) => {
                playerTurn = data.turn;
            }).catch((serverError) => {
                if (serverError instanceof SyntaxError) {
                    console.log('Server sent back malformed JSON')                
                } else {
                    console.log()
                    if (serverError === 400) {
                    console.log('Server did not accept our request')
                    } else if (serverError === 404) {
                    console.log('Server did not find the resource')
                    } 
                }
            })
    }, 1000)

    // setInterval(function() {
    //     console.log(player1Data)
    //     console.log(player2Data)
    // }, 1000)
})