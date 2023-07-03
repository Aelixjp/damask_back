import cors from "cors";
import express from "express";
import { SERVER_CONFIGS } from "./server_configs.js";
import { listenForRequests } from "./requests/robobot_requests.js";

const app = express();
const init = () => app.listenForRequests = listenForRequests;

//Inicializador del servidor
function inisetApp()
{
    //Server global configurations
    app.use(cors({ origin: SERVER_CONFIGS.ALLOWED_ORIGINS }));
    app.use(express.json());

    app.listenForRequests();
    
    app.listen(SERVER_CONFIGS.PORT, "0.0.0.0", () => {
        console.log(`Listening on port: ${SERVER_CONFIGS.PORT}`); 
    });
}

init();
inisetApp();