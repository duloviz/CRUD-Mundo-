<?php
// backend/api_bandeira.php
header("Content-Type: application/json; charset=utf-8");

// Mapeamento de nomes em português para inglês
$countryMapping = [
    'Brasil' => 'Brazil',
    'Estados Unidos' => 'United States',
    'Coreia do Sul' => 'South Korea', 
    'Países Baixos' => 'Netherlands',
    'Inglaterra' => 'United Kingdom',
    'Arábia Saudita' => 'Saudi Arabia',
    'Canadá' => 'Canada',
    'Itália' => 'Italy',
    'Alemanha' => 'Germany',
    'China' => 'China',
    'Chile' => 'Chile'
];

function getCountryFlag($countryName) {
    global $countryMapping;
    
    // Verifica se temos um mapeamento
    if (isset($countryMapping[$countryName])) {
        $searchName = $countryMapping[$countryName];
    } else {
        $searchName = $countryName;
    }
    
    $url = "https://restcountries.com/v3.1/name/" . urlencode($searchName) . "?fields=name,flags";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        // Tenta buscar por nome comum também
        return tryAlternativeSearch($searchName);
    }

    $data = json_decode($response, true);
    
    if (empty($data)) {
        return tryAlternativeSearch($searchName);
    }

    $country = $data[0];
    
    return [
        "flag_url" => $country['flags']['png'] ?? $country['flags']['svg'] ?? null,
        "country_name" => $country['name']['common'] ?? $searchName,
        "found" => true
    ];
}

function tryAlternativeSearch($countryName) {
    // Tenta buscar por todos os países e fazer match
    $url = "https://restcountries.com/v3.1/all?fields=name,flags";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return ["error" => "Erro ao conectar com a API"];
    }

    $allCountries = json_decode($response, true);
    
    // Tenta encontrar por similaridade
    foreach ($allCountries as $country) {
        $commonName = strtolower($country['name']['common'] ?? '');
        $searchName = strtolower($countryName);
        
        // Verifica se o nome é similar
        if (strpos($commonName, $searchName) !== false || 
            levenshtein($commonName, $searchName) < 5) {
            return [
                "flag_url" => $country['flags']['png'] ?? $country['flags']['svg'] ?? null,
                "country_name" => $country['name']['common'],
                "found" => true
            ];
        }
        
        // Verifica traduções em português
        $portugueseName = strtolower($country['name']['translations']['por']['common'] ?? '');
        if (strpos($portugueseName, $searchName) !== false) {
            return [
                "flag_url" => $country['flags']['png'] ?? $country['flags']['svg'] ?? null,
                "country_name" => $country['name']['common'],
                "found" => true
            ];
        }
    }
    
    return ["error" => "País não encontrado: " . $countryName];
}

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
