import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function run() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  
  let executablePath = '';
  for (const p of paths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  const browser = await puppeteer.launch({ executablePath, headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.toString()));

  try {
    await page.goto('https://vogue-trends.vercel.app', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Page loaded successfully');
    
    // Check root html
    const html = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML : 'no root';
    });
    
    console.log('Root HTML:', html);
  } catch (err) {
    console.error('Failed to load page:', err);
  } finally {
    await browser.close();
  }
}

run();
