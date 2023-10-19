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

    
    await page.goto('https://www.ozon.ru/highlight/tovary-kampanii-rasprodazha-stoka-auto-1024701/?currency_price=14.000%3B400.000', {
      waitUntil: 'load'
    });
    

    const doInfiniteScroll = async (page) => {

      // Declare some constants
      const MAXIMUM_NUMBER_OF_TRIALS = 5;
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
        });  console.log('aaa----', Boolean(aaa[0]));
        if (aaa[0]) {
          const allBonusSpans = await page.evaluate(() => {
            const items = document.querySelectorAll('#paginatorContent .b410-b0');
            return items
          })
          console.log('allBonusSpans---',allBonusSpans);
          console.log(Object.getOwnPropertyNames(allBonusSpans[0]) );
          // Array.from(allBonusSpans).forEach((bonusSpan) => {
          // alert(bonusSpan.innerText);
          // })
          let hrefArr = [];
        let linksArr = [];
        let singleProductData = {};
        // Array.from(allBonusSpans).forEach(bonusSpan => {
        //   if (bonusSpan.innerText.includes('за отзыв')) {
        //     hrefArr.push(bonusSpan.innerText);
        //     let linkParentOfItem = bonusSpan.closest('a');
        //     if (linkParentOfItem) {
        //       //here we have to fix the problem of not same paths to elements, paths can be others depending on page we visit
        //       let productTitle = linkParentOfItem.nextElementSibling.children[2].firstChild.firstChild.innerText;
        //       let productPrice = linkParentOfItem.nextElementSibling.firstChild.firstChild.firstChild.innerText;
        //       let bonusValue = bonusSpan.innerText;
        //       let linkToProduct = `ozon.ru${linkParentOfItem.getAttribute("href")}`;

        //       singleProductData.productTitle = productTitle;
        //       singleProductData.linkToProduct = linkToProduct;

        //       productPrice = productPrice.replace(/\s+/g, '');
        //       let numberedProductPrice = productPrice.substring(0, productPrice.length - 1);
        //       singleProductData.productPrice = Number(numberedProductPrice);

        //       singleProductData.bonusValue = Number(bonusValue.substring(0, bonusValue.indexOf(' ')));

        //       linksArr.push({ ...singleProductData });
        //     }
        //   }
        // });
        console.log('linksArr---',linksArr);
        return linksArr;

        }

        
        // Keep the current scroll height
        currentScrollHeight = await page.evaluate('document.body.scrollHeight');//document.body.scrollHeight;

        // Scroll at the bottom of the page
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        //window.scrollTo(0, currentScrollHeight);

        // Wait some seconds to load more results
        await randomSleep();

        // If the height hasn't changed, there may be no more results to load
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

    };
    await doInfiniteScroll(page);


    var i = 0;

    const getDataMain = async () => {

      const getDataFromPage = await page.evaluate(() => {

        const allBonusSpans = document.querySelectorAll('.wi4 .b410-b0');

        let hrefArr = [];
        let linksArr = [];
        let singleProductData = {};
        Array.from(allBonusSpans).forEach(bonusSpan => {
          if (bonusSpan.innerText.includes('за отзыв')) {
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

  console.log('163--------------------');
    while (true) {

      i += 1;
      if (i === 20) { break }

      await page.waitForTimeout(5000);
      getDataMain();

      const pageNavBtns = await page.$$('a.a2429-a4');
      console.log('pageNavBtns.length---', pageNavBtns.length);
      if (pageNavBtns.length === 2 || pageNavBtns.length === 1) {
        await pageNavBtns[0].click();
        await doInfiniteScroll(page);
      } else {
        await pageNavBtns[1].click();
        await doInfiniteScroll(page);
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



  //---------------------------------------------------------------------------------------




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
