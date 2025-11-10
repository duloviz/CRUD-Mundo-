<?php
// backend/api.php
header("Content-Type: application/json; charset=utf-8");

$API_KEY = "1ee8cbbc6a76790592a9b371e62f0ae2";

if (!isset($_GET['cidade']) || empty(trim($_GET['cidade']))) {
    echo json_encode(["error" => "Cidade não informada"]);
    exit;
}

$cidade = urlencode(trim($_GET['cidade']));
$url = "https://api.openweathermap.org/data/2.5/weather?q={$cidade}&appid={$API_KEY}&units=metric&lang=pt_br";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo json_encode(["error" => "Cidade não encontrada"]);
    exit;
}

echo $response;
?>
