const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {
    pool
} = require('./config')
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors())

const login = (req, res) => {
    console.log(req.body)
    let username = req.body.username;
    let password = req.body.password;
    // For the given username fetch user from DB
    let mockedUsername = 'admin';
    let mockedPassword = 'password';

    if (username && password) {
      if (username === mockedUsername && password === mockedPassword) {
        let token = jwt.sign({username: username},
          process.env.JWT_SECRET,
          { expiresIn: '24h' // expires in 24 hours
          }
        );
        // return the JWT token for the future API calls
        res.json({
          success: true,
          message: 'Authentication successful!',
          token: token
        });
      } else {
        res.status(403).json({
          success: false,
          message: 'Incorrect username or password'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Authentication failed! Please check the request'
      });
    }
  };

const getBooks = (request, response) => {
    pool.query('SELECT * FROM books', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const addBook = (request, response) => {
    const {
        author,
        title
    } = request.body

    pool.query('INSERT INTO books (author, title) VALUES ($1, $2)', [author, title], error => {
        if (error) {
            throw error
        }
        response.status(201).json({
            status: 'success',
            message: 'Book added.'
        })
    })
}
app.route('/login').post(login)
app.use(middleware.checkToken)

app
    .route('/books')
    // GET endpoint
    .get(getBooks)
    // POST endpoint
    .post(addBook)



// Start server
app.listen(process.env.PORT || 3002, () => {
    console.log(`Server listening ${process.env.PORT || 3002}`)
})