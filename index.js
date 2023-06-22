import RoboBot from "./modules/RoboBot.js";

(() =>{
  

  async function setup()
  {
    await robobot.setup();

    await robobot.navigate(3);

    const searchInfo = await robobot.searchProduct("Portatil", {minPrice: 100000, maxPrice: 4000000});

    console.log(searchInfo);
  }

  setup();

})();