/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand   = require('must'),
	etcetera = require('../index')
	;

describe('etcetera', function()
{
	it('exports one function', function()
	{
		etcetera.must.have.property('upstart');
		etcetera.upstart.must.be.a.function();
	});
});
