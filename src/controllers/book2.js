const fs = require('fs');
const puppeteer = require('puppeteer-extra');

const { obtainData } = require("../modules/obtainData");
const { resolve } = require('path');

module.exports.getBooks = async function (req, res) {
  console.log('getBooks');

  res.status(200).json({
    message: 'okkk!'
  })
  // try {
  //   const allBooks = await Book.find();
  //   res.status(200).json(allBooks);
  // } catch(err) {
  //   res.status(404).json({
  //     message: 'an error occured!'
  //   })
  // }     
};

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

    await page.goto('https://www.ozon.ru/highlight/bally-za-otzyv-1171518/', {
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
      if (i === 36) {
        //here we take items which bonusValue is bigger than the price of the item
        const goldenItems = [];
        dataFromAllPages.forEach((item) => {
          if (item.bonusValue +50 > item.productPrice) {
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
      console.log('singlePageData2---', singlePageData2);

      dataFromAllPages.push(...singlePageData2);
      console.log('dataFromAllPages', dataFromAllPages);

      console.log('163--------------------');
      console.log(`All done`)

      const pageNavBtns = await page.$$('a.a2429-a4');
      //here to handle the case when there are 2 buttons with hthe same classname
      await pageNavBtns[0].click();//from here on to repeat scrolling/getting data/click next page
    }


  })
};








module.exports.deleteBook = async function (req, res) {
  console.log('deleteBook------');

  // try {
  //   // check is this book in DB 
  // const isBookInDB = await Book.findOne({_id: req.params.id});
  // if (!isBookInDB) {
  //   res.status(404).json({
  //     message: 'this book is not in DB!'
  //   })
  // } else { //delete book
  //   await Book.deleteOne({ _id: req.params.id });
  //   res.status(200).json(`${isBookInDB.name} is deleted`);
  // }
  // } catch(err) {
  //   res.status(404).json({
  //     message: 'error occured!'
  //   })
  // }     
};


module.exports.updateBook = async function (req, res) {
  console.log('updateBook------');


  // try {
  //    const result = await Book.findOneAndUpdate({ _id: req.params.id }, { name: req.body.name }, { new: true });
  //    res.status(200).json(`Book has been updated, new book name is: ${result.name} `);
  // } catch {
  //     res.status(400).json({
  //     message: 'error occured'
  //     })
  //   }
};
