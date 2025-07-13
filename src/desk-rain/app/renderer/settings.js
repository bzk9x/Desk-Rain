const rainSpeedSlider = document.getElementById('rainSpeed');
const rainSpeedValue = document.getElementById('rainSpeedValue');
const rainDensitySlider = document.getElementById('rainDensity');
const rainDensityValue = document.getElementById('rainDensityValue');
const rainColorPicker = document.getElementById('rainColor');
const minOpacitySlider = document.getElementById('minOpacity');
const minOpacityValue = document.getElementById('minOpacityValue');
const maxOpacitySlider = document.getElementById('maxOpacity');
const maxOpacityValue = document.getElementById('maxOpacityValue');
const rainDirectionSlider = document.getElementById('rainDirection');
const rainDirectionValue = document.getElementById('rainDirectionValue');
const splashToggle = document.getElementById('splashToggle');
const splashIntensitySlider = document.getElementById('splashIntensity');
const splashIntensityValue = document.getElementById('splashIntensityValue');
const soundToggle = document.getElementById('soundToggle');
const resetButton = document.getElementById('resetButton');
const saveButton = document.getElementById('saveButton');

const defaultSettings = {
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

let currentSettings = JSON.parse(localStorage.getItem('deskRainSettings')) || defaultSettings;

function initializeUI() {
    rainSpeedSlider.value = currentSettings.rainSpeed;
    rainSpeedValue.textContent = currentSettings.rainSpeed;
    
    rainDensitySlider.value = currentSettings.rainDensity;
    rainDensityValue.textContent = currentSettings.rainDensity;
    
    rainColorPicker.value = currentSettings.rainColor;
    
    minOpacitySlider.value = currentSettings.minOpacity;
    minOpacityValue.textContent = currentSettings.minOpacity;
    
    maxOpacitySlider.value = currentSettings.maxOpacity;
    maxOpacityValue.textContent = currentSettings.maxOpacity;
    
    rainDirectionSlider.value = currentSettings.rainDirection;
    rainDirectionValue.textContent = currentSettings.rainDirection;
    
    splashToggle.checked = currentSettings.splashEnabled;
    
    splashIntensitySlider.value = currentSettings.splashIntensity;
    splashIntensityValue.textContent = currentSettings.splashIntensity;
    
    soundToggle.checked = currentSettings.soundEnabled;
}

rainSpeedSlider.addEventListener('input', () => {
    rainSpeedValue.textContent = rainSpeedSlider.value;
});

rainDensitySlider.addEventListener('input', () => {
    rainDensityValue.textContent = rainDensitySlider.value;
});

minOpacitySlider.addEventListener('input', () => {
    minOpacityValue.textContent = minOpacitySlider.value;
    if (parseFloat(minOpacitySlider.value) > parseFloat(maxOpacitySlider.value)) {
        maxOpacitySlider.value = minOpacitySlider.value;
        maxOpacityValue.textContent = maxOpacitySlider.value;
    }
});

maxOpacitySlider.addEventListener('input', () => {
    maxOpacityValue.textContent = maxOpacitySlider.value;

    if (parseFloat(maxOpacitySlider.value) < parseFloat(minOpacitySlider.value)) {
        minOpacitySlider.value = maxOpacitySlider.value;
        minOpacityValue.textContent = minOpacitySlider.value;
    }
});

rainDirectionSlider.addEventListener('input', () => {
    rainDirectionValue.textContent = rainDirectionSlider.value;
});

splashIntensitySlider.addEventListener('input', () => {
    splashIntensityValue.textContent = splashIntensitySlider.value;
});

resetButton.addEventListener('click', () => {
    currentSettings = {...defaultSettings};
    initializeUI();
    saveSettings();
});

saveButton.addEventListener('click', () => {
    currentSettings.rainSpeed = parseInt(rainSpeedSlider.value);
    currentSettings.rainDensity = parseInt(rainDensitySlider.value);
    currentSettings.rainColor = rainColorPicker.value;
    currentSettings.minOpacity = parseFloat(minOpacitySlider.value);
    currentSettings.maxOpacity = parseFloat(maxOpacitySlider.value);
    currentSettings.rainDirection = parseInt(rainDirectionSlider.value);
    currentSettings.splashEnabled = splashToggle.checked;
    currentSettings.splashIntensity = parseInt(splashIntensitySlider.value);
    currentSettings.soundEnabled = soundToggle.checked;

    saveSettings();
});

function saveSettings() {
    localStorage.setItem('deskRainSettings', JSON.stringify(currentSettings));

    window.electronAPI.saveSettings(currentSettings);
}

let rainAudio = null;

function setupAudio() {
    if (!rainAudio) {
        rainAudio = new Audio('../res/sounds/rain.opus');
        rainAudio.loop = true;
    }
    
    if (currentSettings.soundEnabled) {
        rainAudio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    } else if (rainAudio) {
        rainAudio.pause();
    }
}

window.electronAPI.onSettingsUpdated((event, settings) => {
    currentSettings = settings;
    initializeUI();
    setupAudio();
});

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    setupAudio();
});