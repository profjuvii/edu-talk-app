require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// === Configuration ===
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    }
});

// === User model ===
const User = sequelize.define('User', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: { type: DataTypes.STRING, unique: true, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: false },
    topicCount: { type: DataTypes.INTEGER, allowNull: false },
    online: { type: DataTypes.BOOLEAN, allowNull: false }
});

// === Topic model ===
const Topic = sequelize.define('Topic', {
    text: { type: DataTypes.STRING, allowNull: false },
    encodedPhoto: { type: DataTypes.TEXT },
    likeCount: { type: DataTypes.INTEGER, allowNull: false },
    commentCount: { type: DataTypes.INTEGER, allowNull: false }
});

// === Comment model ===
const Comment = sequelize.define('Comment', {
    text: { type: DataTypes.STRING, allowNull: false }
});

// === Like model ===
const UserTopic = sequelize.define('UserTopic', {
    isLiked: { type: DataTypes.BOOLEAN, allowNull: false }
});

// === Relationships ===
User.hasMany(Topic, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

User.hasMany(Comment, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

User.hasMany(UserTopic, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

Topic.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

Topic.hasMany(Comment, {
    foreignKey: 'topicId',
    onDelete: 'CASCADE'
});

Topic.hasMany(UserTopic, {
    foreignKey: 'topicId',
    onDelete: 'CASCADE'
});

Comment.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

Comment.belongsTo(Topic, {
    foreignKey: 'topicId',
    onDelete: 'CASCADE'
});

UserTopic.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});

UserTopic.belongsTo(Topic, {
    foreignKey: 'topicId',
    onDelete: 'CASCADE'
});

// === Exports ===
module.exports = {
    sequelize,
    User,
    Topic,
    Comment,
    UserTopic
};