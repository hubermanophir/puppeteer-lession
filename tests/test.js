const puppeteer = require('puppeteer');
const assert = require('assert');
const { describe, it, before, after } = require('mocha');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const path = 'file://' + __dirname + '/index.html';

let page;
let browser;

function compareScreenshots(testImageName, testNum) {
	return new Promise((resolve, reject) => {
		const img1 = fs
			.createReadStream(`./tests/${testImageName}`)
			.pipe(new PNG())
			.on('parsed', doneReading);
		const img2 = fs
			.createReadStream(`./tests/base.png`)
			.pipe(new PNG())
			.on('parsed', doneReading);

		let filesRead = 0;
		function doneReading() {
			// Wait until both files are read.
			if (++filesRead < 2) return;

			// The files should be the same size.
			assert.equal(img1.width, img2.width);
			assert.equal(img1.height, img2.height);

			// Do the visual diff.
			const diff = new PNG({ width: img1.width, height: img2.height });
			const numDiffPixels = pixelmatch(
				img1.data,
				img2.data,
				diff.data,
				img1.width,
				img1.height,
				{ threshold: 0.1 }
			);

			// The files should look the same.
			fs.writeFileSync(
				`./tests/diff${testNum}.png`,
				PNG.sync.write(diff)
			);
			assert.equal(numDiffPixels, 0);
			resolve();
		}
	});
}

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

	it('Simple text evaluation before and after', async () => {
		await page.goto(path);
		//to get the element path go to browser elements in dev tools right click -> copy -> copy selector
		await page.waitForSelector('#change-text');
		const beforeEl = await page.$eval('#title', (elem) => elem.innerText);
		await page.click('#change-text');
		const afterEl = await page.$eval('#title', (elem) => elem.innerText);
		assert.notEqual(afterEl, beforeEl);
	});
	it('Image test similar', async () => {
		const testImageName = 'test-image.png';
		page.setViewport({ width: 800, height: 600 });
		await page.goto(path);
		await page.waitForSelector('#show-image');
		await page.click('#show-image');
		await page.screenshot({
			path: `./tests/${testImageName}`,
		});
		await page.waitForSelector('#dog-image');
		return compareScreenshots(testImageName, 1);
	});
	it('Image test similar', async () => {
		const testImageName = 'test-image.png';
		page.setViewport({ width: 800, height: 600 });
		await page.goto(path);
		await page.waitForSelector('#show-image');
		await page.click('#show-image');
		await page.click('#switch-image');
		await page.screenshot({
			path: `./tests/${testImageName}`,
		});
		await page.waitForSelector('#dog-image');
		return compareScreenshots(testImageName, 2);
	});
});
