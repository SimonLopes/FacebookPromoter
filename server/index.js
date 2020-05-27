const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const router = express.Router()
const multer = require('multer')
const fb = require('../robots/facebook.js')
const cors = require('cors')

var imagens = []
var sess;
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var dir = './upload'

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir)
        }
        callback(null, dir)
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({ storage : storage }).array('files',20)

var expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 horas de sessao ativa

app.use(cookieParser())
app.use(session({
        name: 'userInfos',
        secret: 'secretKey',
        rolling: true,
        resave: true,
        saveUninitialized: true,
        cookie: {
            expires: expiryDate,
        },
    })
);

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

router.get('/',function(req,res){
    if(typeof sess == 'undefined') {
        res.sendFile(path.join(__dirname+'/index.html'))
    } else {
        if(sess.logged == true){
            res.redirect('/painel')
        } else {
            res.sendFile(path.join(__dirname+'/index.html'))
        }
    }
});
router.get('/painel',function(req,res){
    if(typeof sess != 'undefined') {
        if(sess.logged == true){
            res.sendFile(path.join(__dirname+'/painel.html'))
        } else {
            res.redirect('/')
        }
    } else {
        res.redirect('/')
    }
        
    
});
app.use('/', router);
app.use('/js', express.static(__dirname + '/js'))
app.use('/css', express.static(__dirname + '/css'))
app.use('/upload', express.static(__dirname + '/upload'))

app.post("/getInfos", (req, res) => {
    if(!sess.logged) return false
    upload(req, res, async function(err) {
        if(err) {
            return res.send("Erro ao enviar informações, tente novamente.\n"+err)
        }
        assunto, texto, headless = '' //reseta valores
        imagens = [] //reseta array de fotos
        var assunto = req.body.grupo
        var texto = req.body.texto
        var email = sess.userEmail
        var senha = sess.userSenha
        var headless = (req.body.headless == 'true')
        for (let i = 0; i < req.files.length; i++) {
            var imagem = __dirname + '\\' + req.files[i].path
            imagens.push(imagem)
        }
        
        try {
            await fb.initialize({func: 'post', email, senha, searchTerm: assunto, contentPost: texto, contentImages: imagens, headless})
            res.send("Trabalho concluido!")
        } catch (err) {
            res.send("Erro ao enviar dados ao servidor, tente novamente.\n" + err)
        }
        
    });
});

app.post("/login", (req, res) => {
    upload(req, res, async function(err) {
        if(err) {
            return res.send("Erro ao enviar informações, tente novamente.\n"+err)
        }
        sess = req.session

        var email = req.body.email
        var senha = req.body.senha
        
        try {
            var auth = await fb.initialize({func: 'login', email, senha, headless: true})
            if(auth == 'found'){
                sess.logged = true
                sess.userEmail = email
                sess.userSenha = senha
            }
            await res.status(200).send(auth)
        } catch (err) {
            res.send("Erro ao enviar informações, tente novamente.\n"+err)
        }
    })
});

app.listen(3000, function() {
    console.log('App escutando na porta 3000!')
})