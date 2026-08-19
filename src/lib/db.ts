import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
};

function createClient(): MongoClient {
  if (!uri) {
    throw new Error("MONGODB_URI is not set.");
  }
  return new MongoClient(uri);
}

export function getDb() {
  const client = globalForMongo._mongoClient ?? createClient();
  globalForMongo._mongoClient = client;
  return client.db();
}

export async function connectDb(): Promise<void> {
  const client = globalForMongo._mongoClient ?? createClient();
  globalForMongo._mongoClient = client;
  await client.connect();
}