exports.paginate = (page = 1, pageSize = 10) => {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const requestedPageSize = parseInt(pageSize, 10) || 12;
  const limit = Math.min(Math.max(requestedPageSize, 1), 60);
  const offset = (safePage - 1) * limit;
  return { page: safePage, pageSize: limit, limit, offset };
};
