import express from 'express';
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import moment from "moment";

// import auth from '../middlewares/auth.mdw.js';
import productHome from "../models/product.model.js";
import productSearch from "../models/search.model.js";
import userModel from "../models/user.model.js";
import emailModel from "../models/email.models.js";

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
router.use(bodyParser.urlencoded({ extended: false }));

// ---------------- HOME ---------------- //
router.get('/', async function (req, res) {
    const list_1 = await productHome.sortByEndDate();
    const list_2 = await productHome.sortByBid();
    const list_3 = await productHome.sortByPrice();

    // console.log(req.session.auth);
    // console.log(req.session.authUser);

    res.render('home', {
        products: list_1[0],
        products_1: list_2[0],
        products_2: list_3[0]
    });
});

// ---------------- SEARCH ---------------- //
router.get('/search', async function (req, res) {
    const limit = 8;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;

    const total = await productSearch.countAllProducts();
    //console.log(total);
    let nPages = Math.floor(total / limit);
    if (total % limit > 0) {
        nPages++;
    }

    const page_numbers = [];
    for (let i = 1; i <= nPages; i++) {
        page_numbers.push({
            value: i,
            isCurrent: +page === i
        });
    }

    const list = await productSearch.findAllPage(limit, offset);
    res.render('search', {
        products: list[0],
        page_numbers,
        isFirst: page_numbers[0].isCurrent,
        isLast: page_numbers[nPages-1].isCurrent
    });
});

// ---------------- REGISTER ---------------- //
router.get('/register', async function(req, res) {
    res.render('register');
});

router.get('/forget-password', async function(req, res) {
    res.render('otp/forget-password');
});

router.post('/forget-password', async function(req, res) {
    const email = req.body.Email;
    const user = await userModel.findByEmail(email);

    if(user === null){
        return res.render('otp/forget-password',{
            error: 'Email not found. Please try again!'
        });
    }

    req.session.forgetUser = email;
    console.log(req.session.forgetUser);
    const otp = emailModel.sendOTP(email);
    req.body.OTP = otp.toString();
    await userModel.updateUser(req.body);

    return res.redirect('/confirm-otp');
});

router.get('/confirm-otp', async function(req, res) {
    res.render('otp/confirm-otp');
});

router.get('/reset-success', async function(req, res) {
    res.render('otp/reset-success');
});

router.post('/confirm-otp', async function(req, res) {
    const email = req.session.forgetUser;
    console.log(email);
    const ret = await userModel.findOTP(email);
    const otpInput = req.body.OTP;

    if(otpInput !== ret.OTP){
        return res.render('otp/confirm-otp',{
            error: 'OTP is incorrect!'
        });
    }
    const password = emailModel.sendNewPassword(email);
    req.body.Email = email;
    req.body.OTP = 'NULL';
    req.body.Password = password;
    await userModel.updateUser(req.body);

    req.session.forgetUser = null;
    return res.redirect('/reset-success');
});

router.post('/register',urlencodedParser,async function(req, res) {
    const rawPassword = req.body.password;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(rawPassword, salt);
    const today = moment().format();
    const otp = emailModel.sendOTPRegister(req.body.email);

    const user = {
        Email: req.body.email,
        Username: req.body.username,
        Password: hash,
        Name: req.body.fullName,
        Address: null,
        DOB: null,
        RegisterDate: today,
        Type: 2,
        Rate: 0,
        OTP: otp.toString(),
        Valid: false
    }

    await userModel.addUser(user);
    req.session.registerUser = req.body.email;

    res.redirect('/confirm-register');
});

router.get('/confirm-register', async function(req, res) {
    res.render('otp/otp-register');
});

router.get('/register-success', async function(req, res) {
    res.render('otp/register-success');
});

router.post('/confirm-register', async function(req, res) {
    const email = req.session.registerUser;
    const ret = await userModel.findOTP(email);
    const otpInput = req.body.OTP;

    if(otpInput !== ret.OTP){
        return res.render('otp/confirm-otp',{
            error: 'OTP is incorrect!'
        });
    }
    req.body.Email = email;
    req.body.OTP = 'NULL';
    req.body.Valid = true;
    await userModel.updateUser(req.body);

    req.session.registerUser = null;
    return res.redirect('/register-success');
});

router.get('/is-available', async function (req, res) {
    const email = req.query.user;
    const user = await userModel.findByEmail(email);

    if (user === null) {
        return res.json(true);
    }
    else {
        return res.json(false);
    }
});

router.get('/is-available-register', async function (req, res) {
    const email = req.query.user;
    const user = await userModel.findByEmailRegister(email);

    if (user === null) {
        return res.json(true);
    }
    else {
        return res.json(false);
    }
});

router.get('/check-username', async function (req, res) {
    const username = req.query.Username;
    const user = await userModel.findByUsername(username);

    if (user === null) {
        return res.json(true);
    }
    else {
        return res.json(false);
    }
});

router.get('/username-available', async function (req, res) {
    const username = req.query.username;
    const user = await userModel.findByUsernameRegister(username);
    if (user === null) {
        return res.json(true);
    }
    else {
        return res.json(false);
    }
});

// ---------------- LOGIN ---------------- //
router.get('/login', async function (req, res) {
    res.render('login');
});

router.post('/login',urlencodedParser, async function (req, res) {
    const email = req.body.email;
    const user = await userModel.findByEmail(email);

    if(user === null){
        return res.render('login',{
            error: 'Invalid username or password !'
        });
    }

    const ret = bcrypt.compareSync(req.body.password, user.Password);
    if(ret === false){
        return res.render('login',{
            error: 'Invalid username or password!'
        });
    }

    delete user.Password;

    // 1 - Seller , 2 - Bidder, 3 - Admin
    req.session.auth=true;
    req.session.authUser=user;

    if (user.Type === '3') {
        req.session.isSeller = true;
        req.session.isAdmin = true;
    }
    else if (user.Type === '1') {
        req.session.isSeller = true;
        req.session.isAdmin = false;
    }

    const url = req.session.retUrl||'/';
    res.redirect(url);
});

// ---------------- LOGOUT ---------------- //
router.post('/logout', async function(req, res) {
    req.session.auth = false;
    req.session.authUser = null;
    req.session.isSeller = null;
    req.session.isAdmin = null;

    res.locals.auth=req.session.auth;
    res.locals.authUser=req.session.authUser;
    res.locals.isSeller=req.session.isSeller;
    res.locals.isAdmin=req.session.isAdmin;

    const url = req.headers.referer || '/';
    res.redirect(url);
});

router.get('/user/:username', async function (req, res) {
    const Username = req.params.username || 0;

    const user = await userModel.findByUsername(Username);

    res.render('profileUserOther', {
        user
    });
});

export default router;