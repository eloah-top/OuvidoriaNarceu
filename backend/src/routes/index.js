import { Router } from 'express';
import healthRoutes from './health.routes.js';
import manifestacoesRoutes from './manifestacoes.routes.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ name: 'OuvidoriaNarceu API', version: '0.1.0' });
});

router.use('/health', healthRoutes);
router.use('/manifestacoes', manifestacoesRoutes);

export default router;
