/**
 * Express 5 compatible NoSQL injection sanitizer.
 * express-mongo-sanitize fails because req.query is a getter-only property.
 */
function stripMongoOperators(value) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      value[i] = stripMongoOperators(value[i]);
    }
    return value;
  }

  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
        continue;
      }
      value[key] = stripMongoOperators(value[key]);
    }
  }

  return value;
}

function sanitizeRequest(req, res, next) {
  if (req.body) stripMongoOperators(req.body);
  if (req.params) stripMongoOperators(req.params);
  if (req.query) stripMongoOperators(req.query);
  next();
}

module.exports = sanitizeRequest;
