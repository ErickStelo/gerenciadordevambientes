
var app = new Vue({
    el: '#app',
    data: {
        formCreate:{
            clonar_data: false,
            server_cliente: null,
            porta: null,
            branch: null,
            area_name: null,
            client_name: null,
            usuario_mattermost: null
        },
        serverList:[],
        ambientsLists:[],
        formatoExibicao:'lista',
        sizes:[]
    },

    methods: {
        restartAmbient: function(area) {
            console.log(area);
            axios({
                method: 'post',
                url: '/action/restartAmbient',
                data: {
                    ambientName: area,
                },
                timeout: 60000

            }).then(function(response) {
                Swal.close();
                Swal.fire({
                    title: 'Successo!',
                    text: 'Instrução para reiniciar enviado!',
                    icon: 'success',
                    confirmButtonText: 'Fechar'
                })
            }).catch(()=>{
                Swal.close();
                Swal.fire({
                    title: 'Falha ao executar ação',
                    html: '<p style="font-size: 14px;">Houve um erro ao executar ação ou o tempo para resposta terminou</p>',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    icon:'error',
                    willClose: () => {}
                });
            })

        },
        getSizes: function(area) {
            console.log(area);
            axios({
                method: 'get',
                url: '/action/getSizes',
                data: {
                    // ambientName: area,
                },
                timeout: 60000

            }).then(function(response) {
                app.sizes = response.data.sizes
            }).catch(()=>{
                Swal.close();
                Swal.fire({
                    title: 'Falha ao executar ação',
                    html: '<p style="font-size: 14px;">Houve um erro ao executar ação ou o tempo para resposta terminou</p>',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    icon:'error',
                    willClose: () => {}
                });
            })
        },

        removeArea: function(area) {
            Swal.fire({
                title: 'Removendo ambiente',
                html: '<p style="font-size: 14px;">Aguarde enquando o ambiente é removido, isso pode levar alguns minutos</p>',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading()
                },
                willClose: () => {}
            })
            axios({
                method: 'post',
                url: '/action/deleteAmbient',
                data: {
                    ambientName: area,
                },
                timeout: 60000

            }).then(function(response) {
                Swal.close();
                Swal.fire({
                    title: 'Successo!',
                    text: 'O ambiente foi removido!',
                    icon: 'success',
                    confirmButtonText: 'Fechar'
                }).then(result =>{
                    app.getAmbients();
                }).catch(()=>{
                    Swal.close();
                    Swal.fire({
                        title: 'Falha ao executar ação',
                        html: '<p style="font-size: 14px;">Houve um erro ao executar ação ou o tempo para resposta terminou</p>',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        icon:'error',
                        willClose: () => {}
                    });
                })
    
            });
        },

        pullAmbient: function(area) {
            Swal.fire({
                title: 'Atualizando ambiente',
                html: '<p style="font-size: 14px;">Aguarde enquando o ambiente é atualizado</p>',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading()
                },
                willClose: () => {}
            });
            axios({
                method: 'post',
                url: '/action/pullAmbient',
                data: {
                    ambientName: area,
                },
                timeout: 60000

            }).then(function(response) {
                Swal.close();
                Swal.fire({
                    title: 'Successo!',
                    text: 'Comando para pull no ambiente realizado!',
                    icon: 'success',
                    confirmButtonText: 'Fechar'
                }).then(result =>{
                    app.getAmbients();
                })
            }).catch(()=>{
                Swal.close();
                Swal.fire({
                    title: 'Falha ao executar ação',
                    html: '<p style="font-size: 14px;">Houve um erro ao executar ação ou o tempo para resposta terminou</p>',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    icon:'error',
                    willClose: () => {}
                });
            })
        },

        getDataForCreate: function(area) {
            axios({
                method: 'get',
                url: '/action/getDataForCreate',
                data: {},
                timeout: 60000

            }).then(function(response) {
                app.serverList = response.data.serversList
                // console.log(response.data);
            }).catch(()=>{
                Swal.close();
                Swal.fire({
                    title: 'Falha ao executar ação',
                    html: '<p style="font-size: 14px;">Houve um erro ao executar ação ou o tempo para resposta terminou</p>',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    icon:'error',
                    willClose: () => {}
                });
            })

        },

        getAmbients: function(area) {
            axios({
                method: 'get',
                url: '/action/getAmbients',
                data: {},
                timeout: 60000
                
            }).then(function(response) {
                var ambientsOrder = [];
                ambientsOrder = _.orderBy(response.data.ambientList, ['name'], ['asc']);
                app.ambientsLists = ambientsOrder
            }).catch(()=>{
                Swal.close();
                Swal.fire({
                    title: 'Falha ao executar ação',
                    html: '<p style="font-size: 14px;">Houve um erro ao executar ação ou o tempo para resposta terminou</p>',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    icon:'error',
                    willClose: () => {}
                });
            })

        },

        createArea: function() {
            var msg = '';
            if(this.formCreate.clonar_data == true && this.formCreate.ServerCliente === null) msg+='<li><p>Servidor do cliente não selecionado</p></li>';
            if(this.formCreate.porta == null || (this.formCreate.porta.trim()) == 0) msg+='<li><p>Não definida a porta para criação da área</p></li>';
            if(this.formCreate.branch == null || (this.formCreate.branch.trim()) == 0) msg+='<li><p>Não definida a branch que irá rodar</p></li>';
            if(this.formCreate.branch != null && this.formCreate.branch.split(' ').length > 1) msg+='<li><p>Não pode conter espaços na definição da branch</p></li>';
            if(this.formCreate.area_name != null && (this.formCreate.area_name.split(' ')).length > 1) msg+='<li><p>Não pode conter espaços no nome da área</p></li>';
            if(this.formCreate.client_name == null || (this.formCreate.client_name.trim()) == 0) msg+='<li><p>Não informado a pasta/nome do banco cliente</p></li>';
            if(this.formCreate.client_name != null && (this.formCreate.client_name.split(' ')).length > 1) msg+='<li><p>Não pode conter espaços no pasta/nome do banco cliente</p></li>';
            if(this.formCreate.clonar_data === true && (this.formCreate.server_cliente === 'null' || this.formCreate.server_cliente === null)) msg+='<li><p>Servidor do cliente não selecionado</p></li>';

            if(msg.length === 0){

                // Swal.fire({
                //     title: 'Criando ambiente',
                //     html: '<p style="font-size: 14px;">Aguarde enquando o ambiente é criado, isso pode levar alguns minutos</p>',
                //     allowOutsideClick: false,
                //     allowEscapeKey: false,    
                //     didOpen: () => {
                //         Swal.showLoading()
                //     },
                //     willClose: () => {}
                // })
                axios({
                    method: 'post',
                    url: '/action/createArea',
                    data: this.formCreate,
                    timeout: 0
                }).then(function(response) {
                    console.log(response.data);
                    Swal.close();
                    Swal.fire({
                        title: `${response.data.icon === 'success' ? 'Sucesso!' : 'Erro!'}`,
                        html: `${response.data.message}`,
                        icon: `${response.data.icon}`,
                        confirmButtonText: 'Fechar'
                    }).then((result) => {
                        if(response.data.icon === 'success'){
                            window.location.reload(false); 
                        }
                    });
                });

            }else{
                Swal.fire({
                    icon: 'error',
                    html: `
                    <h5>Por favor, verifique as inforações abaixo e tente novamente!</h5><br>
                    <ul>
                        ${msg}
                    </ul>
                    `,
                    showConfirmButton: true,
                });
            }
        },
        
        checkPort: function() {
            if (app.formCreate.porta != null && app.formCreate.porta != '' && parseInt(app.formCreate.porta) >= 9000 && parseInt(app.formCreate.porta) <= 9999) {
                console.log('> Checking port', app.formCreate.porta);
                axios({
                    method: 'post',
                    url: '/action/checkport',
                    data: {
                        port: this.formCreate.porta,
                    },
                    timeout: 60000
                }).then(function(response) {
                    if (response.data.success === 'Porta em uso, selecione outra') {
                        Swal.fire({
                            icon: 'error',
                            text: 'Porta em uso, selecione outra',
                            showConfirmButton: false,
                            timer: 2000
                        });


                    } else if (response.data.success === 'Porta livre para uso') {
                        Swal.fire({
                            icon: 'success',
                            text: 'Porta livre para uso',
                            showConfirmButton: false,
                            timer: 2000
                        })
                    }
                }).catch(()=>{
                    Swal.close();
                    Swal.fire({
                        title: 'Falha ao executar ação',
                        html: '<p style="font-size: 14px;">Houve um erro ao executar ação ou o tempo para resposta terminou</p>',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        icon:'error',
                        willClose: () => {}
                    });
                })
            }else{
                app.formCreate.porta = null;
                Swal.fire({
                    title: `Porta inválida`,
                    html: `Defina uma porta de 9000 até 9999`,
                    icon: `error`,
                    confirmButtonText: 'Fechar'
                })
            }
        },

        helpModal: function(campo){
            var message = 'Sem ajuda para este campo';
            switch (campo) {
                case 'branch_name':
                    message = 'Branch que deverá ser usada para criar a área';
                    break;
                case 'area_name':
                    message = 'Necessário apenas quando já existir uma area usando a mesma branch, exemplo: releaseXXapresentacao, releaseXXdemonstracao. Na falta desse parametro, o nome da area será o mesmo da branch';
                    break;
                case 'usuario_mattermost':
                    message = 'Informe o seu usuário do Mattermost para receber uma notificação assim que a área foi criada, caso contrário, será notificado no canal Dev Ambientes';
                    break;
            }
            Swal.fire({
                // title: `Porta inválida`,
                html: `<p style='font-size: 14px;'>${message}</p>`,
                icon: `info`,
                confirmButtonText: 'Fechar'
            })
        }
    },
    mounted: function () {
        this.getDataForCreate();
        this.getSizes();
    },
})