require("dotenv").config();
const { app, sequelize } = require("./db/requests.js");

sequelize.sync().then(() => {
    console.log('All models were synchronized');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));