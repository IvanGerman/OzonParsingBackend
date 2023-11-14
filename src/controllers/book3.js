const fs = require('fs');
const puppeteer = require('puppeteer-extra');

const { obtainData } = require("../modules/obtainData");


module.exports.postBook = async function (req, res) {
  console.log('postBook------', req.body.link);


  //----------------------------------------------------------------------------------------

  // add stealth plugin and use defaults (all evasion techniques)
  const StealthPlugin = require('puppeteer-extra-plugin-stealth')
  puppeteer.use(StealthPlugin())

  var dataFromAllPages = [];

  // puppeteer usage as normal
  puppeteer.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    userDataDir: 'C:/Users/AlHe/AppData/Local/Google/Chrome/User Data/Default',
    //  args: [
    //   "--proxy-server=31.207.128.79:9876"
    //  ]
  }).then(async browser => {
    console.log('Running tests..');
    const page = await browser.newPage();

    // await page.goto('https://www.ozon.ru/category/shayby-i-gayki-9796/?category_was_predicted=true&deny_category_prediction=true&from_global=true&text=%D0%B3%D0%B0%D0%B9%D0%BA%D0%B0+%D0%BC10', {
    //   waitUntil: 'load'
    // });
    await page.goto('https://www.ozon.ru/seller/agromarket-1222632/products/?currency_price=133.000%3B255.000&miniapp=seller_1222632&sorting=price', {
      waitUntil: 'load'
    });
  


    let isItLastPage = false;
    var i = 0;

    const getDataMain = async () => {
      await page.waitForTimeout(5000);

      const getDataFromPage = await page.evaluate(() => {

        const allBonusSpans = document.querySelectorAll('.iy4 .b410-b div');
        const allBonusSpans2 = document.querySelectorAll('.iy4');
        alert(allBonusSpans2[0]);
        let hrefArr = [];
        let linksArr = [];
        let singleProductData = {};
        Array.from(allBonusSpans).forEach(bonusSpan => {
          if (bonusSpan.innerText.includes('отзыв')) {
            hrefArr.push(bonusSpan.innerText);
            let linkParentOfItem = bonusSpan.closest('a');
            if (linkParentOfItem) {

              let productTitle = linkParentOfItem.nextElementSibling.children[2].firstChild.firstChild.innerText;
              let productPrice = linkParentOfItem.nextElementSibling.firstChild.firstChild.firstChild.innerText;
              let bonusValue = bonusSpan.innerText;
              let linkToProduct = `ozon.ru${linkParentOfItem.getAttribute("href")}`;

              singleProductData.productTitle = productTitle;
              singleProductData.linkToProduct = linkToProduct;

              productPrice = productPrice.replace(/\s+/g, '');
              let numberedProductPrice = productPrice.substring(0, productPrice.length - 1);
              singleProductData.productPrice = Number(numberedProductPrice);

              singleProductData.bonusValue = Number(bonusValue.substring(0, bonusValue.indexOf(' ')));

              linksArr.push({ ...singleProductData });
            }
          }
        });
        return linksArr;
      });

      getDataFromPage.forEach((singleProduct) => {
        dataFromAllPages.push(singleProduct);
      });
    }


    while (isItLastPage !== true) {

      i += 1;
      console.log('iiiiiiiii---', i);
      if (i === 20) { break }

      //await page.waitForTimeout(5000);
      getDataMain();

      // to do - click only forward button
      const pageNavBtns = await page.$$('a.a2429-a4');
      if (pageNavBtns.length === 2 || pageNavBtns.length === 1) {
        await pageNavBtns[0].click();
      } else {
        await pageNavBtns[1].click()
      }

      console.log('pageNavBtns---', pageNavBtns[0]);

      //await page.click('a.a2429-a4');
      console.log(dataFromAllPages);

      try {
        await page.waitForSelector('a.a2429-a4');
      } catch (error) {
        console.log('errorhandling');
        getDataMain();
        break;
      }


      isItLastPage = (await page.$('a.a2429-a4')) === null;
      console.log('isItLastPage---', isItLastPage);

      if (isItLastPage === true) {
        console.log('last page to get data');
        //await page.waitForTimeout(5000);
        getDataMain();
        break;
      }
    }
    
    //sorting dataFromAllPages in order of items with biggest positive difference between bonusValue and price at start (descending order)
    const points = [40, 100, 1, 5, 25, 10];
    points.sort(function(a, b){return b-a});
    

    //here we take items which bonusValue is bigger than the price of the item
    const goldenItems = [];
    dataFromAllPages.forEach((item) => {
      if ( item.bonusValue > item.productPrice ) {
        goldenItems.push(item);
      };
    });
    fs.writeFile('goldenItemsResult.json', JSON.stringify(goldenItems, null, 2), (err) => {
      if (err) { throw err };
      console.log('goldenItemsResult.json saved');
    })


    fs.writeFile('obtainDataResult.json', JSON.stringify(dataFromAllPages, null, 2), (err) => {
      if (err) { throw err };
      console.log('obtainDataResult.json saved');
    })
    //await browser.close()
    console.log(`All done`)

    try {
      console.log('obtainData------')

      res.status(201).json({
        result: dataFromAllPages
      });

    } catch (err) {
      res.status(400).json({
        message: 'error occured'
      })
    }
  })



  //---------------------------------------------------------------------------------------




};

