const http = require('http');
const url = require('url');
const fs = require('fs');
const servidor = http.createServer((req, res) =>{
    const parsedUrl = url.parse(req.url, true);
if(req.method == "GET" && parsedUrl.pathname == "/agregar-registros"){
// Mostrar formulario para agregar registro
res.writeHead(200, { 'Content-Type': 'text/html' });
fs.readFile('form.html', (err, data) => {
if (err) {
res.writeHead(500);
return res.end('Error cargando el formulario.');
}
res.end(data);
});
}

});
servidor.listen(3000, () => {
console.log("Servidor ejecutándose");
});