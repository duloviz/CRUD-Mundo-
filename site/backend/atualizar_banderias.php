<?php
header("Content-Type: application/json; charset=utf-8");
require_once "config.php";
require_once "api_bandeira.php";

$paisesParaAtualizar = [
    1 => 'Brasil',
    2 => 'Estados Unidos', 
    3 => 'Coreia do Sul',
    4 => 'China',
    5 => 'Canadá',
    6 => 'Itália',
    7 => 'Países Baixos',
    8 => 'Chile',
    9 => 'Inglaterra', 
    10 => 'Alemanha',
    11 => 'Arábia Saudita'
];

$resultados = [];

foreach ($paisesParaAtualizar as $id => $nome) {
    try {
        $bandeiraData = getCountryFlag($nome);
        
        if (isset($bandeiraData['flag_url']) && $bandeiraData['flag_url']) {
            // Atualiza no banco de dados
            $stmt = $conn->prepare("UPDATE paises SET bandeira_url = ? WHERE id_pais = ?");
            $stmt->bind_param("si", $bandeiraData['flag_url'], $id);
            
            if ($stmt->execute()) {
                $resultados[] = [
                    'pais' => $nome,
                    'status' => 'SUCESSO',
                    'bandeira' => $bandeiraData['flag_url']
                ];
            } else {
                $resultados[] = [
                    'pais' => $nome,
                    'status' => 'ERRO_BD',
                    'erro' => $stmt->error
                ];
            }
            $stmt->close();
        } else {
            $resultados[] = [
                'pais' => $nome,
                'status' => 'NAO_ENCONTRADO',
                'erro' => $bandeiraData['error'] ?? 'Bandeira não encontrada'
            ];
        }
        
        // Pausa para não sobrecarregar a API
        usleep(200000);
        
    } catch (Exception $e) {
        $resultados[] = [
            'pais' => $nome,
            'status' => 'ERRO',
            'erro' => $e->getMessage()
        ];
    }
}

echo json_encode([
    'total_paises' => count($paisesParaAtualizar),
    'resultados' => $resultados
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

$conn->close();
?>
