var cp = require('cookie-parser');
var dbconfig = require('../db');
var ejs = require('ejs');

module.exports = function (app) {

    app.use(cp());
    dbconfig.connect();
    var postrouter = require('./post')(app);

    app.get('/', function (req, res) {
        if (req.cookies.is_logged_in === undefined) {
            res.redirect('/login');
        } 
        else if (req.cookies.is_logged_in === 'false') {
            res.redirect('/login');
        }
        else {
            res.redirect('/main');
        }
    });

    app.get('/login', function (req, res) {
        res.render('login',{login:req.cookies.is_logged_in});
    });

    app.get('/room', function (req, res) {
        if (req.cookies.is_logged_in === undefined) {
            res.redirect('/login');
        }
        else if (req.cookies.is_logged_in === 'false') {
            res.redirect('/login');
        }
        else{
            var sql = 'SELECT stay.room, users.name as staff_name, nationality, personnel, CASE WHEN should_paid IS NULL THEN 0 ELSE should_paid END AS should_paid, cardkey, request, cleaning, checkin, checkout from stay'
            sql += ' JOIN responsibility ON stay.room = responsibility.room';
            sql += ' JOIN users ON stay.room = responsibility.room and users.id = responsibility.id';
            sql += ' JOIN reservation ON reservation.email = stay.email and reservation.reservation_time = stay.reservation_time';
            sql += ' JOIN customers ON stay.email = reservation.email and stay.reservation_time = reservation.reservation_time and customers.email = reservation.email';
            sql += ' LEFT JOIN(SELECT SUM(price) as should_paid, room from receipt_service natural join room_service where paid = 0 group by room)a ON stay.room = a.room';
            var stay_room;

            dbconfig.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.writeHead(200);
                    res.end();
                }
                else {
                    console.log(rows);
                    stay_room = rows;
                }
            });

            var sql = 'SELECT * FROM room';
            dbconfig.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.writeHead(200);
                    res.end();
                }
                else {
                    res.render('room',{rooms:rows, stayrooms: stay_room});
                }
            });
        }
    });

    app.get('/main', function (req, res) {
        if (req.cookies.is_logged_in === undefined) {
            res.redirect('/login');
        } 
        else if (req.cookies.is_logged_in === 'false') {
            res.redirect('/login');
        }
        else {
            res.render('main');
        }
    });

    // 자동 새로고침 기능 확인을 위한 웹페이지, 추후 삭제 예정
    app.get('/reload', function (req, res) {
        var sql = 'SELECT * FROM users';
        dbconfig.query(sql, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.writeHead(200);
                res.end();
            }
            else {
                console.log(rows[0])
                res.render('reload', {row:rows[0].password});
            }
        });
    });
}