var
	Etcd = require('node-etcd'),
	rc   = require('rc')('renv', {
		hosts: '127.0.0.1:4001',
		ssl:   false
	}, []);

var etcd;

function client(opts)
{
	if (!etcd)
		etcd = new Etcd(opts);
	return etcd;
}

function fetchVariable(variable, app, group, callback)
{
	var etc = client(
		Array.isArray(rc.hosts) ? rc.hosts : [rc.hosts],
		rc.ssl ? true : undefined
	);

	var check = [
		[variable, app, group].join('.'),
		[variable, app].join('.'),
		variable
	];

	function continuer(err, result)
	{
		if (err && err.errorCode !== 100) return callback(err);

		if (!err && result)
		{
			return callback(null, result.node.value);
		}

		if (check.length)
		{
			last = check.shift();
			etc.get(last, continuer);
		}
		else
			callback(new Error('key ' + last + ' not found'));
	}

	var last = check.shift();
	etc.get(last, continuer);
}

module.exports = fetchVariable;
module.exports.client = client;
