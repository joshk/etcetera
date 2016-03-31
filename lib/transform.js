// In here we:
//   * resolve app- and group-level configuration
//   * parse JSON strings into JSON objects for accessibility
//
module.exports = function(config, app, group)
{
	function resolve(obj)
	{
		Object.keys(obj).forEach(function(k)
		{
			// Parse JSON if possible.
			try
			{
				obj[k] = JSON.parse(obj[k]);
			}
			catch (_) { }

			var appKey = k + '.' + app;
			var groupKey = group && (appKey + '.' + group);

			if (groupKey && obj[groupKey]) obj[k] = obj[groupKey];
			else if (obj[appKey]) obj[k] = obj[appKey];

			if (typeof obj[k] === 'object') obj[k] = resolve(obj[k]);
		});

		return obj;
	}

	return resolve(config);
};
