let jwt = require('jsonwebtoken');

let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        res.locals.decoded = decoded;
        next();
      }
    });
  }
};

module.exports = {
  checkToken: checkToken
}