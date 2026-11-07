function getHealth(req, res) {
  res.json({
    status: 'ok',
    app: 'Casa em Ordem API',
    timestamp: new Date().toISOString(),
  });
}

module.exports = { getHealth };
