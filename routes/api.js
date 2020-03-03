/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var ObjectId = require("mongodb").ObjectID;



async function databaseConnect() {
  var dbConnection = await MongoClient.connect(process.env.DATABASE, { useUnifiedTopology: true });
  //console.log("successful db connection")
  var db = dbConnection.db("library-db");
  return db;
}

async function findAll(database) {
  var resultwithCommentCount = [];
  var resultKeys = [];
  var resultValues = [];
  var newBookObject = {};
  
  var cursor = await database.collection("library").find();
  var result = await cursor.toArray();
  if (result === []) throw "no book exists" 

  resultKeys = result.map((d, i) => {
    return Object.keys(result[i])
  })
  
  resultValues = result.map((d, i) => {
    return Object.values(result[i])
  })
  
  resultKeys.map((d, i) => {
    newBookObject = {};
    d.map((key, index) => {
      if (key === "comments") {
        newBookObject["commentcount"] = resultValues[i][index].length
      } else {
        newBookObject[key] = resultValues[i][index]
      }
    });
    resultwithCommentCount.push(newBookObject) 
  })
                                      
  return resultwithCommentCount;
}

async function findOneNewBook(title, database) {
  var result = await database.collection("library").findOne({title: title}, { projection: { title: 1, _id: 1 } });
  if (result === null) throw "no book exists" 
  return result;
}

async function findOneById(bookid, database) {
  var result = await database.collection("library").findOne({ _id: ObjectId(bookid) });
  if (result === null) throw "no book exists" 
  return result;
}

async function newBookInsert(title, database) {
  var result = await database.collection("library").insertOne({ title: title, comments: [] });
  return result;
}

async function updateComments(comments, bookid, database) {
  var result = await database.collection("library").updateOne({ _id: ObjectId(bookid) }, { $set: { comments: comments } });
  return result;
}

async function newCommentInsert(bookid, comment, database) {
  var bookFound = await findOneById(bookid, database); 

  bookFound.comments = [...bookFound.comments, comment];
  

  var update = await updateComments(bookFound.comments, bookid, database)
  var result = await findOneById(bookid, database);
  return result;
}

async function deleteOneBook(bookid, database){
  var result = await database.collection("library").deleteOne({ _id: ObjectId(bookid) })
  return result;
}

async function deleteAllBooks(database){
  var result = await database.collection("library").deleteMany()
  return result;
}

async function getAll(res){
  try {
    var database = await databaseConnect();
    var allBooks = await findAll(database);
    res.send(allBooks);
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send("no book exists");
  }
}

async function postBook(res, title){
  try{
    var database = await databaseConnect();
    var newBook =  await newBookInsert(title, database)
    var newBookFromDb = [await findOneNewBook(title, database)]
    res.json(newBookFromDb)
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send("no book exists");
  }
}

async function deleteAll(res) {
  try{
    var database = await databaseConnect();
    var deletedAll =  await deleteAllBooks(database)
    res.status(200);
    res.send("complete delete successful");
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send("no book exists");
  }
} 

async function getOne(res, bookid){
  try {
    var database = await databaseConnect();
    var oneBook = await findOneById(bookid, database);
    res.json(oneBook);
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send("no book exists");
  }
}

async function postComment(res, bookid, comment){
  try{
    var database = await databaseConnect();
    var bookWithNewComments =  await newCommentInsert(bookid, comment, database)
    res.json(bookWithNewComments)
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send("no book exists");
  }
}

async function deleteOne(res, bookid) {
  try{
    var database = await databaseConnect();
    var deletedBook =  await deleteOneBook(bookid, database)
    res.status(200);
    res.send("delete successful");
  } catch (error) {
    console.log(error)
    res.status(400);
    res.send("no book exists");
  }
} 

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){  
      getAll(res);
    })
    
    .post(function (req, res){
      var title = req.body.title;

      if (title === null || title === undefined) {
        res.status(400);
        res.send("invalid data");
      } else {
        postBook(res, title);
      }    
    })
    
    .delete(function(req, res){
      deleteAll(res);
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      if (bookid === null || bookid === undefined) {
        res.status(400);
        res.send("invalid data");
      } else {
        getOne(res, bookid);
      }  
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
    
      if (bookid === null || bookid === undefined || comment === null || comment === undefined) {
        res.status(400);
        res.send("invalid data");
      } else {
        postComment(res, bookid, comment);
      }  
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      if (bookid === null || bookid === undefined) {
        res.status(400);
        res.send("invalid data");
      } else {
        deleteOne(res, bookid);
      } 
      
    });
  
};
