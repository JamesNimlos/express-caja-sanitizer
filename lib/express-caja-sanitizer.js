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
      throw new Error("shouldSanitize should be a function");
    }

    if (!isFunction(options.shouldSanitize)) {
      [req.body, req.query, req.params].forEach(function(obj) {
        obj = sanitizeObject(obj);
      });
    } else {
      [req.body, req.query, req.params].forEach(function(obj, index, request) {
        if (_.size(obj)) {
          _.pick(obj, function(value, key) {
            if (value) {
              if (options.shouldSanitize(key, value)) {
                var tmp = request[index][key];
                delete request[index][key];
                request[index][cleanse(key)] = cleanse(tmp);
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
  return sanitizer.sanitize(val);
}

function sanitizeObject(val) {
  try {
    var teardown = JSON.stringify(val);
    var clean = sanitizer.sanitize(teardown);
    return JSON.parse(clean);
  } catch (e) {
    return val;
  }
}