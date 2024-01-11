const Products = require("../model/Products");
const Orders = require("../model/orderSchema");

const cancelorder = async (req, res) => {
  const orderId = req.params.orderId;
  const productId = req.params.productId.trim(); // Trim whitespaces

  try {
    const updatedOrder = await Orders.updateOne(
      {
          _id: orderId,
          'Products._id': productId
      },
      {
          $set: {
              'orderStatus': 'cancelled'
          }
      }
  );
    // Send a response indicating success
    res.json({
      success: true,
      message: "Product cancelled successfully",
      updatedOrder,
    });
  } catch (error) {
    console.error("Error cancelling product:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  cancelorder,
};
