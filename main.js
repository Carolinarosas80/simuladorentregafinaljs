const productos = [
    { nombre: "Manta", precio: 45000 },
    { nombre: "Camino de mesa", precio: 10000 },
    { nombre: "Paño de cocina", precio: 9000 },
    { nombre: "Funda de almohadón", precio: 7500 },
    { nombre: "Mantel", precio: 30000 },
];

// Guardar usuario en Local Storage
document.getElementById("usuarioForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;

    localStorage.setItem("usuario", JSON.stringify({ nombre, correo }));

    Swal.fire({
        icon: "success",
        title: "¡Usuario guardado!",
        text: `Nombre: ${nombre}\nCorreo: ${correo}`,
        confirmButtonText: "Aceptar",
    });
});

// Cargar productos dinámicamente en el selector
const productoSelect = document.getElementById("producto");
productos.forEach((producto) => {
    const option = document.createElement("option");
    option.value = producto.nombre;
    option.textContent = `${producto.nombre} - $${producto.precio}`;
    productoSelect.appendChild(option);
});

// Calcular compra
document.getElementById("calcular").addEventListener("click", async () => {
    const productoSeleccionado = document.getElementById("producto").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const moneda = document.getElementById("moneda").value;
    const cuotas = parseInt(document.getElementById("cuotas").value);
    const pagoEfectivo = document.getElementById("pagoEfectivo").checked;

    if (cantidad > 10) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Solo puedes comprar un máximo de 10 unidades.",
        });
        return;
    }

    const producto = productos.find((p) => p.nombre === productoSeleccionado);
    let costoTotal = producto.precio * cantidad;

    // Obtener tasas de conversión de moneda
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/ARS");
    const data = await response.json();
    const tasaConversion = data.rates[moneda];

    // Convertir a moneda seleccionada
    costoTotal *= tasaConversion;

    let descuento = 0;
    if (pagoEfectivo && moneda === "ARS") {
        descuento = costoTotal * 0.15;
        costoTotal -= descuento;
    }

    let tasaInteres = 0;
    if (cuotas > 1) {
        tasaInteres = cuotas <= 6 ? 0.10 : 0.15;
        costoTotal += costoTotal * tasaInteres;
    }

    const valorCuota = (costoTotal / cuotas).toFixed(2);

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    Swal.fire({
        icon: "info",
        title: "Resumen de tu compra",
        html: `
            <p><strong>Usuario:</strong> ${usuario ? usuario.nombre : "Sin registrar"}</p>
            <p><strong>Producto:</strong> ${producto.nombre}</p>
            <p><strong>Cantidad:</strong> ${cantidad}</p>
            <p><strong>Total inicial (ARS):</strong> $${(producto.precio * cantidad).toFixed(2)}</p>
            <p><strong>Descuento (si aplica):</strong> $${pagoEfectivo && moneda === "ARS" ? descuento.toFixed(2) : "0.00"}</p>
            <p><strong>Moneda seleccionada:</strong> ${moneda}</p>
            <p><strong>Total final (${moneda}):</strong> $${costoTotal.toFixed(2)}</p>
            <p><strong>Cuotas:</strong> ${cuotas}</p>
            <p><strong>Valor por cuota:</strong> ${!pagoEfectivo ? `$${valorCuota}` : "N/A"}</p>
        `,
        confirmButtonText: "Aceptar",
    });
});
