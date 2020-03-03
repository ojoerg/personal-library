/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = "https://personal-library-gitloeti.glitch.me";

chai.use(chaiHttp);

var testId = "";
var testTitle = "Test Book"

suite('Functional Tests', function() {
  this.timeout(6000);
  
  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({
          title: testTitle
        })        
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'title');
          assert.property(res.body[0], '_id' );
          assert.propertyVal(res.body[0], "title", testTitle)
          testId = res.body[0]._id
          done();
        });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, 'invalid data');
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'title');
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'commentcount');
          done();
        });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/000000000000000000000001')
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        
        chai.request(server)
        .get('/api/books/' + testId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'title');
          assert.property(res.body, '_id');
          assert.property(res.body, 'comments');
          assert.propertyVal(res.body, "title", testTitle)
          done();
        });    
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        var comment = "functional test"
        
        chai.request(server)
        .post('/api/books/' + testId)
        .send({
          comment: comment
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'title');
          assert.property(res.body, '_id');
          assert.property(res.body, 'comments');
          assert.equal(res.body.comments, comment)
          done();
        });

      });
      
    });

  });

});
