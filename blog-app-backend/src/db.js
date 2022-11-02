import { MongoClient } from 'mongodb';

let db;

async function connectToDatabase(callback) {
    //local db
    //const client = new MongoClient('mongodb://127.0.0.1:27017');
    //mongodb atlas db 
    const client = new MongoClient(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.ugvqpnw.mongodb.net/?retryWrites=true&w=majority`);

    await client.connect();
    const DB_NAME = 'react-blog-db';
    db = client.db(DB_NAME);
    callback();
}

export {
    db,
    connectToDatabase,
}