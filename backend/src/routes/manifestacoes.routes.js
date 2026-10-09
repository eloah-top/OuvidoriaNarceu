import { Router } from 'express';
import {
  list,
  getById,
  create,
  update,
  remove,
} from '../controllers/manifestacoes.controller.js';

const router = Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
