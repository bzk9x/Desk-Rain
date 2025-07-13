const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const RAIN_ANGLE = -0.15;

class RainDrop {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * (canvas.width * 1.5);
        this.y = -10 - Math.random() * 100; 
        this.length = 10 + Math.random() * 30; 
        this.speed = 5 + Math.random() * 10; 
        this.thickness = 1 + Math.random() * 2; 
        this.opacity = 0.1 + Math.random() * 0.4;
    }
    
    update() {
        const angleInRadians = RAIN_ANGLE * Math.PI;

        this.x += Math.sin(angleInRadians) * this.speed;
        this.y += Math.cos(angleInRadians) * this.speed;

        if (this.y > canvas.height || this.x < 0) {
            this.reset();
        }
    }
    
    draw() {
        ctx.beginPath();

        const angleInRadians = RAIN_ANGLE * Math.PI;
        const endX = this.x + Math.sin(angleInRadians) * this.length;
        const endY = this.y + Math.cos(angleInRadians) * this.length;
        
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = this.thickness;
        ctx.stroke();
    }
}

const rainDropCount = 200;
const rainDrops = [];

for (let i = 0; i < rainDropCount; i++) {
    rainDrops.push(new RainDrop());
    rainDrops[i].y = Math.random() * canvas.height;
    rainDrops[i].x = Math.random() * (canvas.width * 1.5);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rainDrops.forEach(drop => {
        drop.update();
        drop.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();