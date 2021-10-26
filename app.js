var express = require('express');
var app = express();
var path = require('path');
var manipulator = require(path.join(__dirname, 'helpers/devAreasMinpulator.js'))
var config = require(path.join(__dirname, '/configs.js'))


app.use(express.urlencoded({
    extended: true
}));
app.use(timeout(1800000));
app.use(express.json());
app.use(express.json({
    type: 'application/vnd.api+json'
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public/views'));
app.use(express.static(__dirname + '/public/views'));
// respond with "hello world" when a GET request is made to the homepage
app.get('/', async function(req, res) {
    var list = await manipulator.getProjects();
    res.render('index', {
        list: list
    })
});
app.post('/action/deleteAmbient', async function(req, res) {
    manipulator.removeDev(req.body.ambientName).then(r=>{
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

app.post('/action/createArea', async function(req, res) {
    manipulator.createArea(req.body).then(success => {
        return res.status(200).json(success);
    }).catch(error =>{

    })
});

app.get('/action/killPid/:pid', async function(req, res) {
    manipulator.killPid(req).then(success => {
        return res.status(200).json(success);
    }).catch(error =>{
        return res.status(500).json(error);
    })
});





app.listen(config.porta, () => {
    console.log(`A mágica acontece em http://localhost:${config.porta}`)
})