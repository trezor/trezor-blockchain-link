"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _ws = _interopRequireDefault(require("ws"));

var _events = _interopRequireDefault(require("events"));

var _es6Promise = _interopRequireDefault(require("es6-promise"));

/* @flow */
var Socket =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2.default)(Socket, _EventEmitter);
  (0, _createClass2.default)(Socket, [{
    key: "_send",
    value: function _send(method, params, callback) {
      if (!this._ws) throw new Error('WebSocket not initialized');
      var ws = this._ws;

      var id = this._messageID.toString();

      this._messageID++;
      this._pendingMessages[id] = callback;
      var req = {
        id: id,
        method: method,
        params: params
      };
      ws.send(JSON.stringify(req));
      return id;
    }
  }, {
    key: "_subscribe",
    value: function _subscribe(method, params, callback) {
      if (!this._ws) throw new Error('WebSocket not initialized');
      var ws = this._ws;

      var id = this._messageID.toString();

      this._messageID++;
      this._subscriptions[id] = callback;
      var req = {
        id: id,
        method: method,
        params: params
      };
      ws.send(JSON.stringify(req));
      return id;
    }
  }, {
    key: "_unsubscribe",
    value: function _unsubscribe(method, id, params, callback) {
      if (!this._ws) throw new Error('WebSocket not initialized');
      var ws = this._ws;
      delete this._subscriptions[id];
      this._pendingMessages[id] = callback;
      var req = {
        id: id,
        method: method,
        params: params
      };
      ws.send(JSON.stringify(req));
      return id;
    }
  }, {
    key: "_onmessage",
    value: function _onmessage(m) {
      var resp = JSON.parse(m);
      var f = this._pendingMessages[resp.id];

      if (f != undefined) {
        delete this._pendingMessages[resp.id];
        f(resp.data);
      } else {
        var s = this._subscriptions[resp.id];

        if (s != undefined) {
          s(resp.data);
        } else {
          console.log('unknown response ' + resp.id);
        }
      }
    }
  }, {
    key: "_createWebSocket",
    value: function _createWebSocket() {
      var websocket = new _ws.default(this._url); // we will have a listener for each outstanding request,
      // so we have to raise the limit (the default is 10)

      if (typeof websocket.setMaxListeners === 'function') {
        websocket.setMaxListeners(Infinity);
      }

      return websocket;
    }
  }, {
    key: "_onOpenError",
    value: function _onOpenError(err) {
      console.error('OpenError', err);
    }
  }]);

  function Socket(url) {
    var _this;

    (0, _classCallCheck2.default)(this, Socket);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Socket).call(this));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_url", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_ws", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_state", 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_messageID", 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_pendingMessages", {});
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_subscriptions", {});
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_subscribeNewBlockId", '');
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_subscribeAddressesId", '');

    _this.setMaxListeners(Infinity);

    if (url.startsWith('http')) {
      url = url.replace('http', 'ws');
    }

    if (!url.endsWith('/websocket')) {
      url += '/websocket';
    }

    _this._url = url;
    return _this;
  }

  (0, _createClass2.default)(Socket, [{
    key: "connect",
    value: function connect() {
      var _this2 = this;

      //this._clearReconnectTimer()
      return new _es6Promise.default(function (resolve, reject) {
        if (!_this2._url) {
          reject(new Error('Cannot connect because no server was specified'));
        }

        if (_this2._state === _ws.default.OPEN) {
          resolve();
        } else if (_this2._ws && _this2._state === _ws.default.CONNECTING) {
          _this2._ws.once('open', resolve);
        } else {
          var ws = _this2._createWebSocket();

          ws.once('error', _this2._onOpenError.bind(_this2));
          ws.on('message', _this2._onmessage.bind(_this2)); // this._onUnexpectedCloseBound = this._onUnexpectedClose.bind(this, true, resolve, reject)
          //this._ws.once('close', this._onUnexpectedCloseBound)

          ws.on('open', resolve);
          ws.on('close', function () {
            _this2.emit('disconnected');
          });
          _this2._ws = ws;
          _this2._messageID = 0;
          _this2._pendingMessages = {};
          _this2._subscriptions = {};
          _this2._subscribeNewBlockId = '';
          _this2._subscribeAddressesId = '';
        }
      });
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var _this3 = this;

      return new _es6Promise.default(function () {
        if (_this3._ws) _this3._ws.close();
      });
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      var ws = this._ws;
      return ws && ws.readyState == _ws.default.OPEN;
    }
  }, {
    key: "getServerInfo",
    value: function getServerInfo() {
      var _this4 = this;

      return new _es6Promise.default(function (resolve) {
        _this4._send('getInfo', {}, function (response) {
          resolve({
            block: response.bestheight,
            // network: response.result.network,
            networkName: response.name
          });
        });
      });
    }
  }, {
    key: "subscribeBlock",
    value: function subscribeBlock() {
      var _this5 = this;

      return new _es6Promise.default(function (resolve) {
        if (_this5._subscribeNewBlockId) {
          delete _this5._subscriptions[_this5._subscribeNewBlockId];
          _this5._subscribeNewBlockId = '';
        }

        _this5._subscribeNewBlockId = _this5._subscribe('subscribeNewBlock', {}, function (result) {
          _this5.emit('block', {
            block: result.height,
            hash: result.hash
          });
        });
      });
    }
  }, {
    key: "unsubscribeBlock",
    value: function unsubscribeBlock() {
      var _this6 = this;

      return new _es6Promise.default(function (resolve) {
        if (_this6._subscribeNewBlockId) {
          _this6._unsubscribe('unsubscribeNewBlock', _this6._subscribeNewBlockId, {}, function (result) {
            _this6._subscribeNewBlockId = '';
          });
        }
      });
    }
  }, {
    key: "subscribeAddresses",
    value: function subscribeAddresses(addresses) {
      var _this7 = this;

      return new _es6Promise.default(function (resolve) {
        var method = 'subscribeAddresses';
        var params = {
          addresses: addresses
        };

        if (_this7._subscribeAddressesId) {
          delete _this7._subscriptions[_this7._subscribeAddressesId];
          _this7._subscribeAddressesId = "";
        }

        _this7._subscribeAddressesId = _this7._subscribe(method, params, function (result) {
          _this7.emit('notification', result);
        });
      });
    }
  }, {
    key: "unsubscribeAddresses",
    value: function unsubscribeAddresses(addresses) {
      var _this8 = this;

      return new _es6Promise.default(function (resolve) {
        if (_this8._subscribeAddressesId) {
          _this8._unsubscribe('unsubscribeAddresses', _this8._subscribeAddressesId, {}, function (result) {
            _this8._subscribeAddressesId = '';
          });
        }
      });
    }
  }, {
    key: "getAccountInfo",
    value: function getAccountInfo(payload) {
      var _this9 = this;

      return new _es6Promise.default(function (resolve) {
        _this9._send('getAccountInfo', payload, function (response) {
          resolve(response);
        });
      });
    }
  }, {
    key: "estimateFee",
    value: function estimateFee(options) {
      var _this10 = this;

      return new _es6Promise.default(function (resolve) {
        _this10._send('estimateFee', {
          blocks: [2, 5, 10, 20],
          specific: undefined
        }, function (response) {
          resolve(response);
        });
      });
    }
  }, {
    key: "pushTransaction",
    value: function pushTransaction(hex) {
      var _this11 = this;

      return new _es6Promise.default(function (resolve) {
        _this11._send('sendTransaction', {
          hex: hex
        }, function (response) {
          resolve(response);
        });
      });
    }
  }]);
  return Socket;
}(_events.default);

exports.default = Socket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy93b3JrZXJzL2Jsb2NrYm9vay93ZWJzb2NrZXQudHMiXSwibmFtZXMiOlsiU29ja2V0IiwibWV0aG9kIiwicGFyYW1zIiwiY2FsbGJhY2siLCJfd3MiLCJFcnJvciIsIndzIiwiaWQiLCJfbWVzc2FnZUlEIiwidG9TdHJpbmciLCJfcGVuZGluZ01lc3NhZ2VzIiwicmVxIiwic2VuZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJfc3Vic2NyaXB0aW9ucyIsIm0iLCJyZXNwIiwicGFyc2UiLCJmIiwidW5kZWZpbmVkIiwiZGF0YSIsInMiLCJjb25zb2xlIiwibG9nIiwid2Vic29ja2V0IiwiV2ViU29ja2V0IiwiX3VybCIsInNldE1heExpc3RlbmVycyIsIkluZmluaXR5IiwiZXJyIiwiZXJyb3IiLCJ1cmwiLCJzdGFydHNXaXRoIiwicmVwbGFjZSIsImVuZHNXaXRoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJfc3RhdGUiLCJPUEVOIiwiQ09OTkVDVElORyIsIm9uY2UiLCJfY3JlYXRlV2ViU29ja2V0IiwiX29uT3BlbkVycm9yIiwiYmluZCIsIm9uIiwiX29ubWVzc2FnZSIsImVtaXQiLCJfc3Vic2NyaWJlTmV3QmxvY2tJZCIsIl9zdWJzY3JpYmVBZGRyZXNzZXNJZCIsImNsb3NlIiwicmVhZHlTdGF0ZSIsIl9zZW5kIiwicmVzcG9uc2UiLCJibG9jayIsImJlc3RoZWlnaHQiLCJuZXR3b3JrTmFtZSIsIm5hbWUiLCJfc3Vic2NyaWJlIiwicmVzdWx0IiwiaGVpZ2h0IiwiaGFzaCIsIl91bnN1YnNjcmliZSIsImFkZHJlc3NlcyIsInBheWxvYWQiLCJvcHRpb25zIiwiYmxvY2tzIiwic3BlY2lmaWMiLCJoZXgiLCJFdmVudEVtaXR0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBSkE7SUFPcUJBLE07Ozs7OzswQkFXWEMsTSxFQUFnQkMsTSxFQUFZQyxRLEVBQThC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c291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFdlYlNvY2tldCBmcm9tICd3cyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdlczYtcHJvbWlzZSc7XG5cbnR5cGUgV3NDYWxsYmFjayA9IChyZXN1bHQ6IE9iamVjdCkgPT4gdm9pZDtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvY2tldCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgX3VybDogc3RyaW5nO1xuICAgIF93cztcbiAgICBfc3RhdGU6IG51bWJlciA9IDA7XG5cbiAgICBfbWVzc2FnZUlEOiBudW1iZXIgPSAwO1xuICAgIF9wZW5kaW5nTWVzc2FnZXM6IHsgW3N0cmluZ10gfSA9IHt9O1xuICAgIF9zdWJzY3JpcHRpb25zOiB7IFtzdHJpbmddIH0gPSB7fTtcbiAgICBfc3Vic2NyaWJlTmV3QmxvY2tJZDogc3RyaW5nID0gJyc7XG4gICAgX3N1YnNjcmliZUFkZHJlc3Nlc0lkOiBzdHJpbmcgPSAnJztcblxuICAgIF9zZW5kKG1ldGhvZDogc3RyaW5nLCBwYXJhbXM6IHt9LCBjYWxsYmFjazogV3NDYWxsYmFjayk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy5fd3MpIHRocm93IG5ldyBFcnJvcignV2ViU29ja2V0IG5vdCBpbml0aWFsaXplZCcpO1xuICAgICAgICBjb25zdCB3cyA9IHRoaXMuX3dzO1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMuX21lc3NhZ2VJRC50b1N0cmluZygpO1xuICAgICAgICB0aGlzLl9tZXNzYWdlSUQrKztcbiAgICAgICAgdGhpcy5fcGVuZGluZ01lc3NhZ2VzW2lkXSA9IGNhbGxiYWNrO1xuICAgICAgICBjb25zdCByZXEgPSB7XG4gICAgICAgICAgICBpZCxcbiAgICAgICAgICAgIG1ldGhvZCxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICB9XG4gICAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVxKSk7XG4gICAgICAgIHJldHVybiBpZDtcbiAgICB9XG5cbiAgICBfc3Vic2NyaWJlKG1ldGhvZDogc3RyaW5nLCBwYXJhbXM6IHt9LCBjYWxsYmFjazogV3NDYWxsYmFjayk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy5fd3MpIHRocm93IG5ldyBFcnJvcignV2ViU29ja2V0IG5vdCBpbml0aWFsaXplZCcpO1xuICAgICAgICBjb25zdCB3cyA9IHRoaXMuX3dzO1xuICAgICAgICBjb25zdCBpZCA9IHRoaXMuX21lc3NhZ2VJRC50b1N0cmluZygpO1xuICAgICAgICB0aGlzLl9tZXNzYWdlSUQrKztcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uc1tpZF0gPSBjYWxsYmFjaztcbiAgICAgICAgY29uc3QgcmVxID0ge1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBtZXRob2QsXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgfVxuICAgICAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHJlcSkpO1xuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfVxuXG4gICAgX3Vuc3Vic2NyaWJlKG1ldGhvZDogc3RyaW5nLCBpZDogc3RyaW5nLCBwYXJhbXM6IHt9LCBjYWxsYmFjazogV3NDYWxsYmFjayk6IHN0cmluZyB7XG4gICAgICAgIGlmICghdGhpcy5fd3MpIHRocm93IG5ldyBFcnJvcignV2ViU29ja2V0IG5vdCBpbml0aWFsaXplZCcpO1xuICAgICAgICBjb25zdCB3cyA9IHRoaXMuX3dzO1xuICAgICAgICBkZWxldGUgdGhpcy5fc3Vic2NyaXB0aW9uc1tpZF07XG4gICAgICAgIHRoaXMuX3BlbmRpbmdNZXNzYWdlc1tpZF0gPSBjYWxsYmFjaztcbiAgICAgICAgY29uc3QgcmVxID0ge1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICBtZXRob2QsXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgfVxuICAgICAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHJlcSkpO1xuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfVxuXG4gICAgX29ubWVzc2FnZShtOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcmVzcCA9IEpTT04ucGFyc2UobSk7XG4gICAgICAgIGNvbnN0IGYgPSB0aGlzLl9wZW5kaW5nTWVzc2FnZXNbcmVzcC5pZF07XG4gICAgICAgIGlmIChmICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3BlbmRpbmdNZXNzYWdlc1tyZXNwLmlkXTtcbiAgICAgICAgICAgIGYocmVzcC5kYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLl9zdWJzY3JpcHRpb25zW3Jlc3AuaWRdO1xuICAgICAgICAgICAgaWYgKHMgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcyhyZXNwLmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gcmVzcG9uc2UgJyArIHJlc3AuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZVdlYlNvY2tldCgpOiBXZWJTb2NrZXQge1xuICAgICAgICBjb25zdCB3ZWJzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHRoaXMuX3VybCk7XG4gICAgICAgIC8vIHdlIHdpbGwgaGF2ZSBhIGxpc3RlbmVyIGZvciBlYWNoIG91dHN0YW5kaW5nIHJlcXVlc3QsXG4gICAgICAgIC8vIHNvIHdlIGhhdmUgdG8gcmFpc2UgdGhlIGxpbWl0ICh0aGUgZGVmYXVsdCBpcyAxMClcbiAgICAgICAgaWYgKHR5cGVvZiB3ZWJzb2NrZXQuc2V0TWF4TGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB3ZWJzb2NrZXQuc2V0TWF4TGlzdGVuZXJzKEluZmluaXR5KVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3ZWJzb2NrZXQ7XG4gICAgfVxuXG4gICAgX29uT3BlbkVycm9yKGVycjogRXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignT3BlbkVycm9yJywgZXJyKVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHVybDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc2V0TWF4TGlzdGVuZXJzKEluZmluaXR5KTtcbiAgICAgICAgaWYgKHVybC5zdGFydHNXaXRoKCdodHRwJykpIHtcbiAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKCdodHRwJywgJ3dzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF1cmwuZW5kc1dpdGgoJy93ZWJzb2NrZXQnKSkge1xuICAgICAgICAgICAgdXJsICs9ICcvd2Vic29ja2V0JztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cmwgPSB1cmw7XG4gICAgfVxuXG4gICAgY29ubmVjdCgpOiBQcm9taXNlIHtcbiAgICAgICAgLy90aGlzLl9jbGVhclJlY29ubmVjdFRpbWVyKClcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fdXJsKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ2Fubm90IGNvbm5lY3QgYmVjYXVzZSBubyBzZXJ2ZXIgd2FzIHNwZWNpZmllZCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU4pIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fd3MgJiYgdGhpcy5fc3RhdGUgPT09IFdlYlNvY2tldC5DT05ORUNUSU5HKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fd3Mub25jZSgnb3BlbicsIHJlc29sdmUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdzID0gdGhpcy5fY3JlYXRlV2ViU29ja2V0KCk7XG4gICAgICAgICAgICAgICAgd3Mub25jZSgnZXJyb3InLCB0aGlzLl9vbk9wZW5FcnJvci5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB3cy5vbignbWVzc2FnZScsIHRoaXMuX29ubWVzc2FnZS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMuX29uVW5leHBlY3RlZENsb3NlQm91bmQgPSB0aGlzLl9vblVuZXhwZWN0ZWRDbG9zZS5iaW5kKHRoaXMsIHRydWUsIHJlc29sdmUsIHJlamVjdClcbiAgICAgICAgICAgICAgICAvL3RoaXMuX3dzLm9uY2UoJ2Nsb3NlJywgdGhpcy5fb25VbmV4cGVjdGVkQ2xvc2VCb3VuZClcbiAgICAgICAgICAgICAgICB3cy5vbignb3BlbicsIHJlc29sdmUpO1xuICAgICAgICAgICAgICAgIHdzLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdkaXNjb25uZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl93cyA9IHdzO1xuICAgICAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VJRCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGVuZGluZ01lc3NhZ2VzID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuX3N1YnNjcmliZU5ld0Jsb2NrSWQgPSAnJztcbiAgICAgICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVBZGRyZXNzZXNJZCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkaXNjb25uZWN0KCk6IFByb21pc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3dzKVxuICAgICAgICAgICAgICAgIHRoaXMuX3dzLmNsb3NlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCB3cyA9IHRoaXMuX3dzO1xuICAgICAgICByZXR1cm4gd3MgJiYgd3MucmVhZHlTdGF0ZSA9PSBXZWJTb2NrZXQuT1BFTjtcbiAgICB9XG5cbiAgICBnZXRTZXJ2ZXJJbmZvKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fc2VuZCgnZ2V0SW5mbycsIHt9LCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrOiByZXNwb25zZS5iZXN0aGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAvLyBuZXR3b3JrOiByZXNwb25zZS5yZXN1bHQubmV0d29yayxcbiAgICAgICAgICAgICAgICAgICAgbmV0d29ya05hbWU6IHJlc3BvbnNlLm5hbWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3Vic2NyaWJlQmxvY2soKTogUHJvbWlzZSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N1YnNjcmliZU5ld0Jsb2NrSWQpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fc3Vic2NyaXB0aW9uc1t0aGlzLl9zdWJzY3JpYmVOZXdCbG9ja0lkXTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVOZXdCbG9ja0lkID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVOZXdCbG9ja0lkID0gdGhpcy5fc3Vic2NyaWJlKCdzdWJzY3JpYmVOZXdCbG9jaycsIHt9LCByZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnYmxvY2snLCB7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrOiByZXN1bHQuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiByZXN1bHQuaGFzaCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1bnN1YnNjcmliZUJsb2NrKCk6IFByb21pc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdWJzY3JpYmVOZXdCbG9ja0lkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdW5zdWJzY3JpYmUoJ3Vuc3Vic2NyaWJlTmV3QmxvY2snLCB0aGlzLl9zdWJzY3JpYmVOZXdCbG9ja0lkLCB7fSwgcmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3Vic2NyaWJlTmV3QmxvY2tJZCA9ICcnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdWJzY3JpYmVBZGRyZXNzZXMoYWRkcmVzc2VzOiBBcnJheTxzdHJpbmc+KTogUHJvbWlzZSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0aG9kID0gJ3N1YnNjcmliZUFkZHJlc3Nlcyc7XG4gICAgICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgYWRkcmVzc2VzXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N1YnNjcmliZUFkZHJlc3Nlc0lkKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3N1YnNjcmlwdGlvbnNbdGhpcy5fc3Vic2NyaWJlQWRkcmVzc2VzSWRdO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N1YnNjcmliZUFkZHJlc3Nlc0lkID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3N1YnNjcmliZUFkZHJlc3Nlc0lkID0gdGhpcy5fc3Vic2NyaWJlKG1ldGhvZCwgcGFyYW1zLCByZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnbm90aWZpY2F0aW9uJywgcmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1bnN1YnNjcmliZUFkZHJlc3NlcyhhZGRyZXNzZXM6IEFycmF5PHN0cmluZz4pOiBQcm9taXNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3Vic2NyaWJlQWRkcmVzc2VzSWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91bnN1YnNjcmliZSgndW5zdWJzY3JpYmVBZGRyZXNzZXMnLCB0aGlzLl9zdWJzY3JpYmVBZGRyZXNzZXNJZCwge30sIHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N1YnNjcmliZUFkZHJlc3Nlc0lkID0gJyc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEFjY291bnRJbmZvKHBheWxvYWQ6IGFueSk6IFByb21pc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3NlbmQoJ2dldEFjY291bnRJbmZvJywgXG4gICAgICAgICAgICAgICAgcGF5bG9hZCwgXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZXN0aW1hdGVGZWUob3B0aW9uczogYW55KTogUHJvbWlzZSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fc2VuZCgnZXN0aW1hdGVGZWUnLCB7XG4gICAgICAgICAgICAgICAgYmxvY2tzOiBbMiwgNSwgMTAsIDIwXSxcbiAgICAgICAgICAgICAgICBzcGVjaWZpYzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfSwgcmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1c2hUcmFuc2FjdGlvbihoZXg6IHN0cmluZyk6IFByb21pc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3NlbmQoJ3NlbmRUcmFuc2FjdGlvbicsIHsgaGV4IH0sIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59Il19