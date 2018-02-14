const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const elasticsearch = require('elasticsearch');

const defaultPath = path.resolve(__dirname, 'results.csv');

module.exports.run = runQuery;

async function runQuery(esHost, port, options = {}) {

    try {

        assert(esHost, 'host is requered');
        assert(port, 'port is requered');

        const {
            query = {}, mapItem = '', saveTo = defaultPath, headers
        } = options;

        const file = fs.createWriteStream(saveTo);
        const client = new elasticsearch.Client({ host: `${esHost}:${port}` });
        const body = await client.search(formatQuery(query));

        await writeHeaders(file, body, headers);

        await Promise.all(
            body.hits.hits.map(item => new Promise((resolve, reject) => {
                const { logTag, data } = mapItem(item);
                file.write(`${logTag}, ${data.join(',')} ${os.EOL}`, 
                    (err) => err ? reject(err) : resolve()
                );
            }))
        );

        return true;
    } catch (err) {
        console.error('oops...', err);
        return false;
    }
}

function writeHeaders(file, data, headers) {

    let fheaders = [];

    if (typeof headers === 'function') {
        fheaders = headers(data);
    } else if (Array.isArray(headers)){
        fheaders = headers;
    }

    return new Promise((resolve, reject) => {
        file.write(`${fheaders.join(',')} ${os.EOL}`, 
            (err) => err ? reject(err) : resolve()
        );
    })
}

function formatQuery({
    env = 'qa',
    size = 100,
    sort = [{ "_uid": { "order": "desc" } }],
    service = 'searchapp',
    log_level = 'INFO',
    query = '*'
}) {
    return {
        body: {
            query: {
                bool: {
                    must: [
                        {
                            query_string: {
                                query: '*',
                                analyze_wildcard: true
                            }
                        },
                        {
                            match_phrase: {
                                environment: {
                                    query: env
                                }
                            }
                        },
                        {
                            match_phrase: {
                                log_level: {
                                    query: log_level
                                }
                            }
                        },
                        {
                            match_phrase: {
                                service: {
                                    query: service
                                }
                            }
                        },
                        {
                            query_string: {
                                query,
                                analyze_wildcard: true
                            }
                        },
                        {
                            range: {
                                datetime: {
                                    gte: 1518593664063,
                                    lte: 1518608064063,
                                    format: 'epoch_millis'
                                }
                            }
                        }
                    ]
                }
            },
            size,
            sort
        }
    };
}
