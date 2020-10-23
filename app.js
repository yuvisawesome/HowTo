const express = require("express");
const bodyParser = require('body-parser');
const pug = require("pug");
const colors = require("colors");
const firebase = require("firebase");
require("firebase/firestore");
const Post = require(__dirname + "/post");
// const admin = require('firebase-admin');
const app = express();

app.set("view engine", "pug");
app.use(express.static(__dirname + '/public'));


app.use(bodyParser.urlencoded({extended: true}));

//===========================================================
//===========================================================
// FIREBASE
//===========================================================
//===========================================================

// const fbApp = admin.initializeApp();

// const db = admin.firestore();

// var firebaseConfig = {
//     apiKey: "AIzaSyDi_F85lLdInH3GWUeU84sUz1-Bn1SIJ9o",
//     authDomain: "howto-defe8.firebaseapp.com",
//     databaseURL: "https://howto-defe8.firebaseio.com",
//     projectId: "howto-defe8",
//     storageBucket: "howto-defe8.appspot.com",
//     messagingSenderId: "362987590506",
//     appId: "1:362987590506:web:59023c462d7a997b0c8b13",
//     measurementId: "G-ESFB75SSMP"
// };
// Initialize Firebase

firebase.initializeApp({
    apiKey: 'AIzaSyDi_F85lLdInH3GWUeU84sUz1-Bn1SIJ9o',
    authDomain: "howto-defe8.firebaseapp.com",
    projectId: "howto-defe8",
    appId: "1:362987590506:web:59023c462d7a997b0c8b13"
});


var db = firebase.firestore();  
// firebase.analytics();

//===========================================================
//===========================================================
// GET REQUESTS
//===========================================================
//===========================================================


app.get("/", async function(req, res) {
   
    var posts = []

    await db.collection("posts").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            const data = doc.data();
            
            var post = {
                title: data.title,
                description: data.description,
                content: data.content,
                id: doc.id
            };

            posts.push(post);

        });
    });
    res.render("home", {postsArray: posts});
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/compose", (req, res) => {
    res.render("compose");
});

app.get("/search", async function(req, res) {

    var query = ""
    
    await db.collection("search").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            query = doc.data().query;
        });
    });

    var results = []
    
    await db.collection("posts").get().then(function(querySnapshot) {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const title = data.title.toLowerCase();

            if (title.includes(query.toLowerCase())) {
                var post = {
                    title: data.title,
                    descriptoin: data.description,
                    content: data.content,
                    id: doc.id
                }
    
                results.push(post);
            }

        })
    })  
    
    res.render("search", {
        searchQuery: query,
        results: results
    });  
});

app.get("/posts", (req, res) => {
    res.redirect("/");
});

app.get("/posts/:id", async function(req, res) {
    var post = null

    await db.collection("posts").get().then(function(querySnapshot) {
        querySnapshot.forEach(function (doc) {
            const data = doc.data();
            if (doc.id === req.params.id) {
                post = {
                    title: data.title,
                    description: data.description,
                    content: data.content
                };
            }
        });
    });
    if (post === null) {
        res.redirect("/")
    } else {
        res.render("post", {
            post: post
        });
    }
});

//===========================================================
//===========================================================
// POST REQUESTS
//===========================================================
//===========================================================


app.post("/login", (req, res) => {


    const name = req.body.username;
    const email = req.body.email;
    const pass = req.body.password;

    firebase.auth().createUserWithEmailAndPassword(email, pass).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;


        console.log("An Error Occured: " + errorCode + " - " + errorMessage);

    });

    db.collection("users").add({
        username: name,
        emailAddress: email
    });




    
    res.redirect("/");
});

app.post("/compose", (req, res) => {

    db.collection("posts").add({
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    });
    
    res.redirect("/");
});

app.post("/search", function(req, res) {
    const searchQuery = req.body.query
    
    console.log("---");
    db.collection("search").doc("searchResult").set({query: searchQuery});
    res.redirect("/search");

});

const port = 5000
app.listen(port, function() {
    console.log(("Server is up at http://192.168.100.7:" + port).blue.bold);
    console.log("Press ⌃C to stop.".blue.bold);
});