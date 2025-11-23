<?php
// Define que vamos retornar JSON
header("Content-Type: application/json; charset=utf-8");

// Chave da API do clima (OpenWeatherMap)
$API_KEY = "1ee8cbbc6a76790592a9b371e62f0ae2";

// Verifica se a cidade foi enviada
if (!isset($_GET['cidade']) || empty(trim($_GET['cidade']))) {
    echo json_encode(["error" => "Cidade não informada"]);
    exit;
}

// Prepara o nome da cidade para URL
$cidade = urlencode(trim($_GET['cidade']));
// Monta a URL da API do clima
$url = "https://api.openweathermap.org/data/2.5/weather?q={$cidade}&appid={$API_KEY}&units=metric&lang=pt_br";

// Configura e faz a requisição para a API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);           // URL da API
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);   // Retorna a resposta
curl_setopt($ch, CURLOPT_TIMEOUT, 10);         // Timeout de 10s
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignora certificado SSL

// Executa a requisição
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE); // Pega código de status
curl_close($ch);

// Se não encontrou a cidade (código não é 200)
if ($httpCode !== 200) {
    echo json_encode(["error" => "Cidade não encontrada"]);
    exit;
}

// Retorna os dados do clima
echo $response;
?>
