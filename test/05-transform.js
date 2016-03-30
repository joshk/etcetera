/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand    = require('must'),
	transform = require('../lib/transform')
	;

describe('transform', function()
{
	it('returns an empty object when passed one', function()
	{
		transform({}, 'app-foo').must.eql({});
	});

	it('returns an object with simple config values when passed one', function()
	{
		transform({ foo: 'bar' }, 'app-foo').must.eql({ foo: 'bar' });
	});

	it('returns an object with matching app config values', function()
	{
		transform({
			foo: 'bar',
			'foo.app': 'baz'
		}, 'app').must.eql({
			foo: 'baz',
			'foo.app': 'baz'
		});
	});

	it('returns an object with JSON-parsable entries JSON-parsed', function()
	{
		transform({
			foo: '{"abc":"cba"}'
		}, 'app').must.eql({
			foo: { abc: 'cba' }
		});
	});
});
