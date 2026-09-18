function getPagination(req, defaultRows = 10) {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.rows) || defaultRows;
  const skip = (page - 1) * perPage;

  return { page, perPage, skip };
}

module.exports = getPagination;
