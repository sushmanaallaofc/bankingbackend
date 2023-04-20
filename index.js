const path = require("path");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dal = require("./dal.js");
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;
const {OAuth2Client} = require('google-auth-library');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoUrl= 'mongodb+srv://sushmanaallaofc:tEB82m12W2PPonnp@cluster0.ei3qq09.mongodb.net/?retryWrites=true&w=majority';
var db;
var secret = 'thisisassecretprogrammingandmore';

var CLIENT_ID = '776399895709-3ddui6f51u8capadvdlsh0nejmk2ph8f.apps.googleusercontent.com';
var jwt = require('jsonwebtoken');
var cors = require('cors');
app.use(cors());
app.get('/', (req,res) =>{ I
res.send('Welcome to programmingandmore');
})
async function verify(client, token) {
  const ticket = await client.verifyIdToken({
  idToken: token,
  audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
  // Or, if multiple clients access the backend:
  //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  return ticket.getPayload();
  // const userid = payload ['sub'];
  // If request specified a G Suite domain:
  // const domain = payload ['hd"];
  }
  app.get('/gauthenticate', async(req,res)=>{ I
  var token = req.query.id_token;
  const client = new OAuth2Client (CLIENT_ID);
  var x = await verify(client, token).catch(console.error);
if(x.email_verified) {
db.collection('users').find({email:x.email}).toArray((err, result)=>{
if(err) throw(err);
if(result.length<1){
  db.collection('users').insert([{
  name:x.name,
  email:x.email, ssword: string,
  password:bcrypt.hashSync (x.at_hash, 8)
  }])
  db.collection('users').find({email:x.email}).toArray((e,r)=>{
    if(e) throw e;
    TRANS
    var tkn = jwt.sign({id:result[0]._id}, secret);
    res.send({
    auth:true,
    token: tkn
    })
  })
  } else {
  var token = jwt.sign({id:result[0]._id}, secret);
  res.send({
  auth:true,
  token: token
  })
  }
})
} else {
res.send({
auth: false,
message: "User unauthorized"
})
}
  })
MongoClient.connect (mongoUrl, (err,client)=>{
if(err) console.log("Error while connecting")
else db = client.db('pandm');
})
app.listen(PORT, ()=>{
console.log('Listening to', PORT);
})
// create user account
app.get("/account/create/:name/:email/:password", function(req, res) {
  // check if account exists
  dal.find(req.params.email).then(accounts => {
    // if account exists, return error message
    if (accounts.length > 0) {
      res.send("Account already in exists");
    } else {
      // else create account
      const hash = bcrypt.hashSync(req.params.password, 10);
      dal.create(req.params.name, req.params.email, hash).then(account => {
        //console.log(account);
        res.send(account);
      });
    }
  });
});

// login user
app.get("/account/login/:email/:password", function(req, res) {
  dal.find(req.params.email).then(account => {
    // if account exists, check password and create token
    if (account.length > 0) {
      if (bcrypt.compareSync(req.params.password, account[0].password)) {
        const token = jwt.sign(
          {
            name: account[0].name,
            email: account[0].email,
            balance: account[0].balance,
            password: account[0].password
          },
          "topsecret"
        );
        res.send({ status: "ok", account: token });
      } else {
        res.send("Login failed: wrong password");
      }
    } else {
      res.send("Login failed: account not found");
    }
  });
});

// find user account using token
app.get("/account/find", function(req, res) {
  const token = req.headers["x-access-token"];
  try {
    const token_decoded = jwt.verify(token, "topsecret");
    const email = token_decoded.email;
    dal.find(email).then(account => {
      //console.log(account);
      res.send(account);
    });
  } catch (error) {
    //console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

// find one account by email - alternative to find
app.get("/account/findOne", function(req, res) {
  const token = req.headers["x-access-token"];
  try {
    const token_decoded = jwt.verify(token, "topsecret");
    const email = token_decoded.email;
    dal.findOne(email).then(account => {
      //console.log(account);
      res.send(account);
    });
  } catch (error) {
    //console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

// update - deposit/withdraw amount
app.get("/account/update/:amount", function(req, res) {
  const token = req.headers["x-access-token"];
  const amount = Number(req.params.amount);
  try {
    const token_decoded = jwt.verify(token, "topsecret");
    const email = token_decoded.email;
    dal.update(email, amount).then(response => {
      //console.log(response);
      res.send(response);
    });
  } catch (error) {
    //console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

// all accounts
app.get("/account/all", function(req, res) {
  const token = req.headers["x-access-token"];
  try {
    const token_decoded = jwt.verify(token, "topsecret");
    const email = token_decoded.email;
    if (email) {
      dal.all().then(docs => {
        //console.log(docs);
        res.send(docs);
      });
    }
  } catch (error) {
    //console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

// used to serve static files from build directory
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(PORT, () => console.log(`Running on port: ${PORT}`));
