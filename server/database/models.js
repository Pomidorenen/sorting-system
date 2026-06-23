const sequelize = require('./database');
const { DataTypes } = require('sequelize');

const Address = sequelize.define('address', {
    address_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    country: { type: DataTypes.STRING(100), allowNull: false },
    region: { type: DataTypes.STRING(100) },
    city: { type: DataTypes.STRING(100), allowNull: false },
    street: { type: DataTypes.STRING(100), allowNull: false },
    building: { type: DataTypes.STRING(100), allowNull: false },
    postal_code: { type: DataTypes.STRING(20), allowNull: false }
}, {
    tableName: 'Address',
    timestamps: false
});

const Warehouse = sequelize.define('warehouse', {
    warehouse_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    address_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'Warehouse',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

const Employee = sequelize.define('employee', {
    employee_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING(50), allowNull: false },
    last_name: { type: DataTypes.STRING(50), allowNull: false },
    middle_name: { type: DataTypes.STRING(50) },
    role: { type: DataTypes.ENUM('qc', 'manager'), defaultValue: 'qc' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    login: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false }
}, {
    tableName: 'Employee',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ name: 'idx_employee_login', fields: ['login'] }]
});

const Customer = sequelize.define('customer', {
    customer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    company_name: { type: DataTypes.STRING(200), allowNull: false },
    inn: { type: DataTypes.STRING(12), allowNull: false, unique: true },
    ogrn: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    address_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'Customer',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ name: 'idx_customer', fields: ['company_name', 'inn', 'ogrn'] }]
});

const Order = sequelize.define('order', {
    order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    priority: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1},
    status: {
        type: DataTypes.ENUM('pending', 'in_production', 'sorting', 'completed', 'canceled'),
        defaultValue: 'pending'
    },
    notes: { type: DataTypes.TEXT }
}, {
    tableName: 'Orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ name: 'idx_orders', fields: ['order_number', 'created_at', 'status'] }]
});

const PartType = sequelize.define('partType', {
    part_type_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    type_code: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    price: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: 'Part_Types',
    timestamps: false,
    indexes: [{ name: 'idx_part_types_type_code', fields: ['type_code'] }]
});

const OrderItem = sequelize.define('orderItem', {
    order_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    part_type_id: { type: DataTypes.INTEGER, allowNull: false },
    required_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    price: { type: DataTypes.DECIMAL(12, 2) }
}, {
    tableName: 'Order_Items',
    timestamps: false,
    indexes: [
        { name: 'idx_order_items', fields: ['order_id', 'required_quantity'] }
    ]
});

const Part = sequelize.define('part', {
    part_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    serial_number: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    batch_number: { type: DataTypes.STRING(100) },
    manufacture_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    sorted_at: { type: DataTypes.DATE, allowNull: true },
    warehouse_id: { type: DataTypes.INTEGER },
    qc_inspector_id: { type: DataTypes.INTEGER },
    part_type_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('manufactured', 'sorted'), defaultValue: 'manufactured' }
}, {
    tableName: 'Parts',
    timestamps: false,
    indexes: [{ name: 'idx_parts_search', fields: ['part_type_id', 'manufacture_date', 'serial_number', 'batch_number'] }]
});

const OrderItemPart = sequelize.define('orderItemPart', {
    order_item_part_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_item_id: { type: DataTypes.INTEGER, allowNull: false },
    part_id: { type: DataTypes.INTEGER, allowNull: false, unique: true }
}, {
    tableName: 'Order_Item_Parts',
    timestamps: false,
    indexes: [{ name: 'idx_order_item_part', fields: ['order_item_id', 'part_id'] }]
});

Address.hasMany(Warehouse, { foreignKey: 'address_id', onDelete: 'RESTRICT' });
Warehouse.belongsTo(Address, { foreignKey: 'address_id' });

Address.hasMany(Customer, { foreignKey: 'address_id', onDelete: 'RESTRICT' });
Customer.belongsTo(Address, { foreignKey: 'address_id' });

Customer.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(Customer, { foreignKey: 'customer_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Warehouse.hasMany(Part, { foreignKey: 'warehouse_id' });
Part.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });

Employee.hasMany(Part, { foreignKey: 'qc_inspector_id' });
Part.belongsTo(Employee, { foreignKey: 'qc_inspector_id' });

PartType.hasMany(Part, { foreignKey: 'part_type_id' });
Part.belongsTo(PartType, { foreignKey: 'part_type_id' });

OrderItem.hasMany(OrderItemPart, { foreignKey: 'order_item_id', onDelete: 'CASCADE' });
OrderItemPart.belongsTo(OrderItem, { foreignKey: 'order_item_id' });

Part.hasOne(OrderItemPart, { foreignKey: 'part_id', onDelete: 'RESTRICT' });
OrderItemPart.belongsTo(Part, { foreignKey: 'part_id' });

OrderItem.belongsTo(PartType, { foreignKey: 'part_type_id', onDelete: 'NO ACTION' });
PartType.hasMany(OrderItem, { foreignKey: 'part_type_id' });

module.exports = {
    Address,
    Warehouse,
    Employee,
    Customer,
    Order,
    OrderItem,
    PartType,
    Part,
    OrderItemPart
};