<?php
// Define formato JSON e inclui conexão com banco
header("Content-Type: application/json; charset=utf-8");
require_once "config.php";

try {
    // Pega a ação (read, create, update, delete) da URL ou formulário
    $action = $_GET['action'] ?? ($_POST['action'] ?? '');
    
    // Se não veio ação, retorna erro
    if (empty($action)) {
        throw new Exception("Ação não especificada");
    }

    // Decide o que fazer baseado na ação
    switch ($action) {
        case 'read': // LER países
            $sql = "SELECT id_pais, nome, continente, populacao, idioma FROM paises ORDER BY nome";
            $result = $conn->query($sql);
            
            if (!$result) {
                throw new Exception("Erro na consulta: " . $conn->error);
            }
            
            // Transforma resultado em array
            $paises = [];
            while ($row = $result->fetch_assoc()) {
                $paises[] = $row;
            }
            
            // Retorna países em JSON
            echo json_encode($paises);
            break;

        case 'create': // CRIAR país
            // Pega dados do formulário
            $nome = trim($_POST['nome'] ?? '');
            $continente = trim($_POST['continente'] ?? '');
            $populacao = !empty($_POST['populacao']) ? (int)$_POST['populacao'] : null;
            $idioma = trim($_POST['idioma'] ?? '');

            // Valida campos obrigatórios
            if (empty($nome) || empty($continente) || empty($idioma)) {
                throw new Exception("Nome, continente e idioma são obrigatórios");
            }

            // Prepara e executa INSERT no banco
            $stmt = $conn->prepare("INSERT INTO paises (nome, continente, populacao, idioma) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssis", $nome, $continente, $populacao, $idioma);
            
            if ($stmt->execute()) {
                // Retorna sucesso com ID do novo país
                echo json_encode(["success" => true, "id_pais" => $stmt->insert_id]);
            } else {
                throw new Exception("Erro ao inserir país: " . $stmt->error);
            }
            break;

        case 'update': // ATUALIZAR país
            // Similar ao create, mas com UPDATE
            $id_pais = (int)($_POST['id_pais'] ?? 0);
            $nome = trim($_POST['nome'] ?? '');
            $continente = trim($_POST['continente'] ?? '');
            $populacao = !empty($_POST['populacao']) ? (int)$_POST['populacao'] : null;
            $idioma = trim($_POST['idioma'] ?? '');

            // Valida dados
            if ($id_pais <= 0 || empty($nome) || empty($continente) || empty($idioma)) {
                throw new Exception("Dados inválidos para atualização");
            }

            // Prepara e executa UPDATE
            $stmt = $conn->prepare("UPDATE paises SET nome=?, continente=?, populacao=?, idioma=? WHERE id_pais=?");
            $stmt->bind_param("ssisi", $nome, $continente, $populacao, $idioma, $id_pais);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                throw new Exception("Erro ao atualizar país: " . $stmt->error);
            }
            break;

        case 'delete': // EXCLUIR país
            $id_pais = (int)($_POST['id_pais'] ?? 0);
            
            if ($id_pais <= 0) {
                throw new Exception("ID inválido");
            }

            // Prepara e executa DELETE
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
    // Se der qualquer erro, retorna em JSON
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}

// Fecha conexão com banco
$conn->close();
?>
