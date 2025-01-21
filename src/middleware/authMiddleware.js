const jwt = require('jsonwebtoken')

//Middleware to protect routes requiring authentication
const protect = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

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
        res.status(401).json({ message: 'Token is not vaild'});
    }
};

module.exports = protect;