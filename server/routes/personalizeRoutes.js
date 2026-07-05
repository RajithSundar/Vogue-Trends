import express from 'express';
import { personalizeCapsules, chatStylist } from '../controllers/personalizeController.js';

const router = express.Router();

router.post('/', personalizeCapsules);
router.post('/chat', chatStylist);

export default router;
