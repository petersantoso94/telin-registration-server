const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {
    pool
} = require('./config')
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const crypto = require('crypto')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors())

const login = (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if(!username || !password){
        res.status(400).json({
            success: false,
            message: 'Authentication failed! Please check the request'
          });
    }
    // For the given username fetch user from DB
    pool.query('SELECT * FROM admins WHERE username = $1',[username])
    .then((result)=>{
        if(!result){
            res.status(403).json({
                success: false,
                message: 'Incorrect username or password'
            });
        }
        if(result.rows.length === 0 ){
            res.status(403).json({
                success: false,
                message: 'Incorrect username or password'
            });
        }
        let mockedPassword = result.rows[0].password
        let mockedUsername = username;
        password = crypto.createHash('md5').update(password).digest("hex")
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
    })
    .catch(e => {
        console.error(e.stack)
        res.status(403).json({
            success: false,
            message: 'Incorrect username or password'
        });
    })
  };

const getCustomers = (request, response) => {
    let customerID = request.params.customerID;
    let responseHandler = (error, results) => {
        console.log(results.rows)
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    }
    pool.query('SELECT * FROM customers', responseHandler)
}
const getCustomer = (request, response) => {
    let customerID = request.params.customerID;
    let responseHandler = (error, results) => {
        console.log(results.rows)
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    }
    pool.query('SELECT * FROM customers WHERE id = $1',[customerID], responseHandler)
}

const addCustomers = (request, response) => {
    const {
        name,
        phone,
        nik,
        nokk,
        pktp,
        pkk,
        status,
        admin_id
    } = request.body

    pool.query('INSERT INTO customers (name, phone, nik, nokk, pktp, pkk, status, admin_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [name, phone, nik, nokk, pktp, pkk, status, admin_id], (error,result) => {
        if (error) {
            throw error
        }
        console.log(result)
        response.status(201).json({
            success: true
        })
    })
}
app.route('/login').post(login)
app.use(middleware.checkToken)
// GET endpoint
app.route('/customers').get(getCustomers)
app.route('/customers/:customerID').get(getCustomer)
// POST endpoint
app.route('/customer').post(addCustomers)



// Start server
app.listen(process.env.PORT || 3002, () => {
    console.log(`Server listening ${process.env.PORT || 3002}`)
})