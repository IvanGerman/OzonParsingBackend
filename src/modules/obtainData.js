const fs = require('fs');
const puppeteer = require('puppeteer-extra')

const obtainData = async () => {

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

    // await page.goto('https://www.ozon.ru/category/pelenki-meditsinskie-6246/?category_was_predicted=true&deny_category_prediction=true&from_global=true&text=%D0%BF%D1%80%D0%BE%D1%81%D1%82%D1%8B%D0%BD%D0%B8+%D0%BE%D0%B4%D0%BD%D0%BE%D1%80%D0%B0%D0%B7%D0%BE%D0%B2%D1%8B%D0%B5', {
    //   waitUntil: 'load'
    // });
    await page.goto('https://www.ozon.ru/brand/soul-way-100258413/', {
      waitUntil: 'load'
    });


    let isItLastPage = false;
    var i = 0;

    const getDataMain = async () => {
      //await page.waitForTimeout(5000);

      const getDataFromPage = await page.evaluate(() => {

        const allBonusSpans = document.querySelectorAll('.iv9 .i2.j0.j2.a0i span');
        console.log('allBonusSpans--', allBonusSpans);
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
      if (i === 55) { break }

      await page.waitForTimeout(5000);
      getDataMain();

      // to do - click only forward button
      const pageNavBtns = await page.$$('a.a2423-a4');
      if (pageNavBtns.length === 2 || pageNavBtns.length === 1) {
        await pageNavBtns[0].click();
      } else {
        await pageNavBtns[1].click()
      }

      console.log('pageNavBtns---', pageNavBtns[0]);

      //await page.click('a.a2423-a4');
      console.log(dataFromAllPages);

      try {
        await page.waitForSelector('a.a2423-a4');
      } catch (error) {
        console.log('errorhandling');
        getDataMain();
        break;
      }


      isItLastPage = (await page.$('a.a2423-a4')) === null;
      console.log('isItLastPage---', isItLastPage);

      if (isItLastPage === true) {
        console.log('last page to get data');
        await page.waitForTimeout(5000);
        getDataMain();
        break;
      }
    }

    fs.writeFile('obtainDataResult.json', JSON.stringify(dataFromAllPages, null, 2), (err) => {
      if (err) { throw err };
      console.log('file saved');
    })
    //await browser.close()
    console.log(`All done`)
  })


}

module.exports = obtainData;
