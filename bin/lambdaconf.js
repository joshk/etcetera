#!/usr/bin/env node

'use strict';

const
	updater = require('update-notifier'),
	pkg = require('../package.json');

updater({pkg}).notify();

const argv = require('yargs')
	.usage('configure the named lambda job from etcd')
	.example('lambdaconf pkg-capsule-lambda')
	.example('lambdaconf -t config.tmpl -o .env my-lambda-func')
	.option('template', {
		alias: 't',
		description: 'name of template file',
		default: 'env.tmpl'
	})
	.option('output', {
		alias: 'o',
		description: 'name of destination config file',
		default: '.env'
	})
	.option('env', {
		alias: 'e',
		description: 'config environment',
		default: 'default'
	})
	.help('help')
	.demand(1)
	.argv
;

const
	chalk     = require('chalk'),
	etcdjs    = require('etcdjs'),
	fs        = require('fs'),
	path      = require('path'),
	objectify = require('etcd-result-objectify'),
	nunjucks  = require('nunjucks'),
	hosts     = require('../lib/rc')(argv),
	transform = require('../lib/transform.js')
;

const etcd = etcdjs(hosts);
const app = argv._[0];
const inputTmpl = path.join('.', argv.template);
const destname = path.join('.', argv.output);

nunjucks.configure({ autoescape: false });

function writeConfigurationTemplate(tmplname, callback)
{
	etcd.get('/', { recursive: true }, function(err, reply)
	{
		if (err) return callback(err);

		var objectified = objectify(reply.node);
		var transformed = transform(objectified, app, argv.group);
		transformed.it = transformed;

		var tmpl = nunjucks.renderString(fs.readFileSync(tmplname, 'utf8'), transformed);
		fs.writeFile(destname, tmpl, 'utf8', function(err)
		{
			if (!err) console.log('-- wrote config: ' + chalk.yellow(destname));
			callback(err, destname);
		});
	});
}

console.log('configuring lambda function ' + chalk.blue(app));
console.log('-- reading template: ' + chalk.blue(inputTmpl));
writeConfigurationTemplate(inputTmpl, function(err, config)
{
	if (err)
	{
		console.log(chalk.red(err.message) + '; exiting');
		process.exit(1);
	}
});
