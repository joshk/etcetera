/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand   = require('must'),
	etcetera = require('../index')
	;

describe('etcetera', function()
{
	it('exports three functions', function()
	{
		etcetera.must.be.an.object();
		etcetera.must.have.property('lookup');
		etcetera.lookup.must.be.a.function();
		etcetera.must.have.property('upstart');
		etcetera.upstart.must.be.a.function();
		etcetera.must.have.property('template');
		etcetera.template.must.be.a.function();
	});
});
