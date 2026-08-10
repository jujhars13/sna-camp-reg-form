import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const opts = new chrome.Options();
opts.addArguments("--headless=new", "--window-size=430,1200", "--no-sandbox");
const driver = await new Builder().forBrowser("chrome").setChromeOptions(opts).build();

const fill = async (dobText) => {
  await driver.get("http://localhost:8080/");
  await driver.wait(until.elementLocated(By.id("dob")), 15000);
  await driver.sleep(800);
  // intercept the network call so nothing is actually written
  await driver.executeScript(`
    window.__sent = null;
    const realFetch = window.fetch;
    window.fetch = (...a) => {
      if (String(a[0]).includes("snacamp")) {
        window.__sent = a[1] && a[1].body;
        return Promise.resolve(new Response("[]", {status: 201, headers:{"Content-Type":"application/json"}}));
      }
      return realFetch(...a);
    };
  `);
  for (const [id, val] of [["firstname","Test"],["surname","Child"],["addressline1","1 Road"],["city","Brum"],["postcode","B1 1AA"],["guardianname","A Parent"],["guardiannumber","07700900000"],["email","a@example.com"]]) {
    const els = await driver.findElements(By.id(id));
    if (els.length) await els[0].sendKeys(val);
  }
  await driver.findElement(By.css('#gender option[value="M"]')).click();
  const tshirt = await driver.findElements(By.css('#tshirtsize option[value="Kids M"]'));
  if (tshirt.length) await tshirt[0].click();
  await driver.findElement(By.id("dob")).sendKeys(dobText);
  const terms = await driver.findElements(By.id("terms"));
  if (terms.length) await driver.executeScript("const t=document.getElementById('terms'); t.checked=true; t.dispatchEvent(new Event('change',{bubbles:true})); t.dispatchEvent(new Event('click',{bubbles:true}));");
  await driver.sleep(300);
  await driver.executeScript("document.getElementById('submit').disabled=false;");
  const formValid = await driver.executeScript("const f=document.getElementById('registrationForm'); return {ok:f.checkValidity(), bad:[...f.elements].filter(e=>!e.checkValidity()).map(e=>e.id)};");
  if (!formValid.ok) console.log("  form invalid, blocking fields:", formValid.bad);
  // report native constraint validity — this is what used to silently block
  const valid = await driver.executeScript("return document.getElementById('dob').checkValidity()");
  await driver.findElement(By.id("submit")).click();
  await driver.sleep(1200);
  let alertText = null;
  try { const a = await driver.switchTo().alert(); alertText = await a.getText(); await a.dismiss(); } catch {}
  const sent = await driver.executeScript("return window.__sent");
  return { valid, alertText, sentDob: sent ? JSON.parse(sent).dob : null };
};

try {
  for (const input of ["10/08/2015", "1/8/2015", "10082015", "10/08/15", "10/08/2024", "10/08/2030", "hello"]) {
    const r = await fill(input);
    console.log(`${JSON.stringify(input).padEnd(13)} nativeValid=${String(r.valid).padEnd(5)} alert=${JSON.stringify(r.alertText)} sent.dob=${JSON.stringify(r.sentDob)}`);
  }
} finally { await driver.quit(); }
