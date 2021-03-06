var express = require('express');
const { isBuffer } = require('lodash');
var app = express();
var path = require('path');
var manipulator = require(path.join(__dirname, 'helpers/devAreasMinpulator.js'));
var config = require(path.join(__dirname, '/configs.js'));
var package = require(path.join(__dirname, 'package.json'));


app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.json({
    type: 'application/vnd.api+json'
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public/views'));
app.use(express.static(__dirname + '/public/views'));
// respond with "hello world" when a GET request is made to the homepage
app.get('/', async function(req, res) {
    if(!config.manutencao){
        res.render('index',{
            version: package.version
        })
    }else{
        res.render('manutencao',{
            version: package.version
        })

    }
});
app.get('/action/getAmbients', async function(req, res) {
    manipulator.getAmbients().then(result =>{
        res.status(200).json({
            ambientList: result
        })
    }).catch(error =>{
        return res.status(500).json({
            ambientList: []
        });
    })
});
app.get('/action/getSizes', async function(req, res) {
    manipulator.getSizes().then(result =>{
        res.status(200).json(result)
    }).catch(error =>{
        return res.status(500)
    })
});

app.post('/action/deleteAmbient', async function(req, res) {
    manipulator.removeAmbient(req.body.ambientName).then(r=>{
        res.status(200).json({
            message: 'CAIU'
        })
    }).catch(error =>{
        return res.status(500).json({
           notifications: [{
             type: 'error',
             message: `Falha ao remover`
           }]
        });
    })
});

app.post('/action/restartAmbient', async function(req, res) {
    manipulator.restartAmbient(req.body.ambientName).then(r=>{
        res.status(204).json()
    }).catch(error =>{
        return res.status(500).json({message: error});
    })
});

app.post('/action/checkport', async function(req, res) {
    manipulator.checkPort(req.body.port).then(r=>{
        console.log(r);
        res.status(200).json(r)
    }).catch(error =>{
        return res.status(500).json({
           notifications: [{
             type: 'error',
             message: `Falha ao remover`
           }]
        });
    })
});

app.get('/action/getDataForCreate', async function(req, res) {
    res.status(200).json({
        serversList: config.serverList,
        release: config.release != undefined ? config.release : ''
    })
});

app.post('/action/createArea', async function(req, res) {
    manipulator.createAmbient(req.body).then(resolve => {
        return res.status(200).json(resolve);
    }).catch(error =>{
        console.log(error);
        res.status(500).json()
    })
});

app.get('/action/killPid/:pid', async function(req, res) {
    manipulator.killPid(req).then(success => {
        return res.status(200).json(success);
    }).catch(error =>{
        return res.status(500).json(error);
    })
});

app.post('/action/pullAmbient', async function(req, res) {
    manipulator.pullAmbient(req).then(() => {
        return res.status(200).json();
    }).catch(error =>{
        return res.status(500).json();
    })
});


app.listen(config.porta, () => {
    console.log(`A m??gica acontece em http://localhost:${config.porta}`)
})