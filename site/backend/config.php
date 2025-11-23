<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "bd_mundo_maria";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Erro ao conectar: " . $conn->connect_error);
}

$conn->set_charset("utf8");

?>
