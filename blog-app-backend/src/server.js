import express from 'express';
import cors from 'cors';
//import { MongoClient } from 'mongodb';
import { db, connectToDatabase } from './db.js';

const app = express();
app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:3000"
    })
);
app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;

    /**moved this block of code into db.js 

    // const client=new MongoClient('mongodb://127.0.0.1:27017');
    // await client.connect();

    // const DB_NAME = 'react-blog-db';
    // const db=client.db(DB_NAME);

    */
    const article = await db.collection('articles').findOne({ name });
    if (article) {
        //send back response to the client, res.json bettFer than res.send as we send back json data, not string
        res.json(article);
    } else {
        res.sendStatus(404);
    }
});

app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;

    await db.collection('articles').updateOne({ name }, {
        //we specify mongodb we increment upvotes by 1 
        $inc: { upvotes: 1 },
    });
    const article = await db.collection('articles').findOne({ name });
    if (article) {
        res.json(article);
        //res.send(`the ${name} article now has ${article.upvotes} upvotes!`);
    } else {
        res.send("That article doesnt exist")
    }
});

app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params
    const { postedBy, text } = req.body

    await db.collection('articles').updateOne({ name }, {
        $push: { comments: { postedBy, text } },
    })
    const article = await db.collection('articles').findOne({ name });
    //const article = articlesInfo.find(a => a.name === name);
    if (article) {
        //article.comments.push({postedBy,text})
        res.json(article);
    } else {
        res.send("That article doesnt exist")
    }
})

connectToDatabase(() => {
    console.log('Succesfully connected to database');
    //put app.listen here to connect to database before
    app.listen(8080, () => {
        console.log("Server is listening on port 8080")
    });
})



