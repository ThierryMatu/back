const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const http = require("http")
const app = express()

// const bodyParser = require('body-parser')

// CORS allows you to configure the web API's security. 
// It has to do with allowing other domains to make requests against your web API.
app.use(cors());

// MIDDLEWARES
// Create an Express.js instance:
// use Parser Middleware
app.use(express.json())
app.set('port', 3000)
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// use Logger middleware
app.use(function (req, res, next) {
  console.log('Request IP: ' + req.url)
  console.log('Request date: ' + new Date())
  return next()
})

// use param middleware
app.param('collectionName', function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName)
  return next()
})

// use static file middleware

app.use(function(req, res, next){
  var filePath = path.join(__dirname, "static", req.url)
  fs.stat(filePath, function(err, fileInfo){
      if (err) {
          next()
          return
      }
      if (fileInfo.isFile()) {
          res.sendFile(filePath)
      }
      else{
          next()
      }
  })
})



// connect to MongoDB Database
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://Enoch:Matu@cluster0.4b3r7.mongodb.net/test', (err, client) => {
    db = client.db('afterschool')
})



// retrieve all the objects from an collection
app.get('/collection/:collectionName', (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
      if (e) return next(e)
      res.send(results)
  })
})


//adding post to the collection or uploading a post to the collection
//New value or object to be inserted to the collection
app.post('/collection/:collectionName', (req, res, next) => {
  req.collection.insert(req.body, (e, results) => {
  if (e) return next(e)
  res.send(results.ops)
  })
  })
  


// Endpoint to update number of available spaces in lesson
//update an object 
app.put('/collection/:collectionName/:id', (req, res, next) => {
  req.collection.updateOne(
  {_id: new ObjectID(req.params.id)},
  {$set: req.body},
  {safe: true, multi: false},
  (e, result) => {
  if (e) return next(e)
  res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
  })
  })
  

// Endpoint to perform a Full Text Search on lessons
app.get('/collection/:collectionName/search', (req, res, next) => {
  let search_keyword = req.query.search
  req.collection.find({})
  .toArray((e, results) => {
    if (e) return next(e)
    let filteredList = results.filter((lesson) => {
      return lesson.title.toLowerCase().match(search_keyword.toLowerCase()) || lesson.location.toLowerCase().match(search_keyword.toLowerCase())
  });  
  res.send(filteredList)

  })
})

// Listen to port

const port = process.env.PORT || 3000

app.listen(3000, () => {
  console.log('Express.js server running at localhost:3000')
})



