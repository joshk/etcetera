// given a path to a toml file, read it in & emit a massaged set of variables
// very tightly tied to the specific upstart template, sorry

var
	assert     = require('assert'),
	Async      = require('async'),
	chalk      = require('chalk'),
	nunjucks   = require('nunjucks'),
	fs         = require('fs'),
	path       = require('path'),
	shellQuote = require('shell-quote').quote
	;

require('toml-require').install();

var tmplfile = path.resolve(__dirname, '../templates/upstart.tmpl');
var template = fs.readFileSync(tmplfile, 'utf8');
nunjucks.configure({ autoescape: false });

function upstart(input, outputdir, log, callback)
{
	assert(input && typeof input === 'string', 'you must pass a file path as the first argument');
	assert(outputdir && typeof outputdir === 'string', 'you must pass a directory path as the second argument');
	log = log || console.log;

	log('loading config ' + chalk.blue(input));
	var config = require(path.resolve(input));

	var context = {
		app:         config.app,
		description: config.description,
		start:       config.start || 'npm start --',
		env:         '',
		args:        '',
		argv:        (config.argv || []).join(' '),
		deploydir:   path.join('/mnt', 'deploys', config.app) // this would be a command-line option
	};

	var keys = Object.keys(config.environment || {}).sort();
	context.env = keys.map(function(k)
	{
		var value = config.environment[k];
		try
		{
			var obj = JSON.parse(value);
			var isObj = typeof obj === 'object' && !Array.isArray(obj); // covers all non-array objects
			if (isObj)
			{
				value = JSON.stringify(obj).replace(/"/g, '\\"');
			}
		}
		catch (err)
		{
			value = config.environment[k];
		}
		// quoting would have to not suck
		return k + '="' + value + '" \\\n    ';
	}).join('');

	keys = Object.keys(config.arguments || {});
	keys.forEach(function(k)
	{
		context.args += ' --' + k + '=' + shellQuote([config.arguments[k]]) + ' \\\n    ';
	});

	// how many processes? loop, replace %i, and emit
	var processes = config.processes || 1;
	var tasks = [];

	function makeFunc(index)
	{
		var destination = path.join(outputdir, config.app + index + '.conf');

		return function(cb)
		{
			var result = nunjucks.renderString(template, context);
			result = result.replace(/%i/g, index);
			fs.writeFile(destination, result, 'utf8', function(err)
			{
				if (err) log(chalk.red(err.message) + ' ' + destination);
				else log('wrote output: ' + chalk.yellow(destination));
				cb(err);
			});
		};
	}

	for (var i = 0; i < processes; i++)
	{
		tasks.push(makeFunc(i));
	}

	Async.parallel(tasks, callback);
}

module.exports = upstart;
