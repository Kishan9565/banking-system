const mongoose = require('mongoose');

function connectToDB(){
      mongoose.connect(process.env.MONGO_URI)
      .then( () =>{
            console.log("Server is Connected to DB")
      })
      .catch(err =>{
            console.error("Error Connecting to DB:", err);
            process.exit(1);
      })
}


module.exports = connectToDB;