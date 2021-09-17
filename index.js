const express = require('express');
const faker = require('faker');
const mysql = require('mysql');
const fs = require('fs');
const _ = require('lodash');
const PORT = process.env.PORT || 8080;

const app = express();

//app.get('/readconnection', (req, res) => {
//    readDBConfig();
//})

/*
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
*/

const dbMode = process.env.DB_MODE || 'local';
const dbHost = process.env.DB_HOST || '';
const dbPort = process.env.DB_PORT || '';
const dbUser = process.env.DB_USER || '';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || '';

var db_config = {
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
};
  
var con;

function setDBConfig() {

    if (dbMode == 'HEROKU') {
        db_config = {
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword,
            database: dbName
        };

        console.log('Set DB Config from HEROKU Success !!');
    }
    else if (dbMode == 'local') {
        fs.readFile('./dbconfig.json', 'utf-8', (err, jsonString) => {
            if (err) {
                console.log(err);
            }
            else {
                try {
                    const data = JSON.parse(jsonString);
                    console.log(data);

                    db_config.host = data.host;
                    db_config.port = data.port;
                    db_config.user = data.user;
                    db_config.password = data.password;
                    db_config.database = data.database;

                    console.log('Set DB Config from ConfigFile Success !!');
                }
                catch (e) {
                    console.log('Error Parse JSON');
                }
                
            }
        })
    }
}

function handleDisconnect() {
    con = mysql.createConnection(db_config)
              
    con.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 5000);
        }
        else {
            console.log("Connected Success!");
        }
    });

    con.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } 
        else {
            throw err;
        }
    });
}
  
setDBConfig();
handleDisconnect();

app.get('/', (req, res) => {
    res.send({Server: "Started !!"});
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

        /*
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

        */

        db_config = {
            host: _host,
            port: _port,
            user: _user,
            password: _password,
            database: _database
        };

        const jsonString = JSON.stringify(db_config);
        fs.writeFile('./dbconfig.json', jsonString, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log('DB Config write success');
            }
        });

        handleDisconnect();
    }
    catch (e) {
        res.send({setConnection: "Error!!"});
    }
})

app.get('/getmockdata', (req, res) => {
    const program = req.query.program;
    const version = req.query.version;
    const apiname = req.query.apiname;

    if (!program) {
        return res.status(400).send({errorMsg: 'Parameter program is missing'});
    }

    if (!version) {
        return res.status(400).send({errorMsg: 'Parameter version is missing'});
    }

    if (!apiname) {
        return res.status(400).send({errorMsg: 'Parameter apiname is missing'});
    }

    try {
        var sql = "CALL _sp_get_mock_json(?,?,?);";
        //var sql = "SELECT json_value FROM mock_detail LIMIT 1;";
        con.query(sql, [ program, version, apiname ], function(err, result){

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

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})