<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Handle payment submission
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (empty($data['name']) || empty($data['rollNo']) || empty($data['amount']) || 
            empty($data['paymentDate']) || empty($data['paymentMethod']) || empty($data['transactionCode'])) {
            echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
            exit;
        }

        // Validate amount
        if ($data['amount'] <= 0) {
            echo json_encode(['success' => false, 'message' => 'Please enter a valid amount']);
            exit;
        }

        try {
            // Check if roll number exists
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM registrations WHERE rollNo = ?");
            $stmt->execute([$data['rollNo']]);
            if ($stmt->fetchColumn() == 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid roll number']);
                exit;
            }

            // Insert payment
            $stmt = $pdo->prepare("INSERT INTO payments (id, name, rollNo, amount, paymentDate, paymentMethod, transactionCode, submissionDate, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'submitted')");
            $id = time();
            $stmt->execute([$id, $data['name'], $data['rollNo'], $data['amount'], $data['paymentDate'], 
                $data['paymentMethod'], $data['transactionCode']]);

            echo json_encode(['success' => true, 'message' => "Payment of ₹{$data['amount']} has been recorded for {$data['name']}"]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'GET':
        // Validate payment status
        $rollNo = $_GET['rollNo'] ?? '';
        if (empty($rollNo)) {
            echo json_encode(['success' => false, 'message' => 'Please provide a roll number']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM payments WHERE rollNo = ? AND status = 'submitted'");
            $stmt->execute([$rollNo]);
            $isPaid = $stmt->fetchColumn() > 0;

            echo json_encode([
                'success' => true,
                'isPaid' => $isPaid,
                'message' => $isPaid ? 'Payment verified successfully' : 'Payment not found'
            ]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>