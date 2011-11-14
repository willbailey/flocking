(function() {

  /*
  CoffeeScript port of http://processing.org/learning/topics/flocking.html
  */

  var Boid, Flock, FlockingSketch;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.FlockingSketch = FlockingSketch = (function() {

    function FlockingSketch() {
      this.onclick = __bind(this.onclick, this);
      this.draw = __bind(this.draw, this);      this.setup();
      this.draw();
    }

    FlockingSketch.prototype.setup = function() {
      var boid, i, vector, _results;
      this.canvas = document.getElementById("sketch");
      this.ctx = this.canvas.getContext("2d");
      this.canvas.addEventListener('click', this.onclick);
      this.size(500, 500);
      this.flock = new Flock(this);
      i = 150;
      _results = [];
      while (i--) {
        vector = new Vector(this.width / 2, this.height / 2);
        boid = new Boid(vector, 3, 0.05);
        _results.push(this.flock.addBoid(boid));
      }
      return _results;
    };

    FlockingSketch.prototype.clear = function() {
      return this.ctx.clearRect(0, 0, this.width, this.height);
    };

    FlockingSketch.prototype.draw = function() {
      this.clear();
      this.flock.run();
      return requestAnimationFrame(this.draw);
    };

    FlockingSketch.prototype.onclick = function(ev) {
      var boid, vector, x, y, _ref;
      _ref = [ev.offsetX, ev.offsetY], x = _ref[0], y = _ref[1];
      vector = new Vector(x, y);
      boid = new Boid(vector, 2, 0.05);
      return this.flock.addBoid(boid);
    };

    FlockingSketch.prototype.size = function(width, height) {
      return this.width = arguments[0], this.height = arguments[1], arguments;
    };

    return FlockingSketch;

  })();

  Flock = (function() {

    function Flock(sketch) {
      var _ref;
      _ref = [sketch, []], this.sketch = _ref[0], this.boids = _ref[1];
    }

    Flock.prototype.run = function() {
      var boid, _i, _len, _ref, _results;
      _ref = this.boids;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        boid = _ref[_i];
        _results.push(boid.run(this.boids));
      }
      return _results;
    };

    Flock.prototype.addBoid = function(boid) {
      boid.sketch = this.sketch;
      return this.boids.push(boid);
    };

    return Flock;

  })();

  Boid = (function() {

    Boid.prototype.sketch = null;

    Boid.prototype.loc = null;

    Boid.prototype.vel = null;

    Boid.prototype.acc = null;

    Boid.prototype.r = 3;

    Boid.prototype.maxforce = null;

    Boid.prototype.maxspeed = null;

    function Boid(l, ms, mf) {
      this.acc = new Vector(0, 0);
      this.vel = new Vector(random(-1, 1), random(-1, 1));
      this.loc = l.get();
      this.maxspeed = ms;
      this.maxforce = mf;
    }

    Boid.prototype.run = function(boids) {
      this.flock(boids);
      this.update();
      this.borders();
      return this.render();
    };

    Boid.prototype.flock = function(boids) {
      this.sep = this.separate(boids);
      this.ali = this.align(boids);
      this.coh = this.cohesion(boids);
      this.sep.mult(document.getElementById('sep').value);
      this.ali.mult(document.getElementById('ali').value);
      this.coh.mult(document.getElementById('coh').value);
      this.acc.add(this.sep);
      this.acc.add(this.ali);
      return this.acc.add(this.coh);
    };

    Boid.prototype.update = function() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxspeed);
      this.loc.add(this.vel);
      return this.acc.mult(0);
    };

    Boid.prototype.steer = function(target, slowdown) {
      var d, desired, steer;
      desired = Vector.sub(target, this.loc);
      d = desired.mag();
      if (d > 0) {
        desired.normalize();
        if (slowdown && d < 100) {
          desired.mult(this.maxspeed * (d / 100));
        } else {
          desired.mult(this.maxspeed);
        }
        steer = Vector.sub(desired, this.vel);
        steer.limit(this.maxforce);
      } else {
        steer = new Vector;
      }
      return steer;
    };

    Boid.prototype.render = function() {
      var ctx, theta;
      ctx = this.sketch.ctx;
      theta = this.vel.heading2D() + 270 * (Math.PI / 180);
      ctx.fillStyle = '#333333';
      ctx.save();
      ctx.translate(this.loc.x, this.loc.y);
      ctx.rotate(theta);
      ctx.beginPath();
      ctx.moveTo(0, this.r * 2);
      ctx.lineTo(this.r, -this.r * 2);
      ctx.lineTo(-this.r, -this.r * 2);
      ctx.lineTo(0, this.r * 2);
      ctx.fill();
      ctx.closePath();
      return ctx.restore();
    };

    Boid.prototype.borders = function() {
      if (this.loc.x < -this.r) this.loc.x = this.sketch.width + this.r;
      if (this.loc.y < -this.r) this.loc.y = this.sketch.height + this.r;
      if (this.loc.x > this.sketch.width + this.r) this.loc.x = -this.r;
      if (this.loc.y > this.sketch.width + this.r) return this.loc.y = -this.r;
    };

    Boid.prototype.separate = function(boids) {
      var count, d, desiredseparation, diff, other, steer, _i, _len;
      desiredseparation = 20;
      steer = new Vector;
      count = 0;
      for (_i = 0, _len = boids.length; _i < _len; _i++) {
        other = boids[_i];
        d = Vector.dist(this.loc, other.loc);
        if (d > 0 && d < desiredseparation) {
          diff = Vector.sub(this.loc, other.loc);
          diff.normalize();
          diff.div(d);
          steer.add(diff);
          count++;
        }
      }
      if (count > 0) steer.div(count);
      if (steer.mag() > 0) {
        steer.normalize();
        steer.mult(this.maxspeed);
        steer.sub(this.vel);
        steer.limit(this.maxforce);
      }
      return steer;
    };

    Boid.prototype.align = function(boids) {
      var count, d, neighbordist, other, steer, _i, _len;
      neighbordist = 25;
      steer = new Vector;
      count = 0;
      for (_i = 0, _len = boids.length; _i < _len; _i++) {
        other = boids[_i];
        d = Vector.dist(this.loc, other.loc);
        if (d > 0 && d < neighbordist) {
          steer.add(other.vel);
          count++;
        }
      }
      if (count > 0) steer.div(count);
      if (steer.mag() > 0) {
        steer.normalize();
        steer.mult(this.maxspeed);
        steer.sub(this.vel);
        steer.limit(this.maxforce);
      }
      return steer;
    };

    Boid.prototype.cohesion = function(boids) {
      var count, d, neighbordist, other, sum, _i, _len;
      neighbordist = 25;
      sum = new Vector;
      count = 0;
      for (_i = 0, _len = boids.length; _i < _len; _i++) {
        other = boids[_i];
        d = this.loc.dist(other.loc);
        if (d > 0 && d < neighbordist) {
          sum.add(other.loc);
          count++;
        }
      }
      if (count > 0) {
        sum.div(count);
        return this.steer(sum, false);
      } else {
        return sum;
      }
    };

    return Boid;

  })();

  document.addEventListener('DOMContentLoaded', function() {
    return new FlockingSketch;
  });

}).call(this);
