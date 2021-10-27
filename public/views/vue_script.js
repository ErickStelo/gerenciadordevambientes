

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
                timeout: 0

            }).then(function(response) {
                Swal.close();
                Swal.fire({
                    title: 'Successo!',
                    text: 'Instrução para reiniciar enviado!',
                    icon: 'success',
                    confirmButtonText: 'Fechar'
                })
            });
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
                timeout: 0

            }).then(function(response) {
                Swal.close();
                Swal.fire({
                    title: 'Successo!',
                    text: 'O ambiente foi removido!',
                    icon: 'success',
                    confirmButtonText: 'Fechar'
                }).then(result =>{
                    app.getAmbients();
                })
            });
        },

        getDataForCreate: function(area) {
            axios({
                method: 'get',
                url: '/action/getDataForCreate',
                data: {},
                timeout: 0

            }).then(function(response) {
                app.serverList = response.data.serversList
                // console.log(response.data);
            });
        },

        getAmbients: function(area) {
            axios({
                method: 'get',
                url: '/action/getAmbients',
                data: {},
                timeout: 0

            }).then(function(response) {
                app.ambientsLists = response.data.ambientList
                console.log(response.data);
            });
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
            console.log('> Checking port', app.formCreate.porta);
            axios({
                method: 'post',
                url: '/action/checkport',
                data: {
                    port: this.formCreate.porta,
                },
                timeout: 0
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
            });
        }
    },
    mounted: function () {
        this.getDataForCreate();
    },
})