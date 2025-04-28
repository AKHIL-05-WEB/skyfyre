var express = require('express');
var router = express.Router();
const db = require('../config/connection');
var productHelper = require('../helpers/product-helpers');
const path = require('path');
const fs = require('fs');
const userHelpers = require('../helpers/users-helpers');

/* Admin login page */
router.get('/admin-login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/');
  } else {
    res.render('admin/admin-login', { adminLogin: true, error: req.session.adminLoginErr });
    req.session.adminLoginErr = false;
  }
});

/* Admin login post */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === '123' && password === '123') {
    req.session.adminLoggedIn = true;
    res.render('/');
  } else {
    req.session.adminLoginErr = 'Invalid username or password';
    res.redirect('/admin/admin-login');
  }
});

/* Admin logout */
router.get('/logout', (req, res) => {
  req.session.adminLoggedIn = false;
  res.redirect('/admin/login');
});

/* Middleware to verify admin login */
function verifyAdminLogin(req, res, next) {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect('/admin/admin-login');
  }
}

/* Admin dashboard (View Products) */
router.get('/', verifyAdminLogin, function(req, res) {
  productHelper.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products });
  });
});

/* Add product page */
router.get('/add-product', verifyAdminLogin, function(req, res) {
  res.render('admin/add-product', { admin: true });
});

/* Add product post */
router.post('/add-product', verifyAdminLogin, (req, res) => {
  const userData = req.body;
  productHelper.addProduct(userData, (id) => {
    let image = req.files.image;
    let imagePath = path.join(__dirname, '../public/images/product-images', `${id}.png`);
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });
    image.mv(imagePath, (err) => {
      if (err) {
        console.log('❌ Image upload error:', err);
      } else {
        console.log('✅ Image uploaded successfully');
      }
      res.redirect('/admin');
    });
  });
});

/* Delete product */
router.get('/delete-product/:id', verifyAdminLogin, (req, res) => {
  let proId = req.params.id;
  productHelper.deletePRoduct(proId).then(() => {
    res.redirect('/admin');
  }).catch((err) => {
    console.error("Error deleting product:", err);
    res.status(500).send("Something went wrong");
  });
});

/* Edit product page */
router.get('/edit-product/:id', verifyAdminLogin, async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  res.render('admin/edit-product', { admin: true, product });
});

/* Edit product post */
router.post('/edit-product/:id', verifyAdminLogin, (req, res) => {
  let id = req.params.id;
  productHelper.updateProduct(id, req.body).then(() => {
    if (req.files && req.files.image) {
      let image = req.files.image;
      let imageName = `${id}.png`;
      let imagePath = path.join(__dirname, '../public/images/product-images', imageName);

      image.mv(imagePath, async (err) => {
        if (err) {
          console.log('❌ Image upload error:', err);
          return res.redirect('/admin');
        }

        console.log('✅ Image uploaded successfully');
        await productHelper.updateProductImage(id, `images/product-images/${imageName}`);
        res.redirect('/admin');
      });
    } else {
      res.redirect('/admin');
    }
  });
});

module.exports = router;
