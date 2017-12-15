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
			catch (err) { /* ignored */ }

			var key = k;
			var idx = k.indexOf('.');
			if (idx > -1)
				key = k.substring(0, idx);

			var appKey = key + '.' + app;
			var groupKey = (group && key + '.' + group);
			var groupAppKey = group && (appKey + '.' + group);

			/* Precendence:
			     0. `groupAppKey` - '<key>.<application-name>.<group-name>'`
			     1. `groupKey` - `'<key>.<group-name>'`
			     2. `appKey` - `'<key>.<application-name>'`
			     3. `key` - `'<key>'`

			   The reasoning behind `groupKey` being favored over
			   `appKey` is that more often than not, applications
			   will use a configuration value in the same context,
			   so the need to differ them is smaller than the need
			   to differ, for example, a URL by a datacenter.
			*/

			if (groupAppKey && obj[groupAppKey] !== undefined) result[key] = obj[groupAppKey];
			else if (groupKey && obj[groupKey] !== undefined) result[key] = obj[groupKey];
			else if (obj[appKey] !== undefined) result[key] = obj[appKey];
			else result[key] = obj[key];

			if (typeof result[key] === 'object') result[key] = resolve(result[key]);
		});

		return result;
	}

	return resolve(config);
};
