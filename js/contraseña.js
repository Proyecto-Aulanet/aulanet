
// =====================================
// MOSTRAR Y OCULTAR CONTRASEÑA
// =====================================

function togglePassword(inputId, iconId) {

    const password = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!password || !icon) return;

    if (password.type === "password") {

        password.type = "text";

        icon.classList.replace(
            "bi-eye-fill",
            "bi-eye-slash-fill"
        );

    } else {

        password.type = "password";

        icon.classList.replace(
            "bi-eye-slash-fill",
            "bi-eye-fill"
        );

    }

}
