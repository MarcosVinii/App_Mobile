const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.get('/categories', authMiddleware, categoryController.list);

module.exports = router;