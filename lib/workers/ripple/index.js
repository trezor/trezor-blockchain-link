"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _rippleLib = require("ripple-lib");

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _constants = require("../../constants");

var common = _interopRequireWildcard(require("../common"));

var utils = _interopRequireWildcard(require("./utils"));

/* @flow */
// WebWorker message handling
onmessage = function onmessage(event) {
  if (!event.data) return;
  var data = event.data;
  common.debug('onmessage', data);

  switch (data.type) {
    case _constants.MESSAGES.HANDSHAKE:
      common.setSettings(data.settings);
      break;

    case _constants.MESSAGES.CONNECT:
      connect().then(
      /*#__PURE__*/
      function () {
        var _ref = (0, _asyncToGenerator2.default)(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee(api) {
          var block;
          return _regenerator.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return api.connection.getLedgerVersion();

                case 2:
                  block = _context.sent;
                  common.response({
                    id: data.id,
                    type: _constants.RESPONSES.CONNECT,
                    payload: true
                  });

                case 4:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()).catch(function (error) {
        return common.errorHandler({
          id: data.id,
          error: error
        });
      });
      break;

    case _constants.MESSAGES.GET_INFO:
      getInfo(data);
      break;

    case _constants.MESSAGES.GET_ACCOUNT_INFO:
      getAccountInfo(data);
      break;

    case _constants.MESSAGES.ESTIMATE_FEE:
      estimateFee(data);
      break;

    case _constants.MESSAGES.PUSH_TRANSACTION:
      pushTransaction(data);
      break;

    case _constants.MESSAGES.SUBSCRIBE:
      subscribe(data);
      break;

    case _constants.MESSAGES.UNSUBSCRIBE:
      unsubscribe(data);
      break;

    case _constants.MESSAGES.DISCONNECT:
      disconnect(data);
      break;

    default:
      common.errorHandler({
        id: data.id,
        error: new Error("Unknown message type ".concat(data.type))
      });
      break;
  }
};

var _api;

var _pingTimeout;

var _endpoints;

var RESERVE = {
  BASE: '20000000',
  OWNER: '5000000'
};
var BLOCKS = {
  MIN: 0,
  MAX: 0
};
var TX_LIMIT = 100;

var timeoutHandler =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2() {
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(_api && _api.isConnected())) {
              _context2.next = 10;
              break;
            }

            _context2.prev = 1;
            _context2.next = 4;
            return _api.getServerInfo();

          case 4:
            _pingTimeout = setTimeout(timeoutHandler, 5000);
            _context2.next = 10;
            break;

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](1);
            common.debug("Error in timeout ping request: ".concat(_context2.t0));

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 7]]);
  }));

  return function timeoutHandler() {
    return _ref2.apply(this, arguments);
  };
}();

var connect =
/*#__PURE__*/
function () {
  var _ref3 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3() {
    var api, availableBlocks, info, _availableBlocks;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!_api) {
              _context3.next = 3;
              break;
            }

            if (!_api.isConnected()) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", _api);

          case 3:
            if (!(common.getSettings().server.length < 1)) {
              _context3.next = 5;
              break;
            }

            throw new Error('No servers');

          case 5:
            if (_endpoints.length < 1) {
              _endpoints = common.getSettings().server.slice(0);
            }

            common.debug('Connecting to', _endpoints[0]);
            api = new _rippleLib.RippleAPI({
              server: _endpoints[0]
            });
            _context3.prev = 8;
            _context3.next = 11;
            return api.connect();

          case 11:
            _context3.next = 23;
            break;

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3["catch"](8);
            common.debug('Websocket connection failed');
            _api = undefined; // connection error. remove endpoint

            _endpoints.splice(0, 1); // and try another one or throw error


            if (!(_endpoints.length < 1)) {
              _context3.next = 20;
              break;
            }

            throw new Error('All backends are down');

          case 20:
            _context3.next = 22;
            return connect();

          case 22:
            return _context3.abrupt("return", _context3.sent);

          case 23:
            // disable reconnecting
            // workaround: RippleApi which doesn't have possibility to disable reconnection
            // override private method and return never ending promise
            api.connection._retryConnect = function () {
              return new Promise(function () {});
            };

            api.on('ledger', function (ledger) {
              clearTimeout(_pingTimeout);
              _pingTimeout = setTimeout(timeoutHandler, 5000); // store current block/ledger values

              RESERVE.BASE = api.xrpToDrops(ledger.reserveBaseXRP);
              RESERVE.OWNER = api.xrpToDrops(ledger.reserveIncrementXRP);
              var availableBlocks = ledger.validatedLedgerVersions.split('-');
              BLOCKS.MIN = parseInt(availableBlocks[0]);
              BLOCKS.MAX = parseInt(availableBlocks[1]);
            });
            api.on('disconnected', function () {
              clearTimeout(_pingTimeout);
              cleanup();
              common.response({
                id: -1,
                type: _constants.RESPONSES.DISCONNECTED,
                payload: true
              });
            }); // mocking
            // setTimeout(() => {
            //     api.connection._ws._ws.close()
            // }, 6000);

            _context3.prev = 26;
            availableBlocks = api.connection._availableLedgerVersions.serialize().split('-');
            BLOCKS.MIN = parseInt(availableBlocks[0]);
            BLOCKS.MAX = parseInt(availableBlocks[1]);
            _context3.next = 40;
            break;

          case 32:
            _context3.prev = 32;
            _context3.t1 = _context3["catch"](26);
            _context3.next = 36;
            return api.getServerInfo();

          case 36:
            info = _context3.sent;
            _availableBlocks = info.completeLedgers.split('-');
            BLOCKS.MIN = parseInt(_availableBlocks[0]);
            BLOCKS.MAX = parseInt(_availableBlocks[1]);

          case 40:
            common.response({
              id: -1,
              type: _constants.RESPONSES.CONNECTED
            });
            _api = api;
            return _context3.abrupt("return", _api);

          case 43:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[8, 13], [26, 32]]);
  }));

  return function connect() {
    return _ref3.apply(this, arguments);
  };
}();

var cleanup = function cleanup() {
  if (_api) {
    _api.removeAllListeners();

    _api = undefined;
  }

  common.removeAddresses(common.getAddresses());
  common.clearSubscriptions();
};

var getInfo =
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee4(data) {
    var api, info, block;
    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return connect();

          case 3:
            api = _context4.sent;
            _context4.next = 6;
            return api.getServerInfo();

          case 6:
            info = _context4.sent;
            _context4.next = 9;
            return api.getLedgerVersion();

          case 9:
            block = _context4.sent;
            common.response({
              id: data.id,
              type: _constants.RESPONSES.GET_INFO,
              payload: {
                name: 'Ripple',
                shortcut: 'xrp',
                decimals: 6,
                block: block,
                fee: '',
                reserved: '0'
              }
            });
            _context4.next = 16;
            break;

          case 13:
            _context4.prev = 13;
            _context4.t0 = _context4["catch"](0);
            common.errorHandler({
              id: data.id,
              error: _context4.t0
            });

          case 16:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 13]]);
  }));

  return function getInfo(_x2) {
    return _ref4.apply(this, arguments);
  };
}(); // Custom request
// RippleApi doesn't support "ledger_index": "current", which will fetch data from mempool


var getMempoolAccountInfo =
/*#__PURE__*/
function () {
  var _ref5 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee5(account) {
    var api, info;
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return connect();

          case 2:
            api = _context5.sent;
            _context5.next = 5;
            return api.request('account_info', {
              account: account,
              ledger_index: 'current',
              queue: true
            });

          case 5:
            info = _context5.sent;
            return _context5.abrupt("return", {
              xrpBalance: info.account_data.Balance,
              sequence: info.account_data.Sequence
            });

          case 7:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function getMempoolAccountInfo(_x3) {
    return _ref5.apply(this, arguments);
  };
}(); // Custom request
// RippleApi returns parsed/formatted transactions, use own parsing


var getRawTransactions =
/*#__PURE__*/
function () {
  var _ref6 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee6(account, options) {
    var api, raw;
    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return connect();

          case 2:
            api = _context6.sent;
            _context6.next = 5;
            return api.request('account_tx', {
              account: account,
              ledger_index_max: options.maxLedgerVersion,
              ledger_index_min: options.minLedgerVersion,
              limit: options.limit
            });

          case 5:
            raw = _context6.sent;
            return _context6.abrupt("return", raw.transactions.map(function (tx) {
              return utils.transformTransactionHistory(account, tx);
            }));

          case 7:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function getRawTransactions(_x4, _x5) {
    return _ref6.apply(this, arguments);
  };
}();

var getAccountInfo =
/*#__PURE__*/
function () {
  var _ref7 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee7(data) {
    var payload, options, account, api, info, ownersReserve, mempoolInfo, _api2, block, minLedgerVersion, maxLedgerVersion, fetchAll, requestOptions, transactions, hasNextPage, response;

    return _regenerator.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            payload = data.payload;
            options = payload.options || {};
            account = {
              address: payload.descriptor,
              transactions: 0,
              block: 0,
              balance: '0',
              availableBalance: '0',
              reserve: RESERVE.BASE,
              sequence: 0
            };
            _context7.prev = 3;
            _context7.next = 6;
            return connect();

          case 6:
            api = _context7.sent;
            account.block = BLOCKS.MAX;
            _context7.next = 10;
            return api.getAccountInfo(payload.descriptor);

          case 10:
            info = _context7.sent;
            ownersReserve = info.ownerCount > 0 ? new _bignumber.default(info.ownerCount).multipliedBy(RESERVE.OWNER).toString() : '0';
            account.balance = api.xrpToDrops(info.xrpBalance);
            account.availableBalance = account.balance;
            account.sequence = info.sequence;
            account.reserve = new _bignumber.default(RESERVE.BASE).plus(ownersReserve).toString();
            _context7.next = 22;
            break;

          case 18:
            _context7.prev = 18;
            _context7.t0 = _context7["catch"](3);

            // empty account throws error "actNotFound"
            // catch it and respond with empty account
            if (_context7.t0.message === 'actNotFound') {
              common.response({
                id: data.id,
                type: _constants.RESPONSES.GET_ACCOUNT_INFO,
                payload: account
              });
            } else {
              common.errorHandler({
                id: data.id,
                error: _context7.t0
              });
            }

            return _context7.abrupt("return");

          case 22:
            _context7.prev = 22;
            _context7.next = 25;
            return getMempoolAccountInfo(payload.descriptor);

          case 25:
            mempoolInfo = _context7.sent;
            account.availableBalance = mempoolInfo.xrpBalance;
            account.sequence = mempoolInfo.sequence;
            _context7.next = 34;
            break;

          case 30:
            _context7.prev = 30;
            _context7.t1 = _context7["catch"](22);
            common.errorHandler({
              id: data.id,
              error: _context7.t1
            });
            return _context7.abrupt("return");

          case 34:
            if (!(options.type !== 'transactions')) {
              _context7.next = 37;
              break;
            }

            common.response({
              id: data.id,
              type: _constants.RESPONSES.GET_ACCOUNT_INFO,
              payload: account
            });
            return _context7.abrupt("return");

          case 37:
            _context7.prev = 37;
            _context7.next = 40;
            return connect();

          case 40:
            _api2 = _context7.sent;
            _context7.next = 43;
            return _api2.getLedgerVersion();

          case 43:
            block = _context7.sent;
            minLedgerVersion = options.from ? Math.max(options.from, BLOCKS.MIN) : BLOCKS.MIN;
            maxLedgerVersion = options.to ? Math.max(options.to, BLOCKS.MAX) : undefined; // determines if there is bottom limit

            fetchAll = typeof options.limit !== 'number';
            requestOptions = {
              minLedgerVersion: minLedgerVersion,
              maxLedgerVersion: maxLedgerVersion,
              limit: fetchAll ? TX_LIMIT : options.limit
            };
            transactions = [];

            if (fetchAll) {
              _context7.next = 55;
              break;
            }

            _context7.next = 52;
            return getRawTransactions(payload.descriptor, requestOptions);

          case 52:
            transactions = _context7.sent;
            _context7.next = 65;
            break;

          case 55:
            // get all pages at once
            hasNextPage = true;

          case 56:
            if (!hasNextPage) {
              _context7.next = 65;
              break;
            }

            _context7.next = 59;
            return getRawTransactions(payload.descriptor, requestOptions);

          case 59:
            response = _context7.sent;
            transactions = utils.concatTransactions(transactions, response); // hasNextPage = response.length >= TX_LIMIT && transactions.length < 10000;

            hasNextPage = response.length >= TX_LIMIT;

            if (hasNextPage) {
              requestOptions.maxLedgerVersion = response[response.length - 1].blockHeight;
            }

            _context7.next = 56;
            break;

          case 65:
            common.response({
              id: data.id,
              type: _constants.RESPONSES.GET_ACCOUNT_INFO,
              payload: (0, _objectSpread2.default)({}, account, {
                transactions: transactions,
                block: block
              })
            });
            _context7.next = 71;
            break;

          case 68:
            _context7.prev = 68;
            _context7.t2 = _context7["catch"](37);
            common.errorHandler({
              id: data.id,
              error: _context7.t2
            });

          case 71:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[3, 18], [22, 30], [37, 68]]);
  }));

  return function getAccountInfo(_x6) {
    return _ref7.apply(this, arguments);
  };
}();

var estimateFee =
/*#__PURE__*/
function () {
  var _ref8 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee8(data) {
    var api, fee, drops, payload;
    return _regenerator.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _context8.next = 3;
            return connect();

          case 3:
            api = _context8.sent;
            _context8.next = 6;
            return api.getFee();

          case 6:
            fee = _context8.sent;
            // TODO: sometimes rippled returns very high values in "server_info.load_factor" and calculated fee jumps from basic 12 drops to 6000+ drops for a moment
            // investigate more...
            drops = api.xrpToDrops(fee);
            payload = data.payload && Array.isArray(data.payload.levels) ? data.payload.levels.map(function (l) {
              return {
                name: l.name,
                value: drops
              };
            }) : [{
              name: 'Normal',
              value: drops
            }];
            common.response({
              id: data.id,
              type: _constants.RESPONSES.ESTIMATE_FEE,
              payload: payload
            });
            _context8.next = 15;
            break;

          case 12:
            _context8.prev = 12;
            _context8.t0 = _context8["catch"](0);
            common.errorHandler({
              id: data.id,
              error: _context8.t0
            });

          case 15:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 12]]);
  }));

  return function estimateFee(_x7) {
    return _ref8.apply(this, arguments);
  };
}();

var pushTransaction =
/*#__PURE__*/
function () {
  var _ref9 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee9(data) {
    var api, info;
    return _regenerator.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return connect();

          case 3:
            api = _context9.sent;
            _context9.next = 6;
            return api.submit(data.payload.toUpperCase());

          case 6:
            info = _context9.sent;

            if (!(info.resultCode === 'tesSUCCESS')) {
              _context9.next = 11;
              break;
            }

            common.response({
              id: data.id,
              type: _constants.RESPONSES.PUSH_TRANSACTION,
              payload: info.resultMessage
            });
            _context9.next = 13;
            break;

          case 11:
            common.errorHandler({
              id: data.id,
              error: new Error(info.resultMessage)
            });
            return _context9.abrupt("return");

          case 13:
            _context9.next = 18;
            break;

          case 15:
            _context9.prev = 15;
            _context9.t0 = _context9["catch"](0);
            common.errorHandler({
              id: data.id,
              error: _context9.t0
            });

          case 18:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 15]]);
  }));

  return function pushTransaction(_x8) {
    return _ref9.apply(this, arguments);
  };
}();

var subscribe =
/*#__PURE__*/
function () {
  var _ref10 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee10(data) {
    var payload;
    return _regenerator.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            payload = data.payload;
            _context10.prev = 1;

            if (!(payload.type === 'notification')) {
              _context10.next = 7;
              break;
            }

            _context10.next = 5;
            return subscribeAddresses(payload.addresses, payload.mempool);

          case 5:
            _context10.next = 10;
            break;

          case 7:
            if (!(payload.type === 'block')) {
              _context10.next = 10;
              break;
            }

            _context10.next = 10;
            return subscribeBlock();

          case 10:
            _context10.next = 16;
            break;

          case 12:
            _context10.prev = 12;
            _context10.t0 = _context10["catch"](1);
            common.errorHandler({
              id: data.id,
              error: _context10.t0
            });
            return _context10.abrupt("return");

          case 16:
            common.response({
              id: data.id,
              type: _constants.RESPONSES.SUBSCRIBE,
              payload: true
            });

          case 17:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[1, 12]]);
  }));

  return function subscribe(_x9) {
    return _ref10.apply(this, arguments);
  };
}();

var subscribeAddresses =
/*#__PURE__*/
function () {
  var _ref11 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee11(addresses) {
    var mempool,
        api,
        uniqueAddresses,
        request,
        _args11 = arguments;
    return _regenerator.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            mempool = _args11.length > 1 && _args11[1] !== undefined ? _args11[1] : true;
            _context11.next = 3;
            return connect();

          case 3:
            api = _context11.sent;

            if (!common.getSubscription('transaction')) {
              api.connection.on('transaction', onTransaction); // api.connection.on('ledgerClosed', onLedgerClosed);

              common.addSubscription('transaction');
            }

            uniqueAddresses = common.addAddresses(addresses);

            if (!(uniqueAddresses.length > 0)) {
              _context11.next = 10;
              break;
            }

            request = {
              // stream: ['transactions', 'transactions_proposed'],
              accounts: uniqueAddresses,
              accounts_proposed: mempool ? uniqueAddresses : []
            };
            _context11.next = 10;
            return api.request('subscribe', request);

          case 10:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function subscribeAddresses(_x10) {
    return _ref11.apply(this, arguments);
  };
}();

var subscribeBlock =
/*#__PURE__*/
function () {
  var _ref12 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee12() {
    var api;
    return _regenerator.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            if (!common.getSubscription('ledger')) {
              _context12.next = 2;
              break;
            }

            return _context12.abrupt("return");

          case 2:
            _context12.next = 4;
            return connect();

          case 4:
            api = _context12.sent;
            api.on('ledger', onNewBlock);
            common.addSubscription('ledger');

          case 7:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function subscribeBlock() {
    return _ref12.apply(this, arguments);
  };
}();

var unsubscribe =
/*#__PURE__*/
function () {
  var _ref13 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee13(data) {
    var payload;
    return _regenerator.default.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            payload = data.payload;
            _context13.prev = 1;

            if (!(payload.type === 'notification')) {
              _context13.next = 7;
              break;
            }

            _context13.next = 5;
            return unsubscribeAddresses(payload.addresses);

          case 5:
            _context13.next = 10;
            break;

          case 7:
            if (!(payload.type === 'block')) {
              _context13.next = 10;
              break;
            }

            _context13.next = 10;
            return unsubscribeBlock();

          case 10:
            _context13.next = 16;
            break;

          case 12:
            _context13.prev = 12;
            _context13.t0 = _context13["catch"](1);
            common.errorHandler({
              id: data.id,
              error: _context13.t0
            });
            return _context13.abrupt("return");

          case 16:
            common.response({
              id: data.id,
              type: _constants.RESPONSES.SUBSCRIBE,
              payload: true
            });

          case 17:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, null, [[1, 12]]);
  }));

  return function unsubscribe(_x11) {
    return _ref13.apply(this, arguments);
  };
}();

var unsubscribeAddresses =
/*#__PURE__*/
function () {
  var _ref14 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee14(addresses) {
    var subscribed, request, api;
    return _regenerator.default.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            subscribed = common.removeAddresses(addresses);
            request = {
              // stream: ['transactions', 'transactions_proposed'],
              accounts: addresses,
              accounts_proposed: addresses
            };
            _context14.next = 4;
            return connect();

          case 4:
            api = _context14.sent;
            _context14.next = 7;
            return api.request('unsubscribe', request);

          case 7:
            if (subscribed.length < 1) {
              // there are no subscribed addresses left
              // remove listeners
              api.connection.removeListener('transaction', onTransaction); // api.connection.off('ledgerClosed', onLedgerClosed);

              common.removeSubscription('transaction');
            }

          case 8:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));

  return function unsubscribeAddresses(_x12) {
    return _ref14.apply(this, arguments);
  };
}();

var unsubscribeBlock =
/*#__PURE__*/
function () {
  var _ref15 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee15() {
    var api;
    return _regenerator.default.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            if (common.getSubscription('ledger')) {
              _context15.next = 2;
              break;
            }

            return _context15.abrupt("return");

          case 2:
            _context15.next = 4;
            return connect();

          case 4:
            api = _context15.sent;
            api.removeListener('ledger', onNewBlock);
            common.removeSubscription('ledger');

          case 7:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15);
  }));

  return function unsubscribeBlock() {
    return _ref15.apply(this, arguments);
  };
}();

var disconnect =
/*#__PURE__*/
function () {
  var _ref16 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee16(data) {
    return _regenerator.default.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            if (_api) {
              _context16.next = 3;
              break;
            }

            common.response({
              id: data.id,
              type: _constants.RESPONSES.DISCONNECTED,
              payload: true
            });
            return _context16.abrupt("return");

          case 3:
            _context16.prev = 3;
            _context16.next = 6;
            return _api.disconnect();

          case 6:
            common.response({
              id: data.id,
              type: _constants.RESPONSES.DISCONNECTED,
              payload: true
            });
            _context16.next = 12;
            break;

          case 9:
            _context16.prev = 9;
            _context16.t0 = _context16["catch"](3);
            common.errorHandler({
              id: data.id,
              error: _context16.t0
            });

          case 12:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, null, [[3, 9]]);
  }));

  return function disconnect(_x13) {
    return _ref16.apply(this, arguments);
  };
}();

var onNewBlock = function onNewBlock(event) {
  common.response({
    id: -1,
    type: _constants.RESPONSES.NOTIFICATION,
    payload: {
      type: 'block',
      payload: {
        block: event.ledgerVersion,
        hash: event.ledgerHash
      }
    }
  });
};

var onTransaction = function onTransaction(event) {
  if (event.type !== 'transaction') return;
  var subscribed = common.getAddresses();
  var sender = subscribed.indexOf(event.transaction.Account);
  var receiver = subscribed.indexOf(event.transaction.Destination);

  if (sender >= 0) {
    common.response({
      id: -1,
      type: _constants.RESPONSES.NOTIFICATION,
      payload: {
        type: 'notification',
        payload: utils.transformTransactionEvent(subscribed[sender], event)
      }
    });
  }

  if (receiver >= 0) {
    common.response({
      id: -1,
      type: _constants.RESPONSES.NOTIFICATION,
      payload: {
        type: 'notification',
        payload: utils.transformTransactionEvent(subscribed[receiver], event)
      }
    });
  }
  /*
  const status = event.validated ? 'confirmed' : 'pending';
  const hash = event.transaction.hash;
  const signature = event.transaction.TxnSignature;
  const amount = event.transaction.Amount;
  const fee = event.transaction.Fee;
  const total = new BigNumber(amount).plus(fee).toString();
   const txData = {
      status,
      timestamp: event.transaction.date,
      blockHeight: 0,
       inputs: [{ addresses: [event.transaction.Account] }],
      outputs: [{ addresses: [event.transaction.Destination] }],
       hash,
      amount,
      fee,
      total,
  };
   if (sender >= 0) {
      common.response({
          id: -1,
          type: RESPONSES.NOTIFICATION,
          payload: {
              type: 'notification',
              payload: {
                  type: 'send',
                  descriptor: event.transaction.Account,
                  ...txData,
              }
          }
      });
  }
   if (receiver >= 0) {
      common.response({
          id: -1,
          type: RESPONSES.NOTIFICATION,
          payload: {
              type: 'notification',
              payload: {
                  type: 'recv',
                  descriptor: event.transaction.Destination,
                  ...txData,
              }
          }
      });
  }
  */

}; // postMessage(1/x); // Intentional error.


common.handshake(); // // Testnet account
// // addr: rGz6kFcejym5ZEWnzUCwPjxcfwEPRUPXXG
// // secret: ss2BKjSc4sMdVXcTHxzjyQS2vyhrQ
// // Trezor account
// // rNaqKtKrMSwpwZSzRckPf7S96DkimjkF4H
// rpNqAwVKdyWxZoHerUzDfgEEobNQPnQgPU
// rJb5KsHsDHF1YS5B5DU6QCkH5NsPaKQTcy - exachnge
// rsG1sNifXJxGS2nDQ9zHyoe1S5APrtwpjV - exchange2
// from: https://i.redd.it/zwcthelefj901.png
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy93b3JrZXJzL3JpcHBsZS9pbmRleC50cyJdLCJuYW1lcyI6WyJvbm1lc3NhZ2UiLCJldmVudCIsImRhdGEiLCJjb21tb24iLCJkZWJ1ZyIsInR5cGUiLCJNRVNTQUdFUyIsIkhBTkRTSEFLRSIsInNldFNldHRpbmdzIiwic2V0dGluZ3MiLCJDT05ORUNUIiwiY29ubmVjdCIsInRoZW4iLCJhcGkiLCJjb25uZWN0aW9uIiwiZ2V0TGVkZ2VyVmVyc2lvbiIsImJsb2NrIiwicmVzcG9uc2UiLCJpZCIsIlJFU1BPTlNFUyIsInBheWxvYWQiLCJjYXRjaCIsImVycm9yIiwiZXJyb3JIYW5kbGVyIiwiR0VUX0lORk8iLCJnZXRJbmZvIiwiR0VUX0FDQ09VTlRfSU5GTyIsImdldEFjY291bnRJbmZvIiwiRVNUSU1BVEVfRkVFIiwiZXN0aW1hdGVGZWUiLCJQVVNIX1RSQU5TQUNUSU9OIiwicHVzaFRyYW5zYWN0aW9uIiwiU1VCU0NSSUJFIiwic3Vic2NyaWJlIiwiVU5TVUJTQ1JJQkUiLCJ1bnN1YnNjcmliZSIsIkRJU0NPTk5FQ1QiLCJkaXNjb25uZWN0IiwiRXJyb3IiLCJfYXBpIiwiX3BpbmdUaW1lb3V0IiwiX2VuZHBvaW50cyIsIlJFU0VSVkUiLCJCQVNFIiwiT1dORVIiLCJCTE9DS1MiLCJNSU4iLCJNQVgiLCJUWF9MSU1JVCIsInRpbWVvdXRIYW5kbGVyIiwiaXNDb25uZWN0ZWQiLCJnZXRTZXJ2ZXJJbmZvIiwic2V0VGltZW91dCIsImdldFNldHRpbmdzIiwic2VydmVyIiwibGVuZ3RoIiwic2xpY2UiLCJSaXBwbGVBUEkiLCJ1bmRlZmluZWQiLCJzcGxpY2UiLCJfcmV0cnlDb25uZWN0IiwiUHJvbWlzZSIsIm9uIiwibGVkZ2VyIiwiY2xlYXJUaW1lb3V0IiwieHJwVG9Ecm9wcyIsInJlc2VydmVCYXNlWFJQIiwicmVzZXJ2ZUluY3JlbWVudFhSUCIsImF2YWlsYWJsZUJsb2NrcyIsInZhbGlkYXRlZExlZGdlclZlcnNpb25zIiwic3BsaXQiLCJwYXJzZUludCIsImNsZWFudXAiLCJESVNDT05ORUNURUQiLCJfYXZhaWxhYmxlTGVkZ2VyVmVyc2lvbnMiLCJzZXJpYWxpemUiLCJpbmZvIiwiY29tcGxldGVMZWRnZXJzIiwiQ09OTkVDVEVEIiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwicmVtb3ZlQWRkcmVzc2VzIiwiZ2V0QWRkcmVzc2VzIiwiY2xlYXJTdWJzY3JpcHRpb25zIiwibmFtZSIsInNob3J0Y3V0IiwiZGVjaW1hbHMiLCJmZWUiLCJyZXNlcnZlZCIsImdldE1lbXBvb2xBY2NvdW50SW5mbyIsImFjY291bnQiLCJyZXF1ZXN0IiwibGVkZ2VyX2luZGV4IiwicXVldWUiLCJ4cnBCYWxhbmNlIiwiYWNjb3VudF9kYXRhIiwiQmFsYW5jZSIsInNlcXVlbmNlIiwiU2VxdWVuY2UiLCJnZXRSYXdUcmFuc2FjdGlvbnMiLCJvcHRpb25zIiwibGVkZ2VyX2luZGV4X21heCIsIm1heExlZGdlclZlcnNpb24iLCJsZWRnZXJfaW5kZXhfbWluIiwibWluTGVkZ2VyVmVyc2lvbiIsImxpbWl0IiwicmF3IiwidHJhbnNhY3Rpb25zIiwibWFwIiwidHgiLCJ1dGlscyIsInRyYW5zZm9ybVRyYW5zYWN0aW9uSGlzdG9yeSIsImFkZHJlc3MiLCJkZXNjcmlwdG9yIiwiYmFsYW5jZSIsImF2YWlsYWJsZUJhbGFuY2UiLCJyZXNlcnZlIiwib3duZXJzUmVzZXJ2ZSIsIm93bmVyQ291bnQiLCJCaWdOdW1iZXIiLCJtdWx0aXBsaWVkQnkiLCJ0b1N0cmluZyIsInBsdXMiLCJtZXNzYWdlIiwibWVtcG9vbEluZm8iLCJmcm9tIiwiTWF0aCIsIm1heCIsInRvIiwiZmV0Y2hBbGwiLCJyZXF1ZXN0T3B0aW9ucyIsImhhc05leHRQYWdlIiwiY29uY2F0VHJhbnNhY3Rpb25zIiwiYmxvY2tIZWlnaHQiLCJnZXRGZWUiLCJkcm9wcyIsIkFycmF5IiwiaXNBcnJheSIsImxldmVscyIsImwiLCJ2YWx1ZSIsInN1Ym1pdCIsInRvVXBwZXJDYXNlIiwicmVzdWx0Q29kZSIsInJlc3VsdE1lc3NhZ2UiLCJzdWJzY3JpYmVBZGRyZXNzZXMiLCJhZGRyZXNzZXMiLCJtZW1wb29sIiwic3Vic2NyaWJlQmxvY2siLCJnZXRTdWJzY3JpcHRpb24iLCJvblRyYW5zYWN0aW9uIiwiYWRkU3Vic2NyaXB0aW9uIiwidW5pcXVlQWRkcmVzc2VzIiwiYWRkQWRkcmVzc2VzIiwiYWNjb3VudHMiLCJhY2NvdW50c19wcm9wb3NlZCIsIm9uTmV3QmxvY2siLCJ1bnN1YnNjcmliZUFkZHJlc3NlcyIsInVuc3Vic2NyaWJlQmxvY2siLCJzdWJzY3JpYmVkIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmVTdWJzY3JpcHRpb24iLCJOT1RJRklDQVRJT04iLCJsZWRnZXJWZXJzaW9uIiwiaGFzaCIsImxlZGdlckhhc2giLCJzZW5kZXIiLCJpbmRleE9mIiwidHJhbnNhY3Rpb24iLCJBY2NvdW50IiwicmVjZWl2ZXIiLCJEZXN0aW5hdGlvbiIsInRyYW5zZm9ybVRyYW5zYWN0aW9uRXZlbnQiLCJoYW5kc2hha2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQVBBO0FBWUE7QUFDQUEsU0FBUyxHQUFHLG1CQUFDQyxLQUFELEVBQVc7QUFDbkIsTUFBSSxDQUFDQSxLQUFLLENBQUNDLElBQVgsRUFBaUI7QUFERSxNQUVYQSxJQUZXLEdBRUZELEtBRkUsQ0FFWEMsSUFGVztBQUluQkMsRUFBQUEsTUFBTSxDQUFDQyxLQUFQLENBQWEsV0FBYixFQUEwQkYsSUFBMUI7O0FBQ0EsVUFBUUEsSUFBSSxDQUFDRyxJQUFiO0FBQ0ksU0FBS0Msb0JBQVNDLFNBQWQ7QUFDSUosTUFBQUEsTUFBTSxDQUFDSyxXQUFQLENBQW1CTixJQUFJLENBQUNPLFFBQXhCO0FBQ0E7O0FBQ0osU0FBS0gsb0JBQVNJLE9BQWQ7QUFDSUMsTUFBQUEsT0FBTyxHQUFHQyxJQUFWO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQ0FBZSxpQkFBT0MsR0FBUDtBQUFBO0FB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O0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFFQTtBQUVBO0FBRUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBSaXBwbGVBUEkgfSBmcm9tICdyaXBwbGUtbGliJztcbmltcG9ydCBCaWdOdW1iZXIgZnJvbSAnYmlnbnVtYmVyLmpzJztcbmltcG9ydCAqIGFzIE1lc3NhZ2VUeXBlcyBmcm9tICcuLi8uLi90eXBlcy9tZXNzYWdlcyc7XG5pbXBvcnQgeyBNRVNTQUdFUywgUkVTUE9OU0VTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcbmltcG9ydCAqIGFzIGNvbW1vbiBmcm9tICcuLi9jb21tb24nO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscyc7XG5cblxuZGVjbGFyZSBmdW5jdGlvbiBvbm1lc3NhZ2UoZXZlbnQ6IHsgZGF0YTogTWVzc2FnZSB9KTogdm9pZDtcblxuLy8gV2ViV29ya2VyIG1lc3NhZ2UgaGFuZGxpbmdcbm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgIGlmICghZXZlbnQuZGF0YSkgcmV0dXJuO1xuICAgIGNvbnN0IHsgZGF0YSB9ID0gZXZlbnQ7XG4gICAgXG4gICAgY29tbW9uLmRlYnVnKCdvbm1lc3NhZ2UnLCBkYXRhKTtcbiAgICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgICAgICBjYXNlIE1FU1NBR0VTLkhBTkRTSEFLRTpcbiAgICAgICAgICAgIGNvbW1vbi5zZXRTZXR0aW5ncyhkYXRhLnNldHRpbmdzKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE1FU1NBR0VTLkNPTk5FQ1Q6XG4gICAgICAgICAgICBjb25uZWN0KCkudGhlbihhc3luYyAoYXBpKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2sgPSBhd2FpdCBhcGkuY29ubmVjdGlvbi5nZXRMZWRnZXJWZXJzaW9uKCk7XG4gICAgICAgICAgICAgICAgY29tbW9uLnJlc3BvbnNlKHsgaWQ6IGRhdGEuaWQsIHR5cGU6IFJFU1BPTlNFUy5DT05ORUNULCBwYXlsb2FkOiB0cnVlIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4gY29tbW9uLmVycm9ySGFuZGxlcih7IGlkOiBkYXRhLmlkLCBlcnJvciB9KSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5HRVRfSU5GTzpcbiAgICAgICAgICAgIGdldEluZm8oZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5HRVRfQUNDT1VOVF9JTkZPOlxuICAgICAgICAgICAgZ2V0QWNjb3VudEluZm8oZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5FU1RJTUFURV9GRUU6XG4gICAgICAgICAgICBlc3RpbWF0ZUZlZShkYXRhKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE1FU1NBR0VTLlBVU0hfVFJBTlNBQ1RJT046XG4gICAgICAgICAgICBwdXNoVHJhbnNhY3Rpb24oZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5TVUJTQ1JJQkU6XG4gICAgICAgICAgICBzdWJzY3JpYmUoZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5VTlNVQlNDUklCRTpcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlKGRhdGEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTUVTU0FHRVMuRElTQ09OTkVDVDpcbiAgICAgICAgICAgIGRpc2Nvbm5lY3QoZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbW1vbi5lcnJvckhhbmRsZXIoe1xuICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgICAgIGVycm9yOiBuZXcgRXJyb3IoYFVua25vd24gbWVzc2FnZSB0eXBlICR7ZGF0YS50eXBlfWApXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbmxldCBfYXBpO1xubGV0IF9waW5nVGltZW91dDtcbmxldCBfZW5kcG9pbnRzO1xuY29uc3QgUkVTRVJWRSA9IHtcbiAgICBCQVNFOiAnMjAwMDAwMDAnLFxuICAgIE9XTkVSOiAnNTAwMDAwMCcsXG59O1xuY29uc3QgQkxPQ0tTID0ge1xuICAgIE1JTjogMCxcbiAgICBNQVg6IDAsXG59O1xuY29uc3QgVFhfTElNSVQ6IG51bWJlciA9IDEwMDtcblxuY29uc3QgdGltZW91dEhhbmRsZXIgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKF9hcGkgJiYgX2FwaS5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBfYXBpLmdldFNlcnZlckluZm8oKTtcbiAgICAgICAgICAgIF9waW5nVGltZW91dCA9IHNldFRpbWVvdXQodGltZW91dEhhbmRsZXIsIDUwMDApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29tbW9uLmRlYnVnKGBFcnJvciBpbiB0aW1lb3V0IHBpbmcgcmVxdWVzdDogJHtlcnJvcn1gKVxuICAgICAgICB9XG4gICAgfVxufVxuXG5jb25zdCBjb25uZWN0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmIChfYXBpKSB7XG4gICAgICAgIC8vIHNvY2tldCBpcyBhbHJlYWR5IGNvbm5lY3RlZFxuICAgICAgICBpZiAoX2FwaS5pc0Nvbm5lY3RlZCgpKSByZXR1cm4gX2FwaTtcbiAgICB9XG5cbiAgICAvLyB2YWxpZGF0ZSBlbmRwb2ludHNcbiAgICBpZiAoY29tbW9uLmdldFNldHRpbmdzKCkuc2VydmVyLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBzZXJ2ZXJzJyk7XG4gICAgfVxuXG4gICAgaWYgKF9lbmRwb2ludHMubGVuZ3RoIDwgMSkge1xuICAgICAgICBfZW5kcG9pbnRzID0gY29tbW9uLmdldFNldHRpbmdzKCkuc2VydmVyLnNsaWNlKDApO1xuICAgIH1cblxuICAgIGNvbW1vbi5kZWJ1ZygnQ29ubmVjdGluZyB0bycsIF9lbmRwb2ludHNbMF0pO1xuICAgIGNvbnN0IGFwaSA9IG5ldyBSaXBwbGVBUEkoeyBzZXJ2ZXI6IF9lbmRwb2ludHNbMF0gfSk7XG4gICBcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBhcGkuY29ubmVjdCgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbW1vbi5kZWJ1ZygnV2Vic29ja2V0IGNvbm5lY3Rpb24gZmFpbGVkJyk7XG4gICAgICAgIF9hcGkgPSB1bmRlZmluZWQ7XG4gICAgICAgIC8vIGNvbm5lY3Rpb24gZXJyb3IuIHJlbW92ZSBlbmRwb2ludFxuICAgICAgICBfZW5kcG9pbnRzLnNwbGljZSgwLCAxKTtcbiAgICAgICAgLy8gYW5kIHRyeSBhbm90aGVyIG9uZSBvciB0aHJvdyBlcnJvclxuICAgICAgICBpZiAoX2VuZHBvaW50cy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FsbCBiYWNrZW5kcyBhcmUgZG93bicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhd2FpdCBjb25uZWN0KCk7XG4gICAgfVxuXG4gICAgLy8gZGlzYWJsZSByZWNvbm5lY3RpbmdcbiAgICAvLyB3b3JrYXJvdW5kOiBSaXBwbGVBcGkgd2hpY2ggZG9lc24ndCBoYXZlIHBvc3NpYmlsaXR5IHRvIGRpc2FibGUgcmVjb25uZWN0aW9uXG4gICAgLy8gb3ZlcnJpZGUgcHJpdmF0ZSBtZXRob2QgYW5kIHJldHVybiBuZXZlciBlbmRpbmcgcHJvbWlzZVxuICAgIGFwaS5jb25uZWN0aW9uLl9yZXRyeUNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB7fSk7XG4gICAgfTtcblxuICAgIGFwaS5vbignbGVkZ2VyJywgbGVkZ2VyID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KF9waW5nVGltZW91dCk7XG4gICAgICAgIF9waW5nVGltZW91dCA9IHNldFRpbWVvdXQodGltZW91dEhhbmRsZXIsIDUwMDApO1xuXG4gICAgICAgIC8vIHN0b3JlIGN1cnJlbnQgYmxvY2svbGVkZ2VyIHZhbHVlc1xuICAgICAgICBSRVNFUlZFLkJBU0UgPSBhcGkueHJwVG9Ecm9wcyhsZWRnZXIucmVzZXJ2ZUJhc2VYUlApO1xuICAgICAgICBSRVNFUlZFLk9XTkVSID0gYXBpLnhycFRvRHJvcHMobGVkZ2VyLnJlc2VydmVJbmNyZW1lbnRYUlApO1xuICAgICAgICBjb25zdCBhdmFpbGFibGVCbG9ja3MgPSBsZWRnZXIudmFsaWRhdGVkTGVkZ2VyVmVyc2lvbnMuc3BsaXQoJy0nKTtcbiAgICAgICAgQkxPQ0tTLk1JTiA9IHBhcnNlSW50KGF2YWlsYWJsZUJsb2Nrc1swXSk7XG4gICAgICAgIEJMT0NLUy5NQVggPSBwYXJzZUludChhdmFpbGFibGVCbG9ja3NbMV0pO1xuICAgIH0pO1xuXG4gICAgYXBpLm9uKCdkaXNjb25uZWN0ZWQnLCAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChfcGluZ1RpbWVvdXQpO1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIGNvbW1vbi5yZXNwb25zZSh7IGlkOiAtMSwgdHlwZTogUkVTUE9OU0VTLkRJU0NPTk5FQ1RFRCwgcGF5bG9hZDogdHJ1ZSB9KTtcbiAgICB9KTtcblxuICAgIC8vIG1vY2tpbmdcbiAgICAvLyBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAvLyAgICAgYXBpLmNvbm5lY3Rpb24uX3dzLl93cy5jbG9zZSgpXG4gICAgLy8gfSwgNjAwMCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhdmFpbGFibGVCbG9ja3MgPSBhcGkuY29ubmVjdGlvbi5fYXZhaWxhYmxlTGVkZ2VyVmVyc2lvbnMuc2VyaWFsaXplKCkuc3BsaXQoJy0nKTtcbiAgICAgICAgQkxPQ0tTLk1JTiA9IHBhcnNlSW50KGF2YWlsYWJsZUJsb2Nrc1swXSk7XG4gICAgICAgIEJMT0NLUy5NQVggPSBwYXJzZUludChhdmFpbGFibGVCbG9ja3NbMV0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBhcGkuZ2V0U2VydmVySW5mbygpO1xuICAgICAgICBjb25zdCBhdmFpbGFibGVCbG9ja3MgPSBpbmZvLmNvbXBsZXRlTGVkZ2Vycy5zcGxpdCgnLScpO1xuICAgICAgICBCTE9DS1MuTUlOID0gcGFyc2VJbnQoYXZhaWxhYmxlQmxvY2tzWzBdKTtcbiAgICAgICAgQkxPQ0tTLk1BWCA9IHBhcnNlSW50KGF2YWlsYWJsZUJsb2Nrc1sxXSk7XG4gICAgfVxuXG4gICAgY29tbW9uLnJlc3BvbnNlKHsgaWQ6IC0xLCB0eXBlOiBSRVNQT05TRVMuQ09OTkVDVEVEIH0pO1xuXG4gICAgX2FwaSA9IGFwaTtcbiAgICByZXR1cm4gX2FwaTtcbn1cblxuY29uc3QgY2xlYW51cCA9ICgpID0+IHtcbiAgICBpZiAoX2FwaSkge1xuICAgICAgICBfYXBpLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICBfYXBpID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb21tb24ucmVtb3ZlQWRkcmVzc2VzKGNvbW1vbi5nZXRBZGRyZXNzZXMoKSk7XG4gICAgY29tbW9uLmNsZWFyU3Vic2NyaXB0aW9ucygpO1xufVxuXG5jb25zdCBnZXRJbmZvID0gYXN5bmMgKGRhdGEpID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGkgPSBhd2FpdCBjb25uZWN0KCk7XG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBhcGkuZ2V0U2VydmVySW5mbygpO1xuICAgICAgICBjb25zdCBibG9jayA9IGF3YWl0IGFwaS5nZXRMZWRnZXJWZXJzaW9uKCk7XG4gICAgICAgIGNvbW1vbi5yZXNwb25zZSh7XG4gICAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICAgIHR5cGU6IFJFU1BPTlNFUy5HRVRfSU5GTyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnUmlwcGxlJyxcbiAgICAgICAgICAgICAgICBzaG9ydGN1dDogJ3hycCcsXG4gICAgICAgICAgICAgICAgZGVjaW1hbHM6IDYsXG4gICAgICAgICAgICAgICAgYmxvY2ssXG4gICAgICAgICAgICAgICAgZmVlOiAnJyxcbiAgICAgICAgICAgICAgICByZXNlcnZlZDogJzAnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29tbW9uLmVycm9ySGFuZGxlcih7IGlkOiBkYXRhLmlkLCBlcnJvciB9KTtcbiAgICB9XG59O1xuXG4vLyBDdXN0b20gcmVxdWVzdFxuLy8gUmlwcGxlQXBpIGRvZXNuJ3Qgc3VwcG9ydCBcImxlZGdlcl9pbmRleFwiOiBcImN1cnJlbnRcIiwgd2hpY2ggd2lsbCBmZXRjaCBkYXRhIGZyb20gbWVtcG9vbFxuY29uc3QgZ2V0TWVtcG9vbEFjY291bnRJbmZvID0gYXN5bmMgKGFjY291bnQ6IHN0cmluZyk6IFByb21pc2U8eyB4cnBCYWxhbmNlOiBzdHJpbmcsIHNlcXVlbmNlOiBudW1iZXIgfT4gPT4ge1xuICAgIGNvbnN0IGFwaSA9IGF3YWl0IGNvbm5lY3QoKTtcbiAgICBjb25zdCBpbmZvID0gYXdhaXQgYXBpLnJlcXVlc3QoJ2FjY291bnRfaW5mbycsIHtcbiAgICAgICAgYWNjb3VudCxcbiAgICAgICAgbGVkZ2VyX2luZGV4OiAnY3VycmVudCcsXG4gICAgICAgIHF1ZXVlOiB0cnVlLFxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIHhycEJhbGFuY2U6IGluZm8uYWNjb3VudF9kYXRhLkJhbGFuY2UsXG4gICAgICAgIHNlcXVlbmNlOiBpbmZvLmFjY291bnRfZGF0YS5TZXF1ZW5jZSxcbiAgICB9O1xufTtcblxuLy8gQ3VzdG9tIHJlcXVlc3Rcbi8vIFJpcHBsZUFwaSByZXR1cm5zIHBhcnNlZC9mb3JtYXR0ZWQgdHJhbnNhY3Rpb25zLCB1c2Ugb3duIHBhcnNpbmdcbmNvbnN0IGdldFJhd1RyYW5zYWN0aW9ucyA9IGFzeW5jIChhY2NvdW50OiBzdHJpbmcsIG9wdGlvbnMpID0+IHtcbiAgICBjb25zdCBhcGkgPSBhd2FpdCBjb25uZWN0KCk7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnJlcXVlc3QoJ2FjY291bnRfdHgnLCB7XG4gICAgICAgIGFjY291bnQsXG4gICAgICAgIGxlZGdlcl9pbmRleF9tYXg6IG9wdGlvbnMubWF4TGVkZ2VyVmVyc2lvbixcbiAgICAgICAgbGVkZ2VyX2luZGV4X21pbjogb3B0aW9ucy5taW5MZWRnZXJWZXJzaW9uLFxuICAgICAgICBsaW1pdDogb3B0aW9ucy5saW1pdCxcbiAgICB9KTtcbiAgICByZXR1cm4gcmF3LnRyYW5zYWN0aW9ucy5tYXAodHggPT4gdXRpbHMudHJhbnNmb3JtVHJhbnNhY3Rpb25IaXN0b3J5KGFjY291bnQsIHR4KSk7XG59O1xuXG5jb25zdCBnZXRBY2NvdW50SW5mbyA9IGFzeW5jIChkYXRhKSA9PiB7XG4gICAgY29uc3QgeyBwYXlsb2FkIH0gPSBkYXRhO1xuICAgIGNvbnN0IG9wdGlvbnM6IE1lc3NhZ2VUeXBlcy5HZXRBY2NvdW50SW5mb09wdGlvbnMgPSBwYXlsb2FkLm9wdGlvbnMgfHwge307XG5cbiAgICBjb25zdCBhY2NvdW50ID0ge1xuICAgICAgICBhZGRyZXNzOiBwYXlsb2FkLmRlc2NyaXB0b3IsXG4gICAgICAgIHRyYW5zYWN0aW9uczogMCxcbiAgICAgICAgYmxvY2s6IDAsXG4gICAgICAgIGJhbGFuY2U6ICcwJyxcbiAgICAgICAgYXZhaWxhYmxlQmFsYW5jZTogJzAnLFxuICAgICAgICByZXNlcnZlOiBSRVNFUlZFLkJBU0UsXG4gICAgICAgIHNlcXVlbmNlOiAwLFxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGkgPSBhd2FpdCBjb25uZWN0KCk7XG4gICAgICAgIGFjY291bnQuYmxvY2sgPSBCTE9DS1MuTUFYO1xuXG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBhcGkuZ2V0QWNjb3VudEluZm8ocGF5bG9hZC5kZXNjcmlwdG9yKTtcbiAgICAgICAgY29uc3Qgb3duZXJzUmVzZXJ2ZSA9IGluZm8ub3duZXJDb3VudCA+IDAgPyBuZXcgQmlnTnVtYmVyKGluZm8ub3duZXJDb3VudCkubXVsdGlwbGllZEJ5KFJFU0VSVkUuT1dORVIpLnRvU3RyaW5nKCkgOiAnMCc7XG4gICAgICAgIGFjY291bnQuYmFsYW5jZSA9IGFwaS54cnBUb0Ryb3BzKGluZm8ueHJwQmFsYW5jZSk7XG4gICAgICAgIGFjY291bnQuYXZhaWxhYmxlQmFsYW5jZSA9IGFjY291bnQuYmFsYW5jZTtcbiAgICAgICAgYWNjb3VudC5zZXF1ZW5jZSA9IGluZm8uc2VxdWVuY2U7XG4gICAgICAgIGFjY291bnQucmVzZXJ2ZSA9IG5ldyBCaWdOdW1iZXIoUkVTRVJWRS5CQVNFKS5wbHVzKG93bmVyc1Jlc2VydmUpLnRvU3RyaW5nKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gZW1wdHkgYWNjb3VudCB0aHJvd3MgZXJyb3IgXCJhY3ROb3RGb3VuZFwiXG4gICAgICAgIC8vIGNhdGNoIGl0IGFuZCByZXNwb25kIHdpdGggZW1wdHkgYWNjb3VudFxuICAgICAgICBpZiAoZXJyb3IubWVzc2FnZSA9PT0gJ2FjdE5vdEZvdW5kJykge1xuICAgICAgICAgICAgY29tbW9uLnJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICAgICAgICB0eXBlOiBSRVNQT05TRVMuR0VUX0FDQ09VTlRfSU5GTyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiBhY2NvdW50LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21tb24uZXJyb3JIYW5kbGVyKHsgaWQ6IGRhdGEuaWQsIGVycm9yIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBtZW1wb29sSW5mbyA9IGF3YWl0IGdldE1lbXBvb2xBY2NvdW50SW5mbyhwYXlsb2FkLmRlc2NyaXB0b3IpO1xuICAgICAgICBhY2NvdW50LmF2YWlsYWJsZUJhbGFuY2UgPSBtZW1wb29sSW5mby54cnBCYWxhbmNlO1xuICAgICAgICBhY2NvdW50LnNlcXVlbmNlID0gbWVtcG9vbEluZm8uc2VxdWVuY2U7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29tbW9uLmVycm9ySGFuZGxlcih7IGlkOiBkYXRhLmlkLCBlcnJvciB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGdldCB0aGUgcmVzZXJ2ZVxuXG4gICAgaWYgKG9wdGlvbnMudHlwZSAhPT0gJ3RyYW5zYWN0aW9ucycpIHtcbiAgICAgICAgY29tbW9uLnJlc3BvbnNlKHtcbiAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgdHlwZTogUkVTUE9OU0VTLkdFVF9BQ0NPVU5UX0lORk8sXG4gICAgICAgICAgICBwYXlsb2FkOiBhY2NvdW50LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIC8vIFJpcHBsZWQgaGFzIGFuIGlzc3VlIHdpdGggbG9va2luZyB1cCBvdXRzaWRlIG9mIHJhbmdlIG9mIGNvbXBsZXRlZCBsZWRnZXJzXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9yaXBwbGUvcmlwcGxlLWxpYi9pc3N1ZXMvODc5I2lzc3VlY29tbWVudC0zNzc1NzYwNjNcbiAgICAgICAgLy8gQWx3YXlzIHVzZSBcIm1pbkxlZGdlclZlcnNpb25cIlxuICAgICAgICBjb25zdCBhcGkgPSBhd2FpdCBjb25uZWN0KCk7XG4gICAgICAgIGNvbnN0IGJsb2NrID0gYXdhaXQgYXBpLmdldExlZGdlclZlcnNpb24oKTtcbiAgICAgICAgY29uc3QgbWluTGVkZ2VyVmVyc2lvbiA9IG9wdGlvbnMuZnJvbSA/IE1hdGgubWF4KG9wdGlvbnMuZnJvbSwgQkxPQ0tTLk1JTikgOiBCTE9DS1MuTUlOO1xuICAgICAgICBjb25zdCBtYXhMZWRnZXJWZXJzaW9uID0gb3B0aW9ucy50byA/IE1hdGgubWF4KG9wdGlvbnMudG8sIEJMT0NLUy5NQVgpIDogdW5kZWZpbmVkO1xuICAgICAgICAvLyBkZXRlcm1pbmVzIGlmIHRoZXJlIGlzIGJvdHRvbSBsaW1pdFxuICAgICAgICBjb25zdCBmZXRjaEFsbDogYm9vbGVhbiA9IHR5cGVvZiBvcHRpb25zLmxpbWl0ICE9PSAnbnVtYmVyJztcbiAgICAgICAgY29uc3QgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtaW5MZWRnZXJWZXJzaW9uLFxuICAgICAgICAgICAgbWF4TGVkZ2VyVmVyc2lvbixcbiAgICAgICAgICAgIGxpbWl0OiBmZXRjaEFsbCA/IFRYX0xJTUlUIDogb3B0aW9ucy5saW1pdCxcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0cmFuc2FjdGlvbnM6IEFycmF5PFJlc3BvbnNlVHlwZXMuVHJhbnNhY3Rpb24+ID0gW107XG4gICAgICAgIGlmICghZmV0Y2hBbGwpIHtcbiAgICAgICAgICAgIC8vIGdldCBvbmx5IG9uZSBwYWdlXG4gICAgICAgICAgICB0cmFuc2FjdGlvbnMgPSBhd2FpdCBnZXRSYXdUcmFuc2FjdGlvbnMocGF5bG9hZC5kZXNjcmlwdG9yLCByZXF1ZXN0T3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBnZXQgYWxsIHBhZ2VzIGF0IG9uY2VcbiAgICAgICAgICAgIGxldCBoYXNOZXh0UGFnZTogYm9vbGVhbiA9IHRydWU7XG4gICAgICAgICAgICB3aGlsZSAoaGFzTmV4dFBhZ2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdldFJhd1RyYW5zYWN0aW9ucyhwYXlsb2FkLmRlc2NyaXB0b3IsIHJlcXVlc3RPcHRpb25zKTtcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnMgPSB1dGlscy5jb25jYXRUcmFuc2FjdGlvbnModHJhbnNhY3Rpb25zLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgLy8gaGFzTmV4dFBhZ2UgPSByZXNwb25zZS5sZW5ndGggPj0gVFhfTElNSVQgJiYgdHJhbnNhY3Rpb25zLmxlbmd0aCA8IDEwMDAwO1xuICAgICAgICAgICAgICAgIGhhc05leHRQYWdlID0gcmVzcG9uc2UubGVuZ3RoID49IFRYX0xJTUlUO1xuICAgICAgICAgICAgICAgIGlmIChoYXNOZXh0UGFnZSkge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9ucy5tYXhMZWRnZXJWZXJzaW9uID0gcmVzcG9uc2VbcmVzcG9uc2UubGVuZ3RoIC0gMV0uYmxvY2tIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29tbW9uLnJlc3BvbnNlKHtcbiAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgdHlwZTogUkVTUE9OU0VTLkdFVF9BQ0NPVU5UX0lORk8sXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgLi4uYWNjb3VudCxcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbnMsXG4gICAgICAgICAgICAgICAgYmxvY2ssXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbW1vbi5lcnJvckhhbmRsZXIoeyBpZDogZGF0YS5pZCwgZXJyb3IgfSk7XG4gICAgfVxufVxuXG5jb25zdCBlc3RpbWF0ZUZlZSA9IGFzeW5jIChkYXRhOiB7IGlkOiBudW1iZXIgfSAmIE1lc3NhZ2VUeXBlcy5Fc3RpbWF0ZUZlZSk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGFwaSA9IGF3YWl0IGNvbm5lY3QoKTtcbiAgICAgICAgY29uc3QgZmVlID0gYXdhaXQgYXBpLmdldEZlZSgpO1xuICAgICAgICAvLyBUT0RPOiBzb21ldGltZXMgcmlwcGxlZCByZXR1cm5zIHZlcnkgaGlnaCB2YWx1ZXMgaW4gXCJzZXJ2ZXJfaW5mby5sb2FkX2ZhY3RvclwiIGFuZCBjYWxjdWxhdGVkIGZlZSBqdW1wcyBmcm9tIGJhc2ljIDEyIGRyb3BzIHRvIDYwMDArIGRyb3BzIGZvciBhIG1vbWVudFxuICAgICAgICAvLyBpbnZlc3RpZ2F0ZSBtb3JlLi4uXG4gICAgICAgIGNvbnN0IGRyb3BzID0gYXBpLnhycFRvRHJvcHMoZmVlKTtcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGRhdGEucGF5bG9hZCAmJiBBcnJheS5pc0FycmF5KGRhdGEucGF5bG9hZC5sZXZlbHMpID8gZGF0YS5wYXlsb2FkLmxldmVscy5tYXAobCA9PiAoeyBuYW1lOiBsLm5hbWUsIHZhbHVlOiBkcm9wcyB9KSkgOiBbIHsgbmFtZTogJ05vcm1hbCcsIHZhbHVlOiBkcm9wcyB9IF07XG4gICAgICAgIGNvbW1vbi5yZXNwb25zZSh7XG4gICAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICAgIHR5cGU6IFJFU1BPTlNFUy5FU1RJTUFURV9GRUUsXG4gICAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb21tb24uZXJyb3JIYW5kbGVyKHsgaWQ6IGRhdGEuaWQsIGVycm9yIH0pO1xuICAgIH1cbn07XG5cbmNvbnN0IHB1c2hUcmFuc2FjdGlvbiA9IGFzeW5jIChkYXRhOiB7IGlkOiBudW1iZXIgfSAmIE1lc3NhZ2VUeXBlcy5QdXNoVHJhbnNhY3Rpb24pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhcGkgPSBhd2FpdCBjb25uZWN0KCk7XG4gICAgICAgIC8vIHR4X2Jsb2IgaGV4IG11c3QgYmUgaW4gdXBwZXIgY2FzZVxuICAgICAgICBjb25zdCBpbmZvID0gYXdhaXQgYXBpLnN1Ym1pdChkYXRhLnBheWxvYWQudG9VcHBlckNhc2UoKSk7XG5cbiAgICAgICAgaWYgKGluZm8ucmVzdWx0Q29kZSA9PT0gJ3Rlc1NVQ0NFU1MnKSB7XG4gICAgICAgICAgICBjb21tb24ucmVzcG9uc2Uoe1xuICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgICAgIHR5cGU6IFJFU1BPTlNFUy5QVVNIX1RSQU5TQUNUSU9OLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IGluZm8ucmVzdWx0TWVzc2FnZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tbW9uLmVycm9ySGFuZGxlcih7IGlkOiBkYXRhLmlkLCBlcnJvcjogbmV3IEVycm9yKGluZm8ucmVzdWx0TWVzc2FnZSkgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb21tb24uZXJyb3JIYW5kbGVyKHsgaWQ6IGRhdGEuaWQsIGVycm9yIH0pO1xuICAgIH1cbn1cblxuY29uc3Qgc3Vic2NyaWJlID0gYXN5bmMgKGRhdGE6IHsgaWQ6IG51bWJlciB9ICYgTWVzc2FnZVR5cGVzLlN1YnNjcmliZSk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHsgcGF5bG9hZCB9ID0gZGF0YTtcbiAgICB0cnkge1xuICAgICAgICBpZiAocGF5bG9hZC50eXBlID09PSAnbm90aWZpY2F0aW9uJykge1xuICAgICAgICAgICAgYXdhaXQgc3Vic2NyaWJlQWRkcmVzc2VzKHBheWxvYWQuYWRkcmVzc2VzLCBwYXlsb2FkLm1lbXBvb2wpO1xuICAgICAgICB9IGVsc2UgaWYgKHBheWxvYWQudHlwZSA9PT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgYXdhaXQgc3Vic2NyaWJlQmxvY2soKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbW1vbi5lcnJvckhhbmRsZXIoeyBpZDogZGF0YS5pZCwgZXJyb3IgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb21tb24ucmVzcG9uc2Uoe1xuICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgdHlwZTogUkVTUE9OU0VTLlNVQlNDUklCRSxcbiAgICAgICAgcGF5bG9hZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuY29uc3Qgc3Vic2NyaWJlQWRkcmVzc2VzID0gYXN5bmMgKGFkZHJlc3NlczogQXJyYXk8c3RyaW5nPiwgbWVtcG9vbDogYm9vbGVhbiA9IHRydWUpID0+IHtcbiAgICAvLyBzdWJzY3JpYmUgdG8gbmV3IGJsb2NrcywgY29uZmlybWVkIGFuZCBtZW1wb29sIHRyYW5zYWN0aW9ucyBmb3IgZ2l2ZW4gYWRkcmVzc2VzXG4gICAgY29uc3QgYXBpID0gYXdhaXQgY29ubmVjdCgpO1xuICAgIGlmICghY29tbW9uLmdldFN1YnNjcmlwdGlvbigndHJhbnNhY3Rpb24nKSkge1xuICAgICAgICBhcGkuY29ubmVjdGlvbi5vbigndHJhbnNhY3Rpb24nLCBvblRyYW5zYWN0aW9uKTtcbiAgICAgICAgLy8gYXBpLmNvbm5lY3Rpb24ub24oJ2xlZGdlckNsb3NlZCcsIG9uTGVkZ2VyQ2xvc2VkKTtcbiAgICAgICAgY29tbW9uLmFkZFN1YnNjcmlwdGlvbigndHJhbnNhY3Rpb24nKTtcbiAgICB9XG5cbiAgICBjb25zdCB1bmlxdWVBZGRyZXNzZXMgPSBjb21tb24uYWRkQWRkcmVzc2VzKGFkZHJlc3Nlcyk7XG4gICAgaWYgKHVuaXF1ZUFkZHJlc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAvLyBzdHJlYW06IFsndHJhbnNhY3Rpb25zJywgJ3RyYW5zYWN0aW9uc19wcm9wb3NlZCddLFxuICAgICAgICAgICAgYWNjb3VudHM6IHVuaXF1ZUFkZHJlc3NlcyxcbiAgICAgICAgICAgIGFjY291bnRzX3Byb3Bvc2VkOiBtZW1wb29sID8gdW5pcXVlQWRkcmVzc2VzIDogW10sXG4gICAgICAgIH07XG4gICAgXG4gICAgICAgIGF3YWl0IGFwaS5yZXF1ZXN0KCdzdWJzY3JpYmUnLCByZXF1ZXN0KTtcbiAgICB9XG59XG5cbmNvbnN0IHN1YnNjcmliZUJsb2NrID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmIChjb21tb24uZ2V0U3Vic2NyaXB0aW9uKCdsZWRnZXInKSkgcmV0dXJuO1xuICAgIGNvbnN0IGFwaSA9IGF3YWl0IGNvbm5lY3QoKTtcbiAgICBhcGkub24oJ2xlZGdlcicsIG9uTmV3QmxvY2spO1xuICAgIGNvbW1vbi5hZGRTdWJzY3JpcHRpb24oJ2xlZGdlcicpO1xufTtcblxuY29uc3QgdW5zdWJzY3JpYmUgPSBhc3luYyAoZGF0YTogeyBpZDogbnVtYmVyIH0gJiBNZXNzYWdlVHlwZXMuU3Vic2NyaWJlKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgeyBwYXlsb2FkIH0gPSBkYXRhO1xuICAgIHRyeSB7XG4gICAgICAgIGlmIChwYXlsb2FkLnR5cGUgPT09ICdub3RpZmljYXRpb24nKSB7XG4gICAgICAgICAgICBhd2FpdCB1bnN1YnNjcmliZUFkZHJlc3NlcyhwYXlsb2FkLmFkZHJlc3Nlcyk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC50eXBlID09PSAnYmxvY2snKSB7XG4gICAgICAgICAgICBhd2FpdCB1bnN1YnNjcmliZUJsb2NrKCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb21tb24uZXJyb3JIYW5kbGVyKHsgaWQ6IGRhdGEuaWQsIGVycm9yIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29tbW9uLnJlc3BvbnNlKHtcbiAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgIHR5cGU6IFJFU1BPTlNFUy5TVUJTQ1JJQkUsXG4gICAgICAgIHBheWxvYWQ6IHRydWUsXG4gICAgfSk7XG59XG5cbmNvbnN0IHVuc3Vic2NyaWJlQWRkcmVzc2VzID0gYXN5bmMgKGFkZHJlc3NlczogQXJyYXk8c3RyaW5nPikgPT4ge1xuICAgIGNvbnN0IHN1YnNjcmliZWQgPSBjb21tb24ucmVtb3ZlQWRkcmVzc2VzKGFkZHJlc3Nlcyk7XG4gICAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICAgICAgLy8gc3RyZWFtOiBbJ3RyYW5zYWN0aW9ucycsICd0cmFuc2FjdGlvbnNfcHJvcG9zZWQnXSxcbiAgICAgICAgYWNjb3VudHM6IGFkZHJlc3NlcyxcbiAgICAgICAgYWNjb3VudHNfcHJvcG9zZWQ6IGFkZHJlc3NlcyxcbiAgICB9O1xuICAgIGNvbnN0IGFwaSA9IGF3YWl0IGNvbm5lY3QoKTtcbiAgICBhd2FpdCBhcGkucmVxdWVzdCgndW5zdWJzY3JpYmUnLCByZXF1ZXN0KTtcblxuICAgIGlmIChzdWJzY3JpYmVkLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgLy8gdGhlcmUgYXJlIG5vIHN1YnNjcmliZWQgYWRkcmVzc2VzIGxlZnRcbiAgICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyc1xuICAgICAgICBhcGkuY29ubmVjdGlvbi5yZW1vdmVMaXN0ZW5lcigndHJhbnNhY3Rpb24nLCBvblRyYW5zYWN0aW9uKTtcbiAgICAgICAgLy8gYXBpLmNvbm5lY3Rpb24ub2ZmKCdsZWRnZXJDbG9zZWQnLCBvbkxlZGdlckNsb3NlZCk7XG4gICAgICAgIGNvbW1vbi5yZW1vdmVTdWJzY3JpcHRpb24oJ3RyYW5zYWN0aW9uJylcbiAgICB9XG59XG5cbmNvbnN0IHVuc3Vic2NyaWJlQmxvY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFjb21tb24uZ2V0U3Vic2NyaXB0aW9uKCdsZWRnZXInKSkgcmV0dXJuO1xuICAgIGNvbnN0IGFwaSA9IGF3YWl0IGNvbm5lY3QoKTtcbiAgICBhcGkucmVtb3ZlTGlzdGVuZXIoJ2xlZGdlcicsIG9uTmV3QmxvY2spO1xuICAgIGNvbW1vbi5yZW1vdmVTdWJzY3JpcHRpb24oJ2xlZGdlcicpO1xufVxuXG5jb25zdCBkaXNjb25uZWN0ID0gYXN5bmMgKGRhdGE6IHsgaWQ6IG51bWJlciB9KSA9PiB7XG4gICAgaWYgKCFfYXBpKSB7XG4gICAgICAgIGNvbW1vbi5yZXNwb25zZSh7IGlkOiBkYXRhLmlkLCB0eXBlOiBSRVNQT05TRVMuRElTQ09OTkVDVEVELCBwYXlsb2FkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IF9hcGkuZGlzY29ubmVjdCgpO1xuICAgICAgICBjb21tb24ucmVzcG9uc2UoeyBpZDogZGF0YS5pZCwgdHlwZTogUkVTUE9OU0VTLkRJU0NPTk5FQ1RFRCwgcGF5bG9hZDogdHJ1ZSB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb21tb24uZXJyb3JIYW5kbGVyKHsgaWQ6IGRhdGEuaWQsIGVycm9yIH0pO1xuICAgIH1cbn1cblxuY29uc3Qgb25OZXdCbG9jayA9IChldmVudDogYW55KSA9PiB7XG4gICAgY29tbW9uLnJlc3BvbnNlKHtcbiAgICAgICAgaWQ6IC0xLFxuICAgICAgICB0eXBlOiBSRVNQT05TRVMuTk9USUZJQ0FUSU9OLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICB0eXBlOiAnYmxvY2snLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgIGJsb2NrOiBldmVudC5sZWRnZXJWZXJzaW9uLFxuICAgICAgICAgICAgICAgIGhhc2g6IGV2ZW50LmxlZGdlckhhc2gsXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuY29uc3Qgb25UcmFuc2FjdGlvbiA9IChldmVudDogYW55KSA9PiB7XG4gICAgaWYgKGV2ZW50LnR5cGUgIT09ICd0cmFuc2FjdGlvbicpIHJldHVybjtcblxuICAgIGNvbnN0IHN1YnNjcmliZWQgPSBjb21tb24uZ2V0QWRkcmVzc2VzKCk7XG4gICAgY29uc3Qgc2VuZGVyID0gc3Vic2NyaWJlZC5pbmRleE9mKGV2ZW50LnRyYW5zYWN0aW9uLkFjY291bnQpO1xuICAgIGNvbnN0IHJlY2VpdmVyID0gc3Vic2NyaWJlZC5pbmRleE9mKGV2ZW50LnRyYW5zYWN0aW9uLkRlc3RpbmF0aW9uKTtcblxuXG4gICAgaWYgKHNlbmRlciA+PSAwKSB7XG4gICAgICAgIGNvbW1vbi5yZXNwb25zZSh7XG4gICAgICAgICAgICBpZDogLTEsXG4gICAgICAgICAgICB0eXBlOiBSRVNQT05TRVMuTk9USUZJQ0FUSU9OLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdub3RpZmljYXRpb24nLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHV0aWxzLnRyYW5zZm9ybVRyYW5zYWN0aW9uRXZlbnQoc3Vic2NyaWJlZFtzZW5kZXJdLCBldmVudCksXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChyZWNlaXZlciA+PSAwKSB7XG4gICAgICAgIGNvbW1vbi5yZXNwb25zZSh7XG4gICAgICAgICAgICBpZDogLTEsXG4gICAgICAgICAgICB0eXBlOiBSRVNQT05TRVMuTk9USUZJQ0FUSU9OLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdub3RpZmljYXRpb24nLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHV0aWxzLnRyYW5zZm9ybVRyYW5zYWN0aW9uRXZlbnQoc3Vic2NyaWJlZFtyZWNlaXZlcl0sIGV2ZW50KSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qXG4gICAgY29uc3Qgc3RhdHVzID0gZXZlbnQudmFsaWRhdGVkID8gJ2NvbmZpcm1lZCcgOiAncGVuZGluZyc7XG4gICAgY29uc3QgaGFzaCA9IGV2ZW50LnRyYW5zYWN0aW9uLmhhc2g7XG4gICAgY29uc3Qgc2lnbmF0dXJlID0gZXZlbnQudHJhbnNhY3Rpb24uVHhuU2lnbmF0dXJlO1xuICAgIGNvbnN0IGFtb3VudCA9IGV2ZW50LnRyYW5zYWN0aW9uLkFtb3VudDtcbiAgICBjb25zdCBmZWUgPSBldmVudC50cmFuc2FjdGlvbi5GZWU7XG4gICAgY29uc3QgdG90YWwgPSBuZXcgQmlnTnVtYmVyKGFtb3VudCkucGx1cyhmZWUpLnRvU3RyaW5nKCk7XG5cbiAgICBjb25zdCB0eERhdGEgPSB7XG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgdGltZXN0YW1wOiBldmVudC50cmFuc2FjdGlvbi5kYXRlLFxuICAgICAgICBibG9ja0hlaWdodDogMCxcblxuICAgICAgICBpbnB1dHM6IFt7IGFkZHJlc3NlczogW2V2ZW50LnRyYW5zYWN0aW9uLkFjY291bnRdIH1dLFxuICAgICAgICBvdXRwdXRzOiBbeyBhZGRyZXNzZXM6IFtldmVudC50cmFuc2FjdGlvbi5EZXN0aW5hdGlvbl0gfV0sXG5cbiAgICAgICAgaGFzaCxcbiAgICAgICAgYW1vdW50LFxuICAgICAgICBmZWUsXG4gICAgICAgIHRvdGFsLFxuICAgIH07XG5cbiAgICBpZiAoc2VuZGVyID49IDApIHtcbiAgICAgICAgY29tbW9uLnJlc3BvbnNlKHtcbiAgICAgICAgICAgIGlkOiAtMSxcbiAgICAgICAgICAgIHR5cGU6IFJFU1BPTlNFUy5OT1RJRklDQVRJT04sXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ25vdGlmaWNhdGlvbicsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc2VuZCcsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0b3I6IGV2ZW50LnRyYW5zYWN0aW9uLkFjY291bnQsXG4gICAgICAgICAgICAgICAgICAgIC4uLnR4RGF0YSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChyZWNlaXZlciA+PSAwKSB7XG4gICAgICAgIGNvbW1vbi5yZXNwb25zZSh7XG4gICAgICAgICAgICBpZDogLTEsXG4gICAgICAgICAgICB0eXBlOiBSRVNQT05TRVMuTk9USUZJQ0FUSU9OLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdub3RpZmljYXRpb24nLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3JlY3YnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yOiBldmVudC50cmFuc2FjdGlvbi5EZXN0aW5hdGlvbixcbiAgICAgICAgICAgICAgICAgICAgLi4udHhEYXRhLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgICovXG59XG5cbi8vIHBvc3RNZXNzYWdlKDEveCk7IC8vIEludGVudGlvbmFsIGVycm9yLlxuY29tbW9uLmhhbmRzaGFrZSgpO1xuXG5cblxuXG4vLyAvLyBUZXN0bmV0IGFjY291bnRcbi8vIC8vIGFkZHI6IHJHejZrRmNlanltNVpFV256VUN3UGp4Y2Z3RVBSVVBYWEdcbi8vIC8vIHNlY3JldDogc3MyQktqU2M0c01kVlhjVEh4emp5UVMydnloclFcblxuLy8gLy8gVHJlem9yIGFjY291bnRcbi8vIC8vIHJOYXFLdEtyTVN3cHdaU3pSY2tQZjdTOTZEa2ltamtGNEhcblxuLy8gcnBOcUF3VktkeVd4Wm9IZXJVekRmZ0VFb2JOUVBuUWdQVVxuXG4vLyBySmI1S3NIc0RIRjFZUzVCNURVNlFDa0g1TnNQYUtRVGN5IC0gZXhhY2huZ2VcblxuLy8gcnNHMXNOaWZYSnhHUzJuRFE5ekh5b2UxUzVBUHJ0d3BqViAtIGV4Y2hhbmdlMlxuXG4vLyBmcm9tOiBodHRwczovL2kucmVkZC5pdC96d2N0aGVsZWZqOTAxLnBuZyJdfQ==