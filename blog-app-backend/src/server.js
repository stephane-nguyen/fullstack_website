import express from 'express';
import cors from 'cors';
import { db, connectToDatabase } from './db.js';
import 'dotenv/config';
import fs from 'fs';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

//setup firebase package
const credentials = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../credentials.json'))
);
admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

//route handler for when we receive our request
//get all for routes that does not start by api
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
})

app.use(
    cors({
        origin: "http://localhost:3000"
    })
);

/** 
 * express middleware
 * automatically load user's info when we receive a request
 * */
app.use(async (req, res, next) => {
    const { authtoken } = req.headers;
    if (authtoken) {
        try {
            req.user = await admin.auth().verifyIdToken(authtoken);
        } catch (e) {
            return res.sendStatus(400);
        }
    }
    req.user = req.user || {};
    next();
});

app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;
    const article = await db.collection('articles').findOne({ name });

    if (article) {
        //if articles.upvoteids does not exist, upvoteIds= []
        const upvoteIds = article.upvoteIds || [];
        article.canUpvote = uid && !upvoteIds.includes(uid);
        console.log(uid + ": " + article.canUpvote)
        //send back response to the client, res.json better than res.send as we send back json data, not string
        res.json(article);
    } else {
        res.sendStatus(404);
    }
});

//prevent user to make request to next endpoints if not logged in
app.use((req, res, next) => {
    //if has authtoken
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
})

app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;
    const article = await db.collection('articles').findOne({ name });
    if (article) {
        const upvoteIds = article.upvoteIds || [];
        const canUpvote = uid && !upvoteIds.includes(uid);
        if (canUpvote) {
            await db.collection('articles').updateOne({ name }, {
                //specify to mongo we increment upvotes by 1
                $inc: { upvotes: 1 },
                $push: { upvoteIds: uid },
            });
        }
        const updatedArticle = await db.collection('articles').findOne({ name });
        res.json(updatedArticle);
    } else {
        res.send('That article doesn\'t exist');
    }
});

app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { text } = req.body;
    const { email } = req.user;

    await db.collection('articles').updateOne({ name }, {
        $push: { comments: { postedBy: email, text } },
    });
    const article = await db.collection('articles').findOne({ name });

    if (article) {
        res.json(article);
    } else {
        res.send('That article doesn\'t exist!');
    }
});

const PORT = process.env.PORT || 8080;

connectToDatabase(() => {
    console.log('Successfully connected to database');
    //app.listen as a callback to connect to database before
    app.listen(PORT, () => {
        console.log('Server is listening on port ' + PORT);
    });
})




