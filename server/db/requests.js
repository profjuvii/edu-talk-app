require('dotenv').config();
const bcrypt = require('bcrypt');
const { app } = require("../app.js");

const { sequelize, User, Topic, Comment, UserTopic } = require('./config.js');

// === USER MODEL ===

// POST: Register
app.post('/users/register', async (req, res) => {
    const data = req.body;

    try {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;

        const user = await User.create(data);
        res.status(201).json({ message: "New user successfully added", user });
    } catch (err) {
        res.status(400).json({ error: 'Failed to register', details: err.message });
    }
});

// POST: Login
app.patch('/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        await user.update({ online: true });

        res.status(200).json({ message: "User successfully logged in", user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to log in', details: err.message });
    }
});

// PATCH: Logout
app.patch('/users/:id/logout', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({ online: false });

        res.status(200).json({ message: 'User successfully logged out', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to log out', details: err.message });
    }
});

// DELETE: Delete user
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.destroy();

        res.status(200).json({ message: 'User successfully deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user', details: err.message });
    }
});

// === TOPIC MODEL ===

// POST: Add new topic
app.post('/topics', async (req, res) => {
    const { text, encodedPhoto, userId } = req.body;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const topic = await Topic.create({
            text,
            encodedPhoto,
            likeCount: 0,
            commentCount: 0,
            userId
        });

        user.topicCount += 1;
        await user.save();

        await UserTopic.create({
            isLiked: false,
            userId,
            topicId: topic.id
        });

        res.status(201).json({ message: "New topic successfully added", topic });
    } catch (err) {
        res.status(400).json({ error: 'Failed to add topic', details: err.message });
    }
});

// GET: All topics
app.get('/users/:id/topics/home', async (req, res) => {
    const { id } = req.params;

    try {
        const topics = await Topic.findAll({
            include: [
                {
                    model: User,
                    attributes: ['username']
                },
                {
                    model: UserTopic,
                    where: { userId: id },
                    required: false
                }
            ]
        });

        const topicsWithUserNamesAndLikes = topics.map(topic => ({
            id: topic.id,
            text: topic.text,
            encodedPhoto: topic.encodedPhoto,
            likes: topic.likeCount,
            comments: topic.commentCount,
            username: topic.User.username,
            isLiked: topic.UserTopics.length > 0 && topic.UserTopics[0].isLiked
        }));

        res.json(topicsWithUserNamesAndLikes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get topics', details: err.message });
    }
});

// GET: All user topics
app.get('/users/:id/topics/my-topics', async (req, res) => {
    const { id } = req.params;

    try {
        const topics = await Topic.findAll({
            where: { userId: id },
            include: {
                model: User,
                attributes: ['username']
            }
        });
        
        const topicsWithUserNames = topics.map(topic => ({
            id: topic.id,
            text: topic.text,
            encodedPhoto: topic.encodedPhoto,
            likes: topic.likeCount,
            comments: topic.commentCount,
            username: topic.User.username,
        }));

        res.json(topicsWithUserNames);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get user topics', details: err.message });
    }
});

// DELETE: Delete topic
app.delete('/topics/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const topic = await Topic.findByPk(id);

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const user = await User.findByPk(topic.userId);

        await topic.destroy();

        user.topicCount -= 1;
        await user.save();

        res.status(200).json({ message: 'Topic successfully deleted' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to delete topic', details: err.message });
    }
});

// PATCH: Update topic text
app.patch('/topics/:id/text', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    try {
        const topic = await Topic.findByPk(id);

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        if (!text || text.trim() === "") {
            return res.status(400).json({ error: 'Text is required' });
        }

        topic.text = text;
        await topic.save();

        res.status(200).json({ message: 'Topic updated successfully', topic });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update topic', details: err.message });
    }
});

// PATCH: Update topic like count
app.patch('/users/:userId/topics/:topicId/likes', async (req, res) => {
    const { userId, topicId } = req.params;
    const { like } = req.body;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const topic = await Topic.findByPk(topicId);

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        topic.likeCount += like;
        await topic.save();

        let userTopic = await UserTopic.findOne({ where: { userId, topicId } });

        if (!userTopic) {
            userTopic = await UserTopic.create({ isLiked: like === 1, userId, topicId });
        } else {
            userTopic.isLiked = like === 1;
            await userTopic.save();
        }

        res.status(200).json({ message: 'Topic updated successfully', topic });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update topic', details: err.message });
    }
});

// === COMMENT MODEL ===

// POST: Add new comment
app.post('/users/:userId/topics/:topicId/comments', async (req, res) => {
    const { userId, topicId } = req.params;
    const { text } = req.body;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const topic = await Topic.findByPk(topicId);

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        if (!text || text.trim() === "") {
            return res.status(400).json({ error: 'Text is required' });
        }

        const comment = await Comment.create({ text, userId, topicId });

        topic.commentCount += 1;
        await topic.save();

        res.status(200).json({ message: 'New comment successfully added', comment });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add comment', details: err.message });
    }
});

// GET: All topic comments
app.get('/topics/:id/comments', async (req, res) => {
    const { id } = req.params;

    try {
        const comments = await Comment.findAll({
            where: { topicId: id },
            include: { model: User, attributes: ['username'] }
        });

        const commentsWithUserNames = comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            username: comment.User.username
        }));

        res.json(commentsWithUserNames);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get topics', details: err.message });
    }
});

module.exports = {
    app,
    sequelize
};