require("dotenv").config();
const { DATA_BASE } = require("./database/mongodb");
const { APP_CONFIG } = require("./config/app.config");
const app = require("./index");
const seedPermissions = require("./utils/seedPermissions");  // Ensure this points to your seed permissions file

(async function () {
  // Establish the connection to MongoDB
  await DATA_BASE.connectToMongo(APP_CONFIG.MONGO_CLUSTER_URI, async () => {
    console.log("App database has connected successfully");

    // Seed permissions after the database connection is successful
    await seedPermissions(); // This will seed your permissions

    // Start the app after seeding the permissions
    app.listen(APP_CONFIG.HTTP_PORT, "0.0.0.0", () => {
      console.log(`App is up and running on port ${APP_CONFIG.HTTP_PORT}`);
    });
  });
})();
