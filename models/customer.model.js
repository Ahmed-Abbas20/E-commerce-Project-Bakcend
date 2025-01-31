//To be reviewed
const User = require("./User");

const CustomerSchema = new mongoose.Schema({

});

module.exports = User.discriminator("Customer", CustomerSchema);
