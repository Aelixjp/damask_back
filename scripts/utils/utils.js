export const sleep = timeToSleep => 
{
    return new Promise(resolve => setTimeout(resolve, timeToSleep));
}

export const autoScroll = async(page, interval = 100) => {
    await page.evaluate(async (interval) => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 400;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, interval);
        });
    }, interval);
}

/**Describe la dimension de un objeto*/
export class Dimension
{
    constructor(width = 0, height = 0)
    {
        this.width  = width;
        this.height = height;
    }
}

/**Respuesta generica para una peticion*/
export class Response
{
    #msg;
    #error;
    #status;

    constructor(msg = "", status = false, error)
    {
        this.#msg = msg;
        this.#status = status;
        this.#error = error;
    }

    get msg()
    {
        return this.#msg;
    }

    set msg(msg)
    {
        this.#msg = msg;
    }

    get error()
    {
        return this.#error;
    }

    set error(error)
    {
        this.#error = error;
    }

    get status()
    {
        return this.#status;
    }

    set status(status)
    {
        this.#status = status;
    }

    toObject = () => ({ msg: this.#msg, error: this.#error, status: this.#status })
}

/**Respuesta extendida para una peticion*/
export class ExtendedResponse extends Response
{
    #data;

    constructor(msg = "", status = false, error)
    {
        super(msg, status, error);
    }

    get data()
    {
        return this.#data;
    }

    set data(data)
    {
        this.#data = data;
    }

    toObject = () => ({ msg: this.msg, error: this.error, data: this.#data, status: this.status })
}