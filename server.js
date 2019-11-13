const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const multer = require('multer')
const {
    pool
} = require('./config')
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const crypto = require('crypto')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "./public/uploads"))
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.substring(file.originalname.lastIndexOf(".") + 1, file.originalname.length);
        cb(null, file.fieldname + '-' + Date.now() + "." + ext)
    }
})
const upload = multer({
    storage: storage
})

const app = express()

app.use(express.static('public'))
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(cors())

const login = (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
        res.status(400).json({
            success: false,
            message: 'Authentication failed! Please check the request'
        });
        return;
    }
    // For the given username fetch user from DB
    pool.query('SELECT * FROM admins WHERE username = $1', [username])
        .then((result) => {
            if (!result) {
                res.status(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                });
                return;
            }
            if (result.rows.length === 0) {
                res.status(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                });
                return;
            }
            let admin_id = result.rows[0].id

            let mockedPassword = result.rows[0].password
            let mockedUsername = username;
            password = crypto.createHash('md5').update(password).digest("hex")
            if (username === mockedUsername && password === mockedPassword) {
                let token = jwt.sign({
                        username: username
                    },
                    process.env.JWT_SECRET, {
                        expiresIn: '24h' // expires in 24 hours
                    }
                );
                // return the JWT token for the future API calls
                res.json({
                    success: true,
                    message: 'Authentication successful!',
                    token: token,
                    admin_details: {
                        id: admin_id,
                        username: username
                    },
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
        if (error) {
            response.status(204).json({
                success: false
            })
            console.error(error)
            return;
        }
        response.status(200).json(results.rows)
    }
    pool.query('SELECT * FROM customers', responseHandler)
}

const getCustomer = (request, response) => {
    let customerID = request.params.customerID;
    let responseHandler = (error, results) => {
        if (error) {
            response.status(204).json({
                success: false
            })
            console.error(error)
            return;
        }
        response.status(200).json(results.rows)
    }
    pool.query('SELECT * FROM customers WHERE id = $1', [customerID], responseHandler)
}

const imgUpload = upload.fields([{
    name: 'pkk',
    maxCount: 1
}, {
    name: 'pktp',
    maxCount: 1
}])

const addCustomers = (request, response) => {
    const files = request.files;
    const pktpFiles = files.pktp ? files.pktp[0].filename : ""
    const pkkFiles = files.pkk ? files.pkk[0].filename : ""
    const {
        name,
        phone,
        country,
        nik,
        nokk,
        status,
        admin_id
    } = request.body

    pool.query('INSERT INTO customers (name, phone, country, nik, nokk, pktp, pkk, status, admin_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [name, phone, country, nik, nokk, pktpFiles, pkkFiles, status, admin_id], (error, result) => {
        if (error) {
            response.status(204).json({
                success: false
            })
            console.error(error)
            return;
        }
        response.status(201).json({
            success: true
        })
    })
}

const updateCustomer = (request, response) => {
    let customerID = request.params.customerID;
    const {
        status,
        admin_id
    } = request.body

    if (!status || !admin_id) {
        response.status(400).json({
            success: false,
            message: 'Update failed! Missing params'
        })
        return;
    }

    pool.query('UPDATE customers SET status = $1, admin_id = $2 WHERE id = $3', [status, admin_id, customerID], (error, result) => {
        if (error) {
            response.status(204).json({
                success: false
            })
            console.error(error)
            return;
        }
        response.status(201).json({
            success: true
        })
    })
}

const getMapper = (request, response) => {
    let localphone = request.params.localphone;
    let responseHandler = (error, results) => {
        if (error) {
            response.status(204).json({
                success: false
            })
            console.error(error)
            return;
        }
        response.status(200).json(results.rows)
    }
    pool.query('SELECT idphone FROM mappers WHERE localphone = $1', [localphone], responseHandler)
}

const updateMapper = (request, response) => {
    const {
        localphone,
        idphone,
        admin_id
    } = request.body

    if (!localphone || !idphone || !admin_id) {
        response.status(400).json({
            success: false,
            message: 'Update failed! Missing params'
        })
        return;
    }

    pool.query('INSERT INTO mappers (localphone, idphone, admin_id) SELECT * FROM UNNEST ($1::text[], $2::text[], $3::int[]) ON CONFLICT (idphone) DO UPDATE SET localphone = EXCLUDED.localphone', [localphone, idphone, admin_id], (error, result) => {
        if (error) {
            response.status(204).json({
                success: false
            })
            console.error(error)
            return;
        }
        response.status(201).json({
            success: true
        })
    })
}

app.route('/login').post(login)
app.route('/customer').post(imgUpload, addCustomers)

//Admin section
app.use(middleware.checkToken)
app.route('/customers').get(getCustomers)
app.route('/customer/:customerID').get(getCustomer).put(updateCustomer)
app.route('/mapper/:localphone').get(getMapper)
app.route('/mapper').post(updateMapper)

// Start server
app.listen(process.env.PORT || 3002, () => {
    console.log(`Server listening ${process.env.PORT || 3002}`)
})