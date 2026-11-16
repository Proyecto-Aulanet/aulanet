<?php
// Plantilla sin credenciales. Copia este archivo como php/conexion.php y
// configura estas variables de entorno en WSL antes de iniciar PHP.
$host = getenv('AULANET_DB_HOST') ?: '127.0.0.1';
$db = getenv('AULANET_DB_NAME') ?: 'aulanet';
$user = getenv('AULANET_DB_USER') ?: '';
$pass = getenv('AULANET_DB_PASSWORD') ?: '';

if ($user === '' || $pass === '') {
    throw new RuntimeException('Configura AULANET_DB_USER y AULANET_DB_PASSWORD en el entorno.');
}

$pdo = new PDO(
    "mysql:host={$host};dbname={$db};charset=utf8mb4",
    $user,
    $pass,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);