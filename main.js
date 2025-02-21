require("dotenv").config();
const { DATA_BASE } = require("./database/mongodb");
const { APP_CONFIG } = require("./config/app.config");
const app = require("./index"); 
const seedData = require("./utils/seedPermissions");


(async function () {
  
  await DATA_BASE.connectToMongo(APP_CONFIG.MONGO_CLUSTER_URI, async () => {
    console.log("App database has connected successfully");

   
    seedData();

  
    app.listen(APP_CONFIG.HTTP_PORT, "0.0.0.0", () => {
      console.log(`App is up and running on port ${APP_CONFIG.HTTP_PORT}`);
    });
  });
})();
