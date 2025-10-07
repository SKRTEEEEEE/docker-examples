// Elementos del DOM
const counter = document.getElementById('counter');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const resetBtn = document.getElementById('resetBtn');
const timestamp = document.getElementById('timestamp');

// Estado del contador
let count = 0;

// Función para actualizar el display del contador
function updateCounter() {
    counter.textContent = count;
    
    // Añadir animación
    counter.style.transform = 'scale(1.2)';
    setTimeout(() => {
        counter.style.transform = 'scale(1)';
    }, 200);
}

// Event Listeners
incrementBtn.addEventListener('click', () => {
    count++;
    updateCounter();
    console.log(`Contador incrementado a: ${count}`);
});

decrementBtn.addEventListener('click', () => {
    count--;
    updateCounter();
    console.log(`Contador decrementado a: ${count}`);
});

resetBtn.addEventListener('click', () => {
    count = 0;
    updateCounter();
    console.log('Contador reseteado a 0');
});

// Añadir efecto de transición suave al contador
counter.style.transition = 'transform 0.2s ease';

// Mostrar timestamp de carga
const now = new Date();
timestamp.textContent = now.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

// Log de inicialización
console.log('🐳 Aplicación Docker inicializada correctamente');
console.log('📅 Fecha de carga:', now.toISOString());
console.log('🌐 User Agent:', navigator.userAgent);

// Easter egg: comando secreto en consola
window.dockerInfo = function() {
    console.log('%c🐳 Docker Exercise Info', 'color: #2196F3; font-size: 20px; font-weight: bold;');
    console.log('%cEsta aplicación está corriendo en un contenedor Nginx', 'color: #4CAF50;');
    console.log('%cPuerto: 8080 (host) → 80 (contenedor)', 'color: #FF9800;');
    console.log('%cVolumen: ./site → /usr/share/nginx/html', 'color: #9C27B0;');
    console.log('%cPrueba ejecutar en la terminal: docker logs mi-web', 'color: #F44336;');
};

console.log('%c💡 Tip: Ejecuta dockerInfo() en la consola para más información', 'color: #666; font-style: italic;');