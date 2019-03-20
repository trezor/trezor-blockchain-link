"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _constants = require("../../constants");

var common = _interopRequireWildcard(require("../common"));

var _websocket = _interopRequireDefault(require("./websocket"));

/* @flow */
onmessage = function onmessage(event) {
  if (!event.data) return;
  var data = event.data;
  common.debug('onmessage', data);

  switch (data.type) {
    case _constants.MESSAGES.HANDSHAKE:
      common.setSettings(data.settings);
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

var _connection;

var _endpoints;

var connect =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!_connection) {
              _context.next = 3;
              break;
            }

            if (!_connection.isConnected()) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", _connection);

          case 3:
            if (!(common.getSettings().server.length < 1)) {
              _context.next = 5;
              break;
            }

            throw new Error('No servers');

          case 5:
            if (_endpoints.length < 1) {
              _endpoints = common.getSettings().server.slice(0);
            }

            common.debug('Connecting to', _endpoints[0]);
            _connection = new _websocket.default(_endpoints[0]);
            _context.prev = 8;
            _context.next = 11;
            return _connection.connect();

          case 11:
            _context.next = 23;
            break;

          case 13:
            _context.prev = 13;
            _context.t0 = _context["catch"](8);
            common.debug('Websocket connection failed');
            _connection = undefined; // connection error. remove endpoint

            _endpoints.splice(0, 1); // and try another one or throw error


            if (!(_endpoints.length < 1)) {
              _context.next = 20;
              break;
            }

            throw new Error('All backends are down');

          case 20:
            _context.next = 22;
            return connect();

          case 22:
            return _context.abrupt("return", _context.sent);

          case 23:
            _connection.on('disconnected', function () {
              cleanup();
              common.response({
                id: -1,
                type: _constants.RESPONSES.DISCONNECTED,
                payload: true
              });
            });

            common.response({
              id: -1,
              type: _constants.RESPONSES.CONNECTED
            });
            common.debug('Connected');
            return _context.abrupt("return", _connection);

          case 27:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[8, 13]]);
  }));

  return function connect() {
    return _ref.apply(this, arguments);
  };
}();

var cleanup = function cleanup() {
  if (_connection) {
    _connection.removeAllListeners();

    _connection = undefined;
  }

  common.removeAddresses(common.getAddresses());
  common.clearSubscriptions();
};

var getInfo =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(data) {
    var socket, info;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return connect();

          case 3:
            socket = _context2.sent;
            _context2.next = 6;
            return socket.getServerInfo();

          case 6:
            info = _context2.sent;
            console.warn("getInfo", info, data);
            postMessage({
              id: data.id,
              type: _constants.RESPONSES.GET_INFO,
              payload: info
            });
            _context2.next = 14;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](0);
            common.errorHandler({
              id: data.id,
              error: _context2.t0
            });

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 11]]);
  }));

  return function getInfo(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var estimateFee =
/*#__PURE__*/
function () {
  var _ref3 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(data) {
    var socket, resp;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return connect();

          case 3:
            socket = _context3.sent;
            _context3.next = 6;
            return socket.estimateFee(data);

          case 6:
            resp = _context3.sent;
            console.warn("estimateFee", resp, data);
            postMessage({
              id: data.id,
              type: _constants.RESPONSES.ESTIMATE_FEE,
              payload: resp
            });
            _context3.next = 14;
            break;

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](0);
            common.errorHandler({
              id: data.id,
              error: _context3.t0
            });

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 11]]);
  }));

  return function estimateFee(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

var pushTransaction =
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee4(data) {
    var socket, resp;
    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return connect();

          case 3:
            socket = _context4.sent;
            _context4.next = 6;
            return socket.pushTransaction(data.payload);

          case 6:
            resp = _context4.sent;
            console.warn("pushTransaction", resp, data);
            postMessage({
              id: data.id,
              type: _constants.RESPONSES.PUSH_TRANSACTION,
              payload: resp
            });
            _context4.next = 14;
            break;

          case 11:
            _context4.prev = 11;
            _context4.t0 = _context4["catch"](0);
            common.errorHandler({
              id: data.id,
              error: _context4.t0
            });

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 11]]);
  }));

  return function pushTransaction(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

var getAccountInfo =
/*#__PURE__*/
function () {
  var _ref5 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee5(data) {
    var payload, socket, info;
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            payload = data.payload;
            _context5.prev = 1;
            _context5.next = 4;
            return connect();

          case 4:
            socket = _context5.sent;
            _context5.next = 7;
            return socket.getAccountInfo(payload);

          case 7:
            info = _context5.sent;
            common.response({
              id: data.id,
              type: _constants.RESPONSES.GET_ACCOUNT_INFO,
              payload: info
            });
            _context5.next = 14;
            break;

          case 11:
            _context5.prev = 11;
            _context5.t0 = _context5["catch"](1);
            common.errorHandler({
              id: data.id,
              error: _context5.t0
            });

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[1, 11]]);
  }));

  return function getAccountInfo(_x4) {
    return _ref5.apply(this, arguments);
  };
}();

var subscribe =
/*#__PURE__*/
function () {
  var _ref6 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee6(data) {
    var payload;
    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            payload = data.payload;
            _context6.prev = 1;

            if (!(payload.type === 'notification')) {
              _context6.next = 7;
              break;
            }

            _context6.next = 5;
            return subscribeAddresses(payload.addresses);

          case 5:
            _context6.next = 10;
            break;

          case 7:
            if (!(payload.type === 'block')) {
              _context6.next = 10;
              break;
            }

            _context6.next = 10;
            return subscribeBlock();

          case 10:
            _context6.next = 16;
            break;

          case 12:
            _context6.prev = 12;
            _context6.t0 = _context6["catch"](1);
            common.errorHandler({
              id: data.id,
              error: _context6.t0
            });
            return _context6.abrupt("return");

          case 16:
            postMessage({
              id: data.id,
              type: _constants.RESPONSES.SUBSCRIBE,
              payload: true
            });

          case 17:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[1, 12]]);
  }));

  return function subscribe(_x5) {
    return _ref6.apply(this, arguments);
  };
}();

var subscribeAddresses =
/*#__PURE__*/
function () {
  var _ref7 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee7(addresses) {
    var socket, uniqueAddresses;
    return _regenerator.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return connect();

          case 2:
            socket = _context7.sent;

            if (!common.getSubscription('notification')) {
              socket.on('notification', onTransaction);
              common.addSubscription('notification');
            }

            uniqueAddresses = common.addAddresses(addresses);

            if (!(uniqueAddresses.length > 0)) {
              _context7.next = 8;
              break;
            }

            _context7.next = 8;
            return socket.subscribeAddresses(uniqueAddresses);

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function subscribeAddresses(_x6) {
    return _ref7.apply(this, arguments);
  };
}();

var subscribeBlock =
/*#__PURE__*/
function () {
  var _ref8 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee8() {
    var socket;
    return _regenerator.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            if (!common.getSubscription('block')) {
              _context8.next = 2;
              break;
            }

            return _context8.abrupt("return");

          case 2:
            _context8.next = 4;
            return connect();

          case 4:
            socket = _context8.sent;
            common.addSubscription('block');
            socket.on('block', onNewBlock);
            _context8.next = 9;
            return socket.subscribeBlock();

          case 9:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function subscribeBlock() {
    return _ref8.apply(this, arguments);
  };
}();

var unsubscribe =
/*#__PURE__*/
function () {
  var _ref9 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee9(data) {
    var payload;
    return _regenerator.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            payload = data.payload;
            _context9.prev = 1;

            if (!(payload.type === 'notification')) {
              _context9.next = 7;
              break;
            }

            _context9.next = 5;
            return unsubscribeAddresses(payload.addresses);

          case 5:
            _context9.next = 10;
            break;

          case 7:
            if (!(payload.type === 'block')) {
              _context9.next = 10;
              break;
            }

            _context9.next = 10;
            return unsubscribeBlock();

          case 10:
            _context9.next = 16;
            break;

          case 12:
            _context9.prev = 12;
            _context9.t0 = _context9["catch"](1);
            common.errorHandler({
              id: data.id,
              error: _context9.t0
            });
            return _context9.abrupt("return");

          case 16:
            common.response({
              id: data.id,
              type: _constants.RESPONSES.SUBSCRIBE,
              payload: true
            });

          case 17:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[1, 12]]);
  }));

  return function unsubscribe(_x7) {
    return _ref9.apply(this, arguments);
  };
}();

var unsubscribeAddresses =
/*#__PURE__*/
function () {
  var _ref10 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee10(addresses) {
    var subscribed, socket;
    return _regenerator.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            subscribed = common.removeAddresses(addresses);
            _context10.next = 3;
            return connect();

          case 3:
            socket = _context10.sent;
            _context10.next = 6;
            return socket.unsubscribeAddresses(addresses);

          case 6:
            if (subscribed.length < 1) {
              // there are no subscribed addresses left
              // remove listeners
              // socket.off('notification', onTransaction);
              common.removeSubscription('notification');
            }

          case 7:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function unsubscribeAddresses(_x8) {
    return _ref10.apply(this, arguments);
  };
}();

var unsubscribeBlock =
/*#__PURE__*/
function () {
  var _ref11 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee11() {
    var socket;
    return _regenerator.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (common.getSubscription('block')) {
              _context11.next = 2;
              break;
            }

            return _context11.abrupt("return");

          case 2:
            _context11.next = 4;
            return connect();

          case 4:
            socket = _context11.sent;
            socket.removeListener('block', onNewBlock);
            common.removeSubscription('block');
            _context11.next = 9;
            return socket.unsubscribeBlock();

          case 9:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function unsubscribeBlock() {
    return _ref11.apply(this, arguments);
  };
}();

var disconnect =
/*#__PURE__*/
function () {
  var _ref12 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee12(data) {
    return _regenerator.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            if (_connection) {
              _context12.next = 3;
              break;
            }

            common.response({
              id: data.id,
              type: _constants.RESPONSES.DISCONNECTED,
              payload: true
            });
            return _context12.abrupt("return");

          case 3:
            _context12.prev = 3;
            _context12.next = 6;
            return _connection.disconnect();

          case 6:
            common.response({
              id: data.id,
              type: _constants.RESPONSES.DISCONNECTED,
              payload: true
            });
            _context12.next = 12;
            break;

          case 9:
            _context12.prev = 9;
            _context12.t0 = _context12["catch"](3);
            common.errorHandler({
              id: data.id,
              error: _context12.t0
            });

          case 12:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[3, 9]]);
  }));

  return function disconnect(_x9) {
    return _ref12.apply(this, arguments);
  };
}();

var onNewBlock = function onNewBlock(data) {
  common.response({
    id: -1,
    type: _constants.RESPONSES.NOTIFICATION,
    payload: {
      type: 'block',
      payload: data
    }
  });
};

var onTransaction = function onTransaction(event) {
  common.response({
    id: -1,
    type: _constants.RESPONSES.NOTIFICATION,
    payload: {
      type: 'notification',
      payload: event
    }
  });
};

common.handshake();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy93b3JrZXJzL2Jsb2NrYm9vay9pbmRleC50cyJdLCJuYW1lcyI6WyJvbm1lc3NhZ2UiLCJldmVudCIsImRhdGEiLCJjb21tb24iLCJkZWJ1ZyIsInR5cGUiLCJNRVNTQUdFUyIsIkhBTkRTSEFLRSIsInNldFNldHRpbmdzIiwic2V0dGluZ3MiLCJHRVRfSU5GTyIsImdldEluZm8iLCJHRVRfQUNDT1VOVF9JTkZPIiwiZ2V0QWNjb3VudEluZm8iLCJFU1RJTUFURV9GRUUiLCJlc3RpbWF0ZUZlZSIsIlBVU0hfVFJBTlNBQ1RJT04iLCJwdXNoVHJhbnNhY3Rpb24iLCJTVUJTQ1JJQkUiLCJzdWJzY3JpYmUiLCJVTlNVQlNDUklCRSIsInVuc3Vic2NyaWJlIiwiRElTQ09OTkVDVCIsImRpc2Nvbm5lY3QiLCJlcnJvckhhbmRsZXIiLCJpZCIsImVycm9yIiwiRXJyb3IiLCJfY29ubmVjdGlvbiIsIl9lbmRwb2ludHMiLCJjb25uZWN0IiwiaXNDb25uZWN0ZWQiLCJnZXRTZXR0aW5ncyIsInNlcnZlciIsImxlbmd0aCIsInNsaWNlIiwiQ29ubmVjdGlvbiIsInVuZGVmaW5lZCIsInNwbGljZSIsIm9uIiwiY2xlYW51cCIsInJlc3BvbnNlIiwiUkVTUE9OU0VTIiwiRElTQ09OTkVDVEVEIiwicGF5bG9hZCIsIkNPTk5FQ1RFRCIsInJlbW92ZUFsbExpc3RlbmVycyIsInJlbW92ZUFkZHJlc3NlcyIsImdldEFkZHJlc3NlcyIsImNsZWFyU3Vic2NyaXB0aW9ucyIsInNvY2tldCIsImdldFNlcnZlckluZm8iLCJpbmZvIiwiY29uc29sZSIsIndhcm4iLCJwb3N0TWVzc2FnZSIsInJlc3AiLCJzdWJzY3JpYmVBZGRyZXNzZXMiLCJhZGRyZXNzZXMiLCJzdWJzY3JpYmVCbG9jayIsImdldFN1YnNjcmlwdGlvbiIsIm9uVHJhbnNhY3Rpb24iLCJhZGRTdWJzY3JpcHRpb24iLCJ1bmlxdWVBZGRyZXNzZXMiLCJhZGRBZGRyZXNzZXMiLCJvbk5ld0Jsb2NrIiwidW5zdWJzY3JpYmVBZGRyZXNzZXMiLCJ1bnN1YnNjcmliZUJsb2NrIiwic3Vic2NyaWJlZCIsInJlbW92ZVN1YnNjcmlwdGlvbiIsInJlbW92ZUxpc3RlbmVyIiwiTk9USUZJQ0FUSU9OIiwiaGFuZHNoYWtlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBSEE7QUFRQUEsU0FBUyxHQUFHLG1CQUFDQyxLQUFELEVBQVc7QUFDbkIsTUFBSSxDQUFDQSxLQUFLLENBQUNDLElBQVgsRUFBaUI7QUFERSxNQUVYQSxJQUZXLEdBRUZELEtBRkUsQ0FFWEMsSUFGVztBQUluQkMsRUFBQUEsTUFBTSxDQUFDQyxLQUFQLENBQWEsV0FBYixFQUEwQkYsSUFBMUI7O0FBQ0EsVUFBUUEsSUFBSSxDQUFDRyxJQUFiO0FBQ0ksU0FBS0Msb0JBQVNDLFNBQWQ7QUFDSUosTUFBQUEsTUFBTSxDQUFDSyxXQUFQLENBQW1CTixJQUFJLENBQUNPLFFBQXhCO0FBQ0E7O0FBQ0osU0FBS0gsb0JBQVNJLFFBQWQ7QUFDSUMsTUFBQUEsT0FBTyxDQUFDVCxJQUFELENBQVA7QUFDQTs7QUFDSixTQUFLSSxvQkFBU00sZ0JBQWQ7QUFDSUMsTUFBQUEsY0FBYyxDQUFDWCxJQUFELENBQWQ7QUFDQTs7QUFDSixTQUFLSSxvQkFBU1EsWUFBZDtBQUNJQyxNQUFBQSxXQUFXLENBQUNiLElBQUQsQ0FBWDtBQUNBOztBQUNKLFNBQUtJLG9CQUFTVSxnQkFBZDtBQUNJQyxNQUFBQSxlQUFlLENBQUNmLElBQUQsQ0FBZjtBQUNBOztBQUNKLFNBQUtJLG9CQUFTWSxTQUFkO0FBQ0lDLE1BQUFBLFNBQVMsQ0FBQ2pCLElBQUQsQ0FBVDtBQUNBOztBQUNKLFNBQUtJLG9CQUFTYyxXQUFkO0FBQ0lDLE1BQUFBLFdBQVcsQ0FBQ25CLElBQUQsQ0FBWDtBQUNBOztBQUNKLFNBQUtJLG9CQUFTZ0IsVUFBZDtBQUNJQyxNQUFBQSxVQUFVLENBQUNyQixJQUFELENBQVY7QUFDQTs7QUFDSjtBQUNJQyxNQUFBQSxN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UyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgKiBhcyBjb21tb24gZnJvbSAnLi4vY29tbW9uJztcbmltcG9ydCBDb25uZWN0aW9uIGZyb20gJy4vd2Vic29ja2V0JztcblxuZGVjbGFyZSBmdW5jdGlvbiBwb3N0TWVzc2FnZShkYXRhKTogdm9pZDtcbmRlY2xhcmUgZnVuY3Rpb24gb25tZXNzYWdlKGV2ZW50KTogdm9pZDtcblxub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFldmVudC5kYXRhKSByZXR1cm47XG4gICAgY29uc3QgeyBkYXRhIH0gPSBldmVudDtcblxuICAgIGNvbW1vbi5kZWJ1Zygnb25tZXNzYWdlJywgZGF0YSk7XG4gICAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5IQU5EU0hBS0U6XG4gICAgICAgICAgICBjb21tb24uc2V0U2V0dGluZ3MoZGF0YS5zZXR0aW5ncyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5HRVRfSU5GTzpcbiAgICAgICAgICAgIGdldEluZm8oZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5HRVRfQUNDT1VOVF9JTkZPOlxuICAgICAgICAgICAgZ2V0QWNjb3VudEluZm8oZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5FU1RJTUFURV9GRUU6XG4gICAgICAgICAgICBlc3RpbWF0ZUZlZShkYXRhKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE1FU1NBR0VTLlBVU0hfVFJBTlNBQ1RJT046XG4gICAgICAgICAgICBwdXNoVHJhbnNhY3Rpb24oZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5TVUJTQ1JJQkU6XG4gICAgICAgICAgICBzdWJzY3JpYmUoZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNRVNTQUdFUy5VTlNVQlNDUklCRTpcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlKGRhdGEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTUVTU0FHRVMuRElTQ09OTkVDVDpcbiAgICAgICAgICAgIGRpc2Nvbm5lY3QoZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbW1vbi5lcnJvckhhbmRsZXIoe1xuICAgICAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgICAgIGVycm9yOiBuZXcgRXJyb3IoYFVua25vd24gbWVzc2FnZSB0eXBlICR7ZGF0YS50eXBlfWApXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbmxldCBfY29ubmVjdGlvbjtcbmxldCBfZW5kcG9pbnRzO1xuXG5jb25zdCBjb25uZWN0ID0gYXN5bmMgKCk6IFByb21pc2U8Q29ubmVjdGlvbj4gPT4ge1xuICAgIGlmIChfY29ubmVjdGlvbikge1xuICAgICAgICBpZiAoX2Nvbm5lY3Rpb24uaXNDb25uZWN0ZWQoKSkgcmV0dXJuIF9jb25uZWN0aW9uO1xuICAgIH1cblxuICAgIC8vIHZhbGlkYXRlIGVuZHBvaW50c1xuICAgIGlmIChjb21tb24uZ2V0U2V0dGluZ3MoKS5zZXJ2ZXIubGVuZ3RoIDwgMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHNlcnZlcnMnKTtcbiAgICB9XG5cbiAgICBpZiAoX2VuZHBvaW50cy5sZW5ndGggPCAxKSB7XG4gICAgICAgIF9lbmRwb2ludHMgPSBjb21tb24uZ2V0U2V0dGluZ3MoKS5zZXJ2ZXIuc2xpY2UoMCk7XG4gICAgfVxuXG4gICAgY29tbW9uLmRlYnVnKCdDb25uZWN0aW5nIHRvJywgX2VuZHBvaW50c1swXSk7XG4gICAgX2Nvbm5lY3Rpb24gPSBuZXcgQ29ubmVjdGlvbihfZW5kcG9pbnRzWzBdKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IF9jb25uZWN0aW9uLmNvbm5lY3QoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb21tb24uZGVidWcoJ1dlYnNvY2tldCBjb25uZWN0aW9uIGZhaWxlZCcpO1xuICAgICAgICBfY29ubmVjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gY29ubmVjdGlvbiBlcnJvci4gcmVtb3ZlIGVuZHBvaW50XG4gICAgICAgIF9lbmRwb2ludHMuc3BsaWNlKDAsIDEpO1xuICAgICAgICAvLyBhbmQgdHJ5IGFub3RoZXIgb25lIG9yIHRocm93IGVycm9yXG4gICAgICAgIGlmIChfZW5kcG9pbnRzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWxsIGJhY2tlbmRzIGFyZSBkb3duJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF3YWl0IGNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBfY29ubmVjdGlvbi5vbignZGlzY29ubmVjdGVkJywgKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgIGNvbW1vbi5yZXNwb25zZSh7IGlkOiAtMSwgdHlwZTogUkVTUE9OU0VTLkRJU0NPTk5FQ1RFRCwgcGF5bG9hZDogdHJ1ZSB9KTtcbiAgICB9KTtcblxuICAgIGNvbW1vbi5yZXNwb25zZSh7XG4gICAgICAgIGlkOiAtMSxcbiAgICAgICAgdHlwZTogUkVTUE9OU0VTLkNPTk5FQ1RFRCxcbiAgICB9KTtcblxuICAgIGNvbW1vbi5kZWJ1ZygnQ29ubmVjdGVkJyk7XG4gICAgcmV0dXJuIF9jb25uZWN0aW9uO1xufVxuXG5jb25zdCBjbGVhbnVwID0gKCkgPT4ge1xuICAgIGlmIChfY29ubmVjdGlvbikge1xuICAgICAgICBfY29ubmVjdGlvbi5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgICAgX2Nvbm5lY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbW1vbi5yZW1vdmVBZGRyZXNzZXMoY29tbW9uLmdldEFkZHJlc3NlcygpKTtcbiAgICBjb21tb24uY2xlYXJTdWJzY3JpcHRpb25zKCk7XG59XG5cbmNvbnN0IGdldEluZm8gPSBhc3luYyAoZGF0YTogeyBpZDogbnVtYmVyIH0gJiBNZXNzYWdlVHlwZXMuR2V0SW5mbyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNvY2tldCA9IGF3YWl0IGNvbm5lY3QoKTtcbiAgICAgICAgY29uc3QgaW5mbyA9IGF3YWl0IHNvY2tldC5nZXRTZXJ2ZXJJbmZvKCk7XG4gICAgICAgIGNvbnNvbGUud2FybihcImdldEluZm9cIiwgaW5mbywgZGF0YSlcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgICAgICB0eXBlOiBSRVNQT05TRVMuR0VUX0lORk8sXG4gICAgICAgICAgICBwYXlsb2FkOiBpbmZvXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbW1vbi5lcnJvckhhbmRsZXIoeyBpZDogZGF0YS5pZCwgZXJyb3IgfSk7XG4gICAgfVxufVxuXG5jb25zdCBlc3RpbWF0ZUZlZSA9IGFzeW5jIChkYXRhOiB7IGlkOiBudW1iZXIgfSAmIE1lc3NhZ2VUeXBlcy5Fc3RpbWF0ZUZlZSk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNvY2tldCA9IGF3YWl0IGNvbm5lY3QoKTtcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IHNvY2tldC5lc3RpbWF0ZUZlZShkYXRhKTtcbiAgICAgICAgY29uc29sZS53YXJuKFwiZXN0aW1hdGVGZWVcIiwgcmVzcCwgZGF0YSlcbiAgICAgICAgcG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgICAgICB0eXBlOiBSRVNQT05TRVMuRVNUSU1BVEVfRkVFLFxuICAgICAgICAgICAgcGF5bG9hZDogcmVzcFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb21tb24uZXJyb3JIYW5kbGVyKHsgaWQ6IGRhdGEuaWQsIGVycm9yIH0pO1xuICAgIH1cbn1cblxuY29uc3QgcHVzaFRyYW5zYWN0aW9uID0gYXN5bmMgKGRhdGE6IHsgaWQ6IG51bWJlciB9ICYgTWVzc2FnZVR5cGVzLlB1c2hUcmFuc2FjdGlvbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNvY2tldCA9IGF3YWl0IGNvbm5lY3QoKTtcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IHNvY2tldC5wdXNoVHJhbnNhY3Rpb24oZGF0YS5wYXlsb2FkKTtcbiAgICAgICAgY29uc29sZS53YXJuKFwicHVzaFRyYW5zYWN0aW9uXCIsIHJlc3AsIGRhdGEpXG4gICAgICAgIHBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgICAgdHlwZTogUkVTUE9OU0VTLlBVU0hfVFJBTlNBQ1RJT04sXG4gICAgICAgICAgICBwYXlsb2FkOiByZXNwXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbW1vbi5lcnJvckhhbmRsZXIoeyBpZDogZGF0YS5pZCwgZXJyb3IgfSk7XG4gICAgfVxufVxuXG5jb25zdCBnZXRBY2NvdW50SW5mbyA9IGFzeW5jIChkYXRhOiB7IGlkOiBudW1iZXIgfSAmIE1lc3NhZ2VUeXBlcy5nZXRBY2NvdW50SW5mbyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHsgcGF5bG9hZCB9ID0gZGF0YTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzb2NrZXQgPSBhd2FpdCBjb25uZWN0KCk7XG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBzb2NrZXQuZ2V0QWNjb3VudEluZm8ocGF5bG9hZCk7XG4gICAgICAgIGNvbW1vbi5yZXNwb25zZSh7XG4gICAgICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgICAgIHR5cGU6IFJFU1BPTlNFUy5HRVRfQUNDT1VOVF9JTkZPLFxuICAgICAgICAgICAgcGF5bG9hZDogaW5mbyxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29tbW9uLmVycm9ySGFuZGxlcih7IGlkOiBkYXRhLmlkLCBlcnJvciB9KTtcbiAgICB9XG59O1xuXG5jb25zdCBzdWJzY3JpYmUgPSBhc3luYyAoZGF0YTogeyBpZDogbnVtYmVyIH0gJiBNZXNzYWdlVHlwZXMuU3Vic2NyaWJlKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgeyBwYXlsb2FkIH0gPSBkYXRhO1xuICAgIHRyeSB7XG4gICAgICAgIGlmIChwYXlsb2FkLnR5cGUgPT09ICdub3RpZmljYXRpb24nKSB7XG4gICAgICAgICAgICBhd2FpdCBzdWJzY3JpYmVBZGRyZXNzZXMocGF5bG9hZC5hZGRyZXNzZXMpO1xuICAgICAgICB9IGVsc2UgaWYgKHBheWxvYWQudHlwZSA9PT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgYXdhaXQgc3Vic2NyaWJlQmxvY2soKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbW1vbi5lcnJvckhhbmRsZXIoeyBpZDogZGF0YS5pZCwgZXJyb3IgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBwb3N0TWVzc2FnZSh7XG4gICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICB0eXBlOiBSRVNQT05TRVMuU1VCU0NSSUJFLFxuICAgICAgICBwYXlsb2FkOiB0cnVlLFxuICAgIH0pO1xufVxuXG5jb25zdCBzdWJzY3JpYmVBZGRyZXNzZXMgPSBhc3luYyAoYWRkcmVzc2VzOiBBcnJheTxzdHJpbmc+KSA9PiB7XG4gICAgLy8gc3Vic2NyaWJlIHRvIG5ldyBibG9ja3MsIGNvbmZpcm1lZCBhbmQgbWVtcG9vbCB0cmFuc2FjdGlvbnMgZm9yIGdpdmVuIGFkZHJlc3Nlc1xuICAgIGNvbnN0IHNvY2tldCA9IGF3YWl0IGNvbm5lY3QoKTtcbiAgICBpZiAoIWNvbW1vbi5nZXRTdWJzY3JpcHRpb24oJ25vdGlmaWNhdGlvbicpKSB7XG4gICAgICAgIHNvY2tldC5vbignbm90aWZpY2F0aW9uJywgb25UcmFuc2FjdGlvbik7XG4gICAgICAgIGNvbW1vbi5hZGRTdWJzY3JpcHRpb24oJ25vdGlmaWNhdGlvbicpO1xuICAgIH1cblxuICAgIGNvbnN0IHVuaXF1ZUFkZHJlc3NlcyA9IGNvbW1vbi5hZGRBZGRyZXNzZXMoYWRkcmVzc2VzKTtcbiAgICBpZiAodW5pcXVlQWRkcmVzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYXdhaXQgc29ja2V0LnN1YnNjcmliZUFkZHJlc3Nlcyh1bmlxdWVBZGRyZXNzZXMpO1xuICAgIH1cbn1cblxuY29uc3Qgc3Vic2NyaWJlQmxvY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKGNvbW1vbi5nZXRTdWJzY3JpcHRpb24oJ2Jsb2NrJykpIHJldHVybjtcbiAgICBjb25zdCBzb2NrZXQgPSBhd2FpdCBjb25uZWN0KCk7XG4gICAgY29tbW9uLmFkZFN1YnNjcmlwdGlvbignYmxvY2snKTtcbiAgICBzb2NrZXQub24oJ2Jsb2NrJywgb25OZXdCbG9jayk7XG4gICAgYXdhaXQgc29ja2V0LnN1YnNjcmliZUJsb2NrKCk7XG59O1xuXG5jb25zdCB1bnN1YnNjcmliZSA9IGFzeW5jIChkYXRhOiB7IGlkOiBudW1iZXIgfSAmIE1lc3NhZ2VUeXBlcy5TdWJzY3JpYmUpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB7IHBheWxvYWQgfSA9IGRhdGE7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHBheWxvYWQudHlwZSA9PT0gJ25vdGlmaWNhdGlvbicpIHtcbiAgICAgICAgICAgIGF3YWl0IHVuc3Vic2NyaWJlQWRkcmVzc2VzKHBheWxvYWQuYWRkcmVzc2VzKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLnR5cGUgPT09ICdibG9jaycpIHtcbiAgICAgICAgICAgIGF3YWl0IHVuc3Vic2NyaWJlQmxvY2soKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbW1vbi5lcnJvckhhbmRsZXIoeyBpZDogZGF0YS5pZCwgZXJyb3IgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb21tb24ucmVzcG9uc2Uoe1xuICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgdHlwZTogUkVTUE9OU0VTLlNVQlNDUklCRSxcbiAgICAgICAgcGF5bG9hZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuY29uc3QgdW5zdWJzY3JpYmVBZGRyZXNzZXMgPSBhc3luYyAoYWRkcmVzc2VzOiBBcnJheTxzdHJpbmc+KSA9PiB7XG4gICAgY29uc3Qgc3Vic2NyaWJlZCA9IGNvbW1vbi5yZW1vdmVBZGRyZXNzZXMoYWRkcmVzc2VzKTtcbiAgICBjb25zdCBzb2NrZXQgPSBhd2FpdCBjb25uZWN0KCk7XG4gICAgYXdhaXQgc29ja2V0LnVuc3Vic2NyaWJlQWRkcmVzc2VzKGFkZHJlc3Nlcyk7XG5cbiAgICBpZiAoc3Vic2NyaWJlZC5sZW5ndGggPCAxKSB7XG4gICAgICAgIC8vIHRoZXJlIGFyZSBubyBzdWJzY3JpYmVkIGFkZHJlc3NlcyBsZWZ0XG4gICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lcnNcbiAgICAgICAgLy8gc29ja2V0Lm9mZignbm90aWZpY2F0aW9uJywgb25UcmFuc2FjdGlvbik7XG4gICAgICAgIGNvbW1vbi5yZW1vdmVTdWJzY3JpcHRpb24oJ25vdGlmaWNhdGlvbicpO1xuICAgIH1cbn1cblxuY29uc3QgdW5zdWJzY3JpYmVCbG9jayA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIWNvbW1vbi5nZXRTdWJzY3JpcHRpb24oJ2Jsb2NrJykpIHJldHVybjtcbiAgICBjb25zdCBzb2NrZXQgPSBhd2FpdCBjb25uZWN0KCk7XG4gICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdibG9jaycsIG9uTmV3QmxvY2spO1xuICAgIGNvbW1vbi5yZW1vdmVTdWJzY3JpcHRpb24oJ2Jsb2NrJyk7XG4gICAgYXdhaXQgc29ja2V0LnVuc3Vic2NyaWJlQmxvY2soKTtcbn1cblxuY29uc3QgZGlzY29ubmVjdCA9IGFzeW5jIChkYXRhOiB7IGlkOiBudW1iZXIgfSkgPT4ge1xuICAgIGlmICghX2Nvbm5lY3Rpb24pIHtcbiAgICAgICAgY29tbW9uLnJlc3BvbnNlKHsgaWQ6IGRhdGEuaWQsIHR5cGU6IFJFU1BPTlNFUy5ESVNDT05ORUNURUQsIHBheWxvYWQ6IHRydWUgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgX2Nvbm5lY3Rpb24uZGlzY29ubmVjdCgpO1xuICAgICAgICBjb21tb24ucmVzcG9uc2UoeyBpZDogZGF0YS5pZCwgdHlwZTogUkVTUE9OU0VTLkRJU0NPTk5FQ1RFRCwgcGF5bG9hZDogdHJ1ZSB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb21tb24uZXJyb3JIYW5kbGVyKHsgaWQ6IGRhdGEuaWQsIGVycm9yIH0pO1xuICAgIH1cbn07XG5cbmNvbnN0IG9uTmV3QmxvY2sgPSAoZGF0YTogYW55KSA9PiB7XG4gICAgY29tbW9uLnJlc3BvbnNlKHtcbiAgICAgICAgaWQ6IC0xLFxuICAgICAgICB0eXBlOiBSRVNQT05TRVMuTk9USUZJQ0FUSU9OLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICB0eXBlOiAnYmxvY2snLFxuICAgICAgICAgICAgcGF5bG9hZDogZGF0YSxcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuY29uc3Qgb25UcmFuc2FjdGlvbiA9IChldmVudDogYW55KSA9PiB7XG4gICAgY29tbW9uLnJlc3BvbnNlKHtcbiAgICAgICAgaWQ6IC0xLFxuICAgICAgICB0eXBlOiBSRVNQT05TRVMuTk9USUZJQ0FUSU9OLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICB0eXBlOiAnbm90aWZpY2F0aW9uJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IGV2ZW50LFxuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5jb21tb24uaGFuZHNoYWtlKCk7Il19