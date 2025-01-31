require("dotenv").config();
const { DATA_BASE } = require("./database/mongo/index");
const { APP_CONFIG } = require("./config/app.config");
const connectMemoApp = require("./index");

(async function () {
  await DATA_BASE.connectToMongo({
    dpoptions: {
      url: APP_CONFIG.MONGO_DEV_URI,
      databaseName: APP_CONFIG.MONGO_DATABASE_NAME,
    },
    callback: () => {
      console.log("App database has connected successfully");
      connectMemoApp.listen(APP_CONFIG.HTTP_PORT, "0.0.0.0", () => {
        console.log(`App is up and running on port ${APP_CONFIG.HTTP_PORT}`);
      });
    },
  });
})();
