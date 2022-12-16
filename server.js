const port = 8080;
const express = require('express')
const app = express()
const path = require('path')
const http = require("http");
//http://localhost:8080/battleship/index.html?player=1
//http://localhost:8080/battleship/index.html?player=2
const fs = require('fs');

const sendBody = (res, statusCode, body = null) => {
  if (body && res.statusCode !== 500) {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...res.headers,
      };

      const responseBody =
        headers["Content-Type"] === "application/json"
          ? JSON.stringify(body)
          : body;

      res.writeHead(statusCode, http.STATUS_CODES[statusCode], headers);
      res.write(responseBody);
    } catch (err) {
      if (err instanceof SyntaxError) {
        res.writeHead(500);
      }
    }
  } else {
    res.writeHead(statusCode);

    if (res.statusCode === 500) {
      res.log.error = body;
    }
  }

  res.end();
  return Promise.resolve({
    statusCode,
    body,
  });
};

const readBody = function (req) {
  return new Promise(function (resolve) {
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        resolve(Buffer.concat(body).toString());
      });
  });
};

app.use('/battleship', express.static(path.join(__dirname, '/public')))

app.get('/battleship', function(req,res) {
  res.sendFile(path.join(__dirname + '/index.html'))
});

app.post('/reset',  (req, res) => {
  return readBody(req).then((body) => {
    const boards = JSON.parse(body);
    // check to make sure boards arent empty
    if (!boards) {
      return sendBody(res, 400);
    }
    const fileName = "player-" + boards["playerNumber"] + "-boards.json";
    fs.writeFile(fileName, JSON.stringify(boards), err => {
      if (err) {
        console.error(err);
        return;
      }
    });
    return sendBody(res, 201);
  });
});

app.post('/setBoard',  (req, res) => {
  return readBody(req).then((body) => {
    const boards = JSON.parse(body);
    // check to make sure boards arent empty
    if (!boards) {
      return sendBody(res, 400);
    }
    const fileName = "player-" + boards["playerNumber"] + "-boards.json";
    fs.writeFile(fileName, JSON.stringify(boards), err => {
      if (err) {
        console.error(err);
        return;
      }
    });
    return sendBody(res, 201);
  });
});

app.get('/updateBoards1',  (req, res) => {
  fs.readFile('player-2-boards.json', 'utf8', function (err, data) {
    if (err) {
      res.writeHead(404)
      throw err;
    }
    data = JSON.parse(data);
    sendBody(res, 200, data)
    return; 
  });
});

app.get('/updateBoards2',  (req, res) => {
  fs.readFile('player-1-boards.json', 'utf8', function (err, data) {
    if (err) {
      res.writeHead(404)
      throw err;
    }
    data = JSON.parse(data);
    sendBody(res, 200, data)
    return; 
  });
});

app.post('/attack1',  (req, res) => {
  return readBody(req).then((body) => {
    const boards = JSON.parse(body);
    // check to make sure boards arent empty
    if (!boards) {
      return sendBody(res, 400);
    }
    const fileName = "player-" + boards["playerNumber"] + "-boards.json";
    fs.writeFile(fileName, JSON.stringify(boards), err => {
      if (err) {
        console.error(err);
        return;
      }
    });
    return sendBody(res, 201);
  });
});

app.post('/attack2',  (req, res) => {
  return readBody(req).then((body) => {
    const boards = JSON.parse(body);
    // check to make sure boards arent empty
    if (!boards) {
      return sendBody(res, 400);
    }
    const fileName = "player-" + boards["playerNumber"] + "-boards.json";
    fs.writeFile(fileName, JSON.stringify(boards), err => {
      if (err) {
        console.error(err);
        return;
      }
    });
    return sendBody(res, 201);
  });
});

app.post('/setTurn',  (req, res) => {
  return readBody(req).then((body) => {
    const turn = JSON.parse(body);
    // check to make sure turn isnt empty
    if (!turn) {
      return sendBody(res, 400);
    }
    const fileName = "turn.json";
    fs.writeFile(fileName, JSON.stringify(turn), err => {
      if (err) {
        console.error(err);
        return;
      }
    });
    return sendBody(res, 201);
  });
});

app.get('/getTurn',  (req, res) => {
  fs.readFile('turn.json', 'utf8', function (err, data) {
    if (err) {
      res.writeHead(404)
      throw err;
    }
    data = JSON.parse(data);
    sendBody(res, 200, data)
    return; 
  });
});

app.listen(port)

console.log("Server is listening on port " + port)

// {
//   "playerNumber": 1,
//   "turn": 1,
//   "myGuess": [],
//   "playerGrid": {
//       "ships_placed": 0,
//       "carrier": [],
//       "battleship": [],
//       "cruiser": [],
//       "submarine": [],
//       "destroyer": [],
//       "enemy_guess": []
//   },
//   "opponentGrid": {
//       "hits": [],
//       "misses": [],
//       "ships_sunk": 0,
//       "carrier": 5, 
//       "battleship": 4, 
//       "cruiser": 3, 
//       "submarine": 3, 
//       "destroyer": 2 
//   }
// }