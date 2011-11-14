(function() {
  var Vector, random;

  window.random = random = function(low, hi) {
    var r, res;
    r = Math.abs(low) + Math.abs(hi) + 1;
    res = Math.random() * r;
    return res = Math.floor(res) + low;
  };

  window.requestAnimationFrame = function(func) {
    return webkitRequestAnimationFrame(func);
  };

  window.Vector = Vector = (function() {

    Vector.prototype.x = 0;

    Vector.prototype.y = 0;

    Vector.prototype.z = 0;

    function Vector(x, y, z) {
      if (x == null) x = 0;
      if (y == null) y = 0;
      if (z == null) z = 0;
      this.set(x, y, z);
    }

    Vector.prototype.add = function(v) {
      this.x += v.x;
      this.y += v.y;
      return this.z += v.z;
    };

    Vector.prototype.get = function() {
      return new Vector(this.x, this.y, this.z);
    };

    Vector.prototype.cross = function(v) {
      return new Vector(this.y * v.z - v.y * this.z, this.z * v.x - v.z * this.x, this.x * v.y - v.x * this.y);
    };

    Vector.prototype.div = function(v) {
      if (typeof v === 'number') v = new Vector(v, v, v);
      this.x /= v.x;
      this.y /= v.y;
      return this.z /= v.z;
    };

    Vector.prototype.dist = function(v) {
      var dx, dy, dz;
      if (typeof v === 'number') v = new Vector(v, v, v);
      dx = v.x - this.x;
      dy = v.y - this.y;
      dz = v.z - this.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    Vector.prototype.dot = function(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    };

    Vector.prototype.heading2D = function() {
      return -Math.atan2(-this.y, this.x);
    };

    Vector.prototype.limit = function(high) {
      if (this.mag() > high) {
        this.normalize();
        return this.mult(high);
      }
    };

    Vector.prototype.mag = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };

    Vector.prototype.mult = function(v) {
      this.x *= v.x || v;
      this.y *= v.y || v;
      return this.z *= v.z || v;
    };

    Vector.prototype.normalize = function() {
      var m;
      m = this.mag();
      if (m > 0) return this.div(m);
    };

    Vector.prototype.set = function(x, y, z) {
      var _ref;
      if (x == null) x = 0;
      if (y == null) y = 0;
      if (z == null) z = 0;
      return _ref = [x, y, z], this.x = _ref[0], this.y = _ref[1], this.z = _ref[2], _ref;
    };

    Vector.prototype.sub = function(v) {
      this.x -= v.z;
      this.y -= v.y;
      return this.z -= v.z;
    };

    Vector.prototype.toArray = function() {
      return [this.x, this.y, this.z];
    };

    Vector.prototype.toString = function() {
      return "x:" + this.x + ", y:" + this.y + ", z:" + this.z;
    };

    return Vector;

  })();

  Vector.sub = function(v1, v2, target) {
    if (target) {
      return target.set(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    } else {
      return target = new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
  };

  Vector.dist = function(v1, v2) {
    return v1.dist(v2);
  };

  Vector.dot = function(v1, v2) {
    return v1.dot(v2);
  };

  Vector.cross = function(v1, v2) {
    return v1.cross(v2);
  };

  Vector.angleBetween = function(v1, v2) {
    return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
  };

  if (typeof exports !== "undefined" && exports !== null) exports.Vector = Vector;

}).call(this);
