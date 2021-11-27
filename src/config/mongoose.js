const mongoose = require("mongoose");

// This function initiates a connection with MongoDB
export default function () {
  const connectionUrl = process.env.MONGODB_URL;

  mongoose.connect(connectionUrl, {
    // No deprecation warning about old version of the MongoDB URL parser.
    useNewUrlParser: true,

    // So we use the MongoDB driver's native findOneAndUpdate under the hood
    useFindAndModify: false,

    // No deprecation warning about creating indexes
    useCreateIndex: true,

    // No deprecation warning about opting into MongoDB's new Server Discover and Monitoring engine.
    useUnifiedTopology: true,
  });

  mongoose.connection.on("connected", () => {
    console.log(`Mongoose default connection ready at ${connectionUrl}`);
  });

  mongoose.connection.on("error", (error) => {
    console.log(`Mongoose default connection error: ${error}`);
  });
}
