const puppeteer = require('puppeteer');
const fs = require('fs');

let page;
let browser;

//Opens browser
const initPuppeteer = async () => {
	browser = await puppeteer.launch({
		defaultViewport: null,
		headless: false, //Headless option
		slowMo: 50, //Slow the speed
	});
	page = await browser.newPage();
};

const goToUrl = async (url) => {
	page.goto(url);
};

const mainFunc = async () => {
	const ebayUrl = 'https://www.ebay.com/';
	const searchInputSelector = `input[placeholder="Search for anything"]`;
	const listItemSelector = `div div ul li div div div a div img`;
	await initPuppeteer();
	await goToUrl(ebayUrl);
	await page.waitForSelector(searchInputSelector);
	await page.click(searchInputSelector);
	await page.keyboard.type('sports card');
	await page.keyboard.press('Enter');
	await page.waitForSelector(listItemSelector);
	await page.screenshot({
		path: `./${Date.now().toString()}.png`,
	});

	const itemNames = await page.evaluate(() => {
		const itemTitleSelector = `div div div ul li div div a h3`;
		const titleList = Array.from(
			document.querySelectorAll(itemTitleSelector)
		);
		const titleString = titleList.map(({ innerText }) => innerText);
		return titleString;
	});
	console.log({ itemNames });
	await browser.close();
};
mainFunc();
