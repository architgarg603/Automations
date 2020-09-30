
let fs = require("fs");
let puppeteer = require("puppeteer");
let tab;
let NewNotices=[];


async function start(){
    
    try{
    
        let browser = await puppeteer.launch({ headless : false,
                                                defaultViewport : null,
                                                args : ["--start-maximized"],
                                                // slowmo : 50
                                                
        });
        
        let allpages = await browser.pages();
        tab = allpages[0];
        
        await tab.goto("https://adgitmdelhi.ac.in/");
        await tab.waitForSelector("#mega-menu-item-15235");
        await tab.click("#mega-menu-item-15235");
        await tab.waitForSelector("#mega-menu-item-15242");
        await Promise.all([tab.click("#mega-menu-item-15242"),tab.waitForNavigation({ waitUntil:"networkidle0"})]);
        
        let allArticle = await tab.$$('div[data-cur-page="1"] article h3 a');
        let allDetails = [];
        for(let i=0;i<allArticle.length;i++){
            let link = await tab.evaluate(  function(elem){  return elem.getAttribute("href")  }  , allArticle[i] );
            let name = await tab.evaluate( function(elem){  return elem.innerText }, allArticle[i]);
            
            let entry =  {
                Name : name,
                Link : link
            }
            
         allDetails.push(entry);   
        }
        allDetails = JSON.stringify(allDetails);
         await createList(allDetails);
         tab.close();
         
        }
        catch(err){
            console.log(err);
        }
        
    };
    
async function createList(allDetails){
    try{
        let check = isFile();
    
        if(check){
           
            let oldNotices = await fs.readFileSync("AllNotices.json");  //get old notices in array
            oldNotices = await JSON.parse(oldNotices);

            fs.writeFileSync("AllNotices.json" , allDetails);  //  make All Notices file
            allDetails  = await JSON.parse(allDetails);
            
            NewNotices = [];
            console.log(oldNotices.length, allDetails.length);
            if(oldNotices.length == allDetails.length){
                NewNotices = JSON.stringify(NewNotices);   // make NewNotices file
                fs.writeFileSync("NewNotices.json" , NewNotices);

            }else{

                for(let i=0;i<allDetails.length - oldNotices.length; i++){
                    NewNotices.push(allDetails[i]);
                }
                
                NewNotices = JSON.stringify(NewNotices);  
                fs.writeFileSync("NewNotices.json" , NewNotices);   // make NewNotices file
                
            }
            
        }else{
            
            console.log("part3");
            fs.writeFileSync("AllNotices.json" , allDetails);  // make AllNotices file
            fs.writeFileSync("NewNotices.json" , allDetails);  // make NewNotices file

        }
 
    }
    catch(err){
        console.log(err);
    }
        
    
}

function isFile(){
    return  fs.existsSync("AllNotices.json");
}


setInterval(start,30000);