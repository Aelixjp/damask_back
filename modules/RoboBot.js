import puppeteer from "puppeteer";

export default class RoboBot
{

    constructor(browserConfigs)
    {
        this.pageURL;
        this.currPageID = 1;
        this.browserConfigs = browserConfigs;
    }

    async setup()
    {
        this.browser = await puppeteer.launch(this.browserConfigs);
        this.page = await this.browser.pages().then(p => p[0]);
    }

    selectShop(pageID)
    {
        this.currPageID = pageID;
    }

    navigate(pageID)
    {
        this.pageID   = RoboBot.allowedShops[pageID - 1]["id"];
        this.pageType = RoboBot.allowedShops[pageID - 1]["name"];
        this.pageURL  = RoboBot.allowedShops[pageID - 1]["url"];
        
        return this.page.goto(this.pageURL);
    }

    async searchProduct(search, args)
    {
        await this.navigate(this.currPageID);

        switch(this.pageType)
        {
            case "Amazon":
                return await this.searchProductForAmazon(search, args);

            case "Aliexpress":
                return await this.searchProductForAliexpress(search, args);

            case "Mercadolibre":
                return await this.searchProductForMercadolibre(search, args);

            default:
                break;
            
        }
    }

    async searchProductForMercadolibre(search, args)
    {
        let res = [];
        let srchSize = 25;

        const inputMinPrice = "input[data-testid='Minimum-price']";
        const inputMaxPrice = "input[data-testid='Maximum-price']";
        const inputSubmit   = "button[data-testid='submit-price']";
        const entrySelector = ".andes-card";

        await this.page.waitForSelector("#cb1-edit");
        await this.page.click("#cb1-edit");
        await this.page.type("#cb1-edit", `${search}`, { delay: 2 });
        await this.page.click("body > header > div > form > button");

        if(Object.entries(args).length > 0)
        {
            const { minPrice, maxPrice, searchSize } = args;

            srchSize = searchSize || srchSize;

            if(minPrice && maxPrice)
            {
                await this.page.waitForSelector(inputMinPrice);
                await this.page.waitForSelector(inputMaxPrice);

                await this.page.click(inputMinPrice);
                await this.page.focus(inputMinPrice);
                await this.page.keyboard.type(`${minPrice}`, { delay: 2 });

                await this.page.click(inputMaxPrice);
                await this.page.focus(inputMaxPrice);
                await this.page.keyboard.type(`${maxPrice}`, { delay: 2 });

                await this.page.evaluate(e => { const inp = document.querySelector(e); inp.click(); }, inputSubmit);
            }
        }

        await this.page.waitForSelector(entrySelector);

        res = await this.page.evaluate((e, s) =>{
            let r = [];
            const cards = [...document.querySelectorAll(e)].slice(0, s); let i = 0;

            for(const card of cards)
            {
                const cardLink = card.children[0].children[0];
                const contWrappr = card.children[1].children;
                const titleField = 
                    [...contWrappr].filter(e => e.classList.contains("ui-search-item__group--title"));
                const contCols = [...contWrappr].filter(e => e.classList.contains("ui-search-result__content-columns"));
                
                let prices = contCols[0].children[0].children[0].children[0].children[0];

                if(!prices.children[0].classList.contains("ui-search-price__original-value"))
                {
                    prices = prices.children[0].children[0].children[0];
                }else
                {
                    prices = prices.children[1].children[0].children[0];
                }

                const url = cardLink.href;
                const imgURL = cardLink.children[0].children[0].children[0].children[0].children[0].children[0].src;
                const cardTitle = titleField[0].children[1].children[0].textContent;
                const price = parseFloat(prices.textContent.split(" ")[0]);

                r.push({id: i, url, imgURL, title: cardTitle, price}); i++;
            }

            return r;

        }, entrySelector, srchSize);

        return res;
    }

}

RoboBot.allowedShops = [
    {
        id: 1,
        url: "https://www.amazon.com",
        name: "Amazon"
    },
    {
        id: 2,
        url: "https://best.aliexpress.com/",
        name: "Aliexpress"
    },
    {
        id: 3,
        url: "https://www.mercadolibre.com.co/",
        name: "Mercadolibre"
    }
];