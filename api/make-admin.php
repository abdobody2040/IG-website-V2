<?php
// ── api/make-admin.php ────────────────────────────────────────────────────────
// One-time utility script to make instantgrow.net@gmail.com an admin.
// DELETE THIS FILE AFTER RUNNING FOR SECURITY!

require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $targetEmail = 'instantgrow.net@gmail.com';
    $defaultPassword = 'AdminPassword2026!'; // Change after initial login if inserting new account

    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, email, role FROM users WHERE email = ?");
    $stmt->execute([$targetEmail]);
    $user = $stmt->fetch();

    if ($user) {
        // Promote existing user to admin
        $update = $pdo->prepare("UPDATE users SET role = 'admin', verified = 1, updated = NOW(3) WHERE email = ?");
        $update->execute([$targetEmail]);
        echo json_encode([
            'status' => 'success',
            'action' => 'promoted',
            'message' => "User {$targetEmail} was successfully promoted to admin role!",
            'user_id' => $user['id']
        ], JSON_PRETTY_PRINT);
    } else {
        // Create new admin user
        $newId = 'usr_' . bin2hex(random_bytes(8));
        $passwordHash = password_hash($defaultPassword, PASSWORD_BCRYPT);
        
        $insert = $pdo->prepare("
            INSERT INTO users (id, email, password_hash, name, display_name, role, verified, created, updated)
            VALUES (?, ?, ?, 'Instant Grow Admin', 'Admin', 'admin', 1, NOW(3), NOW(3))
        ");
        $insert->execute([$newId, $targetEmail, $passwordHash]);

        echo json_encode([
            'status' => 'success',
            'action' => 'created',
            'message' => "Admin user {$targetEmail} was created successfully!",
            'temporary_password' => $defaultPassword,
            'user_id' => $newId
        ], JSON_PRETTY_PRINT);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
