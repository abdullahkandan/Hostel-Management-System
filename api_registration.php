<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Handle registration submission
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (empty($data['name']) || empty($data['rollNo']) || empty($data['email']) || 
            empty($data['phone']) || empty($data['course']) || empty($data['year'])) {
            echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
            exit;
        }

        // Validate email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
            exit;
        }

        // Validate phone
        if (!preg_match('/^[\d\s\-\+\(\)]+$/', $data['phone']) || strlen($data['phone']) < 10) {
            echo json_encode(['success' => false, 'message' => 'Please enter a valid phone number']);
            exit;
        }

        try {
            // Check if roll number already exists
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM registrations WHERE rollNo = ?");
            $stmt->execute([$data['rollNo']]);
            if ($stmt->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'message' => 'Roll number already registered']);
                exit;
            }

            // Get available rooms
            $stmt = $pdo->query("SELECT roomNumber FROM rooms WHERE occupied < capacity");
            $availableRooms = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Allocate room
            $allocatedRoom = !empty($data['roomPreference']) && in_array($data['roomPreference'], $availableRooms)
                ? $data['roomPreference']
                : $availableRooms[array_rand($availableRooms)];

            // Insert registration
            $stmt = $pdo->prepare("INSERT INTO registrations (id, name, rollNo, email, phone, course, year, roomPreference, allocatedRoom, registrationDate) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
            $id = time();
            $stmt->execute([$id, $data['name'], $data['rollNo'], $data['email'], $data['phone'], 
                $data['course'], $data['year'], $data['roomPreference'] ?? null, $allocatedRoom]);

            // Update room occupancy
            $stmt = $pdo->prepare("UPDATE rooms SET occupied = occupied + 1, 
                students = CONCAT(COALESCE(students, ''), ?, ',') WHERE roomNumber = ?");
            $stmt->execute([$data['name'], $allocatedRoom]);

            echo json_encode([
                'success' => true,
                'message' => 'Registration successful! Room ' . $allocatedRoom . ' allocated.',
                'data' => ['allocatedRoom' => $allocatedRoom, 'name' => $data['name']]
            ]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>