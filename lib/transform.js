/*
 In here we:
	* resolve app- and group-level configuration
	* parse JSON strings into JSON objects for accessibility

`config` might look like this:
{
	var.app.group: foo,
	var.app.group2: bar,
	var.other: baz,
	var: qux,
	var2: yo
}

We want the following output:
transform(config, 'app', 'group2') => { var: bar, var2: yo }
transform(config, 'app', 'group') => { var: foo, var2: yo }
transform(config, 'other', 'some-other-group') => { var: baz, var2: yo }
transform(config, 'some-other-app') => { var: qux, var2: yo }

Keys not relevant to the app & group specified should be trimmed. Only the top-level
keys should remain in the output.
*/

module.exports = function(config, app, group)
{
	function resolve(obj)
	{
		var result = {};

		Object.keys(obj).forEach(function(k)
		{
			// Parse JSON if possible.
			try
			{
				obj[k] = JSON.parse(obj[k]);
			}
			catch (_) { }

			var key = k;
			var idx = k.indexOf('.');
			if (idx > -1)
				key = k.substring(0, idx);

			var appKey = key + '.' + app;
			var groupKey = group && (appKey + '.' + group);

			if (groupKey && obj[groupKey]) result[key] = obj[groupKey];
			else if (obj[appKey]) result[key] = obj[appKey];
			else result[key] = obj[k];

			if (typeof result[key] === 'object') result[key] = resolve(result[key]);
		});

		return result;
	}

	return resolve(config);
};
