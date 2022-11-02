import { MongoClient } from 'mongodb';

let db;

async function connectToDatabase(callback) {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    await client.connect();
    const DB_NAME = 'react-blog-db';
    db = client.db(DB_NAME);
    callback();
}

export {
    db,
    connectToDatabase,
}