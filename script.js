document.addEventListener("DOMContentLoaded", function () {
  
  const WORLD_SIZE = 1500; // Size of the world, larger than the canvas

let worldWidth = WORLD_SIZE;
let worldHeight = WORLD_SIZE;
  
    const canvas = document.getElementById('worldCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 500; // Set canvas width
    canvas.height = 500; // Set canvas height

    let zoomLevel = 1; // Initial zoom level

// Set initial origin points to center the view
let initialOriginX = (worldWidth - canvas.width) / 2;
let initialOriginY = (worldHeight - canvas.height) / 2;

let originX = initialOriginX;
let originY = initialOriginY;
    let isPanning = false;
    let startX, startY;


class Plant {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.age = 0;
        this.maxAge = 1000; // Increased lifespan of plants
    }

    grow() {
        this.age++;
        return this.age <= this.maxAge;
    }

    draw() {
        let alpha = 1 - this.age / this.maxAge;
        ctx.fillStyle = `rgba(0, 128, 0, ${alpha})`;
        ctx.fillRect(this.x - originX, this.y - originY, 10, 10);
    }
}

class Rabbit {
    constructor() {
        this.x = Math.random() * worldWidth; // Start anywhere in the world
        this.y = Math.random() * worldHeight;
        this.fullness = 100;
        this.energy = 100;
        this.age = 0;
        this.maxAge = 1234;
        this.resting = false;
        this.plantsEaten = 0;
        this.breedingCooldown = 0;
    }

    findNearestPlant() {
        return plantPixels.reduce((nearest, plant) => {
            let dist = Math.hypot(plant.x - this.x, plant.y - this.y);
            return (dist < nearest.dist) ? { plant, dist } : nearest;
        }, { plant: null, dist: Infinity });
    }

    move() {
        this.age++;
        if (this.age > this.maxAge) {
            return false; // Rabbit dies of old age
        }

        if (!this.resting && Math.random() < 0.1) {
            this.resting = true;
        } else if (this.resting && Math.random() < 0.2) {
            this.resting = false;
        }

        if (this.resting) {
            this.energy = Math.min(this.energy + 5, 100);
            return true;
        }

        if (this.energy > 0 && Math.random() < 0.5) {
            // Random movement with increased range
            this.x += Math.random() * 40 - 20;
            this.y += Math.random() * 40 - 20;
        }

        // Stay within world boundaries
        this.x = Math.max(0, Math.min(this.x, worldWidth));
        this.y = Math.max(0, Math.min(this.y, worldHeight));

        let nearestPlant = this.findNearestPlant();

        if (nearestPlant.plant && this.fullness < 50 && nearestPlant.dist < 100) {
            let dx = nearestPlant.plant.x - this.x;
            let dy = nearestPlant.plant.y - this.y;
            let angle = Math.atan2(dy, dx);
            this.x += 5 * Math.cos(angle);
            this.y += 5 * Math.sin(angle);
        }

        if (nearestPlant.plant && nearestPlant.dist < 15 && this.fullness < 50) {
            let idx = plantPixels.indexOf(nearestPlant.plant);
            if (idx > -1) {
                plantPixels.splice(idx, 1);
                this.fullness += 20;
                this.plantsEaten++;
            }
        }

        this.fullness = Math.max(0, this.fullness - 0.5);
        this.energy -= 0.5;

        return true;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x - originX, this.y - originY, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    tryToBreed(rabbits, maxPopulation) {
        if (this.age > 50 && this.plantsEaten >= 3 && this.fullness > 60 && this.energy > 60 && rabbits.length < maxPopulation) {
            let partner = rabbits.find(rabbit => rabbit !== this && rabbit.age > 50 && rabbit.plantsEaten >= 3 && rabbit.fullness > 60 && rabbit.energy > 60 && rabbit.breedingCooldown === 0);
            if (partner) {
                let offspring = new Rabbit();
                offspring.x = this.x + Math.random() * 20 - 10; // Spawn near the parent
                offspring.y = this.y + Math.random() * 20 - 10;
                rabbits.push(offspring);
                
                this.fullness -= 20;
                partner.fullness -= 20;
                this.plantsEaten = 0;
                partner.plantsEaten = 0;
                this.breedingCooldown = 50;
                partner.breedingCooldown = 50;
            }
        }
    }
}
//PREDATOR CLASS PREDATOR CLASS PREDATOR CLASS PREADATOR CLASS PREADATOR CLASS PREDATOR CLASS 

class Predator {
    constructor() {
        this.x = Math.random() * worldWidth; // Random starting position
        this.y = Math.random() * worldHeight;
        this.energy = 100; // Starting energy
        this.age = 0; // Age of the predator
        this.maxAge = 400; // Maximum age of the predator
        this.facingRight = Math.random() < 0.5; // Random initial direction
        this.breedingCooldown = 0; // Cooldown period after breeding
    }

    findNearestRabbit() {
        let nearest = { rabbit: null, dist: Infinity };
        rabbits.forEach(rabbit => {
            let dist = Math.hypot(rabbit.x - this.x, rabbit.y - this.y);
            if (dist < nearest.dist) {
                nearest = { rabbit, dist };
            }
        });
        return nearest;
    }

    move() {
        this.age++;
        if (this.age > this.maxAge || this.energy <= 0) {
            console.log(`Predator died - Age: ${this.age}, Energy: ${this.energy}`);
            return false; // Die of old age or energy depletion
        }

        let nearestRabbit = this.findNearestRabbit();

        if (nearestRabbit.rabbit) {
            let dx = nearestRabbit.rabbit.x - this.x;
            let dy = nearestRabbit.rabbit.y - this.y;
            let angle = Math.atan2(dy, dx);

            this.facingRight = dx > 0;

            this.x += 5 * Math.cos(angle);
            this.y += 5 * Math.sin(angle);

            if (nearestRabbit.dist < 10) {
                let idx = rabbits.indexOf(nearestRabbit.rabbit);
                if (idx > -1) {
                    rabbits.splice(idx, 1);
                    this.energy += 50; // Energy gained from eating a rabbit
                }
            }
        } else {
            // Random wandering when no rabbit is nearby
            this.x += Math.random() * 20 - 10;
            this.y += Math.random() * 20 - 10;
        }

        // Keep the predator within world boundaries
        this.x = Math.max(0, Math.min(this.x, worldWidth));
        this.y = Math.max(0, Math.min(this.y, worldHeight));

        this.energy -= 0.1; // Decrease energy gradually

        if (this.breedingCooldown > 0) {
            this.breedingCooldown--; // Decrease cooldown over time
        }

        this.tryToBreed(predators);

        return true;
    }

    draw() {
        ctx.fillStyle = 'red'; // Bright color for visibility
        ctx.strokeStyle = 'black'; // Black outline for contrast
        ctx.lineWidth = 1;
        let baseSize = 10; // Increase size for better visibility

        let pixelMap = this.facingRight ? [
            { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 },
            { x: 2, y: -1 }, { x: 2, y: 0 }, { x: 2, y: 1 },
            { x: 3, y: 0 },
        ] : [
            { x: 1, y: 0 }, { x: 0, y: 0 }, { x: -1, y: 0 },
            { x: -2, y: -1 }, { x: -2, y: 0 }, { x: -2, y: 1 },
            { x: -3, y: 0 },
        ];

        pixelMap.forEach(pixel => {
            let canvasX = (this.x + pixel.x * baseSize) - originX;
            let canvasY = (this.y + pixel.y * baseSize) - originY;
            ctx.fillRect(canvasX, canvasY, baseSize, baseSize);
            ctx.strokeRect(canvasX, canvasY, baseSize, baseSize);
        });
    }

    tryToBreed(predators) {
        if (this.energy > 100 && this.breedingCooldown === 0 && predators.length < MAX_PREDATORS) {
            let partner = predators.find(predator => 
                predator !== this && 
                predator.energy > 100 && 
                predator.breedingCooldown === 0
            );

            if (partner) {
                let offspring = new Predator();
                offspring.x = this.x + Math.random() * 30 - 15; // Spawn near the parent
                offspring.y = this.y + Math.random() * 30 - 15;
                predators.push(offspring);

                this.energy -= 50; // Increased energy cost for breeding
                partner.energy -= 50;
                this.breedingCooldown = 200; // Set cooldown period
                partner.breedingCooldown = 200;
                console.log('New predator born!');
            }
        }
    }
}
const MAX_PREDATORS = 100; // Maximum number of predators allowed


// PREDATOR CLASS ABOVE THIS LINE PREDATOR CLASS ABOVE THIS LINE PREDATOR CLASS ABOVE THIS LINE

    let plantPixels = [];
let rabbits = [];
for (let i = 0; i < 40; i++) { //adjust this number for total rabbits start
    rabbits.push(new Rabbit());
}

   let predators = [new Predator(), new Predator()]; // Start with two predators
 
    let maxRabbitPopulation = 666;

function addPlant() {
    for (let i = 0; i < 5; i++) { // Add 5 plants at a time, adjust the number as needed
        let x = Math.floor(Math.random() * worldWidth);
        let y = Math.floor(Math.random() * worldHeight);
        plantPixels.push(new Plant(x, y));
    }
}

function updateCounters() {
    document.getElementById('rabbitCounter').textContent = 'Rabbits: ' + rabbits.length;
    document.getElementById('plantCounter').textContent = 'Plants: ' + plantPixels.length;
    document.getElementById('predatorCounter').textContent = 'Predators: ' + predators.length;
}

function updateWorld() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw plants
    plantPixels = plantPixels.filter(plant => plant.grow());
    plantPixels.forEach(plant => plant.draw());

    // Update and draw rabbits
    rabbits = rabbits.filter(rabbit => rabbit.move());
    rabbits.forEach(rabbit => {
        rabbit.draw();
        rabbit.tryToBreed(rabbits, maxRabbitPopulation);
    });

    // Update and draw predators
    predators.forEach(predator => {
        if (predator.move()) {
            predator.draw();
        } else {
            // Remove the predator if it has died
            let index = predators.indexOf(predator);
            if (index > -1) {
                predators.splice(index, 1);
            }
        }
    });

    // Update the counters
    document.getElementById('rabbitCounter').textContent = 'Rabbits: ' + rabbits.length;
    document.getElementById('plantCounter').textContent = 'Plants: ' + plantPixels.length;
    document.getElementById('predatorCounter').textContent = 'Predators: ' + predators.length; // Corrected to reference the predators array

    ctx.restore();
}


// Function to convert world coordinates to canvas coordinates
function toCanvasCoords(worldX, worldY) {
    return {
        x: (worldX - originX) * zoomLevel,
        y: (worldY - originY) * zoomLevel
    };
}

// Function to convert canvas coordinates to world coordinates
function toWorldCoords(canvasX, canvasY) {
    return {
        x: canvasX / zoomLevel + originX,
        y: canvasY / zoomLevel + originY
    };
}

canvas.addEventListener('wheel', function(event) {
    let zoomIntensity = 0.1;
    let wheel = event.deltaY < 0 ? 1 : -1;
    let zoom = Math.exp(wheel * zoomIntensity);

    let mouseX = event.offsetX;
    let mouseY = event.offsetY;

    let worldCoords = toWorldCoords(mouseX, mouseY);

    zoomLevel *= zoom;

    originX = worldCoords.x - mouseX / zoomLevel;
    originY = worldCoords.y - mouseY / zoomLevel;

    updateWorld();
});


canvas.addEventListener('mousedown', function(event) {
    isPanning = true;
    let worldCoords = toWorldCoords(event.offsetX, event.offsetY);
    startX = worldCoords.x;
    startY = worldCoords.y;
});

canvas.addEventListener('mousemove', function(event) {
    if (isPanning) {
        let worldCoords = toWorldCoords(event.offsetX, event.offsetY);
        originX += startX - worldCoords.x;
        originY += startY - worldCoords.y;
        updateWorld();
    }
});

canvas.addEventListener('mouseup', function(event) {
    isPanning = false;
});

    // Initialize the counters
    document.getElementById('rabbitCounter').textContent = 'Rabbits: ' + rabbits.length;
    document.getElementById('plantCounter').textContent = 'Plants: ' + plantPixels.length;
    document.getElementById('predatorCounter').textContent = 'Predators: ' + predators.length;

setInterval(addPlant, 200); // Add a new plant every 0.5 seconds
setInterval(updateWorld, 50); // Update the world 20 times per second

});