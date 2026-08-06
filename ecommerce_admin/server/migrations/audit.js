const mysql = require('mysql2/promise');
(async()=>{
  const c = await mysql.createConnection({host:'127.0.0.1',port:3306,user:'root',password:'',database:'sholok_ecommerce'});
  const [tables] = await c.query('SHOW TABLES');
  const names = tables.map(t => Object.values(t)[0]);
  console.log('TABLES:', names.join(', '));
  for (const t of names) {
    const [cols] = await c.query(`DESCRIBE \`${t}\``);
    console.log(`\n[${t}]`);
    cols.forEach(col => process.stdout.write(`  ${col.Field}(${col.Type}) `));
    console.log('');
  }
  await c.end();
})().catch(e=>console.error(e.message));
