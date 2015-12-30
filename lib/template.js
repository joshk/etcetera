var
	assert = require('assert'),
	map    = require('lodash.map'),
	fs     = require('fs')
	;

var tokenPattern = /{{[^}]+}}/g;

function readConfigTemplate(fpath, callback)
{
	assert(fpath && typeof fpath === 'string', 'you must pass a string file path to template()');

	fs.readFile(fpath, 'utf8', function(err, data)
	{
		if (err) return callback(err);

		var matches = data.match(tokenPattern);
		var variables = map(matches, function(v) { return v.replace('{{', '').replace('}}', ''); });

		callback(null, data, variables);
	});
}

module.exports = readConfigTemplate;
