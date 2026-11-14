
const API_URL = '../php/registro_process.php';

// Variable para recordar si el usuario aceptó continuar
// con una contraseña débil.
let continuarContrasenaDebil = false;


// ==============================================================================
// INICIO
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {

    cargarPaises();

    const selectPais = document.querySelector('#pais');

    if (selectPais) {
        selectPais.addEventListener('change', cambiarPais);
    }

    const form = document.querySelector('#registerForm');

    if (form) {
        form.addEventListener('submit', guardarUsuario);
    }

    if (
        document.querySelector('#tablaUsuarios') ||
        document.querySelector('#listaUsuarios')
    ) {
        consultarUsuarios();
    }

});


// ==============================================================================
// EVALUAR SEGURIDAD DE LA CONTRASEÑA
// ==============================================================================

// Menos de 8 caracteres = contraseña débil.
// 8 caracteres o más = no mostrar advertencia.

function esContrasenaDebil(password) {

    return password.length < 8;

}


// ==============================================================================
// CREAR Y MODIFICAR USUARIO
// ==============================================================================

async function guardarUsuario(e) {

    e.preventDefault();

    const password = document.querySelector('#password')?.value || '';
    const confirmPassword = document.querySelector('#confirmPassword')?.value || '';
    const idusuarioInput = document.querySelector('#idusuario')?.value;

    // Comprobar que las contraseñas coincidan.
    if (confirmPassword && password !== confirmPassword) {

        continuarContrasenaDebil = false;

        Swal.fire({
            title: 'Contraseñas diferentes',
            text: 'Las contraseñas no coinciden. Por favor verifica.',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        });

        return;
    }

    // Mostrar recomendación solamente al crear una cuenta.
    if (
        !idusuarioInput &&
        esContrasenaDebil(password) &&
        !continuarContrasenaDebil
    ) {

        const resultado = await Swal.fire({

            title: 'Recomendación de seguridad',

            text: 'Tu contraseña tiene menos de 8 caracteres. Te recomendamos utilizar al menos 8 caracteres para mejorar su seguridad.',

            icon: 'warning',

            showCancelButton: true,

            confirmButtonText: 'Continuar de todos modos',

            cancelButtonText: 'Cambiar contraseña',

            confirmButtonColor: '#198754',

            cancelButtonColor: '#6c757d',

            allowOutsideClick: false

        });

        // Si decide cambiar la contraseña, detener el registro.
        if (!resultado.isConfirmed) {
            return;
        }

        // Recordar que aceptó continuar.
        continuarContrasenaDebil = true;

        // Volver a enviar el formulario.
        e.target.requestSubmit();

        return;
    }

    // Si aceptó continuar o la contraseña tiene 8 caracteres o más,
    // procesar el registro.
    continuarContrasenaDebil = false;

    await enviarDatosUsuario(password, idusuarioInput);

}


// ==============================================================================
// ENVIAR DATOS AL SERVIDOR
// ==============================================================================

async function enviarDatosUsuario(password, idusuarioInput) {

    const paisVal = document.querySelector('#pais')?.value;
    const estadoVal = document.querySelector('#estado')?.value;

    const accion = idusuarioInput ? "modificar" : "crear";

    const datosUsuario = {

        accion: accion,

        nombre: document.querySelector('#nombre')?.value.trim(),

        apellidop: document.querySelector('#apellidop')?.value.trim(),

        apellidom: document.querySelector('#apellidom')?.value.trim(),


        fechaNac: document.querySelector('#fechaNac')?.value || null,


        username: document.querySelector('#username')?.value.trim(),

        email: document.querySelector('#email')?.value.trim(),

        password: password,

        idpais: paisVal && !isNaN(paisVal)
            ? parseInt(paisVal, 10)
            : null,

        idestado: estadoVal && !isNaN(estadoVal)
            ? parseInt(estadoVal, 10)
            : null

    };

    if (idusuarioInput) {
        datosUsuario.idusuario = parseInt(idusuarioInput, 10);
    }

    try {

        const respuesta = await fetch(API_URL, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(datosUsuario)

        });

        const resultado = await respuesta.json();

        if (resultado.status === 'success') {

            Swal.fire({

                title: '¡Éxito!',

                text: resultado.message,

                icon: 'success',

                confirmButtonText: 'Continuar',

                confirmButtonColor: '#198754'

            }).then(() => {

                if (accion === "crear") {

                    window.location.href = '../pages_ext/index.html';

                } else {

                    consultarUsuarios();

                }

            });

        } else {

            Swal.fire({

                title: 'Atención',

                text: resultado.message,

                icon: 'warning',

                confirmButtonText: 'Aceptar',

                confirmButtonColor: '#ffc107'

            });

        }

    } catch (error) {

        console.error("Error al guardar usuario:", error);

        Swal.fire({

            title: 'Error',

            text: 'Ocurrió un error al procesar la solicitud.',

            icon: 'error',

            confirmButtonText: 'Aceptar'

        });

    }

}


// ==============================================================================
// CONSULTAR USUARIOS
// ==============================================================================

async function consultarUsuarios(idusuario = null) {

    const payload = {
        accion: "consultar"
    };

    if (idusuario) {
        payload.idusuario = idusuario;
    }

    try {

        const respuesta = await fetch(API_URL, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(payload)

        });

        const resultado = await respuesta.json();

        if (resultado.status === 'success') {



            return resultado.data;

        } else {

            console.warn("Respuesta del servidor:", resultado.message);

        }

    } catch (error) {

        console.error("Error al consultar usuarios:", error);

    }

}


// ==============================================================================
// ELIMINAR USUARIO
// ==============================================================================

async function eliminarUsuario(idusuario) {



    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        return;
    }

    try {

        const respuesta = await fetch(API_URL, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({

                accion: "eliminar",

                idusuario: parseInt(idusuario, 10)

            })

        });

        const resultado = await respuesta.json();

        if (resultado.status === 'success') {

            alert(resultado.message);

            consultarUsuarios();

        } else {

            alert("Error: " + resultado.message);

        }

    } catch (error) {

        console.error("Error al eliminar usuario:", error);

        alert("No se pudo completar la eliminación.");

    }

}


// ==============================================================================
// CARGAR PAÍSES
// ==============================================================================

async function cargarPaises() {

    const selectPais = document.querySelector('#pais');

    if (!selectPais) return;

    try {

        const res = await fetch('../php/get_ubicaciones.php?accion=paises');

        const resultado = await res.json();

        if (
            resultado.status === 'success' &&
            Array.isArray(resultado.data)
        ) {

            selectPais.innerHTML =
                '<option value="">Selecciona un país</option>';

            resultado.data.forEach(pais => {

                const opt = document.createElement('option');

                opt.value = pais.idpais;

                opt.textContent = pais.nombre;

                selectPais.appendChild(opt);

            });

        }

    } catch (e) {

        console.error("Error cargando países:", e);

    }

}


// ==============================================================================
// CARGAR ESTADOS SEGÚN EL PAÍS
// ==============================================================================

async function cambiarPais() {

    const selectPais = document.querySelector('#pais');

    const selectEstado = document.querySelector('#estado');

    if (!selectPais || !selectEstado) return;

    const idpais = selectPais.value;

    selectEstado.innerHTML =
        '<option value="">Selecciona un estado</option>';

    if (!idpais) return;

    try {

        const res = await fetch(
            `../php/get_ubicaciones.php?accion=estados&idpais=${idpais}`
        );

        const resultado = await res.json();

        if (
            resultado.status === 'success' &&
            Array.isArray(resultado.data)
        ) {

            resultado.data.forEach(estado => {

                const opt = document.createElement('option');

                opt.value = estado.idestado;

                opt.textContent = estado.nombre;

                selectEstado.appendChild(opt);

            });

        }

    } catch (e) {

        console.error("Error cargando estados:", e);

    }

}
