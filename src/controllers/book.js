const fs = require('fs');
const puppeteer = require('puppeteer-extra');

const { obtainData } = require("../modules/obtainData");
const { resolve } = require('path');


module.exports.postBook = async function (req, res) {
  console.log('postBookkkk------', req.body.link);

  // add stealth plugin and use defaults (all evasion techniques)
  const StealthPlugin = require('puppeteer-extra-plugin-stealth')
  puppeteer.use(StealthPlugin())

  var dataFromAllPages = [];

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


    await page.goto('https://www.ozon.ru/seller/agromarket-1222632/products/?currency_price=133.000%3B255.000&miniapp=seller_1222632&sorting=price', {
      waitUntil: 'load'
    });
    
    // await page.goto('https://www.ozon.ru/brand/soul-way-100258413/', {
    //   waitUntil: 'load'
    // });

    // const html = await page.content()
    // console.log('html---',html)

    var i = 0;

    const getDataMain = async () => {

      const getDataFromPage = await page.evaluate(() => {

        const allBonusSpans = document.querySelectorAll('.b410-b0');
        alert('allBonusSpans--',allBonusSpans)
        let hrefArr = [];
        let linksArr = [];
        let singleProductData = {};
        Array.from(allBonusSpans).forEach(bonusSpan => {
          if (bonusSpan.innerText.includes('отзыв')) {
            hrefArr.push(bonusSpan.innerText);
            let linkParentOfItem = bonusSpan.closest('a');
            if (linkParentOfItem) {
              //here we have to fix the problem of not same paths to elements, paths can be others depending on page we visit
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


    while (true) {

      i += 1;
      if (i === 20) { break }

      await page.waitForTimeout(5000);
      getDataMain();

      const pageNavBtns = await page.$$('a.a2429-a4');
      if (pageNavBtns.length === 2 || pageNavBtns.length === 1) {
        await pageNavBtns[0].click();
      } else {
        await pageNavBtns[1].click();
      }

      console.log(dataFromAllPages);

      try {
        await page.waitForSelector('a.a2429-a4');
      } catch (error) {
        console.log('errorhandling111');
        await getDataMain();
        console.log('errorhandling222');
        break;
      }
    }

    //sorting dataFromAllPages in order of items with biggest positive difference between bonusValue and price at start (descending order)
    //const points = [40, 100, 1, 5, 25, 10];
    //points.sort(function(a, b){return b-a});


    //here we take items which bonusValue is bigger than the price of the item
    const goldenItems = [];
    dataFromAllPages.forEach((item) => {
      if (item.bonusValue > item.productPrice) {
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
      console.log('sending response------')

      res.status(201).json({
        result: dataFromAllPages
      });

    } catch (err) {
      res.status(400).json({
        message: 'error occured'
      })
    }
  })
};
