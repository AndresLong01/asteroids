const canvas = document.querySelector("#game")
let ctx = canvas.getContext("2d");

//Ship constants
const FPS = 60; //fps
const shipSize = 30; //in px
const rotationSpeed = 360;
const acceleration = 5; //in px/s^2
const friction = 0.7; //fric coeff
const explosionAnim = 30; // in frames

//Asteroid constants
const asteroidNum = 8;
const asteroidSize = 100;
const asteroidSpeed = 80;
const asteroidVert = 10; //maximum sides per asteroid
const asteroidJaggy = 0.3; //Jaggedness 

//collision
const boundaries = false; //show collision boundaries

//Laser Logic
//maybe need to limit lasers?
const laserSpd = 300; //px/s
const laserDist = 0.5; //max distance

let ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: shipSize / 2,

  angle: 90 / 180 * Math.PI,
  rotation: 0,

  accel: false,
  thrust: {
    x: 0,
    y: 0
  },

  explodingParam: 0,

  lasers: [],
  canShoot: true
}

let asteroids = [];

const update = () => {
  if(asteroids.length == 0){
    setTimeout(() => location.reload(), 3000)
  }
  let dead = ship.explodingParam > 0;
  //background 
  ctx.fillStyle = "#000020";
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  //position ship
  if (ship.accel) {
    if (!dead) {

      ship.thrust.x += acceleration * Math.cos(ship.angle) / FPS;
      ship.thrust.y -= acceleration * Math.sin(ship.angle) / FPS;
      //animation
      ctx.fillStyle = "#FF9233"
      ctx.strokeStyle = "#500000"
      ctx.lineWidth = shipSize / 20;
      ctx.beginPath();
      ctx.moveTo(
        ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) + 0.75 * Math.sin(ship.angle)),
        ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) - 0.75 * Math.cos(ship.angle))
      );
      ctx.lineTo(
        ship.x - 5 / 3 * ship.radius * Math.cos(ship.angle),
        ship.y + 5 / 3 * ship.radius * Math.sin(ship.angle)
      );
      ctx.lineTo(
        ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) - 0.75 * Math.sin(ship.angle)),
        ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) + 0.75 * Math.cos(ship.angle))
      );
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  } else {
    ship.thrust.x -= friction * ship.thrust.x / FPS
    ship.thrust.y -= friction * ship.thrust.y / FPS
  }

  //ship logic
  if (!dead) {
    ctx.strokeStyle = "#FEFEFE"
    ctx.lineWidth = shipSize / 20;
    ctx.beginPath();
    ctx.moveTo(
      ship.x + 4 / 3 * ship.radius * Math.cos(ship.angle),
      ship.y - 4 / 3 * ship.radius * Math.sin(ship.angle)
    );
    ctx.lineTo(
      ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) + Math.sin(ship.angle)),
      ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) - Math.cos(ship.angle))
    );
    ctx.lineTo(
      ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) - Math.sin(ship.angle)),
      ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) + Math.cos(ship.angle))
    );
    ctx.closePath()
    ctx.stroke()
  } else {
    ctx.fillStyle = "orange";
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();
  }

  //ship boundaries
  if (boundaries) {
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  //ship lasers
  for (let i = 0; i < ship.lasers.length; i++) {
    ctx.fillStyle = "#500000";
    ctx.beginPath()
    ctx.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 15, 0, Math.PI * 2, false)
    ctx.fill()
    // ctx.stroke()
  }

  let ax, ay, ar, lx, ly;
  for (let i=asteroids.length - 1; i >=0; i--) {
    ax=asteroids[i].x;
    ay=asteroids[i].y;
    ar=asteroids[i].r;

    for (let j = ship.lasers.length - 1; j >= 0 ;j--) {
      lx = ship.lasers[j].x;
      ly = ship.lasers[j].y;
  
      if(distBetween(ax, ay, lx, ly) < ar) {

        ship.lasers.splice(j, 1);

        destroyAsteroid(i)
      }
    }
  }
  //ship movement

  if (!dead) {
    ship.angle += ship.rotation;
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
  }

  // asteroids drawn
  ctx.lineWidth = shipSize / 20;

  let x, y, r, a, vert, offs;
  for (i = 0; i < asteroids.length; i++) {
    ctx.strokeStyle = "#FEFEFE";

    x = asteroids[i].x;
    y = asteroids[i].y;
    r = asteroids[i].r;
    a = asteroids[i].a;
    vert = asteroids[i].vertices;
    offs = asteroids[i].offs;

    ctx.beginPath();
    ctx.moveTo(
      x + r * offs[0] * Math.cos(a),
      y + r * offs[0] * Math.sin(a)
    );

    for (var j = 1; j < vert; j++) {
      // ctx.lineTo(
      //   x + r * Math.cos(a + j * Math.PI * 2 / vert),
      //   y + r * Math.sin(a + j * Math.Pi * 2 / vert)
      // );
      ctx.lineTo(
        x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
        y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
      )
    }
    ctx.closePath();
    // ctx.arc(x, y, r, 0, 2*Math.PI, false)
    ctx.stroke();

    if (boundaries) {
      ctx.strokeStyle = "green";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.stroke();
    }
  }
  //check for collision

  if (!dead) {
    for (var k = 0; k < asteroids.length; k++) {
      if (distBetween(ship.x, ship.y, asteroids[k].x, asteroids[k].y) < ship.radius + asteroids[k].r) {
        // console.log(k)
        explodeShip();
      }
    }
  } else {
    ship.explodingParam--;
    // ship.x maybe make spin
    if (ship.explodingParam == 0) {
      location.reload()
    }
  }

  //laser movement
  for (let j = ship.lasers.length - 1; j >= 0 ;j--) {
    if(ship.lasers[j].dist > laserDist * canvas.width) {
      ship.lasers.splice(j, 1)
      continue;
    }

    ship.lasers[j].x += ship.lasers[j].xv;
    ship.lasers[j].y += ship.lasers[j].yv;

    ship.lasers[j].dist += Math.sqrt(Math.pow(ship.lasers[j].xv, 2) + Math.pow(ship.lasers[j].yv, 2));
  }

  //strict asteroid movement
  for (var j = 0; j < asteroids.length; j++) {
    asteroids[j].x += asteroids[j].xv
    asteroids[j].y += asteroids[j].yv

    //asteroid edge of screen
    if (asteroids[j].x < 0 - asteroids[j].r) {
      asteroids[j].x = canvas.width + asteroids[j].r;
    } else if (asteroids[j].x > canvas.width + asteroids[j].r) {
      asteroids[j].x = 0 - asteroids[j].r
    }

    if (asteroids[j].y < 0 - asteroids[j].r) {
      asteroids[j].y = canvas.height + asteroids[j].r;
    } else if (asteroids[j].y > canvas.height + asteroids[j].r) {
      asteroids[j].y = 0 - asteroids[j].r
    }
  }
  //edge of screen
  if (ship.x < 0 - ship.radius) {
    ship.x = canvas.width + ship.radius;
  } else if (ship.x > canvas.width + ship.radius) {
    ship.x = 0 - ship.radius
  }

  if (ship.y < 0 - ship.radius) {
    ship.y = canvas.height + ship.radius;
  } else if (ship.y > canvas.height + ship.radius) {
    ship.y = 0 - ship.radius
  }
}

const movementHandler = (e) => {
  // console.log(e.keyCode)
  switch (e.keyCode) {
    case 32: //space bar
      shootLaser();
      break;

    case 37: //left rotation
      ship.rotation = rotationSpeed / 180 * Math.PI / FPS;
      break;

    case 38:
      ship.accel = true;
      break;

    case 39:
      ship.rotation = -rotationSpeed / 180 * Math.PI / FPS;
      break;

  }
}

const movementStop = (e) => {
  switch (e.keyCode) {
    case 32: //space bar
      ship.canShoot = true;
      break;

    case 37: //let rotational stop
      ship.rotation = 0;
      break;

    case 38:
      ship.accel = false;
      break;

    case 39:
      ship.rotation = 0;
      break;

  }
}

const newAsteroid = (coordX, coordY, r) => {
  var roid = {
    x: coordX,
    y: coordY,
    xv: Math.random() * asteroidSpeed / FPS * (Math.random() < .5 ? 1 : -1),
    yv: Math.random() * asteroidSpeed / FPS * (Math.random() < .5 ? 1 : -1),
    r: r,
    a: Math.random() * 2 * Math.PI,
    vertices: Math.floor(Math.random() * (asteroidVert + 1) + asteroidVert / 2),
    offs: []
  }

  for (var i = 0; i < roid.vertices; i++) {
    roid.offs.push(Math.random() * asteroidJaggy * 2 + 1 - asteroidJaggy)
  }

  return roid
}

const distBetween = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

const createAsteroids = () => {
  asteroids = [];
  let x, y;
  for (i = 0; i < asteroidNum; i++) {
    do {
      x = Math.floor(Math.random() * canvas.width)
      y = Math.floor(Math.random() * canvas.height)
    } while (distBetween(ship.x, ship.y, x, y) < asteroidSize * 2 + ship.radius)
    asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 2)))
  }
}

const destroyAsteroid= (index) => {
  let x = asteroids[index].x;
  let y = asteroids[index].y;
  let r = asteroids[index].r;

  if(r == Math.ceil(asteroidSize / 2)) {
    asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 4)));
    asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 4)));
  } else if (r == Math.ceil(asteroidSize / 4)) {
    asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 8)));
    asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize / 8)));
  }
  
  asteroids.splice(index, 1)
}

const explodeShip = () => {
  // console.log("boom")
  // location.reload()
  ship.explodingParam = explosionAnim
}

const shootLaser = () => {
  //need to put limiter here later?
  if (ship.canShoot) {
    ship.lasers.push({
      x: ship.x + 4 / 3 * ship.radius * Math.cos(ship.angle),
      y: ship.y - 4 / 3 * ship.radius * Math.sin(ship.angle),
      xv: laserSpd * Math.cos(ship.angle) / FPS,
      yv: -laserSpd * Math.sin(ship.angle) / FPS,
      dist: 0
    })
  }
  ship.canShoot = false
}
//Input handler
document.addEventListener("keydown", movementHandler);
document.addEventListener("keyup", movementStop);

//Initializers
createAsteroids();
setInterval(update, 1000 / FPS)