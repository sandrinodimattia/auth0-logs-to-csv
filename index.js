const nconf = require('nconf');
const Auth0 = require('auth0');
const request = require('request');
const winston = require('winston');
const fs = require('fs');
const CSV = require('comma-separated-values');

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            timestamp: true,
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

nconf.argv()
  .env()
  .file({ file: './config.json' });

const auth0 = new Auth0({
  domain: nconf.get('AUTH0_DOMAIN'),
  clientID: nconf.get('AUTH0_CLIENT_ID'),
  clientSecret: nconf.get('AUTH0_CLIENT_SECRET')
});

const logs = [];
const done = function() {
  logger.info('All logs have been downloaded, total: ' + logs.length);

  var log_type = getLogTypes();
  var data = logs.map(function(record) {
    if (log_type[record.type]) {
        record.type = log_type[record.type].event;
    }

    if (record.description) {
      record.description = record.description.replace(/(\s+|\;)/g, ' ');
    }

    if (record.details) {
      record.details = JSON.stringify(record.details).replace(/(\s+|\;)/g, ' ');
    }

    return record;
  });

  var output = new CSV(data, { header: true, cellDelimiter: '\t' }).encode();
  fs.writeFileSync('./auth0-logs-2.csv', output);
};

const getLogs = function(checkPoint) {
  auth0.getLogs({ take: 200, from: checkPoint }, function(err, result) {
      if (err) {
        return logger.error('Error getting logs', err);
      }

      if (result && result.length > 0) {
        result.forEach(function(log) {
          logs.push(log);
        });

        logger.info('Processed ' + logs.length + ' logs.');
        setImmediate(function() {
          getLogs(logs[logs.length - 1]._id);
        });
      }
      else {
        done();
      }
    });
};

logger.info('Starting export...');

auth0.getAccessToken(function (err, newToken) {
  logger.debug('Authenticating...');

  if (err) {
    logger.error('Error authenticating', err);
    return;
  }

  logger.debug('Authentication success.');
  getLogs();
});

const getLogTypes = function() {
  return {
    's': {
      event: 'Success Login'
    },
    'seacft': {
      event: 'Success Exchange'
    },
    'feacft': {
      event: 'Failed Exchange'
    },
    'f': {
      event: 'Failed Login'
    },
    'w': {
      event: 'Warnings During Login'
    },
    'du': {
      event: 'Deleted User'
    },
    'fu': {
      event: 'Failed Login (invalid email/username)'
    },
    'fp': {
      event: 'Failed Login (wrong password)'
    },
    'fc': {
      event: 'Failed by Connector'
    },
    'fco': {
      event: 'Failed by CORS'
    },
    'con': {
      event: 'Connector Online',
    },
    'coff': {
      event: 'Connector Offline'
    },
    'fcpro': {
      event: 'Failed Connector Provisioning'
    },
    'ss': {
      event: 'Success Signup'
    },
    'fs': {
      event: 'Failed Signup'
    },

    'cs': {
      event: 'Code Sent'
    },
    'cls': {
      event: 'Code/Link Sent'
    },
    'sv': {
      event: 'Success Verification Email'
    },
    'fv': {
      event: 'Failed Verification Email'
    },
    'scp': {
      event: 'Success Change Password'
    },
    'fcp': {
      event: 'Failed Change Password'
    },
    'sce': {
      event: 'Success Change Email'
    },
    'fce': {
      event: 'Failed Change Email'
    },
    'scu': {
      event: 'Success Change Username'
    },
    'fcu': {
      event: 'Failed Change Username'
    },
    'scpn': {
      event: 'Success Change Phone Number'
    },
    'fcpn': {
      event: 'Failed Change Phone Number'
    },
    'svr': {
      event: 'Success Verification Email Request'
    },
    'fvr': {
      event: 'Failed Verification Email Request'
    },
    'scpr': {
      event: 'Success Change Password Request'
    },
    'fcpr': {
      event: 'Failed Change Password Request'
    },
    'fn': {
      event: 'Failed Sending Notification'
    },
    'sapi': {
      event: 'API Operation'
    },
    'fapi': {
      event: 'Failed API Operation'
    },
    'limit_wc': {
      event: 'Blocked Account'
    },
    'limit_ui': {
      event: 'Too Many Calls to /userinfo'
    },
    'api_limit': {
      event: 'Rate Limit On API'
    },
    'sdu': {
      event: 'Successful User Deletion'
    },
    'fdu' : {
      event: 'Failed User Deletion'
    }
  };
};
