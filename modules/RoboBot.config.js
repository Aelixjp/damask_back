import { Dimension } from "../scripts/utils/utils.js";

const windowSize = new Dimension(1920, 1080);

export const browserConfigs = {
    headless: false, 
    defaultViewport: null,
    args: [
        '--no-sandbox',
        '--start-maximized',
        `--window-size=${windowSize.width},${windowSize.height}`,
        '--ignore-certificate-errors',
        //'--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36'
    ]
};