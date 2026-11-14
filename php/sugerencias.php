<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");
require_once "conexion.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "status"  => "error",
        "message" => "Método no permitido"
    ]);
    exit;
}

// Solo usuarios con sesión activa pueden enviar sugerencias
if (!isset($_SESSION["idusuario"])) {
    http_response_code(401);
    echo json_encode([
        "status"  => "error",
        "message" => "Inicia sesión para enviar una sugerencia."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$mensaje = trim($data["mensaje"] ?? "");

if ($mensaje === "") {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "Escribe tu comentario antes de enviar."
    ]);
    exit;
}

if (mb_strlen($mensaje, "UTF-8") > 500) {
    http_response_code(400);
    echo json_encode([
        "status"  => "error",
        "message" => "El comentario no puede tener más de 500 caracteres."
    ]);
    exit;
}

try {

    $stmt = $pdo->prepare("
        INSERT INTO sugerencia (idusuario, mensaje)
        VALUES (:idusuario, :mensaje)
    ");

    $stmt->bindValue(':idusuario', (int)$_SESSION["idusuario"], PDO::PARAM_INT);
    $stmt->bindValue(':mensaje', $mensaje, PDO::PARAM_STR);
    $stmt->execute();

    echo json_encode([
        "status"  => "success",
        "message" => "¡Gracias! Tu sugerencia fue enviada al equipo."
    ]);

} catch (PDOException $e) {

    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "No se pudo guardar tu sugerencia. Intenta de nuevo."
    ]);

}

?>