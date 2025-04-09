const jwt = require('jsonwebtoken');
const asyncWrapper = require('../Middleware/async');
const managerModel = require('../Models/landOwner');
const teacherModel = require('../Models/reseacher');
const userModel = require('../Models/user');
const Badrequest=require('../Error/BadRequest');
const Notfound=require('../Error/notFound');
const UnauthorizedError =require('../Error/unauthorized');

const login_post = asyncWrapper(async (req, res, next) => {       
    const { email, password } = req.body;
    const secret = process.env.SECRET_KEY;

    let user = null;
    let role = '';

    // Attempt to login as a teacher
    try {
        user = await teacherModel.login(email, password);
        role = 'researcher';
    } catch (error) {
        console.error('Error logging in as researcher:', error);
    }

    // If not a teacher, attempt to login as a manager
    if (!user) {
        try {
            user = await managerModel.login(email, password);
            role = 'landOwner';
        } catch (error) {
            console.error('Error logging in as landOwner:', error);
        }
    }

    // If not a manager, attempt to login as an admin
    if (!user) {
        try {
            user = await userModel.login(email, password);
            role = 'admin';
        } catch (error) {
            console.error('Error logging in as admin:', error);
        }
    }

    // If no user is found, return an error
    if (!user) {
        console.error('No user found with the provided email and password');
        return next(new Notfound(`Invalid email or password`));
    }

    const { username} = user;
    const token = jwt.sign({ userId:user. _id, username,role }, secret, {
        expiresIn: '1h',
    });

    res.setHeader('Authorization', `Bearer ${token}`);
    const expiryDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    res.cookie(
        'jwt',
        token,
        { httpOnly: true, path: '/', expires: expiryDate, secure: true,sameSite: 'Strict' }
    );

    res.status(200).json({ user: user, token: token });
});

const logout = asyncWrapper(async (req, res, next) => {
    // Retrieve the JWT token from the cookie
    const token = req.cookies.jwt;
    console.log('Token from cookies:', token); // Debug log to check if token is received
  
    // Check if the token exists
    if (!token) {
      // If no token is provided, return a 401 Unauthorized response
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
  
    // Retrieve the secret key from environment variables
    const secret = process.env.SECRET_KEY;
  
    // Verify and decode the token
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        // If token verification fails, return a 401 Unauthorized response
        console.error('JWT Verification Error:', err); // Debug log to check the error
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      } else {
        // If token is valid, clear the JWT token cookie
        res.clearCookie('jwt');
  
        // Send a success response indicating successful logout
        const message = { message: 'Logged out successfully' };
        console.log('Response:', message); // Debug log to check the response
        res.json(message);
      }
    });
  
});

module.exports = {
    login_post,logout
};
