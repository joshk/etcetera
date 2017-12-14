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

	it('preserves all top-level keys', function()
	{
		var input = { foo: { one: '1', two: 2, 'one.app': 'one!!!11!!' } };
		var output = transform(input, 'app');
		output.must.be.an.object();
		output.must.have.property('foo');
		output.foo.must.have.property('one');
		output.foo.one.must.equal('one!!!11!!');
		output.foo.must.have.property('two');
		output.foo.two.must.equal(2);
	});

	it('sets the top-level key when it is missing in the input', function()
	{
		var input = { foo: '{"key.app":"expected"}' };
		var output = transform(input, 'app');
		output.must.eql({ foo: { key: 'expected' }});
	});

	it('sets the top-level key when given matching app & group', function()
	{
		var input = { foo: '{"key.app.group":"expected"}' };
		var output = transform(input, 'app', 'group');
		output.must.eql({ foo: { key: 'expected' }});
	});

	it('sets the top-level key when given matching group', function()
	{
		var input = { foo: '{"key.group":"expected"}' };
		var output = transform(input, 'app', 'group');
		output.must.eql({ foo: { key: 'expected' }});
	});

	it('ignores mismatching apps', function()
	{
		var input = { foo: '{"key.app.group":"expected", "key.other":"not-expected"}' };
		var output = transform(input, 'app', 'group');
		output.must.eql({ foo: { key: 'expected' }});
	});

	it('ignores top-level keys when a matching var is found', function()
	{
		var input = { foo: '{"key":"not-expected","key.app":"expected", "key.other":"to-be-ignored"}' };

		var output = transform(input, 'app');
		output.must.be.an.object();
		output.must.have.property('foo');
		output.foo.must.have.property('key');
		output.foo.key.must.equal('expected');
	});

	it('prefers the top level when app & group do not match', function()
	{
		var input = { foo: '{"key":"expected", "key.other.group2":"not-expected"}' };

		var output = transform(input, 'app');
		output.must.be.an.object();
		output.must.have.property('foo');
		output.foo.must.have.property('key');
		output.foo.key.must.equal('expected');
	});

	it('uses falsey group vars', function()
	{
		var input = { foo: '{"key":"nope", "key.group2":false}' };

		var output = transform(input, 'app', 'group2');
		output.must.be.an.object();
		output.must.have.property('foo');
		output.foo.must.have.property('key');
		output.foo.key.must.equal(false);
	});

	it('uses falsey app vars', function()
	{
		var input = { foo: '{"key":"nope", "key.app":false}' };

		var output = transform(input, 'app');
		output.must.be.an.object();
		output.must.have.property('foo');
		output.foo.must.have.property('key');
		output.foo.key.must.equal(false);
	});

	it('uses falsey app group vars', function()
	{
		var input = { foo: '{"key":"nope", "key.app.group2":false}' };

		var output = transform(input, 'app', 'group2');
		output.must.be.an.object();
		output.must.have.property('foo');
		output.foo.must.have.property('key');
		output.foo.key.must.equal(false);
	});
	it('gracefully ignores group vars', function()
	{
		var input = { foo: '{"key":"not-expected","key.app":"expected", "key.other":"to-be-ignored"}' };
		var withGroup = transform(input, 'app', 'group');

		withGroup.foo.must.be.an.object();
		withGroup.foo.must.have.property('key');
		withGroup.foo.key.must.equal('expected');
		withGroup.must.not.have.property('key.other');
	});
});
