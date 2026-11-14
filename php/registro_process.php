
<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "conexion.php";


// ==============================================================================
// FORMATEAR NOMBRES
// ==============================================================================

function formatoNombre($texto) {

    return mb_convert_case(
        strtolower(trim($texto)),
        MB_CASE_TITLE,
        "UTF-8"
    );

}


// ==============================================================================
// VALIDAR MÉTODO
// ==============================================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "status" => "error",
        "message" => "Método no permitido"
    ]);

    exit;
}


// ==============================================================================
// RECIBIR JSON
// ==============================================================================

$json = file_get_contents("php://input");

$data = json_decode($json, true);

if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Datos JSON no válidos o vacíos."
    ]);

    exit;
}


$accion = strtolower(trim($data["accion"] ?? "crear"));

try {

    switch ($accion) {


        // ==============================================================
        // CREAR USUARIO
        // ==============================================================

        case "crear":
        case "insertar":

            $nombre = formatoNombre($data["nombre"] ?? "");

            $apellidop = formatoNombre($data["apellidop"] ?? "");

            $username = trim($data["username"] ?? "");

            $email = trim($data["email"] ?? "");

            $password = $data["password"] ?? "";


            // País y estado son opcionales.

            $idpais = (
                isset($data["idpais"]) &&
                is_numeric($data["idpais"]) &&
                (int)$data["idpais"] > 0
            ) ? (int)$data["idpais"] : null;


            $idestado = (
                isset($data["idestado"]) &&
                is_numeric($data["idestado"]) &&
                (int)$data["idestado"] > 0
            ) ? (int)$data["idestado"] : null;


            // Validar únicamente los campos obligatorios.

            if (
                $nombre === "" ||
                $apellidop === "" ||
                $email === "" ||
                trim($password) === ""
            ) {

                http_response_code(400);

                echo json_encode([
                    "status" => "error",
                    "message" => "Por favor llena todos los campos obligatorios."
                ]);

                exit;
            }


            // Insertar usuario.
            // Los campos eliminados del formulario se guardan vacíos o NULL.

            $stmt = $pdo->prepare("

                INSERT INTO usuario (

                    nombre,
                    apellidop,
                    apellidom,
                    username,
                    password,
                    email,
                    fechaNac,
                    idpais,
                    idestado

                ) VALUES (

                    :nombre,
                    :apellidop,
                    '',
                    :username,
                    :password,
                    :email,
                    NULL,
                    :idpais,
                    :idestado

                )

            ");


            $stmt->bindValue(':nombre', $nombre);

            $stmt->bindValue(':apellidop', $apellidop);

            $stmt->bindValue(
                ':username',
                $username !== "" ? $username : null
            );

            $stmt->bindValue(
                ':password',
                password_hash($password, PASSWORD_BCRYPT)
            );

            $stmt->bindValue(':email', $email);

            $stmt->bindValue(
                ':idpais',
                $idpais,
                $idpais !== null ? PDO::PARAM_INT : PDO::PARAM_NULL
            );

            $stmt->bindValue(
                ':idestado',
                $idestado,
                $idestado !== null ? PDO::PARAM_INT : PDO::PARAM_NULL
            );


            $stmt->execute();


            echo json_encode([
                "status" => "success",
                "message" => "¡Usuario registrado exitosamente!",
                "idusuario" => $pdo->lastInsertId()
            ]);

            break;



        // ==============================================================
        // CONSULTAR USUARIOS
        // ==============================================================

        case "leer":
        case "consultar":

            $idusuario = (
                isset($data["idusuario"]) &&
                is_numeric($data["idusuario"])
            ) ? (int)$data["idusuario"] : null;


            if ($idusuario) {

                $stmt = $pdo->prepare("

                    SELECT

                        u.idusuario,
                        u.nombre,
                        u.apellidop,
                        u.username,
                        u.email,
                        u.idpais,
                        u.idestado,

                        COALESCE(p.nombre, 'Sin especificar') AS pais,

                        COALESCE(e.nombre, 'Sin especificar') AS estado

                    FROM usuario u

                    LEFT JOIN pais p
                        ON u.idpais = p.idpais

                    LEFT JOIN estado e
                        ON u.idestado = e.idestado

                    WHERE u.idusuario = :idusuario

                ");

                $stmt->bindValue(
                    ':idusuario',
                    $idusuario,
                    PDO::PARAM_INT
                );

                $stmt->execute();

                $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

            } else {

                $stmt = $pdo->query("

                    SELECT

                        u.idusuario,
                        u.nombre,
                        u.apellidop,
                        u.username,
                        u.email,
                        u.idpais,
                        u.idestado,

                        COALESCE(p.nombre, 'Sin especificar') AS pais,

                        COALESCE(e.nombre, 'Sin especificar') AS estado

                    FROM usuario u

                    LEFT JOIN pais p
                        ON u.idpais = p.idpais

                    LEFT JOIN estado e
                        ON u.idestado = e.idestado

                ");

                $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

            }


            echo json_encode([
                "status" => "success",
                "data" => $resultado
            ]);

            break;



        // ==============================================================
        // MODIFICAR USUARIO
        // ==============================================================

        case "modificar":
        case "actualizar":

            $idusuario = (
                isset($data["idusuario"]) &&
                is_numeric($data["idusuario"]) &&
                (int)$data["idusuario"] > 0
            ) ? (int)$data["idusuario"] : 0;


            if ($idusuario <= 0) {

                http_response_code(400);

                echo json_encode([
                    "status" => "error",
                    "message" => "Se requiere un idusuario válido para modificar."
                ]);

                exit;
            }


            $nombre = formatoNombre($data["nombre"] ?? "");

            $apellidop = formatoNombre($data["apellidop"] ?? "");

            $username = trim($data["username"] ?? "");

            $email = trim($data["email"] ?? "");

            $password = $data["password"] ?? "";


            $idpais = (
                isset($data["idpais"]) &&
                is_numeric($data["idpais"]) &&
                (int)$data["idpais"] > 0
            ) ? (int)$data["idpais"] : null;


            $idestado = (
                isset($data["idestado"]) &&
                is_numeric($data["idestado"]) &&
                (int)$data["idestado"] > 0
            ) ? (int)$data["idestado"] : null;


            if (
                $nombre === "" ||
                $apellidop === "" ||
                $email === ""
            ) {

                http_response_code(400);

                echo json_encode([
                    "status" => "error",
                    "message" => "Por favor llena los campos obligatorios."
                ]);

                exit;
            }


            if ($password !== "") {

                $stmt = $pdo->prepare("

                    UPDATE usuario SET

                        nombre = :nombre,
                        apellidop = :apellidop,
                        username = :username,
                        password = :password,
                        email = :email,
                        idpais = :idpais,
                        idestado = :idestado

                    WHERE idusuario = :idusuario

                ");

                $stmt->bindValue(
                    ':password',
                    password_hash($password, PASSWORD_BCRYPT)
                );

            } else {

                $stmt = $pdo->prepare("

                    UPDATE usuario SET

                        nombre = :nombre,
                        apellidop = :apellidop,
                        username = :username,
                        email = :email,
                        idpais = :idpais,
                        idestado = :idestado

                    WHERE idusuario = :idusuario

                ");

            }


            $stmt->bindValue(':nombre', $nombre);

            $stmt->bindValue(':apellidop', $apellidop);

            $stmt->bindValue(
                ':username',
                $username !== "" ? $username : null
            );

            $stmt->bindValue(':email', $email);

            $stmt->bindValue(
                ':idpais',
                $idpais,
                $idpais !== null ? PDO::PARAM_INT : PDO::PARAM_NULL
            );

            $stmt->bindValue(
                ':idestado',
                $idestado,
                $idestado !== null ? PDO::PARAM_INT : PDO::PARAM_NULL
            );

            $stmt->bindValue(
                ':idusuario',
                $idusuario,
                PDO::PARAM_INT
            );


            $stmt->execute();


            echo json_encode([
                "status" => "success",
                "message" => "¡Usuario actualizado exitosamente!"
            ]);

            break;



        // ==============================================================
        // GUARDAR FOTO DE PERFIL
        // ==============================================================

        case "foto":

            $idusuario = (int)($data["idusuario"] ?? 0);

            $ruta_imagen = trim($data["ruta_imagen"] ?? "");


            if ($idusuario <= 0 || $ruta_imagen === "") {

                http_response_code(400);

                echo json_encode([
                    "status" => "error",
                    "message" => "Datos de foto incompletos."
                ]);

                exit;
            }


            $stmt = $pdo->prepare("

                UPDATE usuario

                SET foto_perfil = :ruta_imagen

                WHERE idusuario = :idusuario

            ");


            $stmt->bindValue(
                ':ruta_imagen',
                $ruta_imagen,
                PDO::PARAM_STR
            );

            $stmt->bindValue(
                ':idusuario',
                $idusuario,
                PDO::PARAM_INT
            );


            $stmt->execute();


            if ($stmt->rowCount() > 0) {

                echo json_encode([
                    "status" => "success",
                    "message" => "Foto guardada correctamente."
                ]);

            } else {

                // Comprobar si el usuario existe aunque la ruta no haya cambiado.

                $verificar = $pdo->prepare("
                    SELECT idusuario FROM usuario
                    WHERE idusuario = :idusuario
                ");

                $verificar->execute([
                    ':idusuario' => $idusuario
                ]);

                if ($verificar->fetch()) {

                    echo json_encode([
                        "status" => "success",
                        "message" => "La foto ya estaba guardada."
                    ]);

                } else {

                    http_response_code(404);

                    echo json_encode([
                        "status" => "error",
                        "message" => "Usuario no encontrado."
                    ]);

                }

            }

            break;



        // ==============================================================
        // ELIMINAR USUARIO
        // ==============================================================

        case "eliminar":
        case "borrar":

            $idusuario = (
                isset($data["idusuario"]) &&
                is_numeric($data["idusuario"]) &&
                (int)$data["idusuario"] > 0
            ) ? (int)$data["idusuario"] : 0;


            if ($idusuario <= 0) {

                http_response_code(400);

                echo json_encode([
                    "status" => "error",
                    "message" => "Se requiere un idusuario válido para eliminar."
                ]);

                exit;
            }


            $pdo->beginTransaction();


            // Eliminar registros relacionados.

            $tablasRelacionadas = [
                "lecciones_usuario",
                "intentoexamen",
                "usuario_medalla",
                "puntaje",
                "racha"
            ];


            foreach ($tablasRelacionadas as $tabla) {

                $stmt = $pdo->prepare("
                    DELETE FROM `$tabla`
                    WHERE idusuario = :idusuario
                ");

                $stmt->bindValue(
                    ':idusuario',
                    $idusuario,
                    PDO::PARAM_INT
                );

                $stmt->execute();

            }


            // Eliminar usuario.

            $stmt = $pdo->prepare("

                DELETE FROM usuario

                WHERE idusuario = :idusuario

            ");


            $stmt->bindValue(
                ':idusuario',
                $idusuario,
                PDO::PARAM_INT
            );


            $stmt->execute();


            if ($stmt->rowCount() > 0) {

                $pdo->commit();

                echo json_encode([
                    "status" => "success",
                    "message" => "Usuario eliminado exitosamente."
                ]);

            } else {

                $pdo->rollBack();

                http_response_code(404);

                echo json_encode([
                    "status" => "error",
                    "message" => "No se encontró ningún usuario con ese ID."
                ]);

            }

            break;



        // ==============================================================
        // ACCIÓN NO VÁLIDA
        // ==============================================================

        default:

            http_response_code(400);

            echo json_encode([
                "status" => "error",
                "message" => "Acción no válida."
            ]);

            break;

    }


} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    error_log("Error en registro_process.php: " . $e->getMessage());

    echo json_encode([
        "status" => "error",
        "message" => "Ocurrió un error al procesar la solicitud. Verifica los datos e inténtalo nuevamente."
    ]);

}

?>
