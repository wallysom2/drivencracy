import {MongoClient} from "mongodb";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URL);

try {
  await mongoClient.connect();
  db = mongoClient.db(process.env.DATABASE);
  console.log(chalk.bold.blueBright("Connected to database"));
} catch (error) {
  console.log(chalk.bold.red("Error connecting to database"));
  console.log(error);
}

export default db;
