const bcrypt = require('bcrypt');
const e = require('express');
const jwt = require('jsonwebtoken');


export const hashPassword = async (password) => {
    return await bcrypt.hash(password,12);
}

export const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}


export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}