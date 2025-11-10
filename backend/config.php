<?php
error_reporting(0);
ini_set('display_errors', 0);

$host = "localhost";
$user = "root"; 
$pass = "";
$db   = "bd_mundo_maria";

// Tentativa de conexão
try {
    $conn = new mysqli($host, $user, $pass, $db);
    
    // Verificar erros de conexão
    if ($conn->connect_error) {
        throw new Exception("Erro na conexão com o banco: " . $conn->connect_error);
    }
    
    // Configurar charset
    $conn->set_charset("utf8");
    
} catch (Exception $e) {
    // Retornar erro em formato JSON
    header('Content-Type: application/json');
    die(json_encode([
        "success" => false,
        "error" => "Erro de conexão com o banco de dados: " . $e->getMessage()
    ]));
}
?>
