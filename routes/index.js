var express = require('express');
var router = express.Router();
var axios = require('axios');
var url = require('url');

router.get('/api/items', async function(req, res, next) {
    const query = req.query.query;

    const searchResp = await axios({
        url: `https://api.mercadolibre.com/sites/MLA/search?q=${query}`,
        method: 'get'
    });

    const list = searchResp.data.results.splice(1, 4);

    let objArr = new Object({
        author: {
            name: "irene",
            lastname: "garcia"
        },
        categories: [],
        items: []
    });

    for (let item of list) {
        let cagoriesTemp = await getCategoryInfo(item.category_id);

        for (let category of cagoriesTemp) {
            if (!(objArr.categories.some(elem => JSON.stringify(elem) === JSON.stringify(category)))) {
                objArr.categories.push(category);
            }
        }

        objArr.items.push(new Object({
            id: item.id,
            title: item.title,
            price: {
                currency: item.currency_id,
                amount: item.price,
                decimals: 0,
            },
            address: item.address.state_name,
            picture: item.thumbnail,
            free_shipping: item.shipping.free_shipping,
            condition: item.condition,
        }));
    }
    res.json(objArr);
});

async function getCategoryInfo(categoryId) {
    const res = await axios({
        url: `https://api.mercadolibre.com/categories/${categoryId}`,
        method: 'get'
    });
    return res.data.path_from_root.map(function(category) {
        return category.name;
    });
}

// GET BY ID
router.get('/api/item/:id', async function(req, res, next) {
    const id = req.params.id;

    const resp = await axios({
        url: `https://api.mercadolibre.com/items/${id}`,
        method: 'get'
    });

    const respDescription = await axios({
        url: `https://api.mercadolibre.com/items/${id}/description`,
        method: 'get'
    });

    let obj = new Object({
        author: {
            name: "irene",
            lastname: "garcia"
        },
        items: new Object({
            id: resp.data.id,
            title: resp.data.title,
            price: {
                currency: resp.data.currency_id,
                amount: resp.data.price,
                decimals: 0,
            },
            picture: resp.data.pictures[0].url,
            free_shipping: resp.data.shipping.free_shipping,
            condition: resp.data.condition,
            sold_quantity: resp.data.sold_quantity,
            description: respDescription.data.plain_text
        }),
        categories: []
    });

    let respCagories = await getCategoryInfo(resp.data.category_id);

    for (let category of respCagories) {
        if (!(obj.categories.some(elem => JSON.stringify(elem) === JSON.stringify(category)))) {
            obj.categories.push(category);
        }
    }

    res.json(obj);
});

module.exports = router;