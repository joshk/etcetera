#!/usr/bin/env node

var
	path    = require('path'),
	tomlreader = require('../lib/tomlreader'),
	argv    = require('yargs')
		.usage('generate an upstart file from the provided config\n$0 [-o output] [service-name|configpath]')
		.example('upstarter my-service')
		.example('upstarter -o /etc/whatever /mnt/deploys/my-service/configuration.toml')
		.option('o', {
			alias: 'output',
			default: '/etc/init',
			description: 'where to write the upstart files'
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

var configpath = argv._[0];
if (configpath.indexOf(path.sep) === -1)
{
	configpath = path.join('mnt', 'deploys', argv._[0], 'configuration.toml');
}

function log(msg)
{
	if (argv.silent) return;
	console.log(msg);
}

tomlreader(configpath, argv.output, log, function(err)
{
	if (err) throw err;
	process.exit(0);
});
