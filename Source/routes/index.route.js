import express from 'express';
import productHome from "../models/product.model.js";
import productSearch from "../models/search.model.js";

const router = express.Router();

// ---------------- HOME ---------------- //
router.get('/', async function (req, res) {
    const list_1 = await productHome.sortByEndDate();
    const list_2 = await productHome.sortByBid();
    const list_3 = await productHome.sortByPrice();

    console.log(req.session.auth);
    console.log(req.session.authUser);

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

export default router;