const Order = require('../models/Order');
const { createNotification } = require('./notificationController');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    try {
      await createNotification(req.user._id, {
        type: 'order_placed',
        title: 'Order Placed Successfully',
        message: `Your order #${createdOrder._id.toString().slice(-6).toUpperCase()} has been placed. Total: ₹${createdOrder.totalPrice.toLocaleString()}`,
        link: `/order/${createdOrder._id}`,
      });
    } catch (notifError) {
      console.error('Notification error (order_placed):', notifError.message);
    }

    res.status(201).json(createdOrder);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    try {
      await createNotification(order.user, {
        type: 'order_paid',
        title: 'Payment Confirmed',
        message: `Payment for order #${order._id.toString().slice(-6).toUpperCase()} has been confirmed.`,
        link: `/order/${order._id}`,
      });
    } catch (notifError) {
      console.error('Notification error (order_paid):', notifError.message);
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin/Seller
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    try {
      await createNotification(order.user, {
        type: 'order_delivered',
        title: 'Order Delivered',
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been delivered!`,
        link: `/order/${order._id}`,
      });
    } catch (notifError) {
      console.error('Notification error (order_delivered):', notifError.message);
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
};

// @desc    Create bulk quote enquiry
// @route   POST /api/orders/enquiry
// @access  Private
const createEnquiry = async (req, res) => {
  const { orderItems, customNotes } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      orderType: 'enquiry',
      enquiryStatus: 'pending',
      customNotes,
      // Placeholder data for required fields until quote is accepted
      shippingAddress: { address: 'TBD', city: 'TBD', postalCode: '00000', country: 'TBD' },
      paymentMethod: 'Quote',
      itemsPrice: 0,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 0,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
};

// @desc    Request return for an item
// @route   PUT /api/orders/:id/return-item
// @access  Private
const requestItemReturn = async (req, res) => {
  const { productId, reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized to update this order' });
      return;
    }

    const item = order.orderItems.find((x) => x.product.toString() === productId);

    if (item) {
      item.returnStatus = 'requested';
      item.returnReason = reason;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Item not found in order' });
    }
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get all enquiry orders (for Sales Kanban)
// @route   GET /api/orders/enquiries
// @access  Private/Sales/Admin
const getEnquiries = async (req, res) => {
  const enquiries = await Order.find({ orderType: 'enquiry' }).populate('user', 'id name email');
  res.json(enquiries);
};

// @desc    Get all standard orders (for Support order tracking)
// @route   GET /api/orders/standard
// @access  Private/Support/Admin
const getStandardOrders = async (req, res) => {
  const orders = await Order.find({ orderType: { $ne: 'enquiry' } }).populate('user', 'id name email');
  res.json(orders);
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  createEnquiry,
  requestItemReturn,
  getEnquiries,
  getStandardOrders,
};
