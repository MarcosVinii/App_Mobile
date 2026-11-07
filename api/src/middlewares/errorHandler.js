function notFound(req, res) {
  res.status(404).json({ message: 'Rota não encontrada.' });
}

// O Express reconhece um tratador de erros pelos 4 parâmetros
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido.' });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}

module.exports = { notFound, errorHandler };