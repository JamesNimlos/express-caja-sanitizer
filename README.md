# express-caja-sanitizer
An express middleware inspired from express-sanitizer but additionally sanitizes URL params too. It also provides options to sanitize keys and a preprocessor function to exempt a few values from sanitizing.

## Installation
```
npm install express-caja-sanitizer
```

## Usage
Needs to be called after express.bodyParser() and before anything that requires the sanitized input, e.g.:

```
var express = require('express');
var bodyParser = require('body-parser');
var cajaSanitizer = require('express-caja-sanitizer');

var app = express();

app.use(bodyParser());
app.use(cajaSanitizer());

```

## URL Params
This module by default sanitizes the request url params (`req.params`) e.g.:

```
http://www.myapp.com/rest/user/<script>console.log("hello")</script>bob/details
```

will be sanitized as

```
http://www.myapp.com/rest/user/bob/details
```

## Options

1) `sanitizeKeys`

Defaults to `false` and if set `true` it will sanitize the JSON keys too. e.g.:

```
{
  "id": "1",
  "<script>alert('hey')</script>name": "bob"
}
```

will be sanitized to 

```
{
  "id": "1",
  "name": "bob"
}
```

2) `shouldSanitize`
When 'shouldSanitize` function is provided as an option, the module will sanitize only for the values for which the function returns `true`. 

For example, if we don't want to sanitize XML values then the preprocesser function can be

```
var shouldSanitize = function(value) {
  return !value.startsWith('<?xml version="1.0"')
}
```

##Limitiations
This is a basic implementation of [Caja-HTML-Sanitizer](https://github.com/theSmaw/Caja-HTML-Sanitizer) with the specific purpose of mitigating against persistent XSS risks.

#Caveats
This module trusts the dependencies to provide basic persistent XSS risk mitigation. A user of this package should review all packages and make their own decision on security and fitness for purpose.
