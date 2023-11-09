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

    await page.goto('https://www.ozon.ru/highlight/bally-za-otzyv-1171518/?currency_price=1.000%3B140.000', {
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
          const itemsss = document.querySelectorAll('a.a2429-a4');
          return itemsss
        }); console.log('aaa----', Boolean(aaa[0]));
        if (aaa[0]) {
          const allBonusSpans = await page.evaluate(() => {

            const singlePageBonusDivsData = [];
            let singleProductData = {};

            const items = document.querySelectorAll('#paginatorContent .b410-b0.tsBodyControl400Small');
            singlePageData222 = Array.from(items);
            //alert(singlePageData222)
            //alert(items[4].innerText); //have to take all attribute data from html elements bevor converting through Array.from
            Array.from(items).forEach(bonusSpan => {
              if (bonusSpan.innerText.includes('за отзыв')) {
                //alert(bonusSpan.innerText)

                let linkToProduct = bonusSpan.closest('a');
                singleProductData.linkToProduct = `ozon.ru${linkToProduct.getAttribute("href")}`;
                let productTitle = linkToProduct.nextElementSibling.children[2].firstChild.firstChild.innerText;
                singleProductData.productTitle = productTitle;
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
          //console.log('singlePageData777777777-',singlePageData);
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
      //console.log('singlePageData222222-',singlePageData)
      return singlePageData
    };

    let i = 0;
    while (true) {

      await page.waitForTimeout(5000);
      i += 1; console.log('i-------', i);
      if (i === 33) {
        //here we take items which bonusValue is bigger than the price of the item
        const goldenItems = [];
        dataFromAllPages.forEach((item) => {
          if (item.bonusValue - 70 > item.productPrice) {
            goldenItems.push(item);
          };
        });
        fs.writeFileSync('LikvidationGoldenItemsResult.json', JSON.stringify(goldenItems, null, 2), (err) => {
          if (err) { throw err };
          console.log('LikvidationGoldenItemsResult.json saved');
        })
        break
      };

      
      let singlePageData2 = await doInfiniteScroll(page);
      //console.log('singlePageData2---', singlePageData2);
      if (singlePageData2 !== undefined) {
        dataFromAllPages.push(...singlePageData2);
      }
      //dataFromAllPages.push(...singlePageData2);
      //console.log('dataFromAllPages', dataFromAllPages);

      console.log('163--------------------');
      console.log(`All done`)

      //let aTagParents = await page.evaluate("document.querySelectorAll('.qe3')");
      
      const aTagParent = await page.$$('.qe3');
      console.log('aTagParent--', aTagParent)
      // const t = await (await aTagParents[aTagParents.length - 1].getProperty('firstChild'))
      // console.log('t-----',t);
      // console.log('aTagParents.firstChild--', aTagParents[aTagParents.length - 1].firstChild);

      const aTagParents = await page.evaluate(() => {
        const ttt =  document.querySelectorAll('.qe3');
        Array.from(ttt).forEach((el) => {
        //alert(el.firstChild);
        })
        return ttt;
        }
      );
      
      console.log('aTagParents--', aTagParents);
      
      const pageNavBtns = await page.$$('a.a2429-a4');
      console.log('pageNavBtns.length--', pageNavBtns.length);
      // have to handle the case when the a-tag changes to a button-tag at the last page
      let isItLastPage = await page.evaluate(() => {
        const ttt =  document.querySelectorAll('.qe3');
        //alert( ttt[ttt.length - 1].firstChild.tagName )
        if ( ttt[ttt.length - 1].firstChild.tagName === 'BUTTON'  ) {
          return true
        }
        return false;
        }
      );
      if ( isItLastPage === true ) {
        console.log('last page now');
      }

      if (pageNavBtns.length === 1) {
        await pageNavBtns[0].click();
      } else {
        await pageNavBtns[1].click();
      }
    }


  })
};
