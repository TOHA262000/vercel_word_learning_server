import { MongoClient } from "mongodb";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yapm2yx.mongodb.net/word_learning?retryWrites=true&w=majority`;

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri); // no need for deprecated options
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
