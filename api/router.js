const multer = require('multer');

const express = require("express");
const router = express.Router();

const auth = require('./middlewares/auth.js');
router.use(auth.authInit);

router.get('/v1', function(req, res, next){
  res.json({ version:'1.0.1' });
});

const articlesController = require('./controllers/articles.js');
const categoriesController = require('./controllers/categories.js');
const authController = require('./controllers/auth.js');
const pagesController = require('./controllers/pages.js');
const uploadController = require('./controllers/upload.js');
const imagesController = require('./controllers/images.js');
const tagsController = require('./controllers/tags.js');


router.get(`/v1/articles`, articlesController.index);
router.get(`/v1/articles/:id`, articlesController.show);
router.post(`/v1/articles`, auth.check, articlesController.store);
router.put(`/v1/articles/:id`, auth.check, articlesController.update);
router.delete(`/v1/articles/:id`, auth.check, articlesController.destroy);
router.post(`/v1/articles/bulk-action`, auth.check, articlesController.bulkAction);


router.get(`/v1/categories`, categoriesController.index);
router.get(`/v1/categories/:id`, categoriesController.show);
router.post(`/v1/categories`, auth.check, categoriesController.store);
router.put(`/v1/categories/:id`, auth.check, categoriesController.update);
router.delete(`/v1/categories/:id`, auth.check, categoriesController.destory);


router.get(`/v1/tags`, auth.check, tagsController.index);
router.post(`/v1/tags`, auth.check, tagsController.store);
router.put(`/v1/tags`, auth.check, tagsController.update);
router.delete(`/v1/tags/:id`, auth.check, tagsController.destroy);


router.post('/v1/auth/login', authController.login);
router.post('/v1/auth/send-code', authController.sendCode);
router.post('/v1/auth/register', authController.register);
router.post('/v1/auth/check-code', authController.checkCode);
router.post('/v1/auth/reset-password', authController.resetPassword);


router.post(`/v1/pages`, auth.check, pagesController.store);
router.put(`/v1/pages/:id`, auth.check, pagesController.update);
router.delete(`/v1/pages/:id`, auth.check, pagesController.destroy);


router.post(`/v1/upload`, auth.check, multer().single('file'), uploadController.upload);


router.get(`/v1/images`, auth.check, imagesController.index);
router.delete(`/v1/images/:id`, auth.check, imagesController.destroy);

router.all('*', function (req, res){
  res.status(400).json({error:'router 404'});
});

module.exports = router;
