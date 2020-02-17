export const assocPath = (path, val, obj) => {
  if (path.length === 0) {
    return val;
  }
  var idx = path[0];
  if (path.length > 1) {
    var nextObj =
      !isNil(obj) && _has(idx, obj) ? obj[idx] : _isInteger(path[1]) ? [] : {};
    val = assocPath(Array.prototype.slice.call(path, 1), val, nextObj);
  }
  if (_isInteger(idx) && _isArray(obj)) {
    var arr = [].concat(obj);
    arr[idx] = val;
    return arr;
  } else {
    return assoc(idx, val, obj);
  }
};

const assoc = function assoc(prop, val, obj) {
  var result = {};
  for (var p in obj) {
    result[p] = obj[p];
  }
  result[prop] = val;
  return result;
};

const isNil = function isNil(x) {
  return x == null;
};

function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

const _isInteger =
  Number.isInteger ||
  function _isInteger(n) {
    return n << 0 === n;
  };

const _isArray =
  Array.isArray ||
  function _isArray(val) {
    return (
      val != null &&
      val.length >= 0 &&
      Object.prototype.toString.call(val) === "[object Array]"
    );
  };
