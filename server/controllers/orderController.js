const Order = require('../models/Order');
const { createNotification } = require('./notificationController');
const { logActivity } = require('./activityLogController');

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

    // Emit order status change to the user
    try {
      const emitter = req.io || global.io;
      if (emitter) emitter.to(order.user.toString()).emit('orderStatusChanged', updatedOrder);
    } catch (emitErr) {
      console.error('Error emitting orderStatusChanged (paid):', emitErr.message);
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

    // Emit order status change to the user
    try {
      const emitter = req.io || global.io;
      if (emitter) emitter.to(order.user.toString()).emit('orderStatusChanged', updatedOrder);
    } catch (emitErr) {
      console.error('Error emitting orderStatusChanged (delivered):', emitErr.message);
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
    // Emit new enquiry to sales in real-time
    try {
      const emitter = req.io || global.io;
      if (emitter) emitter.to('sales').emit('newEnquiry', createdOrder);
    } catch (emitErr) {
      console.error('Error emitting newEnquiry:', emitErr.message);
    }

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

// @desc    Provide quote for an enquiry
// @route   PUT /api/orders/:id/quote
// @access  Private/Sales/Admin
const quoteEnquiry = async (req, res) => {
  const { totalPrice, negotiationNotes } = req.body;
  const order = await Order.findById(req.params.id);

  if (order && order.orderType === 'enquiry') {
    order.totalPrice = Number(totalPrice);
    order.itemsPrice = Number(totalPrice);
    if (negotiationNotes) {
      order.negotiationNotes = negotiationNotes;
    }
    order.enquiryStatus = 'quoted';

    const updatedOrder = await order.save();

    try {
      await createNotification(order.user, {
        type: 'quote_received',
        title: 'Quote Received',
        message: `Sales has provided a quote of ₹${Number(totalPrice).toLocaleString()} for your enquiry #${order._id.toString().slice(-6).toUpperCase()}`,
        link: '/myorders',
      });
    } catch (notifError) {
      console.error('Notification error (quote_received):', notifError.message);
    }

    // Emit real-time quote update to the specific user
    try {
      const emitter = req.io || global.io;
      if (emitter) emitter.to(order.user.toString()).emit('quoteUpdated', updatedOrder);
    } catch (emitErr) {
      console.error('Error emitting quoteUpdated:', emitErr.message);
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Enquiry not found' });
  }
};

// @desc    Accept a quote
// @route   PUT /api/orders/:id/accept-quote
// @access  Private
const acceptQuote = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order && order.orderType === 'enquiry') {
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Mark as accepted and convert the enquiry into a standard order for processing
    order.enquiryStatus = 'accepted';
    order.orderType = 'standard';
    // Ensure itemsPrice reflects the quoted total so totals and payment behave correctly
    if (order.totalPrice && order.totalPrice > 0) {
      order.itemsPrice = Number(order.totalPrice);
    }

    const updatedOrder = await order.save();

    // Notify sales room and the user in real-time
    try {
      const emitter = req.io || global.io;
      if (emitter) {
        // Notify sales dashboards and the customer
        emitter.to('sales').emit('enquiryStatusChanged', updatedOrder);
        emitter.to(order.user.toString()).emit('quoteStatusChanged', updatedOrder);
        // Also emit orderStatusChanged so order-listing components react uniformly
        emitter.to(order.user.toString()).emit('orderStatusChanged', updatedOrder);
      }
    } catch (emitErr) {
      console.error('Error emitting enquiryStatusChanged:', emitErr.message);
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Enquiry not found' });
  }
};

// @desc    Propose a counter-offer (customer)
// @route   PUT /api/orders/:id/counter
// @access  Private
const proposeCounter = async (req, res) => {
  const { counterPrice, counterNotes } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order || order.orderType !== 'enquiry') {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  // Only the customer who requested the enquiry can propose a counter
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (counterPrice !== undefined) {
    order.negotiationNotes = counterNotes || order.negotiationNotes;
    order.counterPrice = Number(counterPrice);
    order.enquiryStatus = 'countered';
  }

  const updatedOrder = await order.save();

  try {
    await createNotification(req.user._id, {
      type: 'quote_counter_proposed',
      title: 'Counter Offer Proposed',
      message: `A customer proposed a counter for enquiry #${order._id.toString().slice(-6).toUpperCase()}`,
      link: `/order/${order._id}`,
    });
  } catch (notifError) {
    console.error('Notification error (counter_proposed):', notifError.message);
  }

  // Emit to sales room so Sales users see the counter immediately
  try {
    const emitter = req.io || global.io;
    if (emitter) emitter.to('sales').emit('quoteCounterProposed', updatedOrder);
  } catch (emitErr) {
    console.error('Error emitting quoteCounterProposed:', emitErr.message);
  }

  // Also emit a generic enquiryStatusChanged to ensure dashboards listening for status updates refresh
  try {
    const emitter = req.io || global.io;
    if (emitter) emitter.to('sales').emit('enquiryStatusChanged', updatedOrder);
  } catch (emitErr) {
    console.error('Error emitting enquiryStatusChanged (counter):', emitErr.message);
  }

  // Emit quoteUpdated back to the customer as well
  try {
    const emitter = req.io || global.io;
    if (emitter) emitter.to(order.user.toString()).emit('quoteUpdated', updatedOrder);
  } catch (emitErr) {
    console.error('Error emitting quoteUpdated (counter):', emitErr.message);
  }

  res.json(updatedOrder);
};

// @desc    Sales propose counter-offer to a customer
// @route   PUT /api/orders/:id/counter-by-sales
// @access  Private/Sales
const salesProposeCounter = async (req, res) => {
  const { counterPrice, counterNotes } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order || order.orderType !== 'enquiry') {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  // Route protected by `sales` middleware; no need to check req.user here
  if (counterPrice !== undefined) {
    order.negotiationNotes = counterNotes || order.negotiationNotes;
    order.counterPrice = Number(counterPrice);
    order.enquiryStatus = 'countered';
  }

  const updatedOrder = await order.save();

  try {
    await createNotification(order.user, {
      type: 'quote_counter_proposed',
      title: 'Counter Offer from Sales',
      message: `Sales proposed a counter of ₹${Number(counterPrice).toLocaleString()} for your enquiry #${order._id.toString().slice(-6).toUpperCase()}`,
      link: `/order/${order._id}`,
    });
  } catch (notifError) {
    console.error('Notification error (sales counter_proposed):', notifError.message);
  }

  try {
    const emitter = req.io || global.io;
    if (emitter) {
      // Notify the customer specifically
      emitter.to(order.user.toString()).emit('quoteUpdated', updatedOrder);
      // Refresh sales dashboards
      emitter.to('sales').emit('enquiryStatusChanged', updatedOrder);
    }
  } catch (emitErr) {
    console.error('Error emitting salesProposeCounter events:', emitErr.message);
  }

  res.json(updatedOrder);
};

// @desc    Sales accept a customer's counter (convert to standard order)
// @route   PUT /api/orders/:id/accept-counter
// @access  Private/Sales
const acceptCounterBySales = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order || order.orderType !== 'enquiry') {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  // Convert enquiry to standard order and accept
  order.enquiryStatus = 'accepted';
  order.orderType = 'standard';
  if (order.counterPrice && order.counterPrice > 0) {
    order.totalPrice = Number(order.counterPrice);
    order.itemsPrice = Number(order.counterPrice);
  } else if (order.totalPrice && order.totalPrice > 0) {
    order.itemsPrice = Number(order.totalPrice);
  }

  const updatedOrder = await order.save();

  try {
    await createNotification(order.user, {
      type: 'general',
      title: 'Counter Accepted',
      message: `Sales accepted the counter for enquiry #${order._id.toString().slice(-6).toUpperCase()}`,
      link: `/order/${order._id}`,
    });
  } catch (notifError) {
    console.error('Notification error (accept counter):', notifError.message);
  }

  try {
    const emitter = req.io || global.io;
    if (emitter) {
      emitter.to('sales').emit('enquiryStatusChanged', updatedOrder);
      emitter.to(order.user.toString()).emit('quoteStatusChanged', updatedOrder);
      emitter.to(order.user.toString()).emit('orderStatusChanged', updatedOrder);
    }
  } catch (emitErr) {
    console.error('Error emitting acceptCounter events:', emitErr.message);
  }

  res.json(updatedOrder);
};

// @desc    Sales decline a customer's counter
// @route   PUT /api/orders/:id/decline-counter
// @access  Private/Sales
const declineCounterBySales = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order || order.orderType !== 'enquiry') {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  order.enquiryStatus = 'rejected';
  const updatedOrder = await order.save();

  try {
    await createNotification(order.user, {
      type: 'general',
      title: 'Counter Declined',
      message: `Sales declined the counter for enquiry #${order._id.toString().slice(-6).toUpperCase()}`,
      link: `/myorders`,
    });
  } catch (notifError) {
    console.error('Notification error (decline counter):', notifError.message);
  }

  try {
    const emitter = req.io || global.io;
    if (emitter) {
      emitter.to('sales').emit('enquiryStatusChanged', updatedOrder);
      emitter.to(order.user.toString()).emit('quoteStatusChanged', updatedOrder);
      emitter.to(order.user.toString()).emit('quoteUpdated', updatedOrder);
    }
  } catch (emitErr) {
    console.error('Error emitting declineCounter events:', emitErr.message);
  }

  res.json(updatedOrder);
};

// @desc    Sales reject an enquiry (at any stage)
// @route   PUT /api/orders/:id/reject
// @access  Private/Sales
const rejectEnquiry = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order || order.orderType !== 'enquiry') {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  order.enquiryStatus = 'rejected';
  order.negotiationNotes = req.body.reason || 'Enquiry rejected by sales.';
  const updatedOrder = await order.save();

  try {
    const emitter = req.io || global.io;
    if (emitter) {
      emitter.to('sales').emit('enquiryStatusChanged', updatedOrder);
      emitter.to(order.user.toString()).emit('quoteStatusChanged', updatedOrder);
      emitter.to(order.user.toString()).emit('orderStatusChanged', updatedOrder);
    }
  } catch (emitErr) {
    console.error('Error emitting reject events:', emitErr.message);
  }

  res.json(updatedOrder);
};

// @desc    Get complete sales pipeline history (all enquiries + converted orders)
// @route   GET /api/orders/sales-history
// @access  Private/Sales/Admin
const getSalesHistory = async (req, res) => {
  // Captures every order that has ever been part of the enquiry pipeline:
  //   - Active enquiries (orderType: 'enquiry') with any status
  //   - Won deals that were converted to standard (enquiryStatus: 'accepted')
  const orders = await Order.find({
    $or: [
      { orderType: 'enquiry' },
      { enquiryStatus: 'accepted' }
    ]
  }).populate('user', 'id name email').sort({ updatedAt: -1 });
  res.json(orders);
};

// @desc    Get won/closed deals from the enquiry pipeline (for Sales Live Sheet)
// @route   GET /api/orders/sales-closed
// @access  Private/Sales/Admin
const getSalesClosedOrders = async (req, res) => {
  // When a quote is accepted, enquiryStatus stays 'accepted' but orderType
  // changes to 'standard'. Query by enquiryStatus to capture these won deals.
  const orders = await Order.find({ enquiryStatus: 'accepted' }).populate('user', 'id name email');
  res.json(orders);
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
  quoteEnquiry,
  acceptQuote,
  proposeCounter,
  salesProposeCounter,
  acceptCounterBySales,
  declineCounterBySales,
  rejectEnquiry,
  getSalesHistory,
  getSalesClosedOrders,
  getStandardOrders,
};

// @desc    Cancel an order (Support/Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private/Support/Admin
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.isDelivered) {
    return res.status(400).json({ message: 'Cannot cancel a delivered order' });
  }

  order.isCancelled = true;
  order.cancelReason = req.body.reason || 'Cancelled by support';
  order.cancelledAt = Date.now();
  order.cancelledBy = req.user._id;

  const updatedOrder = await order.save();

  // Log activity
  await logActivity({
    entityType: 'Order',
    entityId: order._id,
    action: 'Order Cancelled',
    details: `Reason: ${order.cancelReason}`,
    performedBy: req.user._id,
  });

  try {
    await createNotification(order.user, {
      type: 'general',
      title: 'Order Cancelled',
      message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled. Reason: ${order.cancelReason}`,
      link: `/order/${order._id}`,
    });
  } catch (notifError) {
    console.error('Notification error (cancel):', notifError.message);
  }

  try {
    const emitter = req.io || global.io;
    if (emitter) emitter.to(order.user.toString()).emit('orderStatusChanged', updatedOrder);
  } catch (emitErr) {
    console.error('Error emitting orderStatusChanged (cancel):', emitErr.message);
  }

  res.json(updatedOrder);
};

// @desc    Process a refund (Support/Admin)
// @route   PUT /api/orders/:id/refund
// @access  Private/Support/Admin
const processRefund = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!order.isPaid) {
    return res.status(400).json({ message: 'Order is not paid, cannot refund' });
  }

  order.refundStatus = req.body.refundStatus || 'processed';
  order.refundAmount = req.body.refundAmount || order.totalPrice;
  order.refundedAt = Date.now();
  order.refundedBy = req.user._id;

  const updatedOrder = await order.save();

  await logActivity({
    entityType: 'Order',
    entityId: order._id,
    action: 'Refund Processed',
    details: `Amount: ₹${order.refundAmount}. Status: ${order.refundStatus}`,
    performedBy: req.user._id,
  });

  try {
    await createNotification(order.user, {
      type: 'general',
      title: 'Refund Processed',
      message: `A refund of ₹${order.refundAmount?.toLocaleString()} has been processed for order #${order._id.toString().slice(-6).toUpperCase()}.`,
      link: `/order/${order._id}`,
    });
  } catch (notifError) {
    console.error('Notification error (refund):', notifError.message);
  }

  res.json(updatedOrder);
};

// @desc    Update shipping address (Support/Admin)
// @route   PUT /api/orders/:id/update-address
// @access  Private/Support/Admin
const updateShippingAddress = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.isDelivered) {
    return res.status(400).json({ message: 'Cannot change address of a delivered order' });
  }

  const oldAddress = JSON.stringify(order.shippingAddress);
  order.shippingAddress = {
    address: req.body.address || order.shippingAddress.address,
    city: req.body.city || order.shippingAddress.city,
    postalCode: req.body.postalCode || order.shippingAddress.postalCode,
    country: req.body.country || order.shippingAddress.country,
  };

  const updatedOrder = await order.save();

  await logActivity({
    entityType: 'Order',
    entityId: order._id,
    action: 'Shipping Address Updated',
    details: `Old: ${oldAddress}, New: ${JSON.stringify(order.shippingAddress)}`,
    performedBy: req.user._id,
  });

  res.json(updatedOrder);
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
  quoteEnquiry,
  acceptQuote,
  proposeCounter,
  salesProposeCounter,
  acceptCounterBySales,
  declineCounterBySales,
  rejectEnquiry,
  getSalesHistory,
  getSalesClosedOrders,
  getStandardOrders,
  cancelOrder,
  processRefund,
  updateShippingAddress,
};
