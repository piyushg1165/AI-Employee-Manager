const crypto = require('crypto');


function cacheKeyFor(sql, params) {
  const h = crypto.createHash('sha256');
  h.update(sql + '||' + JSON.stringify(params || []));
  return 'sqlcache:' + h.digest('hex');
}

module.exports = { cacheKeyFor };
