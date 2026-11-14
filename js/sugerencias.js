document.addEventListener("DOMContentLoaded", () => {

    const modalEl   = document.getElementById("modalSugerencia");
    const form      = document.getElementById("formSugerencia");
    const texto     = document.getElementById("sugerenciaTexto");
    const contador  = document.getElementById("sugerenciaContador");
    const aviso     = document.getElementById("sugerenciaAviso");
    const btnEnviar = document.getElementById("sugerenciaEnviar");

    if (!modalEl || !form || !texto) return;

    const MAX = 500;

    function actualizarContador() {
        contador.textContent = texto.value.length + " / " + MAX;
    }

    function mostrarAviso(mensaje, tipo) {
        aviso.className = "alert alert-" + tipo + " mt-3 mb-0";
        aviso.textContent = mensaje;
    }

    function limpiarAviso() {
        aviso.className = "alert d-none mt-3 mb-0";
        aviso.textContent = "";
    }

    texto.addEventListener("input", actualizarContador);

    modalEl.addEventListener("show.bs.modal", limpiarAviso);

    modalEl.addEventListener("shown.bs.modal", () => texto.focus());

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const mensaje = texto.value.trim();

        if (!mensaje) {
            mostrarAviso("Escribe tu comentario antes de enviar.", "warning");
            return;
        }

        btnEnviar.disabled = true;

        try {

            const respuesta = await fetch("../php/sugerencias_process.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mensaje: mensaje }),
                credentials: "same-origin"
            });

            const resultado = await respuesta.json();

            if (resultado.status === "success") {

                mostrarAviso(resultado.message, "success");
                texto.value = "";
                actualizarContador();

                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                }, 1800);

            } else {

                mostrarAviso(resultado.message || "No se pudo enviar tu sugerencia.", "danger");

            }

        } catch (error) {

            console.error("Error al enviar sugerencia:", error);
            mostrarAviso("Ocurrió un error al enviar. Revisa tu conexión e intenta de nuevo.", "danger");

        } finally {

            btnEnviar.disabled = false;

        }

    });

});