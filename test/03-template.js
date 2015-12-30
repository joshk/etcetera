/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand   = require('must'),
	template = require('../index').template
	;

describe('template', function()
{
	it('demands a string file path', function()
	{
		function shouldThrow() { template(); }
		shouldThrow.must.throw(/you must pass a string file path to template()/);
	});

	it('reads the passed-in file path', function(done)
	{
		template(__dirname + '/fixtures/vands.tmpl', function(err, data, variables)
		{
			demand(err).not.exist();
			data.must.be.a.string();
			variables.must.be.an.array();
			variables.indexOf('couchdb_write_primary_url').must.be.above(-1);
			done();
		});
	});
});
