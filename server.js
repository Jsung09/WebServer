const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

var db;

MongoClient.connect(
    'mongodb+srv://admin:qwer1234@cluster0.meqo8.mongodb.net/Cluster0?retryWrites=true&w=majority',
    {
        useUnifiedTopology: true
    },
    function (err, client) {
        //conneting
        if (err) {
            return console.log(err)
        }

        db = client.db('Plan');

        app.listen(3000, function () {
            console.log('Starting Server on 3000')
        });
    }
);


app.get('/', function (req, res) {
    res.render('index.ejs');
});

app.get('/write', function (req, res) {
    res.render('write.ejs');
});

app.post('/add', function (req, res) {
    res.render('write.ejs');
    db
        .collection('counter')
        .findOne({
            name: '계획갯수'
        }, (err, result) => {
            console.log(result.totalPost);
            var 총계획갯수 = result.totalPost;

            db
                .collection('post')
                .insertOne({
                    _id: 총계획갯수 + 1,
                    제목: req.body.title,
                    날짜: req.body.date
                }, function (er, re) {
                    console.log('Save');
                    db
                        .collection('counter')
                        .updateOne({
                            name: '계획갯수'
                        }, {
                            $inc: {
                                totalPost: 1
                            }
                        }, (err, result) => {
                            if (err) {
                                return console.log(err)
                            }
                        })
                })

        })
})

app.get('/list', (req, res) => {

    db
        .collection('post')
        .find()
        .toArray((err, result) => {
            console.log(result);
            res.render('list.ejs', {posts: result});
        })

})

app.delete('/delete', function (req, res) {
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function(err, result){ 
        console.log('삭제완료');
        res.status(200).send({ message : '성공했습니다' });
    })
})


app.get('/detail/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
        console.log(result)
        res.render('detail.ejs', { data : result })
    })
    
})

app.get('/edit/:id', function(req, res){

    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
    console.log(result)
    res.render('edit.ejs', { post : result })
    })  
})

app.put('/edit', function(req, res){
    db.collection('post').updateOne({_id : parseInt(req.body.id)},  { $set : { 제목 : req.body.title, 날짜 : req.body.date}}, function(err, result){
        console.log('수정완료')
        res.redirect('/list')
    })
});