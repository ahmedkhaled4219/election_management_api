import jwt from 'jsonwebtoken';
import { Citizen } from '../models/citizen.js';

export const isAuthenticated = async (req, res, next) => {
    const token = req.header('token');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.citizen = decoded;

        // Fetch citizen details from the database
        const citizen = await Citizen.findById(req.citizen.citizen._id);

        if (!citizen) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        if (!citizen.emailConfirmation) {
            return res.status(403).json({ message: "Your email is not confirmed." });
        }

        if (citizen.status === 'blocked') {
            return res.status(403).json({ message: "Your account is blocked." });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

