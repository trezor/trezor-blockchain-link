"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

/**
 * Copy/paste from /node_modules/ripple-lib/dist/npm/common/wswrapper.js
 * Provides `EventEmitter` interface for native browser `WebSocket`,
 * same, as `ws` package provides.
 */
var events = require("events");

var WSWrapper =
/*#__PURE__*/
function (_events$EventEmitter) {
  (0, _inherits2.default)(WSWrapper, _events$EventEmitter);

  function WSWrapper(url, _protocols, _websocketOptions) {
    var _this;

    (0, _classCallCheck2.default)(this, WSWrapper);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(WSWrapper).call(this));

    _this.setMaxListeners(Infinity);

    _this._ws = new WebSocket(url);

    _this._ws.onclose = function () {
      _this.emit('close');
    };

    _this._ws.onopen = function () {
      _this.emit('open');
    };

    _this._ws.onerror = function (error) {
      _this.emit('error', error);
    };

    _this._ws.onmessage = function (message) {
      _this.emit('message', message.data);
    };

    return _this;
  }

  (0, _createClass2.default)(WSWrapper, [{
    key: "close",
    value: function close() {
      if (this.readyState === 1) {
        this._ws.close();
      }
    }
  }, {
    key: "send",
    value: function send(message) {
      this._ws.send(message);
    }
  }, {
    key: "readyState",
    get: function get() {
      return this._ws.readyState;
    }
  }]);
  return WSWrapper;
}(events.EventEmitter);

WSWrapper.CONNECTING = 0;
WSWrapper.OPEN = 1;
WSWrapper.CLOSING = 2;
WSWrapper.CLOSED = 3;
module.exports = WSWrapper;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy93cy50cyJdLCJuYW1lcyI6WyJldmVudHMiLCJyZXF1aXJlIiwiV1NXcmFwcGVyIiwidXJsIiwiX3Byb3RvY29scyIsIl93ZWJzb2NrZXRPcHRpb25zIiwic2V0TWF4TGlzdGVuZXJzIiwiSW5maW5pdHkiLCJfd3MiLCJXZWJTb2NrZXQiLCJvbmNsb3NlIiwiZW1pdCIsIm9ub3BlbiIsIm9uZXJyb3IiLCJlcnJvciIsIm9ubWVzc2FnZSIsIm1lc3NhZ2UiLCJkYXRhIiwicmVhZHlTdGF0ZSIsImNsb3NlIiwic2VuZCIsIkV2ZW50RW1pdHRlciIsIkNPTk5FQ1RJTkciLCJPUEVOIiwiQ0xPU0lORyIsIkNMT1NFRCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7O0FBTUEsSUFBTUEsTUFBTSxHQUFHQyxPQUFPLENBQUMsUUFBRCxDQUF0Qjs7SUFFTUMsUzs7Ozs7QUFDRixxQkFBWUMsR0FBWixFQUFpQkMsVUFBakIsRUFBNkJDLGlCQUE3QixFQUFnRDtBQUFBOztBQUFBO0FBQzVDOztBQUNBLFVBQUtDLGVBQUwsQ0FBcUJDLFFBQXJCOztBQUNBLFVBQUtDLEdBQUwsR0FBVyxJQUFJQyxTQUFKLENBQWNOLEdBQWQsQ0FBWDs7QUFDQSxVQUFLSyxHQUFMLENBQVNFLE9BQVQsR0FBbUIsWUFBTTtBQUNyQixZQUFLQyxJQUFMLENBQVUsT0FBVjtBQUNILEtBRkQ7O0FBR0EsVUFBS0gsR0FBTCxDQUFTSSxNQUFULEdBQWtCLFlBQU07QUFDcEIsWUFBS0QsSUFBTCxDQUFVLE1BQVY7QUFDSCxLQUZEOztBQUdBLFVBQUtILEdBQUwsQ0FBU0ssT0FBVCxHQUFtQixVQUFBQyxLQUFLLEVBQUk7QUFDeEIsWUFBS0gsSUFBTCxDQUFVLE9BQVYsRUFBbUJHLEtBQW5CO0FBQ0gsS0FGRDs7QUFHQSxVQUFLTixHQUFMLENBQVNPLFNBQVQsR0FBcUIsVUFBQUMsT0FBTyxFQUFJO0FBQzVCLFlBQUtMLElBQUwsQ0FBVSxTQUFWLEVBQXFCSyxPQUFPLENBQUNDLElBQTdCO0FBQ0gsS0FGRDs7QUFiNEM7QUFnQi9DOzs7OzRCQUNPO0FBQ0osVUFBSSxLQUFLQyxVQUFMLEtBQW9CLENBQXhCLEVBQTJCO0FBQ3ZCLGFBQUtWLEdBQUwsQ0FBU1csS0FBVDtBQUNIO0FBQ0o7Ozt5QkFDSUgsTyxFQUFTO0FBQ1YsV0FBS1IsR0FBTCxDQUFTWSxJQUFULENBQWNKLE9BQWQ7QUFDSDs7O3dCQUNnQjtBQUNiLGFBQU8sS0FBS1IsR0FBTCxDQUFTVSxVQUFoQjtBQUNIOzs7RUE1Qm1CbEIsTUFBTSxDQUFDcUIsWTs7QUE4Qi9CbkIsU0FBUyxDQUFDb0IsVUFBVixHQUF1QixDQUF2QjtBQUNBcEIsU0FBUyxDQUFDcUIsSUFBVixHQUFpQixDQUFqQjtBQUNBckIsU0FBUyxDQUFDc0IsT0FBVixHQUFvQixDQUFwQjtBQUNBdEIsU0FBUyxDQUFDdUIsTUFBVixHQUFtQixDQUFuQjtBQUNBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUJ6QixTQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weS9wYXN0ZSBmcm9tIC9ub2RlX21vZHVsZXMvcmlwcGxlLWxpYi9kaXN0L25wbS9jb21tb24vd3N3cmFwcGVyLmpzXG4gKiBQcm92aWRlcyBgRXZlbnRFbWl0dGVyYCBpbnRlcmZhY2UgZm9yIG5hdGl2ZSBicm93c2VyIGBXZWJTb2NrZXRgLFxuICogc2FtZSwgYXMgYHdzYCBwYWNrYWdlIHByb3ZpZGVzLlxuICovXG5cbmNvbnN0IGV2ZW50cyA9IHJlcXVpcmUoXCJldmVudHNcIik7XG5cbmNsYXNzIFdTV3JhcHBlciBleHRlbmRzIGV2ZW50cy5FdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKHVybCwgX3Byb3RvY29scywgX3dlYnNvY2tldE9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMoSW5maW5pdHkpO1xuICAgICAgICB0aGlzLl93cyA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgdGhpcy5fd3Mub25jbG9zZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xvc2UnKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fd3Mub25vcGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdvcGVuJyk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX3dzLm9uZXJyb3IgPSBlcnJvciA9PiB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl93cy5vbm1lc3NhZ2UgPSBtZXNzYWdlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGNsb3NlKCkge1xuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl93cy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNlbmQobWVzc2FnZSkge1xuICAgICAgICB0aGlzLl93cy5zZW5kKG1lc3NhZ2UpO1xuICAgIH1cbiAgICBnZXQgcmVhZHlTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dzLnJlYWR5U3RhdGU7XG4gICAgfVxufVxuV1NXcmFwcGVyLkNPTk5FQ1RJTkcgPSAwO1xuV1NXcmFwcGVyLk9QRU4gPSAxO1xuV1NXcmFwcGVyLkNMT1NJTkcgPSAyO1xuV1NXcmFwcGVyLkNMT1NFRCA9IDM7XG5tb2R1bGUuZXhwb3J0cyA9IFdTV3JhcHBlcjsiXX0=