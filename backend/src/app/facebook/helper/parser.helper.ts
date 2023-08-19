// import { By, Builder, Browser, WebDriver } from "selenium-webdriver";
// import firefox from "selenium-webdriver/firefox";
// import assert from "assert";

// const options: any = new firefox.Options();
// // enable debugger for CDP
// options.enableDebugger();

// export async function test() {
//   const driver = await new Builder()
//     .forBrowser("firefox")
//     .setFirefoxOptions(options)
//     .build();
//   await driver.get("https://www.facebook.com/");
//   let title = await driver.getTitle();

//   await driver.manage().setTimeouts({ implicit: 500 });
//   await driver.manage().window().maximize();
//   const isLogin = await login(driver, {
//     username: "multiplatform00@gmail.com",
//     password: "QwertyWeb123",
//   });
//   if (isLogin) {
//     await search(driver, "android");
//   }
//   return title;
// }

// async function login(
//   driver: WebDriver,
//   auth: { username: string; password: string }
// ): Promise<boolean> {
//   try {
//     let email = await driver.findElement(By.id("email"));
//     let password = await driver.findElement(By.id("pass"));
//     let button = await driver.findElement(By.name("login"));

//     // let devTools = await driver.

//     await email.sendKeys(auth.username);
//     await password.sendKeys(auth.password);
//     await button.click();
//     return true;
//   } catch (err) {
//     return false;
//   }
// }

// async function search(driver: WebDriver, query: string) {
//   try {
//     let input = await driver.findElements(By.css("input"));
//     input.forEach(async (element, i) => {
//       let role = await element.getAttribute("role");
//       console.log(role);
//     });

//     return true;
//   } catch (err) {
//     return false;
//   }
// }
