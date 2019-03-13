## Installation
```
npm install
npm run build
npm pack
npm install -g ts-rpa-0.0.1.tgz
```

## Usage
```
ts-rpa sample.ts
```

## Sample
```js
import * as RPA from "ts-rpa";

(async () => {
    try {
        await RPA.WebBrowser.get("https://www.google.com/");
        const input = await RPA.WebBrowser.findElement(".gLFyf");
        await RPA.WebBrowser.sendKeys(input, ["RPA"]);
        await RPA.WebBrowser.findElement(
            ".FPdoLc > center:nth-child(1) > input:nth-child(2)"
        ).click();
        await RPA.WebBrowser.takeScreenshot();
    } catch (error) {
        RPA.systemLogger.error(error);
    }
})();
```