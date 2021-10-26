const {
    exec
} = require('child_process');
const path = require("path");
const _ = require('lodash');
const req = require('express/lib/request');
const config = require(path.join(__dirname, '../configs.js'))

module.exports = {

    getProjects: function() {
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
            console.log('Process ID (PID)',process.pid);
        })
    },
    removeDev: function(ambientName) {
        return new Promise((resolve, reject) => {
            if (ambientName != undefined && ambientName != '') {
                console.log('> Removing ambient', ambientName);
                var process = exec(`${config.sshConection.length > 0 ? config.sshConection + ' "':''}export TERM=xterm && cd ${config.pathToPrepareBranch} && ./prepare_branch.sh -b ${ambientName} -r -d${config.sshConection.length > 0 ? '"':''}`, (error, stdout, stderr) => {
                    if (error) {
                        console.log('NAO FOI-1', error.message);
                        resolve();
                        
                    }
                    if (stderr) {
                        console.log('NAO FOI', stderr);
                        resolve();
                    }

                    if (stdout) {
                        console.log('FOI')
                        resolve();
                    }
                });
                console.log('Process ID (PID)',process.pid);

            }
        })
    },
    checkPort: function(port) {
        return new Promise((resolve, reject) => {
            if (port != undefined && port != '') {
                console.log('> Checking port', port);
                var process = exec(`${config.sshConection.length > 0 ? config.sshConection + ' "':''}grep -R '${port}' ${config.nginxSitesAvaliablePath}${config.sshConection.length > 0 ? '"':''}`, (error, stdout, stderr) => {
                    if (error) {
                        resolve({
                            success: 'Porta livre para uso'
                        })
                    }
                    if (stdout) {
                        resolve({
                            success: 'Porta em uso, selecione outra'
                        })
                    }
                });
                console.log('Process ID (PID)',process.pid);

            } else {
                resolve({
                    error: 'Porta não definida'
                })
                
            }
        })
    },
    createArea: function(data) {
        return new Promise((resolve, reject) => {
            console.log('> Create a new ambient with params:', data);
            var command = `./prepare_branch.sh -a -d -b ${data.branch} `

            if(data.area_name.length > 0){
                command += `-n ${data.area_name} `;
            }

            command += `-c -e 172.31.0.99 -f webmaster -g pgsql.production -i ${data.client_name} `;
            
            if(data.clonar_data === true && data.server_cliente != 'null' && data.server_cliente.length > 4){
                command += `-C -E ${data.server_cliente} -F webmaster -G pma2018 -K ${data.client_name} `;
            }
            
            command += `-H 172.31.0.60 -I webmaster -J pma2018 -p ${data.porta}`;

            console.log('>>>>>', command);

            var process = exec(`${config.sshConection.length > 0 ? config.sshConection + ' "':''}export TERM=xterm && cd ${config.pathToPrepareBranch} && ${command}${config.sshConection.length > 0 ?'"':''}`, (error, stdout, stderr) => {
                if (error) {
                    console.log('NAO FOI-1', error.message);
                    resolve();
                    
                }
                if (stderr) {
                    console.log('NAO FOI', stderr);
                    resolve();
                }
                if (stdout) {
                    console.log('Starting instance');
                    var process = exec(`ssh webmaster@172.31.0.50 "export TERM=xterm && cd ${config.pathToPrepareBranch}/projects/${data.area_name.length > 0 ? data.area_name : data.branch} && pm2 start dev-processes-digital-ocean.json --env production"`, (error, stdout, stderr) => {
                        if (error) {
                            console.log('NAO FOI-1', error.message);
                            resolve();
                            
                        }
                        if (stderr) {
                            console.log('NAO FOI', stderr);
                            resolve();
                        }
                        if (stdout) {
                            resolve();
                        }
                    })
                    console.log('Process ID (PID)',process.pid);
                }
            });
            console.log('Process ID (PID)',process.pid);
        })
    },
    killPid: function(req) {
        return new Promise((resolve, reject) => {
            if(req.params.pid){
                console.log(1);
                process.kill(req.params.pid).then(r=>{
                    resolve({success: 'Processo parado'});
                }).catch(error =>{
                    reject(error)
                })
            }
        })
    },
}