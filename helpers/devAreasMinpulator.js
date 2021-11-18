const {
    exec,
    spawn
} = require('child_process');
const path = require("path");
const _ = require('lodash');
const req = require('express/lib/request');
const config = require(path.join(__dirname, '../configs.js'))
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function spawnCommand(command) {
    // var spw = spawn('sh', ['-c', command]);
    var spw = spawn(command, [], {
        shell: true
    });
    // spawn('sh', ['-c', command], {stdio: 'inherit'});
    return spw;
}

var creatingArea = false;


module.exports = {

    getAmbients: function() {
        return new Promise(resolve => {
            console.log('> Getting projects');
            var process = exec(`${config.sshConection.length > 0 ? config.sshConection + ' "':''}ls ${config.pathToPrepareBranch}/projects${config.sshConection.length > 0 ? '"':''}`, (error, stdout, stderr) => {
                if (error) {
                    console.log('NAO FOI-1', error.message);
                    resolve();

                }
                if (stderr) {
                    console.log('NAO FOI', stderr);
                    resolve();
                }
                if (stdout) {
                    var projectsFolders = stdout.split('\n');
                    var listProjects = [];

                    projectsFoldersFilled = _.filter(projectsFolders, (folder, idx) => {
                        if (folder.length > 1 && idx != (projectsFolders.length) - 1) {
                            return folder
                        }
                    })

                    _.forEach(projectsFoldersFilled, (project, idx) => {
                        listProjects.push({
                            name: project,
                            id: parseInt(idx)
                        })
                    })

                    resolve(listProjects);
                }
            });
            console.log('Process ID (PID)', process.pid);
        })
    },

    getSizes: function(req) {
        return new Promise((resolve, reject)=>{
            let command = `${config.sshConection.length > 0 ? config.sshConection + ' "':''}df /dev/sda1 -h${config.sshConection.length > 0 ? '"':''}`;

            var child = spawnCommand(command)
    
            var scriptOutput = "";
    
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function(data) {
                let dataSplited = data.split('\n');
                let size = dataSplited[1].split(' ')
                let sizesFilled = _.filter(size, (sz)=>{
                    if(sz != '' && sz.length > 1){
                        return sz;
                    }
                })
                let sizes = {
                    total: sizesFilled[1],
                    used: sizesFilled[2],
                    disponivel: sizesFilled[3],
                    use: sizesFilled[4],
                }
                console.log(sizes);
                resolve({
                    sizes: sizes
                })
            });
        })
        
    },

    restartAmbient: function(ambientName) {
        return new Promise((resolve, reject) => {
            if (ambientName != undefined && ambientName != '') {
                console.log('> Removing ambient', ambientName);
                let command = `${config.sshConection.length > 0 ? config.sshConection + ' "':''}export TERM=xterm && pm2 restart ${ambientName}${config.sshConection.length > 0 ? '"':''}`;
                console.log('> ', command);
                let SpawnRestart = spawnCommand(command);
                console.log('Process ID (PID)', SpawnRestart.pid);


                // SpawnRestart.stdout.on('data', function(data) {
                //     if (data.toString().length > 0) {
                //         allowedPort = false
                //     }
                // });
                SpawnRestart.on('close', function(code) {
                    console.log('Exit with code', code);
                    resolve({
                        success: 'Comando para restart enviado'
                    })
                });
            }
        })
    },
    pullAmbient: function(req) {
        return new Promise((resolve, reject) => {
            var ambientName = req.body.ambientName;
            if (ambientName != undefined && ambientName != '') {
                console.log('> Removing ambient', ambientName);
                let command = `${config.sshConection.length > 0 ? config.sshConection + ' "':''}cd ${config.pathToPrepareBranch}/projects/${ambientName} && git branch${config.sshConection.length > 0 ? '"':''}`;
                
                let child1 = spawnCommand(command);
                child1.stdout.setEncoding('utf8');
                child1.stdout.on('data', function(data){
                    var retChild1 = data.split(' ');
                    const branch = retChild1[1].replace(/'\n'/g, '')
                    console.log(branch);
                    command = `${config.sshConection.length > 0 ? config.sshConection + ' "':''}cd ${config.pathToPrepareBranch}/projects/${ambientName} && git pull origin ${branch}${config.sshConection.length > 0 ? '"':''}`;
                    let child2 = spawnCommand(command);
                    child2.stdout.setEncoding('utf8');
                    child2.on('close', function(code){
                        if(code === 0){
                            console.log('Finished pull command with code: ',code);
                            resolve({});

                        }else{
                            reject({});

                        }
                    })
                })

                child1.stderr.on('data', (error)=>{
                    reject({});
                })
            }

            // OLD METHOD
            // if (ambientName != undefined && ambientName != '') {
            //     console.log('> Removing ambient', ambientName);
            //     let command = `${config.sshConection.length > 0 ? config.sshConection + ' "':''}cd ${config.pathToPrepareBranch}/projects/${ambientName} && git branch${config.sshConection.length > 0 ? '"':''}`;
            //     var process = exec(command, (error, stdout, stderr) => {
            //         if (error) {
            //             console.log('NAO FOI-1', error.message);
            //             resolve();

            //         }
            //         if (stderr) {
            //             console.log('NAO FOI', stderr);
            //             resolve();
            //         }
            //         if (stdout) {
            //             var aaa = stdout.split(' ');
            //             const branch = aaa[1].replace(/'\n'/g, '')
            //             console.log(branch);

            //             command = `${config.sshConection.length > 0 ? config.sshConection + ' "':''}cd ${config.pathToPrepareBranch}/projects/${ambientName} && git pull origin ${branch}${config.sshConection.length > 0 ? '"':''}`;
            //             console.log('> ', command);
            //             let SpawnRemove = spawnCommand(command);
            //             console.log('Process ID (PID)', SpawnRemove.pid);
            //             SpawnRemove.on('close', function(code) {
            //                 console.log('Exit with code', code);

            //                 resolve({
            //                     success: 'Comando para pull no ambiente realizado'
            //                 })
            //             });
            //         }
            //     });
            // }
        })
    },

    removeAmbient: function(ambientName) {
        return new Promise((resolve, reject) => {
            if (ambientName != undefined && ambientName != '') {
                // console.log('> Removing ambient', ambientName);
                // var process = exec(`${config.sshConection.length > 0 ? config.sshConection + ' "':''}export TERM=xterm && cd ${config.pathToPrepareBranch} && ./prepare_branch.sh -b ${ambientName} -r -d${config.sshConection.length > 0 ? '"':''}`, (error, stdout, stderr) => {
                //     if (error) {
                //         console.log('NAO FOI-1', error.message);
                //         resolve();

                //     }
                //     if (stderr) {
                //         console.log('NAO FOI', stderr);
                //         resolve();
                //     }

                //     if (stdout) {
                //         console.log('FOI')
                //         resolve();
                //     }
                // });
                // console.log('Process ID (PID)', process.pid);


                console.log('> Removing ambient', ambientName);
                let command = `${config.sshConection.length > 0 ? config.sshConection + ' "':''}export TERM=xterm && cd ${config.pathToPrepareBranch} && ./prepare_branch.sh -b ${ambientName} -r -d${config.sshConection.length > 0 ? '"':''}`;
                console.log('> ', command);
                let SpawnRemove = spawnCommand(command);
                console.log('Process ID (PID)', SpawnRemove.pid);


                // SpawnRemove.stdout.on('data', function(data) {
                //     if (data.toString().length > 0) {
                //         allowedPort = false
                //     }
                // });
                SpawnRemove.on('close', function(code) {

                    console.log('Exit with code', code);

                    resolve({
                        success: 'Comando remoção do ambiente iniciado'
                    })
                });




            }
        })
    },

    checkPort: function(port) {
        return new Promise((resolve, reject) => {

            if (port != undefined && port != '') {
                console.log('> Checking port', port);
                var command = `${config.sshConection.length > 0 ? config.sshConection + ' "':''}grep -R '${port}' ${config.nginxSitesAvaliablePath}${config.sshConection.length > 0 ? '"':''}`;
                console.log('> ', command);
                let SpawnCheck = spawnCommand(command);
                console.log('Process ID (PID)', SpawnCheck.pid);

                let allowedPort = true;

                SpawnCheck.stdout.on('data', function(data) {
                    if (data.toString().length > 0) {
                        allowedPort = false
                    }
                });
                SpawnCheck.on('close', function(code) {
                    if (allowedPort == true) {
                        resolve({
                            success: 'Porta livre para uso'
                        })
                    } else {
                        resolve({
                            success: 'Porta em uso, selecione outra'
                        })
                    }
                });
            } else {
                resolve({
                    error: 'Porta não definida'
                })

            }
        })
    },
    createAmbient: function(data) {
        return new Promise((resolve, reject) => {
            if (creatingArea === false) {
                creatingArea = true;
                console.log('> Create a new ambient with params:', data);
                var command = `./prepare_branch.sh -a -d -b ${data.branch} `

                if (data.area_name.length > 0) {
                    command += `-n ${data.area_name} `;
                }

                command += `-c -e 172.31.0.99 -f webmaster -g pgsql.production -i ${data.client_name} `;

                if (data.clonar_data === true && data.server_cliente != 'null' && data.server_cliente != null && data.server_cliente.length > 4) {
                    command += `-C -E ${data.server_cliente} -F webmaster -G pma2018 -K ${data.client_name} `;
                }

                command += `-H 172.31.0.60 -I webmaster -J pma2018 -p ${data.porta}`;
                console.log('>', command);

                var CreateProcess = exec(`${config.sshConection.length > 0 ? config.sshConection + ' "':''}export TERM=xterm && cd ${config.pathToPrepareBranch} && ${command}${config.sshConection.length > 0 ?'"':''}`, {
                    maxBuffer: 1024 * 5000
                }, (error, stdout, stderr) => {
                    if (stdout) {
                        creatingArea = false;
                        console.log('Starting instance');
                        var StartProcess = exec(`${config.sshConection.length > 0 ? config.sshConection + ' "':''}export TERM=xterm && cd ${config.pathToPrepareBranch}/projects/${data.area_name.length > 0 ? data.area_name : data.branch} && pm2 start dev-processes-digital-ocean.json --env production${config.sshConection.length > 0 ?'"':''}`, (error, stdout, stderr) => {
                            if (error) {
                                console.log('NAO FOI-1');

                            }
                            if (stderr) {
                                console.log('NAO FOI');
                            }
                            if (stdout) {
                                module.exports.notificarMattermost(`A área ${data.area_name.length > 0 ? data.area_name : data.branch} foi criada! Acesse usando:\nhttp://${data.area_name.length > 0 ? data.area_name : data.branch}-admin.perigeus.com.br\nhttp://${data.area_name.length > 0 ? data.area_name : data.branch}-site.perigeus.com.br`, (data.usuario_mattermost != null && data.usuario_mattermost.length > 0 ? `@${data.usuario_mattermost}` : 'dev-ambientes'))
                            }
                        })
                        console.log('Process ID (PID)', StartProcess.pid);
                    }
                });
                console.log('Process ID (PID)', CreateProcess.pid);

                resolve({
                    icon: 'success',
                    message: `<p style="font-size: 14px;">O processo de criação do ambiente foi iniciado, você será notificado em seu mattermost quando terminar!</p><br>`
                });
            } else {
                resolve({
                    icon: 'error',
                    message: `<p style="font-size: 14px;">Outro processo de criação está em andamento. Tente novamente em alguns minutos</p><br>`
                });
            }
        })
    },
    killPid: function(req) {
        return new Promise((resolve, reject) => {
            if (req.params.pid) {
                console.log(1);
                process.kill(req.params.pid).then(r => {
                    resolve({
                        success: 'Processo parado'
                    });
                }).catch(error => {
                    reject(error)
                })
            }
        })
    },
    notificarMattermost: function(msg, channel) {

        console.log('Enviando alerta no Mattermost');
        var payload = {
            "text": msg,
            "channel": channel,
            "username": "Gerenciador de Áreas Dev",
            "icon_url": "https://tiinside.com.br/wp-content/uploads/2017/08/Char-bot-bots.jpg"
        };
        console.log(payload);

        axios({
            method: 'post',
            url: 'https://team.imoalert.com.br/hooks/61jun68r47y9pc7qsotmd5adth',
            data: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(success => {
            console.log('> Notificado');
        }).catch(error => {
            console.log('ERROR', error);
        })
    },
}