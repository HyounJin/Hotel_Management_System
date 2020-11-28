var cp = require('cookie-parser');
var dbconfig = require('../db');
var ejs = require('ejs');


module.exports = function (app) {

    app.use(cp());
    dbconfig.connect();
    var postrouter = require('./post')(app); // post방식 request처리 라우터 인클루드


    app.get('/', function (req, res) {
        if (req.cookies.is_logged_in === 'true'){ // 로그인 상태면 main페이지로, 아니면 로그인 페이지로 리다이렉트
            res.redirect('/main');
        }
        else res.redirect('/login');
    });


    /* 로그인 관련 */
    app.get('/login', function (req, res) {
        res.render('login',{login:req.cookies.is_logged_in}); // 로그인 실패시 UI를 다르게 하기 위해 쿠키를 넘겨줌
    });

    app.get('/logout', function (req, res) {
        res.cookie('is_logged_in', undefined); // 로그인 쿠키를 지우고 로그인 페이지로 리다이렉트
        res.redirect('/login');
    });


    /* 메뉴 관련 */
    app.get('/notice', function (req, res) {
        if (req.cookies.is_logged_in === 'true') {
            res.render('notice');
        }
        else res.redirect('/login');
    });

    app.get('/reservation', function (req, res) {
        if (req.cookies.is_logged_in === 'true') {
            res.render('reservation');
        }
        else res.redirect('/login');
    });

    app.get('/room', function (req, res) {
        if (req.cookies.is_logged_in === 'true') {
            var sql = 'SELECT stay.room, users.name as staff_name, nationality, stay.personnel, CASE WHEN should_paid IS NULL THEN 0 ELSE should_paid END AS should_paid, cardkey, request, cleaning, checkin, checkout from stay'
            sql += ' JOIN responsibility ON stay.room = responsibility.room';
            sql += ' JOIN users ON stay.room = responsibility.room and users.id = responsibility.id';
            sql += ' JOIN reservation ON reservation.email = stay.email and reservation.reservation_time = stay.reservation_time';
            sql += ' JOIN customers ON stay.email = reservation.email and stay.reservation_time = reservation.reservation_time and customers.email = reservation.email';
            sql += ' LEFT JOIN(SELECT SUM(price) as should_paid, room from receipt_service natural join room_service where paid = 0 group by room)a ON stay.room = a.room';

            dbconfig.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.writeHead(200);
                    res.end();
                }
                else {
                    console.log(rows);
                    res.render('room', {stayrooms: rows});
                }
            });
        }
        else res.redirect('/');
    });


    app.get('/reload_table', function (req, res) {
        if (req.cookies.is_logged_in === 'true') {
            var sql = 'SELECT stay.room, users.name as staff_name, nationality, stay.personnel, CASE WHEN should_paid IS NULL THEN 0 ELSE should_paid END AS should_paid, cardkey, request, cleaning, checkin, checkout from stay'
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

            sql = 'SELECT * FROM room';
            dbconfig.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res.writeHead(200);
                    res.end();
                }
                else {
                    res.render('reload_table', { rooms: rows, stayrooms: stay_room });
                }
            });
        }
        else res.redirect('/');
    });

    app.get('/staff', function (req, res) {
        if (req.cookies.is_logged_in === 'true') {
            res.render('staff');
        }
        else res.redirect('/login');
    });



    /* 메인페이지, 내정보, 비밀번호 수정 관련*/
    app.get('/main', function (req, res) {
        if (req.cookies.is_logged_in === 'true') {
            res.render('main');
        }
        else res.redirect('/login');
    });

    app.get('/mypage', function(req,res){
        if (req.cookies.is_logged_in === 'true'){
            res.render('mypage');
        }
        else res.redirect('/login');
    });

    app.get('/changepw', function (req, res) {
        if (req.cookies.is_logged_in === 'true') {
            res.render('changepw');
        }
        else res.redirect('/login');
    });

    
    app.get('/equipment', function (req, res) {
        res.render('equipment');
    });


    
    /* 테스트 관련*/
    app.get('/test', function (req, res) {
        var sql = 'SELECT * FROM TEST'
        dbconfig.query(sql, (err, rows) => {
            console.log(new Date() + ' | testing : ' + rows.length);
            if (err) {
                throw err;
            }
            res.render('reload-test',{data:rows});
        });
    });

    
}