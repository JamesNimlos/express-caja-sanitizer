/*!
 * express-caja-sanitizer
 * MIT Licensed
 */

var sanitizer = require('sanitizer');
var _ = require('lodash');

module.exports = function expressSanitizer(options) {

  return function expressSanitizer(req, res, next) {
    options = options || {};

    if (!_.isEmpty(options.shouldSanitize) && !isFunction(options.shouldSanitize)) {
      return new Error("shouldSanitize should be a function");
    } else if (!isFunction(options.shouldSanitize)) {
      req.body = sanitizeObject(req.body);
      req.query = sanitizeObject(req.query);
      req.params = sanitizeObject(req.params);
    } else {
      [req.body, req.query, req.params].forEach(function(obj, index, request) {
        if (_.size(obj)) {
          _.pick(obj, function(value, key) {
            if (value) {
              if (!isFunction(options.shouldSanitize) || options.shouldSanitize(key, value)) {
                var tempValue = request[index][key];
                delete request[index][key];
                request[index][cleanse(key)] = cleanse(tempValue);
              }
            }
          });
        }
      });
    }
    next();
  }
}

function isFunction(f) {
  return typeof(f) === "function";
}

function cleanse(val) {
  if (_.isString(val)) {
    return sanitizeString(val);
  }

  if (_.isNumber(val)) {
    return val;
  }

  if (_.isArray(val) || _.isObject(val)) {
    return sanitizeObject(val);
  }
}

function sanitizeString(val) {
  var sanitized = sanitizer.sanitize(val);
  return sanitized;
}

function sanitizeObject(val) {
  var restore;
  try {
    var teardown = JSON.stringify(val);
    var clean = sanitizer.sanitize(teardown);
    restore = JSON.parse(clean);
  } catch (e) {
    restore = val;
  }
  return restore;
}