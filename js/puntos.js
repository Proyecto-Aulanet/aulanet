
// =====================================================
// PUNTOS.JS
// =====================================================




// =====================================================
// ESPERAR A QUE CARGUE EL HTML
// =====================================================

document.addEventListener("DOMContentLoaded", function () {



    cargarPuntaje();

});


// =====================================================
// CARGAR PUNTAJE
// =====================================================

async function cargarPuntaje() {




    const urlApi = "/aulanet/php/obtener_puntaje_total.php";




    try {

        const response =
            await fetch(
                urlApi,
                {
                    method: "GET",
                    credentials: "include"
                }
            );





        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }


        const data =
            await response.json();





        if (
            data.status === "success"
        ) {

            const puntaje =
                Number(
                    data.puntaje_total
                ) || 0;





            actualizarPuntajeDOM(
                puntaje
            );


        } else {

            console.error(
                "❌ PHP respondió error:",
                data.message
            );

        }


    } catch (error) {

        console.error(
            "❌ ERROR CARGANDO PUNTAJE:",
            error
        );

    }

}


// =====================================================
// ACTUALIZAR ELEMENTOS
// =====================================================

function actualizarPuntajeDOM(puntaje) {




    // =================================================
    // PERFIL
    // =================================================

    const xpUsuario =
        document.getElementById(
            "xpUsuario"
        );


    if (xpUsuario) {

        xpUsuario.textContent =
            puntaje;



    } else {

        console.warn(
            "⚠️ No existe #xpUsuario en esta página"
        );

    }


    // =================================================
    // HEADER
    // =================================================

    const xpDisplay =
        document.getElementById(
            "xp-display"
        );


    if (xpDisplay) {

        xpDisplay.textContent =
            puntaje;



    } else {

        console.warn(
            "⚠️ No existe #xp-display en esta página"
        );

    }

}

