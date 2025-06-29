const mysql=require("mysql2");
const pool=mysql.createPool({
    host:"localhost",
    user:"root",
    password:"arijit",
    database:"homezy"
})
module.exports=pool.promise();