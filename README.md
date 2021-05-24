[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][circleci-image]][circleci-url]
[![Dependencies Status][dependencies-image]][dependencies-url]

**[Documentation](https://ca-rpa.github.io/ts-rpa/)**

## Installation
```
npm i -g ts-rpa
```

## Requirements
### Installation
- chromedriver

### Enviroment
```
export NODE_PATH=$(npm root -g)
export WEB_BROWSER_HEADLESS=true
export GOOGLE_CLIENT_SECRET=************************
export GOOGLE_CLIENT_ID=************-********************************.apps.googleusercontent.com
export WORKSPACE_DIR=./tmp/

# If you plan to use `RPA.GCP` module, you need to set a service account key file.
# https://cloud.google.com/docs/authentication/getting-started
export GOOGLE_APPLICATION_CREDENTIALS=************-************.json
```

## Usage
```
ts-rpa sample.ts
```

## Sample
```js
import RPA from "ts-rpa";

(async () => {
  try {
    await RPA.WebBrowser.get("https://www.google.com/");
    const input = await RPA.WebBrowser.findElement(".gLFyf");
    await RPA.WebBrowser.sendKeys(input, ["RPA"]);
    const element = await RPA.WebBrowser.findElement(
      ".FPdoLc > center:nth-child(1) > input:nth-child(2)"
    );
    await RPA.WebBrowser.mouseClick(element);
    await RPA.sleep(3000);
    await RPA.WebBrowser.takeScreenshot();
  } catch (error) {
    RPA.SystemLogger.error(error);
  } finally {
    await RPA.WebBrowser.quit();
  }
})();
```
[npm-image]: https://img.shields.io/npm/v/express.svg
[npm-url]: https://npmjs.org/package/ts-rpa
[downloads-image]: https://img.shields.io/npm/dm/ts-rpa.svg
[downloads-url]: https://npmjs.org/package/ts-rpa
[circleci-image]: https://circleci.com/gh/ca-rpa/ts-rpa.svg?style=shield
[circleci-url]: https://circleci.com/gh/ca-rpa/ts-rpa
[dependencies-image]: https://david-dm.org/ca-rpa/ts-rpa/status.svg
[dependencies-url]: https://david-dm.org/ca-rpa/ts-rpa
