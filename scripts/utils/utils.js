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