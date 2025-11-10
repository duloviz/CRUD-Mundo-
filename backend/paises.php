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
            $sql = "SELECT id_pais, nome, continente, populacao, idioma FROM paises ORDER BY nome";
            $result = $conn->query($sql);
            
            if (!$result) {
                throw new Exception("Erro na consulta: " . $conn->error);
            }
            
            $paises = [];
            while ($row = $result->fetch_assoc()) {
                $paises[] = $row;
            }
            
            echo json_encode($paises);
            break;

        case 'create':
            $nome = trim($_POST['nome'] ?? '');
            $continente = trim($_POST['continente'] ?? '');
            $populacao = !empty($_POST['populacao']) ? (int)$_POST['populacao'] : null;
            $idioma = trim($_POST['idioma'] ?? '');

            if (empty($nome) || empty($continente) || empty($idioma)) {
                throw new Exception("Nome, continente e idioma são obrigatórios");
            }

            $stmt = $conn->prepare("INSERT INTO paises (nome, continente, populacao, idioma) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssis", $nome, $continente, $populacao, $idioma);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "id_pais" => $stmt->insert_id]);
            } else {
                throw new Exception("Erro ao inserir país: " . $stmt->error);
            }
            break;

        case 'update':
            $id_pais = (int)($_POST['id_pais'] ?? 0);
            $nome = trim($_POST['nome'] ?? '');
            $continente = trim($_POST['continente'] ?? '');
            $populacao = !empty($_POST['populacao']) ? (int)$_POST['populacao'] : null;
            $idioma = trim($_POST['idioma'] ?? '');

            if ($id_pais <= 0 || empty($nome) || empty($continente) || empty($idioma)) {
                throw new Exception("Dados inválidos para atualização");
            }

            $stmt = $conn->prepare("UPDATE paises SET nome=?, continente=?, populacao=?, idioma=? WHERE id_pais=?");
            $stmt->bind_param("ssisi", $nome, $continente, $populacao, $idioma, $id_pais);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                throw new Exception("Erro ao atualizar país: " . $stmt->error);
            }
            break;

        case 'delete':
            $id_pais = (int)($_POST['id_pais'] ?? 0);
            
            if ($id_pais <= 0) {
                throw new Exception("ID inválido");
            }

            $stmt = $conn->prepare("DELETE FROM paises WHERE id_pais = ?");
            $stmt->bind_param("i", $id_pais);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                throw new Exception("Erro ao excluir país: " . $stmt->error);
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
