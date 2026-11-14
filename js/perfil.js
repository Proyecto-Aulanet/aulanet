


const API_PERFIL = "../php/perfil.php";

let idUsuarioActual = null;

let iconoSeleccionado = null;


// ===============================
// CARGAR EVENTOS
// ===============================

document.addEventListener("DOMContentLoaded", function(){


    // Solo carga perfil si existe el elemento del perfil

    if(document.getElementById("lblUsuario")){

        cargarPerfil();

    }



    const botonEditar =
    document.getElementById("btnEditar");

    if(botonEditar){

        botonEditar.addEventListener(
            "click",
            activarEdicion
        );

    }



    const botonGuardar =
    document.getElementById("btnGuardar");


    if(botonGuardar){

        botonGuardar.addEventListener(
            "click",
            guardarPerfil
        );

    }



    const botonEliminar =
    document.getElementById("btnEliminar");


    if(botonEliminar){

        botonEliminar.addEventListener(
            "click",
            eliminarCuenta
        );

    }



    const botonIcono =
    document.getElementById("btnCambiarIcono");


    if(botonIcono){

        botonIcono.addEventListener(
            "click",
            abrirModalIconos
        );

    }



        const botonGuardarIcono =
        document.getElementById("btnGuardarIcono");


        if(botonGuardarIcono){

            botonGuardarIcono.addEventListener(
                "click",
                guardarIcono
            );

        }


});



// ===============================
// CARGAR PERFIL
// ===============================

async function cargarPerfil(){


    try{


        const respuesta =
        await fetch(API_PERFIL);


        const resultado =
        await respuesta.json();




        



        if(resultado.status==="success"){


            const usuario =
            resultado.usuario;



            idUsuarioActual = parseInt(usuario.idusuario, 10);





            const lblUsuario =
            document.getElementById("lblUsuario");


            if(lblUsuario){

                lblUsuario.textContent =
                usuario.username;

            }




            const imagen =
            document.getElementById("imgPerfil");


            const icono =
            document.getElementById("iconoDefaultPerfil");



            if(imagen && icono){


                if (usuario.foto_perfil) {

                    imagen.src = usuario.foto_perfil;

                    imagen.classList.remove("d-none");

                    icono.classList.add("d-none");

                } else {

                    imagen.classList.add("d-none");

                    icono.classList.remove("d-none");

                }

            }





            const txtNombre =
            document.getElementById("txtNombre");


            if(txtNombre){

                txtNombre.value =
                usuario.nombre;

            }



            const txtApellido =
            document.getElementById("txtApellido");


            if(txtApellido){

                txtApellido.value =
                usuario.apellidop+" "+
                usuario.apellidom;

            }



            const txtUsuario =
            document.getElementById("txtUsuario");


            if(txtUsuario){

                txtUsuario.value =
                usuario.username;

            }



            const txtCorreo =
            document.getElementById("txtCorreo");


            if(txtCorreo){

                txtCorreo.value =
                usuario.email;

            }



        }



    }catch(error){


        console.error(
            "Error cargando perfil:",
            error
        );


    }


}




// ===============================
// EDITAR PERFIL
// ===============================

function activarEdicion(){

    Swal.fire({
        title: "Editar información",
        text: "¿Deseas modificar tus datos?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, editar",
        cancelButtonText: "Cancelar"

    }).then((resultado) => {

        if(resultado.isConfirmed){

            let campos = [
                "txtNombre",
                "txtApellido",
                "txtUsuario",
                "txtCorreo",
                "txtPassword"
            ];

            campos.forEach(id => {

                const campo = document.getElementById(id);

                if(campo){
                    campo.disabled = false;
                }

            });

            const botonPassword = document.getElementById("btnTogglePassword");

            if(botonPassword){
                botonPassword.disabled = false;
            }

            const password = document.getElementById("txtPassword");

            if(password){
                password.placeholder = "Escribe una nueva contraseña (opcional)";
            }

            const panel = document.getElementById("panelGuardar");

            if(panel){
                panel.classList.remove("d-none");
            }

        }

    });

}



// ===============================
// GUARDAR PERFIL
// ===============================

async function guardarPerfil(){

    let apellido = document.getElementById("txtApellido").value.split(" ");

    let password = document.getElementById("txtPassword").value;

    let datos = {

        accion: "modificar",
        idusuario: idUsuarioActual,

        nombre: document.getElementById("txtNombre").value,
        apellidop: apellido[0],
        apellidom: apellido[1] || "",

        username: document.getElementById("txtUsuario").value,
        email: document.getElementById("txtCorreo").value

    };

    // Solo enviar contraseña si se escribió una nueva
    if(password.trim() !== ""){

        if(password.length < 8){

            Swal.fire(
                "Contraseña no válida",
                "La nueva contraseña debe tener al menos 8 caracteres.",
                "warning"
            );

            return;

        }

        datos.password = password;

    }

    try{

        const respuesta = await fetch("../php/registro_process.php", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)

        });

        const resultado = await respuesta.json();



        if(resultado.status === "success"){

            Swal.fire(
                "Actualizado",
                "Tus datos se actualizaron correctamente.",
                "success"
            );

            // Limpiar el campo de contraseña
            const campoPassword = document.getElementById("txtPassword");

            campoPassword.value = "";
            campoPassword.type = "password";

            document.getElementById("iconoPassword").classList.remove("bi-eye-slash-fill");
            document.getElementById("iconoPassword").classList.add("bi-eye-fill");

            // Volver a bloquear los campos
            let campos = [
                "txtNombre",
                "txtApellido",
                "txtUsuario",
                "txtCorreo",
                "txtPassword"
            ];

            campos.forEach(id => {

                document.getElementById(id).disabled = true;

            });

            document.getElementById("btnTogglePassword").disabled = true;

            document.getElementById("panelGuardar").classList.add("d-none");

            cargarPerfil();

        }else{

            Swal.fire(
                "Error",
                resultado.message || "No se pudieron actualizar los datos.",
                "error"
            );

        }

    }catch(error){

        console.error("Error actualizando perfil:", error);

        Swal.fire(
            "Error",
            "No fue posible comunicarse con el servidor.",
            "error"
        );

    }

}




// ===============================
// ELIMINAR CUENTA
// ===============================

async function eliminarCuenta(){

    Swal.fire({
        title:"¿Eliminar cuenta?",
        text:"Esta acción no se puede deshacer",
        icon:"warning",
        showCancelButton:true,
        confirmButtonText:"Sí, eliminar",
        cancelButtonText:"Cancelar",
        confirmButtonColor:"#dc3545"
    }).then(async(resultado)=>{

        if(resultado.isConfirmed){

            let datos = {
                accion:"eliminar",
                idusuario: idUsuarioActual
            };

            let respuesta = await fetch("../php/registro_process.php",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(datos)
            });

            let resultadoPHP = await respuesta.json();



            if(resultadoPHP.status==="success"){

                Swal.fire({
                    title:"Cuenta eliminada",
                    text:"Tu cuenta fue eliminada correctamente",
                    icon:"success"
                }).then(()=>{
                    window.location.href="../pages_ext/index.html";
                });

            }else{

                Swal.fire({
                    title:"Error",
                    text:resultadoPHP.message,
                    icon:"error"
                });

            }

        }

    });

}




// ===============================
// ICONOS
// ===============================

function abrirModalIconos(){


    const contenedor =
    document.getElementById("contenedorIconos");


    if(!contenedor){

        return;

    }



const iconos = [

    "../Recursos/mascotas/ajolote.png",
    "../Recursos/mascotas/castor.png",
    "../Recursos/mascotas/zorro.png",
    "../Recursos/mascotas/armadillo.png",
    "../Recursos/mascotas/colibri.png",
    "../Recursos/mascotas/venado.png",
    "../Recursos/mascotas/guacamalla.png",
    "../Recursos/mascotas/lobo.png",
    "../Recursos/mascotas/tigre.png",
    "../Recursos/mascotas/todos_azul.png",
    "../Recursos/mascotas/todos_rosa.png",
    "../Recursos/mascotas/xolo.png"

];



    contenedor.innerHTML="";



    iconos.forEach(ruta=>{


        let img =
        document.createElement("img");


        img.src=ruta;


        img.width=80;

        img.height=80;



        img.onclick=function(){

            iconoSeleccionado = ruta;


            // quitar selección anterior
            document.querySelectorAll("#contenedorIconos img")
            .forEach(i=>{

                i.style.border="none";
                i.style.borderRadius="0";

            });


            // marcar seleccionado
            img.style.border="3px solid #198754";
            img.style.borderRadius="10px";




        };



        contenedor.appendChild(img);


    });

    let modal = new bootstrap.Modal(
    document.getElementById("modalIconos")
);

modal.show();

}






async function guardarIcono(){

    if(!iconoSeleccionado){
        return;
    }

    const datos = {

        accion:"foto",
        idusuario: idUsuarioActual,
        ruta_imagen:iconoSeleccionado

    };



    const respuesta = await fetch("../php/registro_process.php",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(datos)

    });

    const resultado = await respuesta.json();



    if(resultado.status === "success"){

        Swal.fire({
            icon:"success",
            title:"Icono actualizado"
        });

        cargarPerfil();

    }else{

        Swal.fire({
            icon:"error",
            title:"Error",
            text:resultado.message
        });

    }

}

function toggleMostrarPassword() {

    const password = document.getElementById("txtPassword");
    const icono = document.getElementById("iconoPassword");

    if (!password || !icono) return;

    if (password.type === "password") {

        password.type = "text";

        icono.classList.remove("bi-eye-fill");
        icono.classList.add("bi-eye-slash-fill");

    } else {

        password.type = "password";

        icono.classList.remove("bi-eye-slash-fill");
        icono.classList.add("bi-eye-fill");

    }

}



