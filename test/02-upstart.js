/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand   = require('must'),
	fs       = require('fs'),
	upstart = require('../index').upstart
	;

describe('upstart', function()
{
	it('demands a string file path', function()
	{
		function shouldThrow() { upstart(); }
		shouldThrow.must.throw(/file path as the first/);
	});

	it('demands a string directory path', function()
	{
		function shouldThrow() { upstart('a'); }
		shouldThrow.must.throw(/directory path as the second/);
	});

	it('writes stuff', function(done)
	{
		upstart(__dirname + '/fixtures/test1.toml', '.', function() {}, function(err)
		{
			demand(err).not.exist();

			fs.existsSync('./testapp0.conf').must.be.true();
			fs.existsSync('./testapp1.conf').must.be.true();
			fs.existsSync('./testapp2.conf').must.be.true();
			fs.existsSync('./testapp4.conf').must.be.false();

			var data = fs.readFileSync('./testapp2.conf', 'utf8');
			data.must.match(/description "I am a test"/);

			fs.unlinkSync('./testapp0.conf');
			fs.unlinkSync('./testapp1.conf');
			fs.unlinkSync('./testapp2.conf');

			done();
		});
	});

	it('handles objects', function(done)
	{
		upstart(__dirname + '/fixtures/user-acl-two.toml', '.', function() {}, function(err)
		{
			demand(err).not.exist();

			fs.existsSync('./user-acl-two0.conf').must.be.true();
			fs.existsSync('./user-acl-two1.conf').must.be.true();
			fs.existsSync('./user-acl-two2.conf').must.be.true();
			fs.existsSync('./user-acl-two3.conf').must.be.true();
			fs.existsSync('./user-acl-two4.conf').must.be.false();

			var data = fs.readFileSync('./user-acl-two3.conf', 'utf8');
			data.must.match(/"staging"/);
			data.must.match(/{\\"step3\\":0}/);

			fs.unlinkSync('./user-acl-two0.conf');
			fs.unlinkSync('./user-acl-two1.conf');
			fs.unlinkSync('./user-acl-two2.conf');
			fs.unlinkSync('./user-acl-two3.conf');

			done();
		});
	});
});
