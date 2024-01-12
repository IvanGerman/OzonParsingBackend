const fs = require('fs');
const puppeteer = require('puppeteer-extra');

const { obtainData } = require("../modules/obtainData");
const { resolve } = require('path');


module.exports.postBook = async function (req, res) {
  console.log('postBookkkk------', req.body.link);


  //----------------------------------------------------------------------------------------

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


    // await page.goto('https://www.ozon.ru/highlight/tovary-kampanii-rasprodazha-stoka-auto-1024701/?currency_price=14.000%3B400.000', {
    //   waitUntil: 'load'
    // });

    await page.goto('https://www.ozon.ru/highlight/bally-za-otzyv-1171518/?currency_price=1.000%3B130.000', {
      waitUntil: 'load'
    });



    const doInfiniteScroll = async (page) => {

      let singlePageData;
      // Declare some constants
      const MAXIMUM_NUMBER_OF_TRIALS = 2;
      const MINIMUM_SLEEPING_TIME_IN_MS = 500;
      const MAXIMUM_SLEEPING_TIME_IN_MS = 2000;

      // Utility functions
      const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
      const randomNumber = (minimum, maximum) => Math.floor(Math.random() * maximum) + minimum;
      const randomSleep = () => sleep(randomNumber(MINIMUM_SLEEPING_TIME_IN_MS, MAXIMUM_SLEEPING_TIME_IN_MS));

      // How to get at the bottom of an infinity scroll
      var currentScrollHeight = 0;
      let manualStop = false;
      let numberOfScrolls = 0;
      let numberOfTrials = 0;

      while (numberOfTrials < MAXIMUM_NUMBER_OF_TRIALS && !manualStop) {
        let aaa = await page.evaluate(() => {
          //const itemsss = document.querySelectorAll('a.a2429-a4');
          // ++++++++ these are 'dalshe' a-tag buttons
          const itemsss = document.querySelectorAll('a.e0p');
          return itemsss
        }); console.log('aaa----', Boolean(aaa[0]));
        if (aaa[0]) {
          const allBonusSpans = await page.evaluate(() => {

            const singlePageBonusDivsData = [];
            let singleProductData = {};

            //---------DOM-structure way of element selecting
            // const itemsParent = document.querySelector('body').firstChild.firstChild.firstChild.children.item(2).children.item(1).children.item(1).children.item(6).children.item(0).firstChild.firstChild;
            // const allSections = itemsParent.querySelectorAll('section');
            // const allBonusDivs = [];
            // allSections.forEach((section) => {
            //   let bonusDiv = section.firstChild.firstChild.firstChild.children.item(1);
            //   allBonusDivs.push(bonusDiv);
            // })
            // const items = [...allBonusDivs];
            // alert(items.length)

            
            //usual way of element selecting
            // ++++++++++ items - these are divs with bonus description in them
            const items = document.querySelectorAll('#paginatorContent .b419-b0.tsBodyControl400Small');
            //have to take all attribute data from html elements bevor converting through Array.from
            Array.from(items).forEach(bonusSpan => {
              if (bonusSpan.innerText.includes('отзыв')) {

                let linkToProduct = bonusSpan.closest('a');
                singleProductData.linkToProduct = `ozon.ru${linkToProduct.getAttribute("href")}`;
                let productTitle = linkToProduct.nextElementSibling.querySelector('.tsBody500Medium').innerText;
                singleProductData.productTitle = productTitle;
                let imageLink = linkToProduct.querySelector('.b955-a').src;
                singleProductData.imageLink = imageLink;
                let productPrice = linkToProduct.nextElementSibling.firstChild.firstChild.firstChild.innerText;
                productPrice = productPrice.replace(/\s+/g, '');
                productPrice = productPrice.slice(0, -1);
                singleProductData.productPrice = Number(productPrice);
                let bonusValue = bonusSpan.innerText;
                singleProductData.bonusValue = Number(bonusValue.substring(0, bonusValue.indexOf(' ')));

                singlePageBonusDivsData.push({ ...singleProductData });
              }
            })
            return singlePageBonusDivsData;
          })
          singlePageData = allBonusSpans;
        }

        currentScrollHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await randomSleep();
        let documentBodyScrollHeight = await page.evaluate('document.body.scrollHeight');
        if (currentScrollHeight === documentBodyScrollHeight) {
          // Try another time
          numberOfTrials++;

          console.log(
            `Is it already the end of the infinite scroll? ${MAXIMUM_NUMBER_OF_TRIALS - numberOfTrials} trials left.`,
          );

        } else {
          // Restart the number of consecutive trials
          numberOfTrials = 0;

          // Increment the number of successful scroll
          numberOfScrolls++;

          console.log(`The scroll #${numberOfScrolls} was successful!`);
        }
      }

      console.log('We should be at the bottom of the infinity scroll! Congratulation!');
      console.log(`${numberOfScrolls} scrolls were needed to load all results!`);
      //to watch here what we return from each page
      return singlePageData
    };

    let i = 0;

    const breakInfiniteCycle = () => { 
       //here we take items which bonusValue is bigger than the price of the item
       const goldenItems = [];
       dataFromAllPages.forEach((item, index) => {
        // console.log('item.bonusValue--',item.bonusValue,'  ---', index);
        // console.log('item.productPrice--',item.productPrice,'  ---', index);
         if (item.bonusValue - 40 > item.productPrice) {
           goldenItems.push(item);
         };
         //goldenItems.push(item);
       });   console.log('dataFromAllPages--',dataFromAllPages.length);
             console.log('goldenItems--',goldenItems.length);
       //sorting goldenItems in order of items with biggest positive difference between bonusValue and price at start (descending order)
       goldenItems.forEach((item) => {
        let difference = item.bonusValue - item.productPrice;
        item.difference = difference;     
      });
      let compare = (a, b) => {
        if (a.difference < b.difference) {
            return 1;
        }
        if (a.difference > b.difference) {
            return -1;
        }
        return 0;
      };
      goldenItems.sort(compare);
        console.log('goldenItems.length---',goldenItems.length);
        //here to send response data to the client
        res.send(goldenItems);
       fs.writeFileSync('LikvidationGoldenItemsResult.json', JSON.stringify(goldenItems, null, 2), (err) => {
         if (err) { throw err };
         console.log('LikvidationGoldenItemsResult.json saved');
       })
    }


    while (true) {

      await page.waitForTimeout(5000);
      i += 1; console.log('i-------', i);

      if (i === 8) {
        breakInfiniteCycle();
        break
      };

      
      let singlePageData2 = await doInfiniteScroll(page);
      //console.log('singlePageData2--', singlePageData2, singlePageData2.length);
      if (singlePageData2 !== undefined) {
        dataFromAllPages.push(...singlePageData2);
      };

      let isItLastPage = await page.evaluate(() => {
        const aTagParentDiv =  document.querySelectorAll('.p3e'); //here to adapt to a changed dom-structure
        if ( aTagParentDiv[aTagParentDiv.length - 1].lastChild.tagName === 'BUTTON'  ) {
          return true
        }
        return false;
        }
      );
      if ( isItLastPage === true ) {
        console.log('last page now');
        breakInfiniteCycle();
        break
      }
      console.log(`All done`)     
      
      //const pageNavBtns = await page.$$('a.a2429-a4');
      // ++++++++ these are 'dalshe' a-tag buttons
      const pageNavBtns = await page.$$('a.e0p');

      if (pageNavBtns.length === 1) {
        await pageNavBtns[0].click();
      } else {
        await pageNavBtns[1].click();
      }
    }
  })
};
