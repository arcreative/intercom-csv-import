var _ = require('lodash'),
    async = require('async'),
    colors = require('colors'),
    request = require('request');

module.exports = function(users, config) {
    console.log(('Batch updating ' + users.length + ' users...').cyan);

    //Standard request options
    var httpOptions = {
        method: 'POST',
        headers: {
            Authorization: "Basic " + new Buffer(config.APP_ID + ":" + config.API_KEY).toString("base64"),
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }

    // Calculate pages
    var page = 0,
        pageSize = 20,
        totalPages = Math.ceil(users.length / pageSize);

    // Create queue
    var queue = async
        .queue(doRequest, 1);

    // Add tasks to queue
    for (var i = page; i < totalPages; i++) {
        var from = i*pageSize,
            to = (i+1)*pageSize-1;

        // Create request arguments
        var args = _.defaults({
            url: 'https://api.intercom.io/users/bulk',
            body: JSON.stringify({
                users: users.slice(from, to)
            })
        }, httpOptions);

        // Push task
        queue.push(args);
    }

    // Handle done
    queue.drain = function() {
        console.log('Tasks completed.'.green);
    };
};


//Update intercom
function doRequest(args, callback) {
    request(args, function(err, res, body) {
        body = (body || '').trim();
        if (err) {
            console.log('Error requesting users list.'.red);
            throw err;
        } else if (res.statusCode !== 200) {
            console.log('Non-200 response:\n\n'.red, body);
            console.log('Batch users:', JSON.parse(args.body).users);
            process.exit();
        }

        if (body) {

            console.log(body.red);

            try {
                body = JSON.parse(body);
            } catch (e) {
                console.log('Invalid JSON body returned:\n\n'.red, body);
                process.exit(1);
            }
        }

        if ((body.type || '').split('.')[0] === 'error') {
            console.log('Error response received:\n\n'.red, body.errors);
            process.exit(1);
        }

        console.log('Batch update completed...')

        if (callback) {
            callback();
        }
    });
}
