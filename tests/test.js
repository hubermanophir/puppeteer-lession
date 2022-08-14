const puppeteer = require('puppeteer');
const assert = require('assert');
const { describe, it, before, after } = require('mocha');
const fs = require('fs');
const pixelmatch = require('pixelmatch');
const path = 'file://' + __dirname + '/index.html';

let page;
let browser;

describe('Test puppeteer', () => {
	before(async () => {
		browser = await puppeteer.launch({
			headless: false, //Headless option
			slowMo: 50, //Slow the speed
			args: ['--disable-web-security'],
		});
		page = await browser.newPage();
	});
	after(async () => {
		await browser.close();
	});

	it('Should work', async () => {
		await page.goto(path);
		//to get the element path go to browser elements in dev tools right click -> copy -> copy selector
		await page.waitForSelector('#change-text');

		const beforeEl = await page.$eval('#title', (elem) => elem.innerText);
		await page.click('#change-text');
		const afterEl = await page.$eval('#title', (elem) => elem.innerText);

		assert.notEqual(afterEl, beforeEl);
	});
});
