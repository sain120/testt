module.exports = function(app, db2) {
	console.log('Registering contact API');

	var initialData = [
		{
			country: 'sweden',
			year: 2014,
			eev: 8076,
			ms: 1.53,
			eec: 135002
		},
		{
			country: 'france',
			year: 2014,
			eev: 43605,
			ms: 1.2,
			eec: 489944
		},
		{
			country: 'united kingdom',
			year: 2014,
			eev: 24500,
			ms: 1.1,
			eec: 135002
		},
		{
			country: 'united states',
			year: 2014,
			eev: 291332,
			ms: 0.72,
			eec: 172000
		},
		{
			country: 'china',
			year: 2014,
			eev: 81298,
			ms: 0.23,
			eec: 28619
		},
		{
			country: 'canada',
			year: 2015,
			eev: 3456,
			ms: 0.34,
			eec: 14563
		}
	];

	const BASE_API_URL = '/api/v1';

	function checkJSON(data) {
		return (
			data.country != null &&
			data.year != null &&
			data.eev != null &&
			data.ms != null &&
			data.eec != null
		);
	}

	app.post(BASE_API_URL + '/ec-stats', (req, res) => {
		console.log(req.body);
		if (checkJSON(req.body)) {
			db2.insert(req.body);
			res.sendStatus(201, 'CREATED');
		} else {
			res.sendStatus(400, 'BAD REQUEST');
		}
	});

	app.get(BASE_API_URL + '/ec-stats', (req, res) => {
		var rlimit = req.query.limit;
		var roffset = req.query.offset;
		var rcountry = req.query.country;
		var ryear = req.query.year;
		var reev = req.query.eev;
		var rms = req.query.ms;
		var reec = req.query.eec;

		db2.find({}, (err, row) => {
			row.forEach(r => {
				delete r._id;
			});

			var frows = row;

			if (rcountry != undefined) {
				frows = frows.filter(r => {
					return r.country == rcountry;
				});
			}

			if (ryear != undefined) {
				frows = frows.filter(r => {
					return r.year == ryear;
				});
			}

			if (reev != undefined) {
				frows = frows.filter(r => {
					return r.eev == reev;
				});
			}

			if (rms != undefined) {
				frows = frows.filter(r => {
					return r.ms == rms;
				});
			}

			if (reec != undefined) {
				frows = frows.filter(r => {
					return r.eec == reec;
				});
			}

			if (roffset != undefined) {
				var newFrows = [];

				for (i = roffset; i < frows.length; i++) {
					newFrows.push(frows[i]);
				}

				frows = newFrows;
			}

			if (rlimit != undefined) {
				var newFrows = [];

				for (i = 0; i < rlimit; i++) {
					newFrows.push(frows[i]);
				}

				frows = newFrows;
			}

			res.send(JSON.stringify(frows, null, 2));
			console.log('Data is' + JSON.stringify(frows, null, 2));
			console.log(rcountry);
		});
	});

	app.delete(BASE_API_URL + '/ec-stats/:country/:year', (req, res) => {
		var country = req.params.country;
		var year = req.params.year;

		db2.find({}, (err, rows) => {
			var frows = rows.filter(r => {
				return r.country == country && r.year == year;
			});

			if (frows.length >= 1) {
				var idr = frows[0]._id;
				db2.remove({ _id: idr }, {}, function(err, numRemoved) {});
				res.sendStatus(200, 'REMOVED');
			} else {
				res.sendStatus(404, 'ROW NOT FOUND');
			}
		});
	});

	app.put(BASE_API_URL + '/ec-stats/:country/:year', (req, res) => {
		if (checkJSON(req.body)) {
			var country = req.params.country;
			var year = req.params.year;

			db2.find({}, (err, rows) => {
				var frows = rows.filter(r => {
					return r.country == country && r.year == year;
				});

				if (frows.length >= 1) {
					var idr = frows[0]._id;
					db2.remove({ _id: idr }, {}, function(err, numRemoved) {});
					db2.insert(req.body);
					res.sendStatus(200, 'UPDATED');
				} else {
					res.sendStatus(404, 'ROW NOT FOUND');
				}
			});
		} else {
			res.sendStatus(400, 'BAD REQUEST');
		}
	});

	app.get(BASE_API_URL + '/ec-stats/loadInitialData', (req, res) => {
		console.log('Now get loadInitialData');

		db2.remove({}, { multi: true }, function(err, numRemoved) {});

		db2.insert(initialData);
		res.sendStatus(200);
		console.log('Initial Contacts Loaded' + JSON.stringify(initialData, null, 2));
	});

	app.get(BASE_API_URL + '/ec-stats/:country/:year', (req, res) => {
		var country = req.params.country;
		var year = req.params.year;

		db2.find({}, (err, rows) => {
			rows.forEach(r => {
				delete r._id;
			});

			var frows = rows.filter(r => {
				return r.country == country && r.year == year;
			});

			if (frows.length >= 1) {
				res.send(frows[0]);
			} else {
				res.sendStatus(404, 'ROW NOT FOUND');
			}
		});
	});
};