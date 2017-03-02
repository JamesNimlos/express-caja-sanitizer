/*!
 * express-caja-sanitizer
 * MIT Licensed
 */

var sanitizer = require('sanitizer');
var _size = require('lodash.size');
var _pick = require('lodash.pick');
var _isString = require('lodash.isstring');
var _isNumber = require('lodash.isnumber');


module.exports = function expressSanitizer(options) {
  options = options || {};

  return function expressSanitizer(req, res, next) {
    if (options.shouldSanitize !== null && options.shouldSanitize !== undefined && !isFunction(options.shouldSanitize)) {
      throw new Error("shouldSanitize should be a function");
    }

    if (!isFunction(options.shouldSanitize)) {
      req.body = sanitizeObject(req.body);
      req.params = sanitizeObject(req.params);
      req.query = sanitizeObject(req.query);
    } else {
      [req.body, req.query, req.params].forEach(function(obj, index, request) {
        if (_size(obj)) {
          _pick(obj, function(value, key) {
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
  if (_isString(val)) {
    return sanitizeString(val);
  } else if (_isNumber(val)) {
    return val;
  } else {
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