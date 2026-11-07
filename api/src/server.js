const app = require('./app');
const { port } = require('./config/env');
const { runMigrations } = require('./database/migrate');

runMigrations();

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});