/*!
 * express-caja-sanitizer
 * MIT Licensed
 */

var sanitizer = require('sanitizer');
var _ = require('underscore');

module.exports = function expressSanitizer(options) {

  return function expressSanitizer(req, res, next) {
    options = options || {};

    if (options.sanitizeKeys && typeof(options.shouldSanitize) !== "function") {
      req.body = sanitizeObject(req.body);
      req.query = sanitizeObject(req.query);
      req.params = sanitizeObject(req.params);
    } else {
      [req.body, req.query, req.params].forEach(function(val, ipar, request) {
        if (_.size(val)) {
          _.each(val, function(v, ichild) {
            if (v) {
              console.log(typeof(options.shouldSanitize) !== "function", options.shouldSanitize(v));
              if (typeof(options.shouldSanitize) !== "function" || options.shouldSanitize(v)) {
                request[ipar][ichild] = cleanse(v);
              } else {
                request[ipar][ichild] = v;
              }
            }
          });
          if (options.sanitizeKeys) {
            _.each(_.keys(val), function(k) {
              var value = request[ipar][k];
              delete request[ipar][k];
              request[ipar][cleanse(k)] = value;
            });
          }
        }
      });
    }
    next();
  }
}

function cleanse(val) {
  //strings
  if (_.isString(val)) {
    return sanitizeString(val);
  }

  //numbers
  if (_.isNumber(val)) {
    return val;
  }

  //arrays and objects
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
    console.log(e);
    restore = val;
  }
  return restore;
}