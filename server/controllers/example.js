// Тут я хочу попбробывать переписать логику одного контролера(для примера взял OrderController)
// Чисто посмотреть сколько строк можно с экономить
const ApiError = require('../error/api-error')
const {Order, Customer, OrderItem, PartType, Part, OrderItemPart} = require('../database/models')
const sequelize = require('../database/database')
const logger = require("../modules/logger");

const wrapperTryCatchError = callbackError => func => {
    return async (...args) => {
        var result;
        try{
            result = await func(...args);
        }catch(e){
            result =  callbackError(...args,e);
        }
        return result;
    }
}

const wrapperTryCatchApiError = description => wrapperTryCatchError((req,res,next,e)=>{
    logger.error(e);
    return next(ApiError.internal(description + e.message))
});

const addNew = wrapperTryCatchApiError("Registration error: ")
(async (req, res, next)=>{
    logger.info("Call " + req.baseUrl + req.url);
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);

    const {customer_id, notes, priority} = req.body;
    if (!customer_id || !notes)
    {
        logger.warn("Invalid order information: " + JSON.stringify(req.body))
        return next(ApiError.badRequest("Incorrect request data"))
    }

    logger.info("Getting order number");
    const [[{queue}]] = await sequelize.query("SELECT nextval('\"Orders_order_id_seq\"') as queue;");

    logger.info("Creating new order");
    const order = await Order.create({
        customer_id,
        notes,
        priority,
        order_number: `${dd}${mm}${yy}H${queue}`
    });

    logger.info("Find customer information");
    const customer = await Customer.findOne({where: {customer_id}});
    order.dataValues.customer = customer?.dataValues;

    logger.done("Sending response");
    return res.json(order);
});

const addItem = wrapperTryCatchApiError("Registration error: ")
(async (req, res, next)=>{
    logger.info("Call " + req.baseUrl + req.url)

    const {order_id, part_type_id, required_quantity } = req.body
    if (!order_id || !part_type_id || !required_quantity)
    {
        logger.warn("Invalid order-item information: " + JSON.stringify(req.body))
        return next(ApiError.badRequest("Incorrect request data"))
    }

    logger.info("Search order")
    const order = await Order.findByPk(order_id)
    if (!order)
    {
        logger.warn("Order is not found")
        return next(ApiError.notFound("Order not found"))
    }

    logger.info("Creating new order-item")
        const item = await OrderItem.create({
        order_id,
        part_type_id,
        required_quantity
    })

    logger.done("Sending response")
    return res.json(item)
});

const findAll = wrapperTryCatchApiError("Fetch error: ")
(async (req,res,next)=>{
    logger.info("Call " + req.baseUrl + req.url)

    let {limit, offset} = req.query
    limit = parseInt(limit) || 20
    offset = parseInt(offset) || 0

    logger.info("Find all orders")
    const orders = await Order.findAndCountAll({
                limit,
                offset,
                distinct: true,
                attributes: {
                    include: [
                        [
                            sequelize.cast(sequelize.literal(`(
                                SELECT SUM(price)
                                FROM "Order_Items" AS orderItems
                                WHERE
                                    orderItems.order_id = "order".order_id
                            )`), "float"),
                            'fullPrice'
                        ],
                        [
                            sequelize.cast(sequelize.literal(`(
                                (
                                    SELECT COUNT(order_item_parts)
                                    FROM "Order_Items"  orderItems
                                    JOIN "Order_Item_Parts" order_item_parts ON order_item_parts.order_item_id = orderItems.order_item_id
                                    WHERE orderItems.order_id = "order".order_id
                                ) * 1.0
                                    /
                                (
                                    SELECT SUM(required_quantity)
                                    FROM "Order_Items" AS orderItems
                                    WHERE orderItems.order_id = "order".order_id
                                )
                            )`), "float"),
                            'completedPercentage'
                        ]
                    ]
                },
                include: [{
                model: Customer, as: 'customer', attributes: ['customer_id', 'company_name']}, {
                model: OrderItem, as: 'orderItems', include: [{
                model: PartType, as: 'partType', attributes: ['part_type_id', 'name', 'price']}, {
                model: OrderItemPart, as: 'orderItemParts', include: [{
                model: Part, as: 'part', attributes: ['part_id', 'serial_number', 'batch_number']}]}]}
        ],
        order: [['created_at', 'DESC']]
    })

    logger.done("Sending response")
    return res.json(orders)
});

const findOne = wrapperTryCatchApiError("Fetch error: ")
(async (req,res,next)=>{
     logger.info("Call " + req.baseUrl + req.url)

            const {id} = req.params

            logger.info("Getting order")
            const order = await Order.findByPk(id, {
                attributes: {
                    include: [
                        [
                            sequelize.cast(sequelize.literal(`(
                                SELECT SUM(price)
                                FROM "Order_Items" AS orderItems
                                WHERE
                                    orderItems.order_id = "order".order_id
                            )`), "float"),
                            'fullPrice'
                        ],
                        [
                            sequelize.cast(sequelize.literal(`(
                                (
                                    SELECT COUNT(order_item_parts)
                                    FROM "Order_Items"  orderItems
                                    JOIN "Order_Item_Parts" order_item_parts ON order_item_parts.order_item_id = orderItems.order_item_id
                                    WHERE
                                        orderItems.order_id = "order".order_id
                                ) * 1.0
                                    /
                                (
                                    SELECT SUM(required_quantity)
                                    FROM "Order_Items" AS orderItems
                                    WHERE
                                        orderItems.order_id = "order".order_id
                                )
                            )`), "float"),
                            'completedPercentage'
                        ]
                    ]
                },
                include: [{
                    model: Customer, as: 'customer', attributes: ['customer_id', 'company_name']}, {
                    model: OrderItem, as: 'orderItems', include: [{
                        model: PartType, as: 'partType', attributes: ['part_type_id', 'name', 'price']}, {
                        model: OrderItemPart, as: 'orderItemParts', include: [{
                            model: Part, as: 'part', attributes: ['part_id', 'serial_number', 'batch_number']}]}]}
                ]
            })

            if (!order)
            {
                logger.warn("Order not found")
                return next(ApiError.notFound("Order not found"))
            }

            logger.done("Sending response")
            return res.json(order)
});

const remove = wrapperTryCatchApiError("Delete error: ")
(async (req,res,next)=>{
        logger.info("Call " + req.baseUrl + req.url)

        const {id} = req.body;

        const order = await Order.findByPk(id)
        if (!order)
        {
            logger.warn("Order not found")
            return next(ApiError.notFound("Order not found"))
        }
        await order.destroy()

        logger.done("Sending response")
        return res.json({message: "Ok"})
})

const deleteItem = wrapperTryCatchApiError("Delete error: ")
(async (req,res,next)=>{
        logger.info("Call " + req.baseUrl + req.url)

        const {id} = req.body;

        const item = await OrderItem.findByPk(id)
        if (!item)
        {
            logger.warn("Item not found")
            return next(ApiError.notFound("Item not found"))
        }
        await item.destroy()

        logger.done("Sending response")
        return res.json({message: "Ok"})
})


module.exports = {
    addNew,
    addItem,
    findAll,
    findOne,
    remove,
    deleteItem
}
