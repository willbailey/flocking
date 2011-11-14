###
CoffeeScript port of http://processing.org/learning/topics/flocking.html
###

window.FlockingSketch = class FlockingSketch 
  # setup the environment and start the draw loop
  constructor: ->
    @setup()
    @draw()

  # setup the canvas and create the flock of boids
  setup: ->
    @canvas = document.getElementById "sketch"
    @ctx    = @canvas.getContext "2d"
    @canvas.addEventListener 'click', @onclick
    @size 500, 500
    @flock = new Flock @
    i = 150 
    while(i--)
      # vector = new Vector random(0, @width), random(0, @height)
      vector = new Vector @width/2, @height/2
      boid = new Boid vector, 3, 0.05
      @flock.addBoid boid 

  # clear the screen
  clear: -> @ctx.clearRect 0, 0, @width, @height

  # draw the frame based on the current boids flock state
  draw: =>
    @clear()
    @flock.run()
    requestAnimationFrame @draw

  # add more boids where the user clicked
  onclick: (ev) =>
    [x, y] = [ev.offsetX, ev.offsetY]
    vector = new Vector x, y 
    boid = new Boid vector, 2, 0.05
    @flock.addBoid boid
  
  # set the size of the sketch
  size: (width, height) -> [@width, @height] = arguments

# wrapper for all the boids in the simulation
class Flock
  # create the flock container and keep a reference to the sketch
  constructor: (sketch)-> [@sketch, @boids] = [sketch, []]

  # run each boid in the flock
  run: -> boid.run(@boids) for boid in @boids
  
  # add a boid to the flock
  addBoid: (boid) -> 
    boid.sketch = @sketch
    @boids.push boid 

class Boid

  # sketch the boid is a part of
  sketch: null
  
  # current location of the boid
  loc: null

  # current velocity of the boid
  vel: null

  # current acceleration of the boid
  acc: null

  # size of the boids sides
  r: 3

  # maximum force that can be exerted by any vector
  maxforce: null

  # maximum speed of the boid
  maxspeed: null

  # setup the initial boid state
  constructor: (l, ms, mf) ->
    @acc = new Vector 0, 0
    @vel = new Vector random(-1,1), random(-1,1)
    @loc = l.get()
    @maxspeed = ms
    @maxforce = mf

  run: (boids) ->
    @flock boids
    @update()
    @borders()
    @render()

  flock: (boids) ->
    # calculate the three rules: separation, alignment, cohesion
    @sep = @separate boids
    @ali = @align boids
    @coh = @cohesion boids

    # weight the forces -- controllable in the ui via slider
    @sep.mult document.getElementById('sep').value 
    @ali.mult document.getElementById('ali').value 
    @coh.mult document.getElementById('coh').value 

    # add the forces to the boid's acceleration vector
    @acc.add @sep
    @acc.add @ali
    @acc.add @coh

  # move the boid up to maxspeed
  update: ->
    @vel.add @acc
    @vel.limit @maxspeed
    @loc.add @vel
    @acc.mult 0

  # steer the boid toward a target
  steer: (target, slowdown) ->
    desired = Vector.sub target, @loc
    d = desired.mag()
    if d > 0
      desired.normalize()
      if slowdown and d < 100
        desired.mult @maxspeed*(d/100)
      else
        desired.mult @maxspeed
      steer = Vector.sub desired, @vel
      steer.limit @maxforce
    else
      steer = new Vector
    steer
  
  render: ->
    ctx = @sketch.ctx
    theta = @vel.heading2D() + 270 * (Math.PI/180);
    ctx.fillStyle = '#333333';
    ctx.save()
    ctx.translate @loc.x, @loc.y
    ctx.rotate theta
    ctx.beginPath()
    ctx.moveTo 0, @r*2
    ctx.lineTo @r, -@r*2
    ctx.lineTo -@r, -@r*2
    ctx.lineTo 0, @r*2 
    ctx.fill()
    ctx.closePath()
    ctx.restore()

  # wrap around
  borders: ->
    @loc.x = @sketch.width + @r  if @loc.x < -@r
    @loc.y = @sketch.height + @r if @loc.y < -@r
    @loc.x = -@r if (@loc.x > @sketch.width + @r)
    @loc.y = -@r if (@loc.y > @sketch.width + @r)

  # check for nearby boids and steer away
  separate: (boids)->
    desiredseparation = 20
    steer = new Vector
    count = 0
    
    # check if any are too close
    for other in boids
      d = Vector.dist @loc, other.loc  
      if d > 0 and d < desiredseparation
        diff = Vector.sub @loc, other.loc
        diff.normalize()
        diff.div d
        steer.add diff
        count++
    steer.div count if count > 0

    if steer.mag() > 0
      steer.normalize()
      steer.mult @maxspeed
      steer.sub @vel
      steer.limit @maxforce
    steer

  # for every nearby boid in the system calculate the average  # velocity
  align: (boids)->
    neighbordist = 25
    steer = new Vector
    count = 0
    for other in boids
      d = Vector.dist @loc, other.loc
      if d > 0 && d < neighbordist
        steer.add other.vel
        count++
    steer.div count if count > 0

    if steer.mag() > 0
      steer.normalize()
      steer.mult @maxspeed
      steer.sub @vel
      steer.limit @maxforce
    steer

  # for the average location (i.e. center) of all nearby
  # boids, calculate steering vector towards that location
  cohesion: (boids)->
    neighbordist = 25
    sum = new Vector
    count = 0
    for other in boids
      d = @loc.dist other.loc
      if d > 0 and d < neighbordist
        sum.add other.loc
        count++
    if count > 0
      sum.div count
      @steer sum, false
    else 
      sum

# listen for document load and startup the Flocking sketch
document.addEventListener 'DOMContentLoaded', -> new FlockingSketch
