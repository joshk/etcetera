/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand   = require('must'),
	Etcd = require('node-etcd'),
	lookup = require('../index').lookup,
	sinon = require('sinon')
	;

describe('lookup', function()
{
	var etcd;

	it('exports a function on `client`', function()
	{
		lookup.must.have.property('client');
		lookup.client.must.be.a.function();
	});

	it('client() returns an etcd client', function()
	{
		etcd = lookup.client();
		etcd.must.be.instanceOf(Etcd);
	});

	it('tries three different variations', function(done)
	{
		var spy = sinon.spy(etcd, 'get');
		lookup('a', 'b', 'c', function(err, value)
		{
			err.must.be.an.object();
			err.must.match(/key a not found/);

			spy.called.must.be.true();
			spy.calledWith('a.b.c').must.be.true();
			spy.calledWith('a.b').must.be.true();
			spy.calledWith('a').must.be.true();
			spy.restore();
			done();
		});
	});

	it('returns when it finds a hit', function(done)
	{
		var spy = sinon.spy(etcd, 'get');
		etcd.set('a.b.c', 'hello', function(err)
		{
			demand(err).not.exist();

			lookup('a', 'b', 'c', function(err, value)
			{
				demand(err).not.exist();
				value.must.equal('hello');
				spy.calledOnce.must.be.true();
				spy.calledTwice.must.be.false();
				spy.restore();
				etcd.del('a.b.c', done);
			});
		});
	});
});
