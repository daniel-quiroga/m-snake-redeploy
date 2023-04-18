require('dotenv').config({ path: ".env" })

// --- IMPORT DEPENDENCIES --- //
var mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const path = require('path');
const compression = require('compression');
const pug = require('pug');

// --- IMPORT FILES --- //
const questionModel = require('./src/models/question')
const highScoreModel = require('./src/models/highScore')

// ---- CONFIGURES FILE ROUTES ---- //
const _app_folder = '/dist/m-snake';

const app = express()
.use(compression())
.use(express.json());

app.set('view engine', 'pug')

// --- SERVE STATIC FILES --- //
app.get('*.*', express.static(_app_folder, { maxAge: '1y' }));


// --- SERVE APPLICATION PATHS --- //


//app.use(bodyParser.urlencoded({}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);
const _html_folder = "/src/app";
const _png_folder = "/src/assets/png";
const _svg_folder = "/src/assets/svg";
const _jpg_folder = "/src/assets/jpg";
app.use(express.static(__dirname + _app_folder));
app.use(express.static(__dirname + _html_folder));

// --- CONFIGURE ASSET ROUTES ---- //
app.use("/png", express.static(__dirname + _png_folder));
app.use("/svg", express.static(__dirname + _svg_folder));


// --- API PATHS --- //
app.get('/api/quiz_question', async (req: Request, res: any) => {
    var questions = await questionModel.find({ language: 'en' });
    res.status(200).json(questions);
})

app.post('/api/quiz_question', async (req: Request, res: any) => {
    questionModel.create(req.body)
    res.status(200).send('done')
})

app.get('/api/high_score', async (req: Request, res: any) => {
    var highScores = await highScoreModel.find({});
    res.status(200).json(highScores);
})

app.post('/api/high_score', async (req: Request, res: any) => {
    var highScore = req.body
    highScoreModel.create(req.body)
    res.status(200).send('done')
})

app.get('/api/ping', (req: any, res: any) => {
    console.log('ping')
    res.status(200).send('pong')
})


// ---- SERVE APPLICATION PATHS ---- //
// All requests that do NOT contain a . will be handled by angular
app.all('*', (req: Request, res) => {
    res.status(200).send('');
})

// ---- CONFIGURES SERVER TO LISTEN ---- //
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;




// ---- STARTS LISTENING TO SERVER ---- //
var uri = process.env.MONGO_CONNECTION_URI;
app.listen((PORT), async (err: any) => {
    if (err) {
        console.log(err)
    } else {
        mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
        mongoose.connection.on('error', (err) => {
            console.log(err);
            process.exit(1);
        });
        mongoose.connection.on('connected', function () {
            console.log('connected to mongo');
        });
        console.log('server running on port:' + PORT)
    }
});
