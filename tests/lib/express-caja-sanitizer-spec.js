var _isNumber = require('lodash.isnumber');

var lib = require('../../lib/express-caja-sanitizer');
var req, req, next;

describe("Express Caja Sanitizer", function() {
	beforeEach(function() {
		req = {
			body: {
				"id": "<script>console.log('hey')</script>185",
				"name": "<a href='javascript:init()'>Bob</a>",
				"xmlData": "<?xml version='1.0' encoding='utf-8'?><Data/>",
				"testFiller": undefined,
				"numeric": 1,
				"boolean": true
			},
			query: {
				"<a href='javascript:init()'>Bob</a>id": "185",
				"arr": ["tom", "harry"],
				"obj": {
					"id": "38ac",
					"name": "caja"
				}
			},
			params: {
				"name": "<script>console.log('a')</script>Bob"
			},
			data: {}
		};
		res = {};
		next = jasmine.createSpy('next');
	});

	it("should initialize the middleware function", function() {
		expect(lib()).not.toBeNull();
		expect(lib({})).not.toBeNull();
	});

	it("should throw error when shouldSanitize is a number", function() {
		var middleware = lib({
			shouldSanitize: 123
		});
		try {
			middleware();
		} catch (e) {
			expect(e.toString()).toEqual("Error: shouldSanitize should be a function");
		}
	});

	it("should throw error when shouldSanitize is a string", function() {
		var middleware = lib({
			shouldSanitize: "string"
		});
		try {
			middleware();
		} catch (e) {
			expect(e.toString()).toEqual("Error: shouldSanitize should be a function");
			expect(next).not.toHaveBeenCalled();
		}
	});

	it("should sanitize req.body, req.query, req.params fully, when shouldSanitize is not given", function() {
		var middleware = lib();
		middleware(req, res, next);

		var expectedBody = '{"id":"185","name":"<a>Bob</a>","xmlData":"","numeric":1,"boolean":true}';
		var expectedParams = '{"name":"Bob"}';
		var expectedQuery = '{"<a>Bob</a>id":"185","arr":["tom","harry"],"obj":{"id":"38ac","name":"caja"}}';

		expect(JSON.stringify(req.body)).toEqual(expectedBody);
		expect(JSON.stringify(req.params)).toEqual(expectedParams);
		expect(JSON.stringify(req.query)).toEqual(expectedQuery);
		expect(next).toHaveBeenCalled();
	});

	it("should sanitize req.body, req.query, req.params only for the (key, value) pairs for which shouldSanitize returns true", function() {
		var middleware = lib({
			shouldSanitize: function(key, value) {
				return _isNumber(value) || (!value.indexOf || value.indexOf("<?xml") === -1);
			}
		});
		delete req.params;
		middleware(req, res, next);
		expect(req.body.xmlData).toEqual("<?xml version='1.0' encoding='utf-8'?><Data/>");
		expect(next).toHaveBeenCalled();
	});
});