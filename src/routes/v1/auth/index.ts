import express, { Request, Response } from "express"
import bcrypt from "bcryptjs";
import { myDataSource } from "../../../app-data-source";
import { User } from "../../../entity/user.entity";
import { config } from 'dotenv';

const router = express.Router();

config();

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const userRepository = myDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { username } });
        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid)
                return res.json({ user });
            return res.status(401).json({ error: 'Invalid credentials' });
        } 
        return res.status(404).json({ error: 'User not found' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userRepository = myDataSource.getRepository(User);
        const userExists = await userRepository.findOne({ where: { username } });
        if (userExists)
            return res.status(409).json({ error: 'User already exists' });
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
        await userRepository.save({ username, password: hashedPassword });
        res.json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: 'User creation failed' });
    }
});

export default router;
