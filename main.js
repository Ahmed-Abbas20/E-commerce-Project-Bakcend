require("dotenv").config();
const { DATA_BASE } = require("./database/mongo/index");
const { APP_CONFIG } = require("./config/app.config");
const connectMemoApp = require("./index");
const seedPermissions = require("./utils/seedPermissions");  // Ensure this points to your seed permissions file

(async function () {
  await DATA_BASE.connectToMongo({
    dpoptions: {
      url: APP_CONFIG.MONGO_DEV_URI,
      databaseName: APP_CONFIG.MONGO_DATABASE_NAME,
    },
    callback: async () => {
      console.log("App database has connected successfully");

      // Seed permissions after the database connection is successful
      await seedPermissions();

      // Start the app after seeding the permissions
      connectMemoApp.listen(APP_CONFIG.HTTP_PORT, "0.0.0.0", () => {
        console.log(`App is up and running on port ${APP_CONFIG.HTTP_PORT}`);
      });
    },
  });
})();
