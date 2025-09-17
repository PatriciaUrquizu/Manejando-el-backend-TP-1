// Elementos del DOM
const form = document.getElementById('conceptoForm');
const nombreInput = document.getElementById('nombre');
const definicionInput = document.getElementById('definicion');
const conceptosList = document.getElementById('conceptosList');
const eliminarTodosBtn = document.getElementById('eliminarTodos');

// Event listeners
form.addEventListener('submit', agregarConcepto);
eliminarTodosBtn.addEventListener('click', eliminarTodosConceptos);

// Cargar conceptos al iniciar la página
document.addEventListener('DOMContentLoaded', cargarConceptos);

// Función para agregar un nuevo concepto
async function agregarConcepto(e) {
    e.preventDefault();
    
    const nombre = nombreInput.value.trim();
    const definicion = definicionInput.value.trim();
    
    if (!nombre || !definicion) {
        alert('Por favor, completa todos los campos');
        return;
    }
    
    try {
        const res = await fetch('/api/conceptos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, definicion })
        });
        
        if (res.ok) {
            form.reset();
            cargarConceptos();
            mostrarMensaje('Concepto agregado exitosamente', 'success');
        } else {
            const error = await res.json();
            mostrarMensaje(error.error, 'error');
        }
    } catch (error) {
        mostrarMensaje('Error al agregar el concepto', 'error');
    }
}

// Función para cargar y mostrar todos los conceptos
async function cargarConceptos() {
    try {
        const res = await fetch('/api/conceptos');
        const conceptos = await res.json();
        mostrarConceptos(conceptos);
    } catch (error) {
        mostrarMensaje('Error al cargar los conceptos', 'error');
    }
}

// Función para mostrar los conceptos en el DOM
function mostrarConceptos(conceptos) {
    if (conceptos.length === 0) {
        conceptosList.innerHTML = `<div class="empty-state">No hay conceptos guardados</div>`;
        return;
    }
    
    conceptosList.innerHTML = conceptos.map(concepto => `
        <div class="concepto-card">
            <div class="concepto-header">
                <h3 class="concepto-nombre">${concepto.nombre}</h3>
                <button class="btn-danger btn-small" onclick="eliminarConcepto(${concepto.id})">
                    Eliminar
                </button>
            </div>
            <p class="concepto-definicion">${concepto.definicion}</p>
        </div>
    `).join('');
}

// Función para eliminar un concepto específico
async function eliminarConcepto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este concepto?')) return;
    
    try {
        const res = await fetch(`/api/conceptos/${id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            cargarConceptos();
            mostrarMensaje('Concepto eliminado exitosamente', 'success');
        } else {
            const error = await res.json();
            mostrarMensaje(error.error, 'error');
        }
    } catch (error) {
        mostrarMensaje('Error al eliminar el concepto', 'error');
    }
}

// Función para eliminar todos los conceptos
async function eliminarTodosConceptos() {
    if (!confirm('¿Estás seguro de que quieres eliminar TODOS los conceptos?')) return;
    
    try {
        const res = await fetch('/api/conceptos', {
            method: 'DELETE'
        });
        
        if (res.ok) {
            cargarConceptos();
            mostrarMensaje('Todos los conceptos eliminados', 'success');
        } else {
            const error = await res.json();
            mostrarMensaje(error.error, 'error');
        }
    } catch (error) {
        mostrarMensaje('Error al eliminar los conceptos', 'error');
    }
}

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    const div = document.createElement('div');
    div.className = `mensaje ${tipo}`;
    div.textContent = mensaje;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 3000);
}
let conceptos = [];
exports.conceptos = conceptos;

