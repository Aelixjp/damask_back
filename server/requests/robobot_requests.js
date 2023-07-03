import RequestHandler from "./requestHandler.js";

export function listenForRequests()
{
    this.get("/damask/api/shops", RequestHandler.notSpecifiedShopHandler);
    this.get("/damask/api/shops/:shop", RequestHandler.shopHandler);
}