import {
  Builder,
  By,
  Capabilities,
  Condition,
  ThenableWebDriver,
  WebElement,
  WebElementPromise
} from "selenium-webdriver";
import { Command } from "selenium-webdriver/lib/command";

import * as fs from "fs";
import Logger from "./Logger";

export { until as Until, By, Key } from "selenium-webdriver";

export class WebBrowser {
  public driver: ThenableWebDriver;

  private capabilities: Capabilities;

  public constructor() {
    this.capabilities = Capabilities.chrome();
    this.capabilities.set("chromeOptions", {
      args: [
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--window-size=1980,1200"
      ]
    });
    this.driver = new Builder().withCapabilities(this.capabilities).build();
  }

  public get(url: string) {
    Logger.debug(`WebBrowser.get(${url})`);
    return this.driver.get(url);
  }

  public wait<T>(
    condition: Condition<T> | PromiseLike<T>,
    optTimeout?: number
  ) {
    Logger.debug(`WebBrowser.wait(${condition}, ${optTimeout})`);
    return this.driver.wait(condition, optTimeout);
  }

  public mouseMove(element: WebElementPromise | WebElement) {
    Logger.debug(`WebBrowser.mouseMove(${element})`);
    return this.driver
      .actions()
      .mouse()
      .move({ origin: element })
      .perform();
  }

  public mouseClick(element: WebElementPromise | WebElement) {
    Logger.debug(`WebBrowser.mouseClick(${element})`);
    return this.driver
      .actions()
      .mouse()
      .move({ origin: element })
      .press()
      .release()
      .perform();
  }

  /* eslint-disable class-methods-use-this */
  public sendKeys(
    element: WebElementPromise | WebElement,
    [args]: (string | number | Promise<string | number>)[]
  ) {
    Logger.debug(`WebBrowser.sendKeys(${element})`);
    return element.sendKeys(args);
  }
  /* eslint-enable class-methods-use-this */

  public findElement(selector: string) {
    Logger.debug(`WebBrowser.findElement(${selector})`);
    return this.driver.findElement(By.css(selector));
  }

  public findElements(selector: string) {
    Logger.debug(`WebBrowser.findElement(${selector})`);
    return this.driver.findElements(By.css(selector));
  }

  public findElementById(id: string) {
    Logger.debug(`WebBrowser.findElementById(${id})`);
    return this.driver.findElement(By.id(id));
  }

  public findElementsById(id: string) {
    Logger.debug(`WebBrowser.findElementById(${id})`);
    return this.driver.findElements(By.id(id));
  }

  public findElementByClassName(name: string) {
    Logger.debug(`WebBrowser.findElementByClassName(${name})`);
    return this.driver.findElement(By.className(name));
  }

  public findElementsByClassName(name: string) {
    Logger.debug(`WebBrowser.findElementByClassName(${name})`);
    return this.driver.findElements(By.className(name));
  }

  public findElementByCSSSelector(selector: string) {
    Logger.debug(`WebBrowser.findElementByCSSSelector(${selector})`);
    return this.driver.findElement(By.css(selector));
  }

  public findElementsByCSSSelector(selector: string) {
    Logger.debug(`WebBrowser.findElementByCSSSelector(${selector})`);
    return this.driver.findElements(By.css(selector));
  }

  public findElementByXPath(xpath: string) {
    Logger.debug(`WebBrowser.findElementByXPath(${xpath})`);
    return this.driver.findElement(By.xpath(xpath));
  }

  public findElementsByXPath(xpath: string) {
    Logger.debug(`WebBrowser.findElementByXPath(${xpath})`);
    return this.driver.findElements(By.xpath(xpath));
  }

  public findElementByLinkText(text: string) {
    Logger.debug(`WebBrowser.findElementByLinkText(${text})`);
    return this.driver.findElement(By.linkText(text));
  }

  public async takeScreenshot() {
    Logger.debug(`WebBrowser.takeScreenshot()`);
    const image = await this.driver.takeScreenshot();
    return fs.writeFile(
      `${Math.round(new Date().getTime() / 1000)}.png`,
      image,
      "base64",
      error => {
        if (error != null) {
          Logger.error(error);
        }
      }
    );
  }

  /**
   * Enable file downloads in Chrome running in headless mode
   * @param downloadDir Destination Directory
   */
  public enableDownloadInHeadlessChrome(downloadDir: string) {
    /* eslint-disable no-underscore-dangle */
    const executor = (this.driver as any).getExecutor
      ? (this.driver as any).getExecutor()
      : (this.driver as any).executor_;
    /* eslint-enable no-underscore-dangle */
    executor.defineCommand(
      "send_command",
      "POST",
      "/session/:sessionId/chromium/send_command"
    );
    const params = {
      cmd: "Page.setDownloadBehavior",
      params: {
        behavior: "allow",
        downloadPath: downloadDir
      }
    };
    this.driver.execute(new Command("send_command").setParameters(params));
  }
}

export default new WebBrowser();
