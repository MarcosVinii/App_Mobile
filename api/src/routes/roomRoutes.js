const { Router } = require('express');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// Todas as rotas de cômodos exigem usuário autenticado
router.use('/rooms', authMiddleware);

router.get('/rooms', roomController.list);
router.post('/rooms', roomController.create);
router.get('/rooms/:id', roomController.getById);
router.put('/rooms/:id', roomController.update);
router.delete('/rooms/:id', roomController.remove);

module.exports = router;