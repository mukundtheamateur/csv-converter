var express = require("express");
var app = express();
var path = require("path");
var mysql = require('mysql');
var bodyParser = require('body-parser');
// var Json2csvParser = require('json2csv').Parser;
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "technovate"
});
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});
app.post('/', function (req, res) {
  var roll = req.body.roll;
  var name = req.body.name;
  var marks = req.body.marks;


  // res.write('You sent the sno "' + req.body.sno+'".\n');
  // res.write('You sent the name "' + req.body.Name+'".\n');
  // res.write('You sent the phoneno "' + req.body.Phone+'".\n');
  // res.write('You sent the email "' + req.body.email+'".\n');
  // res.write('You sent the course "' + req.body.course+'".\n');


  con.connect(function (err) {
    var sql = "INSERT INTO technovate (roll, name, marks) VALUES ('" + roll + "','" + name + "','" + marks + "')";
    con.query(sql, function (err, result) {
      if (err) {

        if (err.errno == 1062) {

          var sql = 'UPDATE technovate SET name ="' + req.body.name + '",marks="' + req.body.marks + '",roll="' + req.body.roll;
          con.query(sql, function (err, result) {
            if (err) throw err;
            console.log(result.affectedRows + " record(s) updated");
          });
          // res.end();

        }
        else {
          throw err;
          // res.end();
        }
      }
      console.log("1 record inserted");

      res.redirect('/');

      res.end();

    });
  });
});
app.post('/download', function (req, res) {
  con.connect((err) => {
    if (err) throw err;
      
    // -> Query data from MySQL
    con.query("SELECT * FROM technovate", function (err, customers, fields) {
      if (err) throw err;
      console.log("evaluation:");
      
      const jsonCustomers = JSON.parse(JSON.stringify(customers));
      console.log(jsonCustomers);

      // -> Convert JSON to CSV data
      const csvFields = ['roll', 'name', 'marks'];
      const json2csvParser = new Json2csvParser({ csvFields });
      const csv = json2csvParser.parse(jsonCustomers);
  
      console.log(csv);

      fs.writeFile('round1.csv', csv, function(err) {
        if (err) throw err;
        console.log('file saved');

      });
      res.redirect('/');
      // -> Check 'customer.csv' file in root project folder
    });
  });
});

app.get('/csvfile', function(req, res){
  const file = `${__dirname}/round1.csv`;
  res.download(file); // Set disposition and send it.
});



app.get('/search', function (req, res) {
  con.connect(function (err) {
    con.query('SELECT * FROM technovate ', function (err, result) {
      if (err) throw err;
      console.log(result);
    });
  });
});
app.listen(3000);
console.log("Running at Port localhost:3000");
