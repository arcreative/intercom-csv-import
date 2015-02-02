var argv = require('minimist')(process.argv.slice(2)),
    colors = require('colors'),
    csv = require('csv'),
    fs = require('fs');

//Local modules
var updateIntercom = require('./src/update-intercom'),
    intercomConfig = require('./intercom-config');

//Get input file
try {
    var contents = fs.readFileSync(argv._[0], {
        encoding: 'utf-8'
    })
} catch (e) {
    console.log("Error reading input file.".red);
    process.exit(1);
}

//Parse input file
csv.parse(contents, function(err, data) {
    if (err) {
        throw err;
    }

    //Process into unique email hash
    var users = {};
    data.forEach(function(row) {
        var email = row[0],
            createdTime = Math.round(new Date(row[1]).valueOf() / 1000);
        users[email] = {
            email: email,
            custom_attributes: {
                is_us_presignup: true,
                is_twami: true,
                us_presignup_at: createdTime
            }
        };
    });

    //Arrayify
    var userArray = [];
    for (var i in users) {
        if (users.hasOwnProperty(i)) {
            userArray.push(users[i]);
        }
    }

    //Update intercom
    updateIntercom(userArray, intercomConfig);
});
