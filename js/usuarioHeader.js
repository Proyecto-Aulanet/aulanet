
// =====================================
// DETECTAR RUTA BASE DEL PROYECTO
// =====================================

const rutaScriptUsuario = document.currentScript.src;

const RUTA_BASE = new URL("../", rutaScriptUsuario);

function obtenerRuta(archivo) {
    return new URL(archivo, RUTA_BASE).href;
}


// =====================================
// CARGAR INFORMACIÓN DEL USUARIO
// =====================================

document.addEventListener("DOMContentLoaded", function () {





    // ================================
    // SESIÓN DEL USUARIO
    // ================================

    fetch(obtenerRuta("php/sesion_usuario.php"), {
        method: "GET",
        credentials: "include",
        cache: "no-store"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error HTTP: " + response.status);
            }

            return response.json();
        })
        .then(data => {



            const nombreHeader =
                document.getElementById("nombreUsuario");

            const nombreBienvenida =
                document.getElementById("nombreUsuarioBienvenida");

            if (data.status === "success" && data.usuario) {

                const nombre =
                    data.usuario.nombre?.trim() || "Usuario";

                if (nombreHeader) {
                    nombreHeader.textContent = nombre;
                }

                if (nombreBienvenida) {
                    nombreBienvenida.textContent = nombre;
                }

                if (data.usuario.idusuario) {
                    localStorage.setItem(
                        "idusuario",
                        data.usuario.idusuario
                    );
                }

            } else {

                if (nombreHeader) {
                    nombreHeader.textContent = "Invitado";
                }

                if (nombreBienvenida) {
                    nombreBienvenida.textContent = "Invitado";
                }
            }

        })
        .catch(error => {
            console.error("Error al obtener el usuario:", error);
        });


    // ================================
    // FOTO DEL USUARIO
    // ================================

    fetch(obtenerRuta("php/foto_usuario.php"), {
        method: "GET",
        credentials: "include",
        cache: "no-store"
    })
        .then(response => response.json())
        .then(data => {

            if (data.status !== "success") return;

            const foto =
                document.getElementById("fotoUsuario");

            const icono =
                document.getElementById("iconoUsuario");

            if (foto && data.foto) {

                let rutaFoto = data.foto;

                rutaFoto = rutaFoto.replace(/^(\.\.\/)+/, "");

                if (!rutaFoto.startsWith("/")) {
                    rutaFoto = "/" + rutaFoto;
                }

                // Construir ruta de la imagen desde la raíz
                foto.src = obtenerRuta(rutaFoto.replace(/^\/+/, ""));

                foto.style.display = "block";

                if (icono) {
                    icono.style.display = "none";
                }
            }

        })
        .catch(error => {
            console.error("Error al obtener la foto:", error);
        });


    // ================================
    // RACHA DEL USUARIO
    // ================================

    function cargarRacha() {

        fetch(obtenerRuta("php/obtener_racha.php"), {
            credentials: "include",
            cache: "no-store"
        })
            .then(response => response.json())
            .then(data => {

                if (data.status !== "success") return;

                const streakDisplay =
                    document.getElementById("streak-display");

                if (streakDisplay) {
                    streakDisplay.textContent = data.racha || 0;
                }

            })
            .catch(error => {
                console.error("Error al obtener la racha:", error);
            });
    }

    cargarRacha();

});
