/* global before, beforeEach, after, afterEach, it, describe */

const assert = require('assert');
const { run } = require('../');

describe('Your app', () => {

    function extractMessage({ _source: { message } }) {
        return JSON.parse(message.slice(message.indexOf('{')));
    }

    function mapItem(results) {
        const { data, logTag } = extractMessage(results);
        return {
                logTag,
                data: data.map(item => Object.values(item)[0])
        }
    };
    
    function extractHeaders(results) {
        const { data } = extractMessage(results.hits.hits[0]);
        return data.reduce((res, item) => {
            res.push(Object.keys(item)[0]);
            return res;
        },['logTag']);
    }

    describe('runQuery', () => {

        const host = 'kibana.toolmx.com';
        const port = 9200;
        const query = {
            env: 'qa',
            service: 'searchapp',
            log_level: 'INFO',
            query: 'Timers'
        };

        it('should return true)', async () => {
            try {
                const res = await run(host, port, { 
                    query, mapItem, headers: extractHeaders
                });
                assert.equal(res, true);
            } catch (e) {
                console.error(e);
            }
        });
    });

});
