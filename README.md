## es-reports

#### Description
with this module you can make elasticsearch queries and create csv files with the results.

```js
const es_report = require('es-report')

const host = 'www.elasticdata.com';
const port = 8080;
const saveTo = './mydir';
const mapHeaders = ['f1', 'f2', 'f3'];
const query = {
  	env: 'qa',
	service: 'yourapp',
	log_level: 'INFO',
	query: 'some query'
}

const mapItem = (item) => {
	console.log(item);
}

es_report.run(host, port, {
	query,
	mapItem,
	mapHeaders, // or a function
	saveTo,
});

```

## Installation
```bash
$ npm i es-reports
```
