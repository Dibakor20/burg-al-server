// npm init
// npm install express mongodb 
// npm install -g nodemon  for auto connect if anything i change
// npm install cors for handiling cors error
// npm install body-parser for  geeting post
// npm install firebase-admin --save  for firebase admin setup jwt

// userName='burjAlArab'
// password='burjAlarab420'

const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json());
app.use(cors())
require('dotenv').config()


var serviceAccount = require("./config/burg-all-firebase-adminsdk-yiww4-65448a4194.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ysvsi.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/',(req,res)=>{
    res.send("Hellow world")
})

client.connect(err => {
  const bookings = client.db("burjAlArab").collection("booking");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    console.log(newBooking)
    bookings.insertOne(newBooking)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/booking',(req,res)=>{
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });
            admin.auth().verifyIdToken(idToken)
            .then((decodedToken) => {
            const tokenEmail = decodedToken.email;
            const queryEmail = req.query.email;
            if(tokenEmail == queryEmail){
                bookings.find({email:queryEmail})
                .toArray((err,documents)=>{
                    res.send(documents)
        })
            }
            else{
                res.status(401).send('un-authorized access')
            }

        })
        .catch((error) => {
            res.status(401).send('un-authorized access')
        })
        }
        else{
            res.status(401).send('un-authorized access')
        }

        
    })
});


app.listen(5000,()=>console.log("listing to port 5000"))