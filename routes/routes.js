const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const fs = require('fs');

// Image Upload
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads')
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname)
  }
})

var upload = multer({
  storage: storage,
}).single("image")

// Insert an user into database route
router.post('/add', upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });

  // user.save((err, result) => {
  //   if(err) {
  //     res.json({message: err.message, type: 'danger'});
  //   }else{
  //     req.session.message = {
  //       type: 'success',
  //       message: 'User added successfully!'
  //     }
  //     res.redirect('/');
  //   }
  // })

  user.save().then(() => {
    req.session.message = {
      type: 'success',
      message: 'User added successfully!'
    }
    res.redirect('/');
  }).catch(err => {
    res.json({message: err.message, type: 'danger'});
  });

})


// Get all users route
router.get('/', async (req, res) => {
  await User.find().then((users) => {
    res.render('index', {title: "Home Page", users: users })
  }).catch((err) => {
    res.json({message: err.message})
  }) 
})

router.get('/add', (req, res) => {
  res.render('add_users', {title: "Add Users"})
})

// Edit an user route
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  User.findById(id).then((user) => {
    user == null && res.redirect('/');
    res.render('edit_users', {title: "Edit User", user: user});
  }).catch((err) => res.redirect('/'));
})

// Update user route
router.post('/update/:id', upload, (req, res) => {
  const id = req.params.id;
  let new_image = '';
  if(req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync(`./uploads/${req.body.old_image}`)
    } catch (error) {
      console.log(error);
    }
  } else {
    new_image = req.body.old_image;
  }
  
  User.findByIdAndUpdate(id, { 
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: new_image
   }).then(() => {
    req.session.message = {
      type:'success',
      message: 'User updated successfully!'
    };
    res.redirect('/');
   }).catch((error) => {
    res.json({message: error.message, type: 'danger'});
   });
})

// Delete user route
router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  User.findByIdAndDelete(id).then((result) => {
    if(result.image != '') {
      try {
        fs.unlinkSync(`./uploads/${result.image}`)
      } catch (error) {
        console.log(error);
      }
    }
    req.session.message = {
      type:'success',
      message: 'User deleted successfully!'
    };
    res.redirect('/');
  }).catch((error) => {
    res.json({message: error.message, type: 'danger'});
  });
})

module.exports = router;