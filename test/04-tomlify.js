/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand   = require('must'),
	fs       = require('fs'),
	tomlreader = require('../index').tomlreader
	;

describe('tomlreader', function()
{
	it('demands a string file path', function()
	{
		function shouldThrow() { tomlreader(); }
		shouldThrow.must.throw(/file path as the first/);
	});

	it('demands a string directory path', function()
	{
		function shouldThrow() { tomlreader('a'); }
		shouldThrow.must.throw(/directory path as the second/);
	});

	it('writes stuff', function(done)
	{
		tomlreader(__dirname + '/fixtures/test1.toml', '.', function() {}, function(err)
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
});
