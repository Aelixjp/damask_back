import express from "express";
import RoboBot from "../modules/RoboBot.js";
import { browserConfigs } from "../modules/RoboBot.config.js";

const app = express();
const SERVER_PORT = 8081;

const defaultPaginationSize = 25;

const robobot = new RoboBot(browserConfigs);

app.get("/damask/api", async(req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type: application/json; charset=utf8');

    const data = req.query;
    const resp = {};

    if(Object.entries(data).length <= 0)
    {
        resp.msg = "No se han proporcionado parametros!";
        resp.status = "failed";
    }else
    {
        const { action, pageID } = data;

        if((!action || !pageID) || (action.trim() === "" || (pageID <= 0 || pageID > RoboBot.allowedShops.length)))
        {
            resp.msg = "Acción o id de la tienda no especificado!";
            resp.status = "failed";
        }
        else
        {
            robobot.selectShop(pageID);

            switch(action)
            {
                case "search-product":
                    const { name, minPrice, maxPrice, searchSize } = data;

                    const srchSize = searchSize || defaultPaginationSize;

                    try {
                        const searchRes = await robobot.searchProduct(name, {minPrice, maxPrice, searchSize: srchSize});

                        resp.msg = "Exito!";
                        resp.status = "success";
                        resp.data = searchRes;
                    } catch (e) {
                        resp.msg = "Ha ocurrido un error al obtener la información de la busqueda!";
                        resp.status = "failed";
                        resp.error = e.message;
                    }

                    break;

                default:
                    resp.msg = "Acción no especificada";
                    resp.status = "failed";
                    break;
            }
        }
    }

    res.json(resp);
});

app.listen(SERVER_PORT, "0.0.0.0", async() => {
    console.log(`Listening on port: ${SERVER_PORT}`); robobot.setup();
});
