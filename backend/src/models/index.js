const sequelize = require('../config/db')

const User = require('./User')
const Address = require('./Address')
const Category = require('./Category')
const Product = require('./Product')
const ProductImage = require('./ProductImage')
const Coupon = require('./Coupon')
const Order = require('./Order')
const OrderItem = require('./OrderItem')
const OrderStatusHistory = require('./OrderStatusHistory')
const Payment = require('./Payment')
const Review = require('./Review')
const Wishlist = require('./Wishlist')
const { Cart, CartItem } = require('./Cart')
const Banner = require('./Banner')
const CmsPage = require('./CmsPage')
const ContactMessage = require('./ContactMessage')
const NewsletterSubscriber = require('./NewsletterSubscriber')
const Setting = require('./Setting')
const ActivityLog = require('./ActivityLog')
const RefreshToken = require('./RefreshToken')
const EmailVerificationToken = require('./EmailVerificationToken')
const RecentlyViewed = require('./RecentlyViewed')
const SearchLog = require('./SearchLog')
const EmailLog = require('./EmailLog')

// User <-> Address
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses', onDelete: 'CASCADE' })
Address.belongsTo(User, { foreignKey: 'userId' })

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' })
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })

// Product <-> ProductImage
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' })
ProductImage.belongsTo(Product, { foreignKey: 'productId' })

// Product <-> Review
Product.hasMany(Review, { foreignKey: 'productId', as: 'productReviews', onDelete: 'CASCADE' })
Review.belongsTo(Product, { foreignKey: 'productId' })
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' })
Review.belongsTo(User, { foreignKey: 'userId' })

// User <-> Wishlist <-> Product
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist', onDelete: 'CASCADE' })
Wishlist.belongsTo(User, { foreignKey: 'userId' })
Product.hasMany(Wishlist, { foreignKey: 'productId', onDelete: 'CASCADE' })
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// User <-> Cart <-> CartItem <-> Product
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart', onDelete: 'CASCADE' })
Cart.belongsTo(User, { foreignKey: 'userId' })
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' })
CartItem.belongsTo(Cart, { foreignKey: 'cartId' })
Product.hasMany(CartItem, { foreignKey: 'productId', onDelete: 'CASCADE' })
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' })
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Order <-> OrderItem <-> Product
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' })
OrderItem.belongsTo(Order, { foreignKey: 'orderId' })
Product.hasMany(OrderItem, { foreignKey: 'productId' })
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// Order <-> OrderStatusHistory
Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory', onDelete: 'CASCADE' })
OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId' })

// Order <-> Payment
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments', onDelete: 'CASCADE' })
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' })

// User <-> Payment
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' })
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// User <-> ActivityLog
User.hasMany(ActivityLog, { foreignKey: 'userId' })
ActivityLog.belongsTo(User, { foreignKey: 'userId' })

// User <-> RefreshToken (sessions)
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' })
RefreshToken.belongsTo(User, { foreignKey: 'userId' })

// User <-> EmailVerificationToken
User.hasMany(EmailVerificationToken, { foreignKey: 'userId', onDelete: 'CASCADE' })
EmailVerificationToken.belongsTo(User, { foreignKey: 'userId' })

// User <-> RecentlyViewed <-> Product
User.hasMany(RecentlyViewed, { foreignKey: 'userId', as: 'recentlyViewed', onDelete: 'CASCADE' })
RecentlyViewed.belongsTo(User, { foreignKey: 'userId' })
Product.hasMany(RecentlyViewed, { foreignKey: 'productId', onDelete: 'CASCADE' })
RecentlyViewed.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// Order <-> EmailLog (loose reference — email logs survive even if the order concept changes)
Order.hasMany(EmailLog, { foreignKey: 'orderId', as: 'emailLogs' })
EmailLog.belongsTo(Order, { foreignKey: 'orderId' })

module.exports = {
  sequelize,
  User,
  Address,
  Category,
  Product,
  ProductImage,
  Coupon,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  Review,
  Wishlist,
  Cart,
  CartItem,
  Banner,
  CmsPage,
  ContactMessage,
  NewsletterSubscriber,
  Setting,
  ActivityLog,
  RefreshToken,
  EmailVerificationToken,
  RecentlyViewed,
  SearchLog,
  EmailLog,
}
