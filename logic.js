const canvas = document.querySelector("#game")
let ctx = canvas.getContext("2d");

const FPS = 30; //fps
const shipSize = 30; //in px
const rotationSpeed = 360;
const acceleration = 5; //in px/s^2

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

const update = () => {
  //background 
  ctx.fillStyle = "#000020";
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  //position ship
  if (ship.accel) {
    ship.thrust.x += acceleration * Math.cos(ship.angle) / FPS;
    ship.thrust.y -= acceleration * Math.sin(ship.angle) / FPS;
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

  //ship movement
  ship.angle += ship.rotation;
  ship.x += ship.thrust.x;
  ship.y += ship.thrust.y;

  ctx.fillStyle = "red"
  ctx.fillRect(ship.x -1, ship.y -1, 2, 2)
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

//Input handler
document.addEventListener("keydown", movementHandler);
document.addEventListener("keyup", movementStop);

setInterval(update, 1000/ FPS)