const request = require("request")
const requestPromise = require("request-promise")
const cheerio = require("cheerio")
const fs = require('fs');
const {Parser} = require('json2csv');
const { join } = require("path");
const XLSX = require('xlsx');

let cardCitas = [];
let paginasA = [];
let resultados = [];
let resultadosXlsx = [];


(async() =>{
    try{
        
        let response = await requestPromise('https://quotes.toscrape.com/')
        let $ = cheerio.load(response);

        for (let i = 0; i <10; i++){
            if(i === 0){
                paginasA.push('https://quotes.toscrape.com/')
            }else{
                paginasA.push(`https://quotes.toscrape.com/page/${i+1}`)
            }
        }

        /**for(let citas of paginasA){
            response = await requestPromise(citas);
            $ = await cheerio.load(response);
            $('div[class="quote"] > span.text').each(function(){
                cardCitas.push($(this).text())
            })
        }
        console.log(paginasA)
        console.log(cardCitas)*/

        for (urlVisitada of paginasA.slice(0,11)){
            response = await requestPromise(urlVisitada);
            $ = await cheerio.load(response);
            const cards = $('div[class="col-md-8"]');
            const card = cards.find('.quote');
            card.each(function(index) {
            });

            for (let i = 0; i<card.length;i++){
                let cardActual = $(card[i])
                let cita = cardActual.find('span.text').text();
                let autor = cardActual.find('small.author').text();
                let tag = cardActual.find('a.tag');
                let tags = [];

                for (let j = 0; j < tag.length; j++) {
                    let tagText = $(tag[j]).text();
                    tags.push(tagText);
                }
            

                let Data = {
                    cita : cita,
                    autor : autor,
                    tags : tags
                }

                resultados.push(Data)

                let DataXlsx = {
                    cita : cita,
                    autor : autor,
                    tags : tags.join(', ')
                }

                resultadosXlsx.push(DataXlsx)

                //console.log("La cita es:", cita);
                //console.log("El autor de la cita es:", autor);
                //console.log("Los tags de la cita es:", tags);
            }
            
            

           



            
            //let cita = $('div[class="quote"] > span.text').text()
            //console.log("Cita en texto: ",cita);
            //let autor = $('div[class="quote"] > span >small.author').first().text()  
            //console.log("EL AUTOR DE LA CITA ES",autor)
            //let tags = $('div[class="quote"]>div.tags').find('a.tga').text()
            //console.log("Los tags de la cita SON",tags)
        }
        let data = JSON.stringify(resultados)
            fs.writeFileSync("Resultados JSON", data)
            console.log("ArchivoCreado")
        


         const fields = ['cita','autor','tags']
         const json2csvParse = new Parser({
            fields : fields,
            defaultValue: 'SIN INFO'
         })
         const csv = json2csvParse.parse(resultados)
        fs.writeFileSync('./resultados.csv',csv,"utf-8")
        console.log("Resultados.CSV CREADO ")   

        const worksheet = XLSX.utils.json_to_sheet(resultadosXlsx);

        const workbook= XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook, worksheet, 'CITAS'
        );

        XLSX.writeFile(workbook, 'resultados.xlsx');
        console.log("Se creo el archivo resultados.xlsx")


    }catch(error){
        console.log("Hubo un error")
        console.log("/ ~ error: ", error);
        console.error("Error: ", error);
        console.error(":: Error mensaje::", error.message);
    }
    
})();
