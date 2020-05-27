var inputFiles = [];
function newInput(input) {
    for (let i = 0; i < input.files.length; i++) {
        inputFiles.push(input.files[i]);
        var fileName = input.files[i].name
        var reader = new FileReader();
        reader.onload = function(e) {
            $('.view-images').append(`<div class="image" onclick="removeFoto(this)" id="${fileName}" style='background-image: url("${e.target.result}");'><i class="icon icon-delete far fa-trash-alt"></i></div>`)
        }
        reader.readAsDataURL(input.files[i]);
    }
    document.getElementById("imagem").value = "";

}

$('#imagem').change(function() {
    newInput(this)
})
function removeFoto(e){
    inputFiles = inputFiles.filter(function(file) {
        return file.name !== e.id;
    })
    $(e).remove();
}

$(document).ready(function(){
    $("#send").click(function(e) {
        e.preventDefault();
        
        var grupo = $('#grupo').val()
        var texto = $('#texto').val()
        var headless = $('#headless').is(':checked')
        var totalfiles = inputFiles.length;

        var form_data = new FormData();

        for (var index = 0; index < totalfiles; index++) {
            form_data.append("files", inputFiles[index]);
        }
        form_data.append('grupo', grupo);
        form_data.append('texto', texto);
        form_data.append('headless', headless);

        
        $.ajax({
            url: "http://localhost:3000/getInfos",
            dataType: 'text', 
            cache: false,
            contentType: false,
            processData: false,
            enctype: "multipart/form-data",
            data: form_data,  
            type: 'POST',
            success: function(data){
                alert(data);
            }
        });
        alert("Dados enviados, aguardando resposta do servidor!");

    });
})
