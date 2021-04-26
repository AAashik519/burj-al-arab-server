const express = require('express')
 
const port = 5000
const bodyParser =require('body-parser')
const cors = require('cors')
const admin = require('firebase-admin')
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config()
// console.log(process.env.DB_PASS)
// console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wrj66.mongodb.net/burj-all-arab?retryWrites=true&w=majority`;

 
const app = express()

app.use(cors());
app.use(bodyParser.json())


 

var serviceAccount = require("./configs/burj-al-arab-privateKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const  bookings = client.db("burj-all-arab").collection("bookings");


  app.post('/addbooking', (req,res) =>{
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then(result => {
         res.send(result.insertedCount> 0)
         console.log(result)
      })
  })
  app.get('/booking', (req,res)=>{
     const bearer =req.headers.authorization;
     if(bearer && bearer.startsWith('Bearer ')){
       const idToken= bearer.split(' ')[1];
       console.log({idToken});
       admin.auth().verifyIdToken(idToken)
         .then((decodedToken) => {
           const tokenEmail = decodedToken.email;
           const quearyEmail = req.query.email
           console.log(tokenEmail,quearyEmail)

           if(tokenEmail== req.query.email){
             bookings.find({ email: req.query.email })
               .toArray((err, documents) => {
                 res.status(200).send(documents);
                 })
                }
                else{
                  res.status(401).send('unauthorized access')
                }
 
         })
         .catch((error) => {
          res.status(401).send('unauthorized access')
         });
       
     }
     else {
       res.status(401).send('unauthorized access')
     }
    
  })
  
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

