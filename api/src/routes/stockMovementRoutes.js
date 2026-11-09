const { Router } = require('express');
const controller = require('../controllers/stockMovementController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use('/stock-movements', authMiddleware);

router.get('/stock-movements', controller.list);
router.post('/stock-movements', controller.create);

module.exports = router;