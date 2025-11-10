<?php
header("Content-Type: application/json; charset=utf-8");
require_once "config.php";

try {
    $action = $_GET['action'] ?? ($_POST['action'] ?? '');
    
    if (empty($action)) {
        throw new Exception("Ação não especificada");
    }

    switch ($action) {
        case 'read':
            $sql = "SELECT c.id_cidade, c.nome, c.populacao, c.id_pais, p.nome AS pais_nome
                    FROM cidades c 
                    JOIN paises p ON c.id_pais = p.id_pais
                    ORDER BY c.nome";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                throw new Exception("Erro na consulta: " . $conn->error);
            }
            
            $cidades = [];
            while ($row = $result->fetch_assoc()) {
                $cidades[] = $row;
            }
            
            echo json_encode($cidades);
            break;

        case 'create':
            $nome = trim($_POST['nome'] ?? '');
            $populacao = !empty($_POST['populacao']) ? (int)$_POST['populacao'] : null;
            $id_pais = (int)($_POST['id_pais'] ?? 0);

            if (empty($nome) || $id_pais <= 0) {
                throw new Exception("Nome e país são obrigatórios");
            }

            $stmt = $conn->prepare("INSERT INTO cidades (nome, populacao, id_pais) VALUES (?, ?, ?)");
            $stmt->bind_param("sii", $nome, $populacao, $id_pais);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "id_cidade" => $stmt->insert_id]);
            } else {
                throw new Exception("Erro ao inserir cidade: " . $stmt->error);
            }
            break;

        case 'update':
            $id_cidade = (int)($_POST['id_cidade'] ?? 0);
            $nome = trim($_POST['nome'] ?? '');
            $populacao = !empty($_POST['populacao']) ? (int)$_POST['populacao'] : null;
            $id_pais = (int)($_POST['id_pais'] ?? 0);

            if ($id_cidade <= 0 || empty($nome) || $id_pais <= 0) {
                throw new Exception("Dados inválidos para atualização");
            }

            $stmt = $conn->prepare("UPDATE cidades SET nome=?, populacao=?, id_pais=? WHERE id_cidade=?");
            $stmt->bind_param("siii", $nome, $populacao, $id_pais, $id_cidade);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                throw new Exception("Erro ao atualizar cidade: " . $stmt->error);
            }
            break;

        case 'delete':
            $id_cidade = (int)($_POST['id_cidade'] ?? 0);
            
            if ($id_cidade <= 0) {
                throw new Exception("ID inválido");
            }

            $stmt = $conn->prepare("DELETE FROM cidades WHERE id_cidade = ?");
            $stmt->bind_param("i", $id_cidade);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                throw new Exception("Erro ao excluir cidade: " . $stmt->error);
            }
            break;

        default:
            throw new Exception("Ação inválida: " . $action);
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>
