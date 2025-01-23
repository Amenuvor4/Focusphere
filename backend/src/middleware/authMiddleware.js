const jwt = require('jsonwebtoken')

//Middleware to protect routes requiring authentication
const protect = (req, res, next) => {


    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if(!token){
        return res.status(401).json({message: 'No token, authorization denied'});
    }
    
    try {
        //Verify the token using your JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user's ID to teh request object for later use
        req.user = decoded.id;


        //Continue to the next middleware or route handler
        next();
    } catch (error){
        console.error('JWT Verification Error:', error.message)
        res.status(401).json({ message: 'Token is not vaild'});
    }
};

module.exports = protect;