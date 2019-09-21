const express = require('express');
const app = express();

let router = require('./router');
//console.log(router);


app.use(express.static('public'));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(router);

module.exports = app;