import { Router } from 'express';
import { sequelize } from '../config/database.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'ok', uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'down', message: err.message });
  }
});

export default router;