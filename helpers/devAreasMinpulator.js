const {exec, spawn} = require('child_process');
const path = require("path");
const _ = require('lodash');
const req = require('express/lib/request');
const config = require(path.join(__dirname, '../configs.js'))
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function spawnCommand(command) {
    // var spw = spawn('sh', ['-c', command]);
    var spw = spawn(command, [], {shell: true});
    // spawn('sh', ['-c', command], {stdio: 'inherit'});
    return spw;
} 

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
            console.log('> Create a new ambient with params:', data);
            var command = `./prepare_branch.sh -a -d -b ${data.branch} `

            if (data.area_name.length > 0) {
                command += `-n ${data.area_name} `;
            }

            command += `-c -e 172.31.0.99 -f webmaster -g pgsql.production -i ${data.client_name} `;

            if (data.clonar_data === true && data.server_cliente != 'null' && data.server_cliente.length > 4) {
                command += `-C -E ${data.server_cliente} -F webmaster -G pma2018 -K ${data.client_name} `;
            }

            command += `-H 172.31.0.60 -I webmaster -J pma2018 -p ${data.porta}`;

            var process = exec(`${config.sshConection.length > 0 ? config.sshConection + ' "':''}export TERM=xterm && cd ${config.pathToPrepareBranch} && ${command}${config.sshConection.length > 0 ?'"':''}`, {maxBuffer: 1024 * 5000}, (error, stdout, stderr) => {
                if (stdout) {
                    console.log('Starting instance');
                    var process = exec(`${config.sshConection.length > 0 ? config.sshConection + ' "':''}export TERM=xterm && cd ${config.pathToPrepareBranch}/projects/${data.area_name.length > 0 ? data.area_name : data.branch} && pm2 start dev-processes-digital-ocean.json --env production${config.sshConection.length > 0 ?'"':''}`, (error, stdout, stderr) => {
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
                    console.log('Process ID (PID)', process.pid);
                }
            });
            console.log('Process ID (PID)', process.pid);

            resolve({});

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