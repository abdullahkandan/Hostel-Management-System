<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get room occupancy data
        $roomNumber = $_GET['roomNumber'] ?? '';
        if (empty($roomNumber)) {
            echo json_encode(['success' => false, 'message' => 'Please provide a room number']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("SELECT * FROM rooms WHERE roomNumber = ?");
            $stmt->execute([$roomNumber]);
            $roomData = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($roomData) {
                $roomData['students'] = array_filter(explode(',', $roomData['students']));
                echo json_encode(['success' => true, 'data' => $roomData]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Room not found']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>