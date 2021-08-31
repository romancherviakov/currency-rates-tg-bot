const express = require("express");
const app = express();
const port = 8000;


app.get("/", (req, res) => {
    res.send('It works on nodejs server!');
});

app.listen(port, () => console.log(`Started test server on ${port} port`));