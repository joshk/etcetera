#!/usr/bin/env node

var
	chalk     = require('chalk'),
	fs        = require('fs'),
	path      = require('path'),
	Etcd      = require('node-etcd'),
	objectify = require('etcd-result-objectify'),
	nunjucks  = require('nunjucks'),
	transform = require('../lib/transform.js'),
	rc	  = require('rc')('renv', { hosts: '127.0.0.1:4001',
		ssl:   false
	}, []),
	argv      = require('yargs')
		.usage('configure the named application by filling out its template with data from etcd\n$0 [-d deploydir] [-g hostgroup] [-c template] appname')
		.example('etcetera my-service')
		.example('etcetera -d /mnt/deploys/foozle my-service')
		.option('d', {
			alias: 'deploydir',
			description: 'full path to deploy directory',
		})
		.option('t', {
			alias: 'template',
			default: 'configuration.tmpl',
			description: 'configuration template file name'
		})
		.option('g', {
			alias: 'group',
			description: 'hostgroup, if there is one',
			default: ''
		})
		.option('s', {
			alias: 'silent',
			description: 'do not log helpfully',
			type: 'boolean'
		})
		.help('help')
		.demand(1)
		.argv
	;

var app = argv._[0];
var deploydir = argv.d || path.join('/mnt', 'deploys', app);
var inputTmpl = path.join(deploydir, argv.template);
nunjucks.configure({ autoescape: false });

var etcd = new Etcd(
	Array.isArray(rc.hosts) ? rc.hosts : [rc.hosts],
	rc.ssl ? true : undefined
);

function log(msg)
{
	if (argv.silent) return;
	console.log(msg);
}

function writeConfigurationTemplate(tmplname, callback)
{
	etcd.get('/', { recursive: true }, function(err, reply)
	{
		if (err) return callback(err);

		var objectified = objectify(reply.node);
		var transformed = transform(objectified);
		transformed.it = transformed;

		var destname = tmplname.replace('.tmpl', '.toml');
		var tmpl = nunjucks.renderString(fs.readFileSync(tmplname, 'utf8'), transformed);
		log('-- wrote config: ' + chalk.yellow(destname));
		fs.writeFile(destname, tmpl, 'utf8', function(err)
		{
			callback(err, destname);
		});
	});
}

function dumpFiles(input)
{
	require('toml-require').install();
	var config = require(path.resolve(input));

	// now dump the files listed in config.files
	// This is obviously a hacky step forward from existing config.

	var keys = Object.keys(config.files || {});
	keys.forEach(function(k)
	{
		var fkey = config.files[k];
		etcd.get(fkey, function(err, result)
		{
			if (err)
			{
				log(chalk.red('cannot find key ' + fkey));
				process.exit(1);
			}

			var fname = path.join(deploydir, k);
			fs.writeFile(fname, result.node.value, function(err)
			{
				if (err) console.error(err);
				else log('-- wrote additional file: ' + fname);
			});
		});
	});
}

log('configuring app ' + chalk.blue(app));
log('-- reading template: ' + chalk.blue(inputTmpl));
writeConfigurationTemplate(inputTmpl, function(err, config)
{
	if (err)
	{
		log(chalk.red(err.message) + '; exiting');
		process.exit(1);
	}

	// now we read it & dump any files mentioned
	dumpFiles(config);
});
