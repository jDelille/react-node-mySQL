const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2');

const bodyParser = require('body-parser');
const session = require('express-session');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const db = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: 'JuiceMan12!',
	database: 'crudapp',
});

app.use(express.json());
app.use(
	cors({
		origin: ['http://localhost:3000'],
		methods: ['GET', 'POST'],
		credentials: true,
	})
);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		secret: 'bweem',
		key: 'userId',
		resave: false,
		saveUninitialized: false,
		cookie: {
			sameSite: 'strict',
			expires: 60 * 60 * 24,
		},
	})
);

// user
app.post('/register', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	bcrypt.hash(password, saltRounds, (err, hash) => {
		if (err) console.log(err);

		db.query(
			'INSERT INTO users (username, password) VALUES (?,?)',
			[username, hash],
			(err, result) => {
				if (err) console.log(err);
			}
		);
	});
});
app.get('/login', (req, res) => {
	if (req.session.user) {
		res.send({ loggedIn: true, user: req.session.user });
	} else {
		res.send({ loggedIn: false });
	}
});
app.post('/login', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	db.query(
		'SELECT * FROM users WHERE username = ?',
		[username],
		(err, result) => {
			if (err) console.log(err);
			if (result.length > 0) {
				bcrypt.compare(password, result[0].password, (err, response) => {
					if (response) {
						req.session.user = result;
						console.log(req.session.user);
						res.send(result);
					}
					if (!response)
						res.send({ message: 'Wrong username/password combination' });
				});
			} else {
				res.send({ message: "User doesn't exist" });
			}
		}
	);
});

// posts
app.get('/api/get', (req, res) => {
	const sqlSelect = 'SELECT * FROM movie_reviews';
	db.query(sqlSelect, (err, result) => {
		res.send(result);
	});
});
app.post('/api/insert', (req, res) => {
	const movieName = req.body.movieName;
	const movieReview = req.body.movieReview;

	const sqlInsert =
		'INSERT INTO movie_reviews (movieName, movieReview) VALUES (?,?)';

	db.query(sqlInsert, [movieName, movieReview], (err, result) => {
		console.log(err);
		console.log(result);
	});
});
app.put('/api/update', (req, res) => {
	const name = req.body.movieName;
	const review = req.body.movieReview;
	const sqlUpdate =
		'UPDATE movie_reviews SET movieReview = ? WHERE movieName = ?';

	db.query(sqlUpdate, [review, name], (err, result) => {
		if (err) console.log(err);
	});
});
app.delete('/api/delete/:movieName', (req, res) => {
	const name = req.params.movieName;
	const sqlDelete = 'DELETE FROM movie_reviews WHERE movieName = ?';
	db.query(sqlDelete, name, (err, result) => {
		if (err) console.log(err);
	});
});

app.listen(3001, () => {
	console.log('Hey J Master Bweem, server is running on port 3001');
});
