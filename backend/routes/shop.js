const express = require("express");
const router = express.Router();
const { createShop, listShops, deleteShop } = require("../controllers/shop");

router.post("/shop", createShop);
router.get("/shop", listShops);
router.delete("/shop", deleteShop);

module.exports = router;
