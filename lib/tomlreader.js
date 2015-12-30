// given a path to a toml file, read it in & emit a massaged set of variables
// very tightly tied to the specific upstart template, sorry

var
	assert = require('assert'),
	Async  = require('async'),
	chalk  = require('chalk'),
	dot    = require('dot'),
	fs     = require('fs'),
	path   = require('path')
	;

require('toml-require').install();
dot.templateSettings.strip = false;
var tmplfile = path.resolve(__dirname, '../templates/upstart.tmpl');
var upstart = dot.template(fs.readFileSync(tmplfile));

function tomlreader(input, outputdir, log, callback)
{
	assert(input && typeof input === 'string', 'you must pass a file path as the first argument');
	assert(outputdir && typeof outputdir === 'string', 'you must pass a directory path as the second argument');
	log = log || console.log;

	log('loading config ' + chalk.blue(input));
	var config = require(path.resolve(input));

	var context = {
		app:         config.app,
		description: config.description,
		start:       config.start,
		env:         '',
		args:        '',
		argv:        config.argv.join(' '),
		deploydir:   path.join('mnt', 'deploys', config.app) // this would be a command-line option
	};

	var keys = Object.keys(config.environment).sort();
	keys.forEach(function(k)
	{
		// quoting would have to not suck
		context.env += k + '=' + '"' + config.environment[k] + '" \\\n    ';
	});

	keys = Object.keys(config.arguments);
	keys.forEach(function(k)
	{
		// quoting would have to not suck
		context.args += ' --' + k + '=' + config.arguments[k] + ' \\\n    ';
	});

	// how many processes? loop, replace %i, and emit
	var processes = config.processes || 1;
	var tasks = [];

	function makeFunc(index)
	{
		var destination = path.join(outputdir, config.app + index + '.conf');

		return function(cb)
		{
			var result = upstart(context);
			result = result.replace(/\%i/g, index);
			fs.writeFile(destination, result, 'utf8', function(err)
			{
				if (err) log(chalk.red(err.message) + ' ' + destination);
				else log('wrote ' + chalk.blue(destination));
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

module.exports = tomlreader;
