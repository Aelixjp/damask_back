import RoboBot from "../../modules/RoboBot.js";
import { ExtendedResponse } from "../../scripts/utils/utils.js";
import { browserConfigs } from "../../modules/RoboBot.config.js";

export default class RequestHandler
{
    constructor(){}

    /************************************** ROBOBOT INSTANCE OPERATIONS ********************************/
    
    /**Crea una instancia de robobot si no esta creada para un usuario y la añade a la lista de instancias*/
    static createRobobotInstance(instanceID)
    {
        RequestHandler.robobotInstances[instanceID] ??= new RoboBot(browserConfigs);

        return RequestHandler.robobotInstances[instanceID];
    }

    static getRobobotInstances()
    {
        return RequestHandler.robobotInstances;
    }

    static setRobobotInstances(robobotInstances)
    {
        RequestHandler.robobotInstances = robobotInstances;
    }

    /**Obtiene una instancia especifica de un robobot asociado a un usuario*/
    static getRobobotInstance(instanceID)
    {
        return RequestHandler.robobotInstances[instanceID];
    }

    /**Remueve y destruye de la lista una instancia especifica de un robobot asociado a un usuario*/
    static removeRobobotInstance(robobotInstance)
    {
        if(RequestHandler.robobotInstances.hasOwnProperty(robobotInstance))
            delete RequestHandler.robobotInstances[robobotInstance];
    }
    /******************************** END OF ROBOBOT OPERATIONS FOR CLIENT ********************************/


    /************************************** REQUEST HANDLERS **********************************************/
    static notSpecifiedShopHandler(req, res)
    {
        res.json(new ExtendedResponse("No se ha especificado un e-commerce!", false).toObject());
    }

    static async shopHandler(req, res)
    {
        let resp = new ExtendedResponse();
        const shop = req.params.shop;

        switch (shop.toLowerCase()) {
            case "amazon":
                resp = await RequestHandler.searchProductByAmazonHandler(req, res);
                break;

            case "aliexpress":
                resp.msg = "No soportado por ahora!";
                break;

            case "mercadolibre":
                resp = await RequestHandler.searchProductByMercadoLibreHandler(req, res);
                break;
        
            default:
                resp.msg = "No se ha especificado un e-commerce valido!";
                break;
        }

        res.json(resp.toObject());
    }

    static async genericSearch(req, res)
    {
        const data = req.query;
        const resp = new ExtendedResponse();

        if(Object.entries(data).length <= 0)
            resp.msg = "No se han proporcionado parametros!";
        else
        {
            const { name, minPrice, maxPrice, searchSize, pageID, instanceID } = data;

            if(
                (!pageID || !instanceID)  || 
                (instanceID.trim() === "" || (pageID <= 0 || pageID > RoboBot.allowedShops.length))
            )
                resp.msg = "Peticion no valida!";
            else
            {
                const robobotInstance = await RequestHandler.createRobobotInstance(instanceID);
                const srchSize = searchSize || robobotInstance.defaultPaginationSize;

                robobotInstance.selectShop(pageID);

                try {
                    const searchRes = await robobotInstance.searchProduct(name, {minPrice, maxPrice, searchSize: srchSize});

                    resp.msg = "Exito!";
                    resp.status = true;
                    resp.data = searchRes;
                } catch (e) {
                    resp.msg = "Ha ocurrido un error al obtener la información de la busqueda!";
                    resp.error = e.message;
                }
            }
        }

        return resp;
    }

    static searchProductByAmazonHandler(req, res)
    {
        return RequestHandler.genericSearch(req, res);
    }

    static searchProductByMercadoLibreHandler(req, res)
    {
        return RequestHandler.genericSearch(req, res);
    }
    /************************************** END OF REQUEST HANDLERS ******************************************/

}

/**Instancias de robobot ligadas a cada usuario*/
RequestHandler.robobotInstances = {};