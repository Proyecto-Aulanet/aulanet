(function() {
    'use strict';


    function cargarPuntajeHeader() {
        fetch("/aulanet/php/obtener_puntaje_total.php")
            .then(response => response.json())
            .then(data => {


                if (data.status === "success") {
                    const puntajeFormateado = Number(data.puntaje_total).toLocaleString();

                    const xpDisplay = document.getElementById("xp-display");
                    if (xpDisplay) {
                        xpDisplay.textContent = puntajeFormateado;

                    } else {
                        console.warn("⚠️ No se encontró el elemento #xp-display en el HTML");
                    }
                }
            })
            .catch(error => console.error("❌ Error en fetch de header:", error));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cargarPuntajeHeader);
    } else {
        cargarPuntajeHeader();
    }

    setInterval(cargarPuntajeHeader, 30000);
})();