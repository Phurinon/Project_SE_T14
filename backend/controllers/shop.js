const prisma = require("../config/prisma");

exports.createShop = async (req, res) => {
  try {
    const { shop_name, address, is_active, Location } = req.body;

    // Validate input
    if (!shop_name) {
      return res.status(400).json({ message: "Shop name is required!!!" });
    }
    if (!address) {
      return res.status(400).json({ message: "Address is required!!!" });
    }
    if (!Location || !Location.location_name || !Location.coordinates) {
      return res
        .status(400)
        .json({ message: "Location details are required!!!" });
    }

    // Check if the shop already exists
    const existingShop = await prisma.sHOP.findFirst({
      where: {
        shop_name,
      },
    });
    if (existingShop) {
      return res.status(400).json({ message: "Shop already exists!!!" });
    }

    // Create a new shop with the associated location
    const newShop = await prisma.sHOP.create({
      data: {
        shop_name,
        address,
        is_active: is_active ?? true, // Default to true if `is_active` is not provided
        LOCATION: {
          create: {
            location_name: Location.location_name,
            coordinates: Location.coordinates,
          },
        },
      },
    });

    res
      .status(201)
      .json({ message: "Shop created successfully!", shop: newShop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listShops = async (req, res) => {
  try {
    const { shop_name } = req.query;
    // Search for shops matching the shop_name
    const shops = await prisma.sHOP.findMany({
      where: {
        shop_name: {
          contains: shop_name, // Allow searching all shops if shop_name is not provided
          mode: "insensitive", // Optional: Case-insensitive search
        },
      },
      select: {
        shop_name: true,
        address: true,
        is_active: true,
        LOCATION: {
          select: {
            location_name: true,
            coordinates: true,
          },
        },
      },
    });

    // Check if shops were found
    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "Shop not found!!!" });
    }

    // Return the matched shops
    res.status(200).json({ shops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    const { shop_name } = req.query;
    //check if shop exists
    const shop = await prisma.sHOP.findFirst({
      where: {
        shop_name: shop_name,
      },
    });
    if (!shop) {
      return res.status(400).json({ message: "Shop not found!!!" });
    }
    //delete shop
    await prisma.sHOP.delete({
      where: {
        shop_name: shop_name,
        shop_id: shop.shop_id,
      },
    });
    res.status(200).json({ message: "Shop deleted successfully!!!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
