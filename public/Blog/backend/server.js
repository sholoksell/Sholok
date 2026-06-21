const app = require('./app');

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`\n🚀 Sholok Blog Server running on port ${PORT}`);
});
