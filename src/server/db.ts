import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri && process.env.NODE_ENV === 'production') {
  throw new Error('MONGODB_URI is not defined');
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) return client;
  
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env');
  }

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  console.log('Connected to MongoDB');
  return client;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db();
}
