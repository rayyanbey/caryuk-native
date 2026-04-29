const jwt = requiure('jsonwebtoken');
const User = require('../models/user.model');


export const verifyJWT = async(req,res,next)=>{
    const token = req.headers.authorization?.split('Bearer ')[1];
    if(!token){
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}