$(document).ready(function(){
    $("#send").click(function(e) {
        e.preventDefault();
        
        $('.spinner').removeClass('hidden')
        $('.text').addClass('hidden')
        $('.submit').addClass('loading')
        $('.submit').prop('disabled', true);

        var email = $('#email').val()
        var senha = $('#senha').val()
        var form_data = new FormData();
        form_data.append('email', email);
        form_data.append('senha', senha);

        $.ajax({
            url: "http://localhost:3000/login",
            dataType: 'text',
            cache: false,
            contentType: false,
            data: form_data,
            type: 'POST',
            processData: false,
            success: function(data){
                if(data == 'found'){
                    window.location.replace('/painel')
                } else {
                    
                    $('.spinner').addClass('hidden')
                    $('.text').removeClass('hidden')
                    $('.submit').removeClass('loading')
                    $('.submit').prop('disabled', false)
                    $('.submit').addClass('error')
                    $('.text').html('ERRO')
                    $('.text').css('color', 'rgb(250, 92, 92)')
                    setTimeout(() => {
                        $('.text').html('Entrar')
                        $('.submit').removeClass('error')
                        $('.text').css('color', 'white')
                    }, 3000)
                    alert(data)
                }
            },
            error: function(request, status, erro) { console.log(status); console.log(erro) }
        });

    });
})