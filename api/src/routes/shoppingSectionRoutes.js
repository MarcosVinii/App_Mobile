const { Router } = require('express');
const controller = require('../controllers/shoppingSectionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use('/shopping-sections', authMiddleware);

router.put('/shopping-sections/:id', controller.rename);
router.delete('/shopping-sections/:id', controller.remove);

module.exports = router;