<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Handle feedback submission
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate feedback text
        if (empty($data['feedback']) || trim($data['feedback']) === '') {
            echo json_encode(['success' => false, 'message' => 'Please write your feedback before submitting']);
            exit;
        }

        // Validate required fields if not anonymous
        if (empty($data['isAnonymous']) && (empty($data['name']) || empty($data['rollNo']))) {
            echo json_encode(['success' => false, 'message' => 'Please provide your name and roll number, or choose to submit anonymously']);
            exit;
        }

        try {
            // If not anonymous, verify roll number
            if (empty($data['isAnonymous'])) {
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM registrations WHERE rollNo = ?");
                $stmt->execute([$data['rollNo']]);
                if ($stmt->fetchColumn() == 0) {
                    echo json_encode(['success' => false, 'message' => 'Invalid roll number']);
                    exit;
                }
            }

            // Insert feedback
            $stmt = $pdo->prepare("INSERT INTO feedback (id, feedback, rating, isAnonymous, name, rollNo, submissionDate) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $id = time();
            $stmt->execute([
                $id,
                $data['feedback'],
                $data['rating'],
                $data['isAnonymous'] ? 1 : 0,
                $data['isAnonymous'] ? null : $data['name'],
                $data['isAnonymous'] ? null : $data['rollNo']
            ]);

            echo json_encode(['success' => true, 'message' => 'Feedback submitted successfully']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>