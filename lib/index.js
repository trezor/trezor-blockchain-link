"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _events = _interopRequireDefault(require("events"));

var _constants = require("./constants");

var _deferred = require("./utils/deferred");

/* @flow */
var workerWrapper = function workerWrapper(factory) {
  if (typeof factory === 'function') return new factory();
  if (typeof factory === 'string' && typeof Worker !== 'undefined') return new Worker(factory); // use custom worker

  throw new Error('Cannot use worker');
}; // initialize worker communication, raise error if worker not found


var initWorker =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(settings) {
    var dfd, worker;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            dfd = (0, _deferred.create)(-1);
            worker = workerWrapper(settings.worker);

            worker.onmessage = function (message) {
              if (message.data.type !== _constants.MESSAGES.HANDSHAKE) return;
              delete settings.worker;
              worker.postMessage({
                type: _constants.MESSAGES.HANDSHAKE,
                settings: settings
              });
              dfd.resolve(worker);
            };

            worker.onerror = function (error) {
              worker.onmessage = null;
              worker.onerror = null;
              var msg = error.message ? "Worker runtime error: Line ".concat(error.lineno, " in ").concat(error.filename, ": ").concat(error.message) : 'Worker handshake error';
              dfd.reject(new Error(msg));
            };

            return _context.abrupt("return", dfd.promise);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function initWorker(_x) {
    return _ref.apply(this, arguments);
  };
}();

var BlockchainLink =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2.default)(BlockchainLink, _EventEmitter);

  function BlockchainLink(settings) {
    var _this;

    (0, _classCallCheck2.default)(this, BlockchainLink);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(BlockchainLink).call(this));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "settings", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "messageId", 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "worker", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "deferred", []);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "__send",
    /*#__PURE__*/
    function () {
      var _ref2 = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(message) {
        var dfd;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _this.getWorker();

              case 2:
                dfd = (0, _deferred.create)(_this.messageId);

                _this.deferred.push(dfd);

                _this.worker.postMessage((0, _objectSpread2.default)({
                  id: _this.messageId
                }, message));

                _this.messageId++;
                return _context2.abrupt("return", dfd.promise);

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "onMessage", function (event) {
      if (!event.data) return;
      var data = event.data;

      if (data.id === -1) {
        _this.onEvent(event);

        return;
      }

      var dfd = _this.deferred.find(function (d) {
        return d.id === data.id;
      });

      if (!dfd) {
        console.warn("Message with id ".concat(data.id, " not found"));
        return;
      }

      if (data.type === _constants.RESPONSES.ERROR) {
        dfd.reject(new Error(data.payload));
      } else {
        dfd.resolve(data.payload);
      }

      _this.deferred = _this.deferred.filter(function (d) {
        return d !== dfd;
      });
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "onEvent", function (event) {
      if (!event.data) return;
      var data = event.data;

      if (data.type === _constants.RESPONSES.CONNECTED) {
        _this.emit('connected');
      } else if (data.type === _constants.RESPONSES.DISCONNECTED) {
        _this.emit('disconnected');
      } else if (data.type === _constants.RESPONSES.ERROR) {
        _this.emit('error', data.payload);
      } else if (data.type === _constants.RESPONSES.NOTIFICATION) {
        _this.emit(data.payload.type, data.payload.payload);
      }
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "onNotification", function (notification) {
      _this.emit(notification.type, notification.payload);
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "onError", function (error) {
      var message = error.message ? "Worker runtime error: Line ".concat(error.lineno, " in ").concat(error.filename, ": ").concat(error.message) : 'Worker handshake error';
      var e = new Error(message); // reject all pending responses

      _this.deferred.forEach(function (d) {
        d.reject(e);
      });

      _this.deferred = [];
    });
    _this.settings = settings;
    return _this;
  }

  (0, _createClass2.default)(BlockchainLink, [{
    key: "getWorker",
    value: function () {
      var _getWorker = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3() {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.worker) {
                  _context3.next = 6;
                  break;
                }

                _context3.next = 3;
                return initWorker(this.settings);

              case 3:
                this.worker = _context3.sent;
                // $FlowIssue MessageEvent type
                this.worker.onmessage = this.onMessage.bind(this); // $FlowIssue ErrorEvent type

                this.worker.onerror = this.onError.bind(this);

              case 6:
                return _context3.abrupt("return", this.worker);

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getWorker() {
        return _getWorker.apply(this, arguments);
      }

      return getWorker;
    }() // Sending messages to worker

  }, {
    key: "connect",
    value: function () {
      var _connect = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4() {
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.__send({
                  type: _constants.MESSAGES.CONNECT
                });

              case 2:
                return _context4.abrupt("return", _context4.sent);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function connect() {
        return _connect.apply(this, arguments);
      }

      return connect;
    }()
  }, {
    key: "getInfo",
    value: function () {
      var _getInfo = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee5() {
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.__send({
                  type: _constants.MESSAGES.GET_INFO
                });

              case 2:
                return _context5.abrupt("return", _context5.sent);

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getInfo() {
        return _getInfo.apply(this, arguments);
      }

      return getInfo;
    }()
  }, {
    key: "getAccountInfo",
    value: function () {
      var _getAccountInfo = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee6(payload) {
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.__send({
                  type: _constants.MESSAGES.GET_ACCOUNT_INFO,
                  payload: payload
                });

              case 2:
                return _context6.abrupt("return", _context6.sent);

              case 3:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getAccountInfo(_x3) {
        return _getAccountInfo.apply(this, arguments);
      }

      return getAccountInfo;
    }()
  }, {
    key: "estimateFee",
    value: function () {
      var _estimateFee = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee7(payload) {
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.__send({
                  type: _constants.MESSAGES.ESTIMATE_FEE,
                  payload: payload
                });

              case 2:
                return _context7.abrupt("return", _context7.sent);

              case 3:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function estimateFee(_x4) {
        return _estimateFee.apply(this, arguments);
      }

      return estimateFee;
    }()
  }, {
    key: "subscribe",
    value: function () {
      var _subscribe = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee8(payload) {
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.__send({
                  type: _constants.MESSAGES.SUBSCRIBE,
                  payload: payload
                });

              case 2:
                return _context8.abrupt("return", _context8.sent);

              case 3:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function subscribe(_x5) {
        return _subscribe.apply(this, arguments);
      }

      return subscribe;
    }()
  }, {
    key: "unsubscribe",
    value: function () {
      var _unsubscribe = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee9(payload) {
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.__send({
                  type: _constants.MESSAGES.UNSUBSCRIBE,
                  payload: payload
                });

              case 2:
                return _context9.abrupt("return", _context9.sent);

              case 3:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function unsubscribe(_x6) {
        return _unsubscribe.apply(this, arguments);
      }

      return unsubscribe;
    }()
  }, {
    key: "pushTransaction",
    value: function () {
      var _pushTransaction = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee10(payload) {
        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.__send({
                  type: _constants.MESSAGES.PUSH_TRANSACTION,
                  payload: payload
                });

              case 2:
                return _context10.abrupt("return", _context10.sent);

              case 3:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function pushTransaction(_x7) {
        return _pushTransaction.apply(this, arguments);
      }

      return pushTransaction;
    }()
  }, {
    key: "disconnect",
    value: function () {
      var _disconnect = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee11() {
        return _regenerator.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                if (this.worker) {
                  _context11.next = 2;
                  break;
                }

                return _context11.abrupt("return", true);

              case 2:
                _context11.next = 4;
                return this.__send({
                  type: _constants.MESSAGES.DISCONNECT
                });

              case 4:
                return _context11.abrupt("return", _context11.sent);

              case 5:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function disconnect() {
        return _disconnect.apply(this, arguments);
      }

      return disconnect;
    }() // worker messages handler

  }, {
    key: "dispose",
    value: function dispose() {
      if (this.worker) {
        this.worker.terminate();
        delete this.worker;
      }
    }
  }]);
  return BlockchainLink;
}(_events.default);

var _default = BlockchainLink;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6WyJ3b3JrZXJXcmFwcGVyIiwiZmFjdG9yeSIsIldvcmtlciIsIkVycm9yIiwiaW5pdFdvcmtlciIsInNldHRpbmdzIiwiZGZkIiwid29ya2VyIiwib25tZXNzYWdlIiwibWVzc2FnZSIsImRhdGEiLCJ0eXBlIiwiTUVTU0FHRVMiLCJIQU5EU0hBS0UiLCJwb3N0TWVzc2FnZSIsInJlc29sdmUiLCJvbmVycm9yIiwiZXJyb3IiLCJtc2ciLCJsaW5lbm8iLCJmaWxlbmFtZSIsInJlamVjdCIsInByb21pc2UiLCJCbG9ja2NoYWluTGluayIsImdldFdvcmtlciIsIm1lc3NhZ2VJZCIsImRlZmVycmVkIiwicHVzaCIsImlkIiwiZXZlbnQiLCJvbkV2ZW50IiwiZmluZCIsImQiLCJjb25zb2xlIiwid2FybiIsIlJFU1BPTlNFUyIsIkVSUk9SIiwicGF5bG9hZCIsImZpbHRlciIsIkNPTk5FQ1RFRCIsImVtaXQiLCJESVNDT05ORUNURUQiLCJOT1RJRklDQVRJT04iLCJub3RpZmljYXRpb24iLCJlIiwiZm9yRWFjaCIsIm9uTWVzc2FnZSIsImJpbmQiLCJvbkVycm9yIiwiX19zZW5kIiwiQ09OTkVDVCIsIkdFVF9JTkZPIiwiR0VUX0FDQ09VTlRfSU5GTyIsIkVTVElNQVRFX0ZFRSIsIlNVQlNDUklCRSIsIlVOU1VCU0NSSUJFIiwiUFVTSF9UUkFOU0FDVElPTiIsIkRJU0NPTk5FQ1QiLCJ0ZXJtaW5hdGUiLCJFdmVudEVtaXR0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBTEE7QUFTQSxJQUFNQSxhQUFhLEdBQUcsU0FBaEJBLGFBQWdCLENBQUNDLE9BQUQsRUFBd0M7QUFDMUQsTUFBSSxPQUFPQSxPQUFQLEtBQW1CLFVBQXZCLEVBQW1DLE9BQU8sSUFBSUEsT0FBSixFQUFQO0FBQ25DLE1BQUksT0FBT0EsT0FBUCxLQUFtQixRQUFuQixJQUEr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QUVDLG9CQUFTNEMsZ0JBRE07QUFFckJuQixrQkFBQUEsT0FBTyxFQUFQQTtBQUZxQixpQkFBWixDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFPUixLQUFLOUIsTTs7Ozs7bURBQWUsSTs7Ozt1QkFDWixLQUFLMEMsTUFBTCxDQUFZO0FBQ3JCdEMsa0JBQUFBLElBQUksRUFBRUMsb0JBQVM2QztBQURNLGlCQUFaLEM7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQUtqQjs7Ozs4QkFzRFU7QUFDTixVQUFJLEtBQUtsRCxNQUFULEVBQWlCO0FBQ2IsYUFBS0EsTUFBTCxDQUFZbUQsU0FBWjtBQUNBLGVBQU8sS0FBS25ELE1BQVo7QUFDSDtBQUNKOzs7RUFqSndCb0QsZTs7ZUFvSmRwQyxjIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuXG5pbXBvcnQgeyBNRVNTQUdFUywgUkVTUE9OU0VTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgY3JlYXRlIGFzIGNyZWF0ZURlZmVycmVkIH0gZnJvbSAnLi91dGlscy9kZWZlcnJlZCc7XG5pbXBvcnQgKiBhcyBNZXNzYWdlVHlwZXMgZnJvbSAnLi90eXBlcy9tZXNzYWdlcyc7XG5pbXBvcnQgKiBhcyBSZXNwb25zZVR5cGVzIGZyb20gJy4vdHlwZXMvcmVzcG9uc2VzJztcblxuY29uc3Qgd29ya2VyV3JhcHBlciA9IChmYWN0b3J5OiBzdHJpbmcgfCBGdW5jdGlvbik6IFdvcmtlciA9PiB7XG4gICAgaWYgKHR5cGVvZiBmYWN0b3J5ID09PSAnZnVuY3Rpb24nKSByZXR1cm4gbmV3IGZhY3RvcnkoKTtcbiAgICBpZiAodHlwZW9mIGZhY3RvcnkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBXb3JrZXIgIT09ICd1bmRlZmluZWQnKSByZXR1cm4gbmV3IFdvcmtlcihmYWN0b3J5KTtcbiAgICAvLyB1c2UgY3VzdG9tIHdvcmtlclxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHVzZSB3b3JrZXInKTtcbn07XG5cbi8vIGluaXRpYWxpemUgd29ya2VyIGNvbW11bmljYXRpb24sIHJhaXNlIGVycm9yIGlmIHdvcmtlciBub3QgZm91bmRcbmNvbnN0IGluaXRXb3JrZXIgPSBhc3luYyAoc2V0dGluZ3MpOiBQcm9taXNlPFdvcmtlcj4gPT4ge1xuICAgIGNvbnN0IGRmZCA9IGNyZWF0ZURlZmVycmVkKC0xKTtcbiAgICBjb25zdCB3b3JrZXIgPSB3b3JrZXJXcmFwcGVyKHNldHRpbmdzLndvcmtlcik7XG4gICAgd29ya2VyLm9ubWVzc2FnZSA9IChtZXNzYWdlOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuZGF0YS50eXBlICE9PSBNRVNTQUdFUy5IQU5EU0hBS0UpIHJldHVybjtcbiAgICAgICAgZGVsZXRlIHNldHRpbmdzLndvcmtlcjtcbiAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6IE1FU1NBR0VTLkhBTkRTSEFLRSxcbiAgICAgICAgICAgIHNldHRpbmdzLFxuICAgICAgICB9KTtcbiAgICAgICAgZGZkLnJlc29sdmUod29ya2VyKTtcbiAgICB9XG5cbiAgICB3b3JrZXIub25lcnJvciA9IChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICB3b3JrZXIub25lcnJvciA9IG51bGw7XG4gICAgICAgIGNvbnN0IG1zZyA9IGVycm9yLm1lc3NhZ2UgPyBgV29ya2VyIHJ1bnRpbWUgZXJyb3I6IExpbmUgJHtlcnJvci5saW5lbm99IGluICR7ZXJyb3IuZmlsZW5hbWV9OiAke2Vycm9yLm1lc3NhZ2V9YCA6ICdXb3JrZXIgaGFuZHNoYWtlIGVycm9yJztcbiAgICAgICAgZGZkLnJlamVjdChuZXcgRXJyb3IobXNnKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRmZC5wcm9taXNlO1xufVxuXG5jbGFzcyBCbG9ja2NoYWluTGluayBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgc2V0dGluZ3M6IEJsb2NrY2hhaW5TZXR0aW5ncztcbiAgICBtZXNzYWdlSWQ6IG51bWJlciA9IDA7XG4gICAgd29ya2VyOiBXb3JrZXI7XG4gICAgZGVmZXJyZWQ6IEFycmF5PERlZmVycmVkPGFueT4+ID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcihzZXR0aW5nczogQmxvY2tjaGFpblNldHRpbmdzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB9XG5cbiAgICBhc3luYyBnZXRXb3JrZXIoKTogUHJvbWlzZTxXb3JrZXI+IHtcbiAgICAgICAgaWYgKCF0aGlzLndvcmtlcikge1xuICAgICAgICAgICAgdGhpcy53b3JrZXIgPSBhd2FpdCBpbml0V29ya2VyKHRoaXMuc2V0dGluZ3MpO1xuICAgICAgICAgICAgLy8gJEZsb3dJc3N1ZSBNZXNzYWdlRXZlbnQgdHlwZVxuICAgICAgICAgICAgdGhpcy53b3JrZXIub25tZXNzYWdlID0gdGhpcy5vbk1lc3NhZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIC8vICRGbG93SXNzdWUgRXJyb3JFdmVudCB0eXBlXG4gICAgICAgICAgICB0aGlzLndvcmtlci5vbmVycm9yID0gdGhpcy5vbkVycm9yLmJpbmQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMud29ya2VyO1xuICAgIH1cblxuICAgIC8vIFNlbmRpbmcgbWVzc2FnZXMgdG8gd29ya2VyXG4gICAgX19zZW5kOiA8Uj4obWVzc2FnZTogYW55KSA9PiBQcm9taXNlPFI+ID0gYXN5bmMgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5nZXRXb3JrZXIoKTtcbiAgICAgICAgY29uc3QgZGZkOiBEZWZlcnJlZDxhbnk+ID0gY3JlYXRlRGVmZXJyZWQodGhpcy5tZXNzYWdlSWQpO1xuICAgICAgICB0aGlzLmRlZmVycmVkLnB1c2goZGZkKTtcbiAgICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoeyBpZDogdGhpcy5tZXNzYWdlSWQsIC4uLm1lc3NhZ2UgfSk7XG4gICAgICAgIHRoaXMubWVzc2FnZUlkKys7XG4gICAgICAgIHJldHVybiBkZmQucHJvbWlzZTtcbiAgICB9XG5cbiAgICBhc3luYyBjb25uZWN0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fX3NlbmQoe1xuICAgICAgICAgICAgdHlwZTogTUVTU0FHRVMuQ09OTkVDVCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0SW5mbygpOiBQcm9taXNlPCRFbGVtZW50VHlwZTxSZXNwb25zZVR5cGVzLkdldEluZm8sICdwYXlsb2FkJz4+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX19zZW5kKHtcbiAgICAgICAgICAgIHR5cGU6IE1FU1NBR0VTLkdFVF9JTkZPLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBnZXRBY2NvdW50SW5mbyhwYXlsb2FkOiAkRWxlbWVudFR5cGU8TWVzc2FnZVR5cGVzLkdldEFjY291bnRJbmZvLCAncGF5bG9hZCc+KTogUHJvbWlzZTwkRWxlbWVudFR5cGU8UmVzcG9uc2VUeXBlcy5HZXRBY2NvdW50SW5mbywgJ3BheWxvYWQnPj4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fX3NlbmQoe1xuICAgICAgICAgICAgdHlwZTogTUVTU0FHRVMuR0VUX0FDQ09VTlRfSU5GTyxcbiAgICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZXN0aW1hdGVGZWUocGF5bG9hZDogJEVsZW1lbnRUeXBlPE1lc3NhZ2VUeXBlcy5Fc3RpbWF0ZUZlZSwgJ3BheWxvYWQnPik6IFByb21pc2U8JEVsZW1lbnRUeXBlPFJlc3BvbnNlVHlwZXMuRXN0aW1hdGVGZWUsICdwYXlsb2FkJz4+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX19zZW5kKHtcbiAgICAgICAgICAgIHR5cGU6IE1FU1NBR0VTLkVTVElNQVRFX0ZFRSxcbiAgICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgc3Vic2NyaWJlKHBheWxvYWQ6ICRFbGVtZW50VHlwZTxNZXNzYWdlVHlwZXMuU3Vic2NyaWJlLCAncGF5bG9hZCc+KTogUHJvbWlzZTwkRWxlbWVudFR5cGU8UmVzcG9uc2VUeXBlcy5TdWJzY3JpYmUsICdwYXlsb2FkJz4+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX19zZW5kKHtcbiAgICAgICAgICAgIHR5cGU6IE1FU1NBR0VTLlNVQlNDUklCRSxcbiAgICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgdW5zdWJzY3JpYmUocGF5bG9hZDogJEVsZW1lbnRUeXBlPE1lc3NhZ2VUeXBlcy5TdWJzY3JpYmUsICdwYXlsb2FkJz4pOiBQcm9taXNlPCRFbGVtZW50VHlwZTxSZXNwb25zZVR5cGVzLlVuc3Vic2NyaWJlLCAncGF5bG9hZCc+PiB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9fc2VuZCh7XG4gICAgICAgICAgICB0eXBlOiBNRVNTQUdFUy5VTlNVQlNDUklCRSxcbiAgICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgcHVzaFRyYW5zYWN0aW9uKHBheWxvYWQ6ICRFbGVtZW50VHlwZTxNZXNzYWdlVHlwZXMuUHVzaFRyYW5zYWN0aW9uLCAncGF5bG9hZCc+KTogUHJvbWlzZTwkRWxlbWVudFR5cGU8UmVzcG9uc2VUeXBlcy5QdXNoVHJhbnNhY3Rpb24sICdwYXlsb2FkJz4+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX19zZW5kKHtcbiAgICAgICAgICAgIHR5cGU6IE1FU1NBR0VTLlBVU0hfVFJBTlNBQ1RJT04sXG4gICAgICAgICAgICBwYXlsb2FkXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIGRpc2Nvbm5lY3QoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIGlmICghdGhpcy53b3JrZXIpIHJldHVybiB0cnVlO1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fX3NlbmQoe1xuICAgICAgICAgICAgdHlwZTogTUVTU0FHRVMuRElTQ09OTkVDVCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gd29ya2VyIG1lc3NhZ2VzIGhhbmRsZXJcblxuICAgIG9uTWVzc2FnZTogKGV2ZW50OiB7ZGF0YTogUmVzcG9uc2VUeXBlcy5SZXNwb25zZX0pID0+IHZvaWQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFldmVudC5kYXRhKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gZXZlbnQ7XG5cbiAgICAgICAgaWYgKGRhdGEuaWQgPT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLm9uRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGZkID0gdGhpcy5kZWZlcnJlZC5maW5kKGQgPT4gZC5pZCA9PT0gZGF0YS5pZCk7XG4gICAgICAgIGlmICghZGZkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE1lc3NhZ2Ugd2l0aCBpZCAke2RhdGEuaWR9IG5vdCBmb3VuZGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT09IFJFU1BPTlNFUy5FUlJPUikge1xuICAgICAgICAgICAgZGZkLnJlamVjdChuZXcgRXJyb3IoZGF0YS5wYXlsb2FkKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZmQucmVzb2x2ZShkYXRhLnBheWxvYWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVmZXJyZWQgPSB0aGlzLmRlZmVycmVkLmZpbHRlcihkID0+IGQgIT09IGRmZCk7XG4gICAgICAgIFxuICAgIH1cblxuICAgIG9uRXZlbnQ6IChldmVudDoge2RhdGE6IFJlc3BvbnNlVHlwZXMuUmVzcG9uc2V9KSA9PiB2b2lkID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghZXZlbnQuZGF0YSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB7IGRhdGEgfSA9IGV2ZW50O1xuXG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT09IFJFU1BPTlNFUy5DT05ORUNURUQpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY29ubmVjdGVkJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YS50eXBlID09PSBSRVNQT05TRVMuRElTQ09OTkVDVEVEKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gUkVTUE9OU0VTLkVSUk9SKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZGF0YS5wYXlsb2FkKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09IFJFU1BPTlNFUy5OT1RJRklDQVRJT04pIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChkYXRhLnBheWxvYWQudHlwZSwgZGF0YS5wYXlsb2FkLnBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Ob3RpZmljYXRpb246IChub3RpZmljYXRpb246IGFueSkgPT4gdm9pZCA9IChub3RpZmljYXRpb24pID0+IHtcbiAgICAgICAgdGhpcy5lbWl0KG5vdGlmaWNhdGlvbi50eXBlLCBub3RpZmljYXRpb24ucGF5bG9hZCk7XG4gICAgfVxuICAgIFxuICAgIG9uRXJyb3I6IChlcnJvcjogeyBtZXNzYWdlOiBzdHJpbmcsIGxpbmVubzogbnVtYmVyLCBmaWxlbmFtZTogc3RyaW5nIH0pID0+IHZvaWQgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgPyBgV29ya2VyIHJ1bnRpbWUgZXJyb3I6IExpbmUgJHtlcnJvci5saW5lbm99IGluICR7ZXJyb3IuZmlsZW5hbWV9OiAke2Vycm9yLm1lc3NhZ2V9YCA6ICdXb3JrZXIgaGFuZHNoYWtlIGVycm9yJztcbiAgICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgLy8gcmVqZWN0IGFsbCBwZW5kaW5nIHJlc3BvbnNlc1xuICAgICAgICB0aGlzLmRlZmVycmVkLmZvckVhY2goZCA9PiB7XG4gICAgICAgICAgICBkLnJlamVjdChlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGVmZXJyZWQgPSBbXTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICBpZiAodGhpcy53b3JrZXIpIHtcbiAgICAgICAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMud29ya2VyO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCbG9ja2NoYWluTGluazsiXX0=