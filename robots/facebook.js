const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.facebook.com/'

const facebook = {
    browser: null,
    page: null,

    initialize: async ({func, email, senha, searchTerm, contentPost, contentImages , headless}) => {
        facebook.browser = await puppeteer.launch({
            headless: headless, //true = navegador oculta; false = navegador visivel durante execucao
            args: [
                '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3803.0 Safari/537.36',
                '--lang=pt-BR,pt;q=0.9',
            ],
        }) //Headers do navegador
        facebook.page = await facebook.browser.newPage() //Iniciar pagina
        await facebook.browser.defaultBrowserContext().overridePermissions(BASE_URL, ['notifications']); //Bloquear notificaçoes

        switch (func) { //verfica qual funcao enviada pelo request
            case 'post':
                await facebook.login(email, senha)
                var listGroupsLength = await facebook.openGroups(searchTerm) //extracao da lista de grupos em q o usuario participa
                for (let i =0; i < listGroupsLength.length; i++) {
                    var listGroups = await facebook.page.$$('._1glk._6phc.img')
                    try {
                        listGroups[i].click()
                        await facebook.postingInGroups(contentPost, contentImages)
                    } catch (e) {
                        var listGroups = await facebook.page.$$('._1glk._6phc.img')        
                        listGroups[i].click()
                        await facebook.postingInGroups(contentPost, contentImages)
                    }
                    await facebook.page.waitFor(3000)
                    await facebook.page.goBack()
                }
                await facebook.page.waitFor(2000)
                await facebook.browser.close()
                break;
            case 'login':
                await facebook.login(email, senha) //efetua o login
                return await facebook.verifyUser() //verifica se usuario existe
                break;
            default:
                return 'invalid or null func parameter error'
                break;
        }

    },

    login: async (email, senha) => {
        await facebook.page.goto(BASE_URL, { waitUntil: 'networkidle2' })
        await facebook.page.type('input[name="email"]', email, { delay: 5 })
        await facebook.page.type('input[name="pass"]', senha, { delay: 5 })
        await facebook.page.waitFor(1000)
        await Promise.all([
            facebook.page.click('#u_0_b'),
            facebook.page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);
    },

    verifyUser: async () => {
        await facebook.page.$('body');
        var is_logged = await facebook.page.evaluate(() => document.querySelector('._3qcu._cy7') !== null);
        if (is_logged){
            await facebook.page.waitFor(2000)
            await facebook.browser.close()
            return 'found'
        } else{
            await facebook.page.waitFor(2000)
            await facebook.browser.close()
            return 'User not found!'
        }
    },

    openGroups: async (searchTerm) => {
        try {
            await facebook.page.waitFor(3000)
            await facebook.page.type('input[name=q]', searchTerm, { delay: 20 })
            await facebook.page.click('._42ft._4jy0._4w98')
            await facebook.page.waitFor(3000)
        } catch (e) {
            await facebook.page.waitFor(3000)
            await facebook.page.type('input[name=q]', searchTerm, { delay: 20 })
            await facebook.page.click('._42ft._4jy0._4w98')
            await facebook.page.waitFor(3000)
        }
        

        groupButton = await facebook.page.$x('//div[contains(text(), "Grupos")]')
        await groupButton[0].click()
        await facebook.page.waitFor(2000)

        myGroupButton = await facebook.page.$x('//span[contains(text(), "Meus grupos")]')
        await myGroupButton[0].click()
        await facebook.page.waitFor(2000)
        
        var listGroupsLength = await facebook.page.$$('._1glk._6phc.img')

        return listGroupsLength
    },
    postingInGroups: async(contentPost, contentImages) => {
        await facebook.page.waitFor('div[aria-label="Criar uma publicação"]', {"timeout": 180000});
        await facebook.page.keyboard.press('KeyP');
        await facebook.page.waitFor(1000)
        await facebook.page.type('._1mf._1mj', contentPost, { delay: 5 });
        await facebook.page.waitFor(1000)

        for (let i = 0; i < contentImages.length; i++) {
            var input = await facebook.page.$('span._m._5g_r a div._3jk input[type=file]')
            var urlFile = contentImages[i]
            await input.uploadFile(urlFile)
        }

        var is_disabled = await facebook.page.evaluate(() => document.querySelector('div[aria-label="Criar uma publicação"] button[disabled]') !== null);

        while (is_disabled == true){
            is_disabled = await facebook.page.evaluate(() => document.querySelector('div[aria-label="Criar uma publicação"] button[disabled]') !== null);
            await facebook.page.waitFor(1000)
        }

        await facebook.page.click('div[aria-label="Criar uma publicação"] button[type=submit]')
    }

}

module.exports = facebook