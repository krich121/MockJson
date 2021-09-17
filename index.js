const express = require('express');
const faker = require('faker');
const mysql = require('mysql');
const _ = require('lodash');
const PORT = process.env.port || 8080;

const app = express();

var con = mysql.createConnection({
    host:"",
    port:"",
    user:"",
    password:"",
    database:""
});

con.connect(function(err) {
    //if (err) throw err;
    if (err) {
        console.log("Connected Error !");
    }
    else {
        console.log("Connected Success!");
    }
});


app.get('/', (req, res) => {
    res.send({testConnection: "Success!!"});
})

app.get('/setconnection', (req, res) => {
    const _host = req.query.host;
    const _port = req.query.port;
    const _user = req.query.user;
    const _password = req.query.password;
    const _database = req.query.database;
    const _apikey = req.query.apikey;

    if (!_host) {
        return res.status(400).send({errorMsg: 'Parameter host is missing'});
    }

    if (!_port) {
        return res.status(400).send({errorMsg: 'Parameter port is missing'});
    }
    
    if (!_user) {
        return res.status(400).send({errorMsg: 'Parameter user is missing'});
    }
    if (!_password) {
        return res.status(400).send({errorMsg: 'Parameter password is missing'});
    }

    if (!_database) {
        return res.status(400).send({errorMsg: 'Parameter database is missing'});
    }

    if (!_apikey) {
        return res.status(400).send({errorMsg: 'Parameter apikey is missing'});
    }

    if (_apikey != 'c5960e8e-f7fe-403a-8220-ac5475a94753') {
        return res.status(400).send({errorMsg: 'apikey is wrong !!'});
    }

    try {
        con = mysql.createConnection({
            host: _host,
            port: _port,
            user: _user,
            password: _password,
            database: _database
        });

        con.connect(function(err) {
            //if (err) throw err;
            if (err) {
                console.log("Connected Error!");
                res.send({setConnection: "Error!!"});
            }
            else {
                console.log("Connected Success!");
                res.send({setConnection: "Success!!"});
            }
        }); 
    }
    catch (e) {
        res.send({setConnection: "Error!!"});
    }
})

app.get('/getmockdata', (req, res) => {
    const count = req.query.count

    if (!count) {
        return res.status(400).send({errorMsg: 'Parameter is missing'});
    }

    try {
        var sql = "CALL _sp_get_mock_json();";
        //var sql = "SELECT json_value FROM mock_detail LIMIT 1;";
        con.query(sql, true, function(err, result){

            if (err) {
                console.log("Connected Error!");
                res.send({Connection: "Error!!"});
                return;
            }

            console.log(result[0].length);
            if(result[0].length <= 0) {
                return res.status(400).send({errorMsg: 'Not Found Result !'});
            }

            res.setHeader('Content-Type', 'application/json');
            res.send(Object.values(JSON.parse(JSON.stringify(result[0][0])))[0]);

        });
    }
    catch (e) {
        res.send({Connection: "Error!!"});
    }
})

app.listen(process.env.PORT || 8080, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

//app.listen(PORT, () => {
//    //console.log(`Server started on port ${PORT}`);
//    console.log('Server started');
//})