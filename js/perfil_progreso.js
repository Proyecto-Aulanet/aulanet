
document.addEventListener("DOMContentLoaded", function () {



    // ===============================
    // 1. OBTENER FOTO Y NOMBRE DEL USUARIO
    // ===============================
    function cargarPerfil() {

        fetch("/aulanet/php/perfil_usuario.php")
            .then(response => response.json())
            .then(data => {

                if (data.status !== "success") return;

                const usuario = data.usuario;

                // Actualizar foto de perfil
                const foto = document.getElementById("fotoPerfil");
                if (foto && usuario.foto !== "") {
                    foto.src = usuario.foto;
                }

                // Reemplazar "Invitado" por el nombre real
                const nombre = document.getElementById("nombrePerfil");
                if (nombre) {
                    nombre.textContent = usuario.nombre;
                }
            })
            .catch(error => console.error("❌ Error al cargar perfil:", error));
    }

    // Llama a cargarPerfil para que cambie el nombre "Invitado" y la foto
    cargarPerfil();

    // ===============================
    // 2. OBTENER PUNTAJE Y RANKING
    // ===============================
    (function () {
        'use strict';

        function cargarPuntosProgreso() {
            fetch("/aulanet/php/obtener_puntaje_total.php")
                .then(response => response.json())
                .then(data => {


                    if (data.status === "success") {
                        const total = Number(data.puntaje_total).toLocaleString();

                        // Solo actualiza el valor de "pts Total" en la tarjeta
                        const xpUsuario = document.getElementById("xpUsuario");
                        if (xpUsuario) {
                            xpUsuario.textContent = total;

                        } else {
                            console.warn("⚠️ No se encontró #xpUsuario en el HTML");
                        }

                        // Solo actualiza los puntos del Ranking
                        const xpRankingUsuario = document.getElementById("xpRankingUsuario");
                        if (xpRankingUsuario) {
                            xpRankingUsuario.textContent = `${total} XP`;

                        }
                    } else {
                        console.warn("⚠️ Error en PHP de puntaje:", data.message);
                    }
                })
                .catch(error => console.error("❌ Error al obtener puntaje en progreso:", error));
        }

        cargarPuntosProgreso();
        setInterval(cargarPuntosProgreso, 30000);
    })();

});