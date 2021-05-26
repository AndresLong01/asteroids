const canvas = document.querySelector("#game")
let ctx = canvas.getContext("2d");

//Ship constants
const FPS = 60; //fps
const shipSize = 30; //in px
const rotationSpeed = 360;
const acceleration = 5; //in px/s^2
const friction = 0.7; //fric coeff

//Asteroid constants
const asteroidNum = 5;
const asteroidSize = 100;
const asteroidSpeed = 25;
const asteroidVert = 10; //maximum sides per asteroid
const asteroidJaggy = 0.3; //Jaggedness 


//collision
const boundaries = true; //show collision boundaries

let ship = {
  x: canvas.width/2,
  y: canvas.height/2,
  radius: shipSize/2,

  angle: 90 /180 * Math.PI,
  rotation: 0,

  accel: false,
  thrust: {
    x: 0,
    y: 0
  }
}

let asteroids = [];

const update = () => {
  //background 
  ctx.fillStyle = "#000020";
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  //position ship
  if (ship.accel) {
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
  } else {
    ship.thrust.x -= friction * ship.thrust.x /FPS
    ship.thrust.y -= friction * ship.thrust.y /FPS
  }

  //ship logic
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

  //ship boundaries
  if(boundaries) {
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI *2, false);
    ctx.stroke();
  }
  //ship movement
  ship.angle += ship.rotation;
  ship.x += ship.thrust.x;
  ship.y += ship.thrust.y;

  // asteroids drawn
  ctx.lineWidth = shipSize / 20;
  
  let x, y, r, a, vert, offs;
  for(i=0; i< asteroids.length; i++){
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

    for(var j=1; j<vert; j++){
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

    if(boundaries) {
      ctx.strokeStyle = "green";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2*Math.PI, false);
      ctx.stroke();
    }
  }
  //check for collision
  for(var k=0; k<asteroids.length; k++){
    if(distBetween(ship.x, ship.y, asteroids[k].x, asteroids[k].y) < ship.radius + asteroids[k].r) {
      // console.log('collision detected')
      explodeShip();
    }
  }

  //strict asteroid movement
  for(var j=0; j<asteroids.length; j++){
    asteroids[j].x += asteroids[j].xv
    asteroids[j].y += asteroids[j].yv

    //asteroid edge of screen
    if(asteroids[j].x < 0 - asteroids[j].r) {
      asteroids[j].x = canvas.width + asteroids[j].r;
    }else if (asteroids[j].x > canvas.width + asteroids[j].r){
      asteroids[j].x = 0 - asteroids[j].r
    }

    if(asteroids[j].y < 0 - asteroids[j].r) {
      asteroids[j].y = canvas.height + asteroids[j].r;
    }else if (asteroids[j].y > canvas.height + asteroids[j].r){
      asteroids[j].y = 0 - asteroids[j].r
    }
  }
  //edge of screen
  if(ship.x < 0 - ship.radius){
    ship.x = canvas.width + ship.radius;
  } else if(ship.x > canvas.width + ship.radius){
    ship.x = 0 - ship.radius
  }

  if(ship.y < 0 - ship.radius){
    ship.y = canvas.height + ship.radius;
  } else if(ship.y > canvas.height + ship.radius){
    ship.y = 0 - ship.radius
  }
}

const movementHandler = (e) => {
  // console.log(e.keyCode)
  switch(e.keyCode) {
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
  switch(e.keyCode) {
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

const newAsteroid = (coordX, coordY) => {
  var roid = {
    x: coordX,
    y: coordY,
    xv: Math.random() * asteroidSpeed / FPS * (Math.random() < .5 ? 1 : -1),
    yv: Math.random() * asteroidSpeed / FPS * (Math.random() < .5 ? 1 : -1),
    r: asteroidSize / 2,
    a: Math.random() * 2 * Math.PI,
    vertices: Math.floor(Math.random() * (asteroidVert + 1) + asteroidVert/2),
    offs: []
  }

  for (var i=0; i < roid.vertices; i++) {
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
  for (i=0; i< asteroidNum; i++) {
    do{
      x = Math.floor(Math.random() * canvas.width)
      y = Math.floor(Math.random() * canvas.height)
    } while (distBetween(ship.x, ship.y, x, y) < asteroidSize * 2 + ship.radius)
    asteroids.push(newAsteroid(x, y))
  }
}

const explodeShip = () => {
  // console.log("boom")
  ctx.fillStyle = "orange";
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.stroke();
}
//Input handler
document.addEventListener("keydown", movementHandler);
document.addEventListener("keyup", movementStop);

//Initializers
createAsteroids();
setInterval(update, 1000/ FPS)