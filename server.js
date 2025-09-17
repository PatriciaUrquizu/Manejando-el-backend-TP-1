const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const { conceptos } = require('./script');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Archivos estáticos
    const staticFiles = {
        '/': 'index.html',
        '/style.css': 'style.css',
        '/script.js': 'script.js'
    };

    if (method === 'GET' && staticFiles[pathname]) {
        fs.readFile(path.join(__dirname, staticFiles[pathname]), (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Archivo no encontrado');
            } else {
                const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
                const ext = path.extname(staticFiles[pathname]);
                res.writeHead(200, { 'Content-Type': types[ext] });
                res.end(data);
            }
        });
    }
    // API de conceptos
    else if (pathname.startsWith('/api/conceptos')) {
        handleConceptosAPI(req, res, method, pathname);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada');
    }
});

function handleConceptosAPI(req, res, method, pathname) {
    const segments = pathname.split('/');
    const id = segments[3] ? parseInt(segments[3]) : null;

    // GET /api/conceptos - Obtener todos los conceptos
    if (method === 'GET' && !id) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(conceptos));
    }
    // POST /api/conceptos - Crear nuevo concepto
    else if (method === 'POST' && !id) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { nombre, definicion } = JSON.parse(body);
                if (!nombre || !definicion) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Nombre y definición son requeridos' }));
                    return;
                }

                const nuevo = { id: nextId++, nombre: nombre.trim(), definicion: definicion.trim() };
                conceptos.push(nuevo);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(nuevo));
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'JSON inválido' }));
            }
        });
    }
    // DELETE /api/conceptos - Eliminar todos los conceptos
    else if (method === 'DELETE' && !id) {
        conceptos = [];
        nextId = 1;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Todos los conceptos eliminados' }));
    }
    // DELETE /api/conceptos/:id - Eliminar concepto específico
    else if (method === 'DELETE' && id) {
        const index = conceptos.findIndex(c => c.id === id);
        if (index !== -1) {
            const eliminado = conceptos.splice(index, 1)[0];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ mensaje: 'Concepto eliminado', concepto: eliminado }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Concepto no encontrado' }));
        }
    }
    // Otros métodos no permitidos
    else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Método no permitido' }));
    }
}

server.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});
