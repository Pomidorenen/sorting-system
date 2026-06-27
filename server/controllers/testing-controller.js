const ApiError = require('../error/api-error')
const utils = require('../modules/utils')
const { faker } = require('@faker-js/faker')
const bcrypt = require('bcrypt')
const config = require('../modules/config')
const {
    Address,
    Warehouse,
    Employee,
    Customer,
    Order,
    OrderItem,
    PartType,
    Part,
    OrderItemPart
} = require("../database/models")
const sequelize = require("../database/database")
const logger = require('../modules/logger')

class TestingController
{
    async init(req, res, next)
    {
        try
        {
            if(!config.app.dev_mode) return next(ApiError.forbidden('Testing route is off'))

            let {override_DB, ratio} = req.body

            ratio = parseFloat(ratio)

            const getCount = (count) => {
                return parseInt(count * ratio)
            }

            if(override_DB === "true")
            {
                await sequelize.query("DROP SCHEMA IF EXISTS public CASCADE;\nCREATE SCHEMA public;")
                await sequelize.sync()
            }

            const adminPasswordHash = await bcrypt.hash('1234' + config.encryption.salt, 10)
            const qcPasswordHash = await bcrypt.hash('1234' + config.encryption.salt, 10)

            await Employee.findOrCreate({
                where: {login: 'admin'},
                defaults: {
                    first_name: 'Администратор',
                    last_name: 'Системы',
                    middle_name: 'Главный',
                    role: 'manager',
                    is_active: true,
                    login: 'admin',
                    password_hash: adminPasswordHash
                }
            })
            const [qcInspector] = await Employee.findOrCreate({
                where: {login: 'qc'},
                defaults: {
                    first_name: 'Андрей',
                    last_name: 'Гайдулян',
                    middle_name: 'Сергеевич',
                    role: 'qc',
                    is_active: true,
                    login: 'qc',
                    password_hash: qcPasswordHash
                }
            })

            const warehouseCount = faker.number.int({ min: getCount(3), max: getCount(5) });
            logger.info(warehouseCount);
            const warehouseAddresses = []

            for (let i = 0; i < warehouseCount; i++)
            {
                const address = await Address.create({
                    country: 'Россия',
                    region: faker.location.state(),
                    city: faker.location.city(),
                    street: faker.location.street(),
                    building: faker.number.int({ min: 1, max: 200 }).toString(),
                    postal_code: faker.location.zipCode('######')
                })
                warehouseAddresses.push(address.dataValues)
            }

            const warehouses = [];

            for (let i = 0; i < warehouseAddresses.length; i++)
            {
                const warehouse = await Warehouse.create({
                    name: `Склад №${i + 1} - ${warehouseAddresses[i].city}`,
                    address_id: warehouseAddresses[i].address_id
                })
                warehouses.push(warehouse)
            }

            const customerCount = faker.number.int({ min: getCount(5), max: getCount(10) })
            const customerAddresses = []

            for (let i = 0; i < customerCount; i++)
            {
                const address = await Address.create({
                    country: 'Россия',
                    region: faker.location.state(),
                    city: faker.location.city(),
                    street: faker.location.street(),
                    building: faker.number.int({ min: 1, max: 200 }).toString(),
                    postal_code: faker.location.zipCode('######')
                });
                customerAddresses.push(address.dataValues)
            }

            const customers = []

            for (let i = 0; i < customerAddresses.length; i++)
            {
                const customer = await Customer.create({
                    company_name: faker.company.name(),
                    inn: faker.string.numeric(12),
                    ogrn: faker.string.numeric(15),
                    address_id: customerAddresses[i].address_id
                })
                customers.push(customer.dataValues)
            }

            const partTypeCount = faker.number.int({ min: getCount(10), max: getCount(20) })
            const partTypes = []

            for (let i = 0; i < partTypeCount; i++)
            {
                const name = `${faker.commerce.product()} ${i+1}`
                const partType = await PartType.create({
                    name: name,
                    type_code: utils.TransliterateText(name).toUpperCase().replace(" ", ""),
                    price: faker.number.int({ min: 100, max: 10000 })
                })
                partTypes.push(partType.dataValues)
            }

            const partCount = faker.number.int({ min: getCount(50), max: getCount(100) })
            const parts = []

            for (let i = 0; i < partCount; i++)
            {
                const d = new Date()
                const dd = String(d.getDate()).padStart(2, '0')
                const mm = String(d.getMonth() + 1).padStart(2, '0')
                const yy = String(d.getFullYear()).slice(-2)
                const isSorted = faker.datatype.boolean(0.6)
                const partType = faker.helpers.arrayElement(partTypes)
                const part = await Part.create({
                    serial_number: `SN-${partType.type_code.toUpperCase()}${dd}${mm}${yy}H${i}Z`,
                    batch_number: `B-${faker.number.int({ min: 1000, max: 9999 })}Z`,
                    manufacture_date: faker.date.past({ years: 1 }),
                    sorted_at: isSorted ? faker.date.recent({ days: 30 }) : null,
                    warehouse_id: isSorted ? faker.helpers.arrayElement(warehouses).warehouse_id : null,
                    qc_inspector_id: isSorted ? qcInspector.dataValues.employee_id : null,
                    part_type_id: partType.part_type_id,
                    status: isSorted ? 'sorted' : 'manufactured'
                })
                parts.push(part.dataValues)
            }

            const orderCount = faker.number.int({ min: getCount(10), max: getCount(15) })
            const orders = []
            for (let i = 0; i < orderCount; i++)
            {
                const order = await Order.create({
                    order_number: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
                    customer_id: faker.helpers.arrayElement(customers).customer_id,
                    priority: faker.number.int({ min: 1, max: 5 }),
                    status: faker.helpers.arrayElement(['pending', 'in_production', 'sorting', 'completed']),
                    notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null
                })
                orders.push(order.dataValues)
            }

            const allOrderItems = []

            for (const order of orders)
            {
                const itemCount = faker.number.int({ min: getCount(2), max: getCount(5) })

                for (let i = 0; i < itemCount; i++)
                {
                    const partType = faker.helpers.arrayElement(partTypes)
                    const orderItem = await OrderItem.create({
                        order_id: order.order_id,
                        part_type_id: partType.part_type_id,
                        required_quantity: faker.number.int({ min: 3, max: 15 }),
                        price: partType.price
                    })
                    allOrderItems.push(orderItem)
                }
            }

            const sortedParts = parts.filter(p => p.status === 'sorted')
            let assignedPartsCount = 0

            for (const orderItem of allOrderItems)
            {
                const shouldFillCompletely = faker.datatype.boolean(0.6)

                if (!shouldFillCompletely) continue

                const availableParts = sortedParts.filter(p => p.part_type_id === orderItem.part_type_id && !p.assigned)

                const quantityToAssign = Math.min(
                    faker.number.int({ min: 1, max: orderItem.required_quantity }),
                    availableParts.length
                )

                for (let i = 0; i < quantityToAssign; i++)
                {
                    if (availableParts[i])
                    {
                        await OrderItemPart.create({
                            order_item_id: orderItem.order_item_id,
                            part_id: availableParts[i].part_id
                        });
                        availableParts[i].assigned = true
                        assignedPartsCount++;
                    }
                }
            }

            return res.json({message: "Ok"})
        }
        catch (e)
        {
            console.log(e)
            return next(ApiError.internal('Request error: ' + e.message))
        }
    }
}

module.exports = new TestingController()