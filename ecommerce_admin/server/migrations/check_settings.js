const mysql = require('mysql2/promise');
(async()=>{
  const c = await mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'',database:'sholok_ecommerce'});
  const [rows] = await c.query('DESCRIBE settings');
  console.log(JSON.stringify(rows,null,2));
  await c.end();
})()
