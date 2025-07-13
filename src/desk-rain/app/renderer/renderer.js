const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

const toast = document.getElementById('toast');
let toastTimeout;

function displayToast(message, duration = 5000) {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

document.addEventListener('show-toast', (event) => {
    displayToast(event.detail);
});

const RAIN_ANGLE = -0.15;

class SplashParticle {
    constructor(x, y, opacity) {
        this.x = x;
        this.y = y;
        this.radius = 0.5 + Math.random() * 1.5;
        this.opacity = opacity || 0.3 + Math.random() * 0.2;
        this.speed = 1 + Math.random() * 3;
        
        this.angle = (Math.random() * 300 - 60) * (Math.PI / 180);

        this.maxLife = 300 + Math.random() * 200;
        this.life = this.maxLife;
        this.active = true;
    }
    
    update(deltaTime) {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        this.life -= deltaTime;
        this.opacity = (this.life / this.maxLife) * this.opacity;

        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

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
        this.splashed = false;
    }
    
    update(deltaTime, splashParticles) {
        const angleInRadians = RAIN_ANGLE * Math.PI;

        this.x += Math.sin(angleInRadians) * this.speed;
        this.y += Math.cos(angleInRadians) * this.speed;

        if (this.y > canvas.height) {
            if (!this.splashed) {
                this.createSplash(splashParticles);
                this.splashed = true;
            }
            this.reset();
        } else if (this.x < 0) {
            this.reset();
        }
    }
    
    createSplash(splashParticles) {
        const angleInRadians = RAIN_ANGLE * Math.PI;
        const impactX = this.x + Math.sin(angleInRadians) * 
            ((canvas.height - this.y) / Math.cos(angleInRadians));

        const particleCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < particleCount; i++) {
            splashParticles.push(new SplashParticle(impactX, canvas.height, this.opacity * 1.5));
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
const splashParticles = []; 

for (let i = 0; i < rainDropCount; i++) {
    rainDrops.push(new RainDrop());
    rainDrops[i].y = Math.random() * canvas.height;
    rainDrops[i].x = Math.random() * (canvas.width * 1.5);
}

let lastTime = 0;

function animate(currentTime) {
    const deltaTime = lastTime ? currentTime - lastTime : 16;
    lastTime = currentTime;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rainDrops.forEach(drop => {
        drop.update(deltaTime, splashParticles);
        drop.draw();
    });

    for (let i = splashParticles.length - 1; i >= 0; i--) {
        const particle = splashParticles[i];
        particle.update(deltaTime);
        
        if (particle.active) {
            particle.draw();
        } else {
            splashParticles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}

animate();