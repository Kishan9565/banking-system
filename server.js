require('dotenv').config();

const dns = require('dns');
dns.setServers(["1.1.1.1"]);
console.log("✅ DNS servers set to", dns.getServers())


const app = require('./src/app');
const connectToDB = require('./src/config/db');

connectToDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
});