"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

/* @flow */
function create(id) {
  var localResolve = function localResolve() {};

  var localReject = function localReject() {};

  var promise = new Promise(
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee(resolve, reject) {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              localResolve = resolve;
              localReject = reject;

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
  return {
    id: id,
    resolve: localResolve,
    reject: localReject,
    promise: promise
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9kZWZlcnJlZC50cyJdLCJuYW1lcyI6WyJjcmVhdGUiLCJpZCIsImxvY2FsUmVzb2x2ZSIsImxvY2FsUmVqZWN0IiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7QUFFTyxTQUFTQSxNQUFULENBQWdCQyxFQUFoQixFQUE0QjtBQUMvQixNQUFJQyxZQUF3QixHQUFHLHdCQUFNLENBQUUsQ0FBdkM7O0FBQ0EsTUFBSUMsV0FBdUIsR0FBRyx1QkFBTSxDQUFFLENBQXRDOztBQUVBLE1BQU1DLE9BQWdCLEdBQUcsSUFBSUMsT0FBSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsOEJBQVksaUJBQU9DLE9BQVAsRUFBZ0JDLE1BQWhCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDakNMLGNBQUFBLFlBQVksR0FBR0ksT0FBZjtBQUNBSCxjQUFBQSxXQUFXLEdBQUdJLE1BQWQ7O0FBRmlDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQVo7O0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFBekI7QUFLQSxTQUFPO0FBQ0hOLElBQUFBLEVBQUUsRUFBRUEsRUFERDtBQUVISyxJQUFBQSxPQUFPLEVBQUVKLFlBRk47QUFHSEssSUFBQUEsTUFBTSxFQUFFSixXQUhMO0FBSUhDLElBQUFBLE9BQU8sRUFBUEE7QUFKRyxHQUFQO0FBTUgiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKGlkOiBudW1iZXIpIHtcbiAgICBsZXQgbG9jYWxSZXNvbHZlOiAoKSA9PiB2b2lkID0gKCkgPT4ge307XG4gICAgbGV0IGxvY2FsUmVqZWN0OiAoKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgICBjb25zdCBwcm9taXNlOiBQcm9taXNlID0gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsb2NhbFJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICBsb2NhbFJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBpZCxcbiAgICAgICAgcmVzb2x2ZTogbG9jYWxSZXNvbHZlLFxuICAgICAgICByZWplY3Q6IGxvY2FsUmVqZWN0LFxuICAgICAgICBwcm9taXNlLFxuICAgIH07XG59XG4iXX0=