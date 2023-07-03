import puppeteer from "puppeteer";
import { allowedShops } from "./RoboBot.config.js";

export default class RoboBot
{
    #defaultPaginationSize = 25;

    constructor(browserConfigs)
    {
        this.pageURL;
        this.currPageID = 1;
        this.browserConfigs = browserConfigs;

        return this.setup();
    }

    async setup()
    {
        this.browser = await puppeteer.launch(this.browserConfigs);
        this.page = await this.browser.pages().then(p => p[0]);

        return this;
    }

    set defaultPaginationSize(defaultPaginationSize)
    {
        this.#defaultPaginationSize = defaultPaginationSize;
    }

    get defaultPaginationSize()
    {
        return this.#defaultPaginationSize;
    }

    navigate(pageID, customPage)
    {
        this.selectShop(pageID);

        return this.page.goto(customPage ? customPage : this.pageURL);
    }

    selectShop = pageID =>
    {
        this.currPageID = pageID;

        this.pageID   = RoboBot.allowedShops[pageID - 1]["id"];
        this.pageType = RoboBot.allowedShops[pageID - 1]["name"];
        this.pageURL  = RoboBot.allowedShops[pageID - 1]["url"];
    }

    searchProduct = async(search, args) =>
    {   
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

    searchProductForAmazon = async(search, args) => 
    {
        let res = [];
        const srchSize = args.searchSize || this.#defaultPaginationSize;
        
        this.selectShop(1);

        await this.navigate(this.currPageID, encodeURI(`${this.pageURL}/s?k=${search}`));
        
        const inputMinPrice = "#low-price";
        const inputMaxPrice = "#high-price";
        const inputSubmit   = "#a-autoid-1";
        const inpLinks = ".s-card-container .sg-row:nth-child(1):not(.puis-expand-height)";

        if(args.minPrice != 0 || args.maxPrice != 0)
        {
            const { minPrice, maxPrice } = args;

            if(minPrice && maxPrice)
            {
                await this.page.waitForSelector(inputMinPrice);
                await this.page.waitForSelector(inputMaxPrice);

                await this.page.click(inputMinPrice);
                await this.page.focus(inputMinPrice);
                await this.page.keyboard.type(`${minPrice}`, { delay: 3 });

                await this.page.click(inputMaxPrice);
                await this.page.focus(inputMaxPrice);
                await this.page.keyboard.type(`${maxPrice}`, { delay: 3 });

                await this.page.evaluate(e => { const inp = document.querySelector(e); inp.click(); }, inputSubmit);
            }
        }
        
        res = await this.page.evaluate(async(e, s, pageID) => {
            const inpImages = "img";
            const inpPrices = ".a-offscreen";
            const inpPricesDf = ".a-price-whole";

            const linksHtml  = [...document.querySelectorAll(e)].slice(0, s);

            const imagesHtml = linksHtml.map(l => l.querySelector(inpImages)); 
            const pricesHtml = linksHtml.map(p => p.querySelector(inpPrices) || p.querySelector(inpPricesDf) || "");

            const images = imagesHtml.map(image => image.src);
            const links = linksHtml.map(link => link.querySelector("a.a-link-normal").href);
            const titles = linksHtml.map(link => link.querySelector("span.a-size-medium").innerText);
            const prices = pricesHtml.map(price => price.innerText ? parseFloat(price.innerText.slice(3).replaceAll(",", "")) : 0);

            const r = images.map((image, i) => {
                const data = 
                {
                    id: i,
                    url: links[i],
                    imgURL: image,
                    title: titles[i],
                    price: prices[i],
                    pageID
                };

                return data;
            });

            return r;
        }, inpLinks, srchSize, this.currPageID);

        return res;
    }

    searchProductForMercadolibre = async(search, args) =>
    {
        let res = [];
        const srchSize = args.searchSize || this.#defaultPaginationSize;
        
        this.selectShop(3);

        await this.navigate(this.currPageID, encodeURI(`https://listado.mercadolibre.com.co/${search}#D[A:${search}]`));

        const inputMinPrice = "input[data-testid='Minimum-price']";
        const inputMaxPrice = "input[data-testid='Maximum-price']";
        const inputSubmit   = "button[data-testid='submit-price']";
        const entrySelector = ".andes-card";

        if(args.minPrice != 0 || args.maxPrice != 0)
        {
            const { minPrice, maxPrice } = args;

            if(minPrice && maxPrice)
            {
                await this.page.waitForSelector(inputMinPrice);
                await this.page.waitForSelector(inputMaxPrice);

                await this.page.click(inputMinPrice);
                await this.page.focus(inputMinPrice);
                await this.page.keyboard.type(`${minPrice}`, { delay: 3 });

                await this.page.click(inputMaxPrice);
                await this.page.focus(inputMaxPrice);
                await this.page.keyboard.type(`${maxPrice}`, { delay: 3 });

                await this.page.evaluate(e => { const inp = document.querySelector(e); inp.click(); }, inputSubmit);
                await this.page.waitForNavigation();
            }
        }

        res = await this.page.evaluate(async(e, s) =>{
            let r = [];
            const cards = [...document.querySelectorAll(e)].slice(0, s); let i = 0;

            for(const card of cards)
            {
                const cardLink = card.querySelector("a");
                const contWrappr = card.children[1].children;
                const titleField = 
                    [...contWrappr].filter(e => e.classList.contains("ui-search-item__group--title"));
                const contCols = [...contWrappr].filter(e => e.classList.contains("ui-search-result__content-columns"));
                
                let prices = contCols[0].children[0].children[0].children[0].children[0];

                if(!prices.children[0].classList.contains("ui-search-price__original-value"))
                    prices = prices.children[0].children[0].children[0];
                else
                    prices = prices.children[1].children[0].children[0];

                let url = cardLink.href;
                
                const cardTitle = titleField[0].children[1].children[0].textContent;
                const price = parseFloat(prices.textContent.split(" ")[0]);

                const img = card.querySelector("img");
                const imgURL = img.hasAttribute("data-src") ? img.getAttribute("data-src") : img.src;

                r.push({id: i, url, imgURL, title: cardTitle, price}); i++;
            }

            return r;

        }, entrySelector, srchSize);

        res = res.map(async(dt) => {
            if(dt.url.startsWith("https://click1.mercadolibre.com.co/"))
            {
                const externalPage = await this.browser.newPage();
                await externalPage.goto(dt.url);

                dt.url = externalPage.url();
                
                externalPage.close();
            }

            if(dt.url.startsWith(this.pageURL))
                dt.url = dt.url.split("?")[0];

            if(dt.url.startsWith("https://articulo.mercadolibre.com.co/"))
            {
                dt.url = dt.url.split("#")[0];
            }

            dt.pageID = this.currPageID | 0;

            return dt;
        });

        res = Promise.all(res);

        return res;
    }

}

RoboBot.allowedShops = allowedShops;