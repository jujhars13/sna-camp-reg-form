const { Builder, By, until } = require("selenium-webdriver");
const { fakerEN_GB } = require("@faker-js/faker");

const chrome = require("selenium-webdriver/chrome");
const chromeOptions = new chrome.Options();
chromeOptions.addArguments(["auto-open-devtools-for-tabs"]);
chromeOptions.setUserPreferences({
  "autofill.profile_enabled": false,
  "disable-notifications": true,
  devtools: {
    preferences: {
      "panel-selectedTab": '"console"',
      currentDockState: '"right"'
    }
  }
});

(async function runTest() {
  // Initialize WebDriver and navigate to the form page
  let driverBuilder = new Builder().forBrowser("chrome");
  driverBuilder.setChromeOptions(chromeOptions);
  let driver = await driverBuilder.build();

  try {
    // Navigate to the form page (adjust the URL to where your form is served)
    //await driver.get("http://localhost:8080/");
    await driver.get("https://snaform.com/");

    // Generate fake data using faker.js
    const firstname = fakerEN_GB.person.firstName();
    const surname = fakerEN_GB.person.lastName();
    const otherNames = fakerEN_GB.person.firstName();
    const gender = fakerEN_GB.helpers.arrayElement(["M", "F"]);
    const dob = fakerEN_GB.date
      .past({ date: 10, dateRef: new Date() })
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    const addressLine1 = fakerEN_GB.location.streetAddress();
    const addressLine2 = fakerEN_GB.location.secondaryAddress();
    const city = fakerEN_GB.location.city();
    const postcode = fakerEN_GB.location.zipCode();
    const guardianName = fakerEN_GB.person.fullName();
    const guardianNumber = fakerEN_GB.phone.number();
    const email = fakerEN_GB.internet.email();
    const allergies = fakerEN_GB.lorem.words(3);
    const yearAttendedBefore = fakerEN_GB.date
      .past({ years: 2, refDate: new Date() })
      .getFullYear();
    console.log(dob);

    // Fill out the form fields
    await driver.findElement(By.id("firstname")).sendKeys(firstname);
    await driver.findElement(By.id("surname")).sendKeys(surname);
    await driver.findElement(By.id("othernames")).sendKeys(otherNames);
    await driver.findElement(By.id("gender")).sendKeys(gender);
    await driver.findElement(By.id("dob")).sendKeys(dob);
    await driver.findElement(By.id("addressline1")).sendKeys(addressLine1);
    await driver.findElement(By.id("addressline2")).sendKeys(addressLine2);
    await driver.findElement(By.id("city")).sendKeys(city);
    await driver.findElement(By.id("postcode")).sendKeys(postcode);
    await driver.findElement(By.id("guardianname")).sendKeys(guardianName);
    await driver.findElement(By.id("guardiannumber")).sendKeys(guardianNumber);
    await driver.findElement(By.id("email")).sendKeys(email);
    await driver.findElement(By.id("tshirtsize")).sendKeys("Adults XS");
    await driver.findElement(By.id("allergies")).sendKeys(allergies);
    await driver.findElement(By.id("notes")).sendKeys(`{testing}`);
    await driver
      .findElement(By.id("yearattendedbefore"))
      .sendKeys(yearAttendedBefore.toString());

    // Submit the form
    await driver.findElement(By.css('button[type="submit"]')).click();

    // Wait for the form submission to be processed (this assumes there's a visible success message)
    // await driver.wait(until.alertIsPresent(), 5000);
    // let alert = await driver.switchTo().alert();
    // let alertText = await alert.getText();
    // await alert.accept();

    // Assert that the submission was successful
    //assert.strictEqual(alertText, "Form submitted successfully!");
    await driver.sleep(60000);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await driver.quit();
  }
})();
