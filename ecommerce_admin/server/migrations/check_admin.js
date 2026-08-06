const mysql = require('mysql2/promise');
(async()=>{
  const c = await mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'',database:'sholok_ecommerce'});
  const [rows] = await c.query("SELECT password FROM admins WHERE email='mkkhan@gmail.com' LIMIT 1");
  console.log(JSON.stringify(rows[0]));
  await c.end();
})()
