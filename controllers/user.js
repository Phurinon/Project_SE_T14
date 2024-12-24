const prisma = require("../config/prisma");

exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.uSERS.findMany({
      select: {
        user_id: true,
        email: true,
        role: true,
        is_active: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    //code
    const { user_id, is_active } = req.body;
    console.log(user_id, is_active);
    const user = await prisma.uSERS.update({
      where: { user_id: Number(user_id) },
      data: { is_active: true },
    });

    res.send("Update Status Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    //code
    const { user_id, role } = req.body;

    const user = await prisma.uSERS.update({
      where: { user_id: Number(user_id) },
      data: { role: role },
    });

    res.send("Update Role Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
