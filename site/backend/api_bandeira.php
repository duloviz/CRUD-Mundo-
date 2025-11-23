<?php
// API para buscar bandeiras de países
header("Content-Type: application/json; charset=utf-8");

function getCountryFlag($countryName) {
    // Tenta buscar país pela API REST Countries
    $url = "https://restcountries.com/v3.1/name/" . urlencode($countryName) . "?fields=name,flags,cca2";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Se encontrou o país, retorna a bandeira
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        
        if (!empty($data)) {
            $country = $data[0];
            return [
                "flag_url" => $country['flags']['png'] ?? $country['flags']['svg'] ?? null,
                "country_name" => $country['name']['common'] ?? $countryName,
                "found" => true
            ];
        }
    }
    
    // Se não encontrou, tenta por código do país
    return tryCountryCode($countryName);
}

function tryCountryCode($countryName) {
    // Mapeamento manual de países para códigos
    $countryCodes = [
        'Brasil' => 'br',
        'Estados Unidos' => 'us',
        // ... outros países
    ];
    
    // Se conhece o país, retorna bandeira pelo código
    if (isset($countryCodes[$countryName])) {
        $code = $countryCodes[$countryName];
        return [
            "flag_url" => "https://flagcdn.com/w320/{$code}.png",
            "country_name" => $countryName,
            "found" => true
        ];
    }
    
    return ["error" => "País não encontrado: " . $countryName];
}

// Se veio parâmetro 'nome', busca a bandeira
if (isset($_GET['nome'])) {
    $countryName = trim($_GET['nome']);
    
    if (empty($countryName)) {
        echo json_encode(["error" => "Nome do país não fornecido"]);
        exit;
    }

    $result = getCountryFlag($countryName);
    echo json_encode($result);
    exit;
}

echo json_encode(["error" => "Parâmetro 'nome' não fornecido"]);
?>
