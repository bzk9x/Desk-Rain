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

let settings = {
    rainSpeed: 7,
    rainDensity: 200,
    rainColor: '#ffffff',
    minOpacity: 0.1,
    maxOpacity: 0.4,
    rainDirection: -9,
    splashEnabled: true,
    splashIntensity: 3,
    soundEnabled: false
};

let RAIN_ANGLE = settings.rainDirection * (Math.PI / 180);

let rainAudio = null;

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

        const color = hexToRgb(settings.rainColor);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
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
        this.speed = settings.rainSpeed * (0.7 + Math.random() * 0.6); 
        this.thickness = 1 + Math.random() * 2; 
        this.opacity = settings.minOpacity + Math.random() * (settings.maxOpacity - settings.minOpacity);
        this.splashed = false;
    }
    
    update(deltaTime, splashParticles) {
        const angleInRadians = RAIN_ANGLE;

        this.x += Math.sin(angleInRadians) * this.speed;
        this.y += Math.cos(angleInRadians) * this.speed;

        if (this.y > canvas.height) {
            if (!this.splashed && settings.splashEnabled) {
                this.createSplash(splashParticles);
                this.splashed = true;
            }
            this.reset();
        } else if (this.x < 0) {
            this.reset();
        }
    }
    
    createSplash(splashParticles) {
        const angleInRadians = RAIN_ANGLE;
        const impactX = this.x + Math.sin(angleInRadians) * 
            ((canvas.height - this.y) / Math.cos(angleInRadians));

        const particleCount = settings.splashIntensity + Math.floor(Math.random() * 2);
        for (let i = 0; i < particleCount; i++) {
            splashParticles.push(new SplashParticle(impactX, canvas.height, this.opacity * 1.5));
        }
    }
    
    draw() {
        ctx.beginPath();

        const angleInRadians = RAIN_ANGLE;
        const endX = this.x + Math.sin(angleInRadians) * this.length;
        const endY = this.y + Math.cos(angleInRadians) * this.length;
        
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);

        const color = hexToRgb(settings.rainColor);
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
        ctx.lineWidth = this.thickness;
        ctx.stroke();
    }
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

let rainDrops = [];
let splashParticles = [];

function initializeRainDrops() {
    rainDrops = [];
    
    for (let i = 0; i < settings.rainDensity; i++) {
        rainDrops.push(new RainDrop());
        rainDrops[i].y = Math.random() * canvas.height;
        rainDrops[i].x = Math.random() * (canvas.width * 1.5);
    }
}

function setupAudio() {
    if (!rainAudio) {
        rainAudio = new Audio('../res/sounds/rain.opus');
        rainAudio.loop = true;
    }
    
    if (settings.soundEnabled) {
        rainAudio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    } else if (rainAudio) {
        rainAudio.pause();
    }
}

initializeRainDrops();

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

if (window.electronAPI) {
    window.electronAPI.updateSettings((event, newSettings) => {
        settings = newSettings;

        RAIN_ANGLE = settings.rainDirection * (Math.PI / 180);

        if (rainDrops.length !== settings.rainDensity) {
            initializeRainDrops();
        }

        rainDrops.forEach(drop => {
            drop.speed = settings.rainSpeed * (0.7 + Math.random() * 0.6);
            drop.opacity = settings.minOpacity + Math.random() * (settings.maxOpacity - settings.minOpacity);
        });

        setupAudio();
    });

    window.electronAPI.requestSettings();
}

animate();