'use strict';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

var rootPath = path.normalize(__dirname + '/..'),
  env,
  db,
  port,
  b_port,
  p2p_port;

var packageStr = fs.readFileSync(rootPath + '/package.json');
var version = JSON.parse(packageStr).version;


function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var home = process.env.INSIGHT_DB || (getUserHome() + '/.clicksight');

if (process.env.INSIGHT_NETWORK === 'livenet') {
  env = 'livenet';
  db = home;
  port = '3002';
  b_port = '36353';
  p2p_port = '36352';
} else {
  env = 'testnet';
  db = home + '/testnet';
  port = '3003';
  b_port = '55443';
  p2p_port = '55444';
}
port = parseInt(process.env.INSIGHT_PORT) || port;


switch (process.env.NODE_ENV) {
  case 'production':
    env += '';
    break;
  case 'test':
    env += ' - test environment';
    break;
  default:
    env += ' - development';
    break;
}

var network = process.env.INSIGHT_NETWORK || 'livenet';

var dataDir = process.env.BITCOIND_DATADIR;
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
if (!dataDir) {
  if (isWin) dataDir = '%APPDATA%\\ClickCoin\\';
  if (isMac) dataDir = process.env.HOME + '/Library/Application Support/ClickCoin/';
  if (isLinux) dataDir = process.env.HOME + '/.ClickCoin/';
}
dataDir += network === 'testnet' ? 'testnet' : '';

var safeConfirmations = process.env.INSIGHT_SAFE_CONFIRMATIONS || 6;
var ignoreCache = process.env.INSIGHT_IGNORE_CACHE || 0;


var bitcoindConf = {
  protocol: process.env.BITCOIND_PROTO || 'http',
  user: process.env.BITCOIND_USER || 'ClickCoinrpc',
  pass: process.env.BITCOIND_PASS || 'xxx',
  host: process.env.BITCOIND_HOST || '127.0.0.1',
  port: process.env.BITCOIND_PORT || b_port,
  p2pPort: process.env.BITCOIND_P2P_PORT || p2p_port,
  p2pHost: process.env.BITCOIND_P2P_HOST || process.env.BITCOIND_HOST || '127.0.0.1',
  dataDir: dataDir,
  // DO NOT CHANGE THIS!
  disableAgent: true
};

var enableMonitor = process.env.ENABLE_MONITOR === 'true';
var enableCleaner = process.env.ENABLE_CLEANER === 'true';
var enableMailbox = process.env.ENABLE_MAILBOX === 'true';
var enableRatelimiter = process.env.ENABLE_RATELIMITER === 'true';
var enableCredentialstore = process.env.ENABLE_CREDSTORE === 'true';
var enableEmailstore = process.env.ENABLE_EMAILSTORE === 'true';
var enablePublicInfo = process.env.ENABLE_PUBLICINFO === 'true';
var loggerLevel = process.env.LOGGER_LEVEL || 'info';
var enableHTTPS = process.env.ENABLE_HTTPS === 'true';

if (!fs.existsSync(db)) {
  mkdirp.sync(db);
}

module.exports = {
  enableMonitor: enableMonitor,
  monitor: require('../plugins/config-monitor.js'),
  enableCleaner: enableCleaner,
  cleaner: require('../plugins/config-cleaner.js'),
  enableMailbox: enableMailbox,
  mailbox: require('../plugins/config-mailbox.js'),
  enableRatelimiter: enableRatelimiter,
  ratelimiter: require('../plugins/config-ratelimiter.js'),
  enableCredentialstore: enableCredentialstore,
  credentialstore: require('../plugins/config-credentialstore'),
  enableEmailstore: enableEmailstore,
  emailstore: require('../plugins/config-emailstore'),
  enablePublicInfo: enablePublicInfo,
  publicInfo: require('../plugins/publicInfo/config'),
  loggerLevel: loggerLevel,
  enableHTTPS: enableHTTPS,
  version: version,
  root: rootPath,
  publicPath: process.env.INSIGHT_PUBLIC_PATH || false,
  appName: 'Insight ' + env,
  apiPrefix: '/api',
  port: port,
  leveldb: db,
  bitcoind: bitcoindConf,
  network: network,
  disableP2pSync: true,
  disableHistoricSync: false,
  poolMatchFile: rootPath + '/etc/minersPoolStrings.json',

  // Time to refresh the currency rate. In minutes
  currencyRefresh: 10,
  keys: {
    segmentio: process.env.INSIGHT_SEGMENTIO_KEY
  },
  safeConfirmations: safeConfirmations, // PLEASE NOTE THAT *FULL RESYNC* IS NEEDED TO CHANGE safeConfirmations
  ignoreCache: ignoreCache,
};
