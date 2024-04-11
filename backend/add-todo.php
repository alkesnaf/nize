<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
	header("Access-Control-Allow-Headers: Content-Type, Authorization");

	function addTodo($hashedAuthToken, $name,  $description, $due_date, $duration) {
		require('./db-credentials.php');
		$conn = new mysqli($host, $dbusername, $dbpassword, $dbname);
	    if ($conn->connect_error) {
			die("Connection failed: " . $conn->connect_error);
		}

		// Construct the SQL query with a prepared statement
		$sql = "SELECT * FROM User WHERE JSON_SEARCH(auth_token, 'one', ?) IS NOT NULL";

		// Create a prepared statement
		$stmt = $conn->prepare($sql);

		// Bind the parameter to the statement
		$stmt->bind_param("s", $hashedAuthToken);

		// Execute the query
		$stmt->execute();

		// Get the result
		$result = $stmt->get_result();

		// Check if at least one user was found
		if ($result->num_rows > 0) {
			// Fetch the first row (assuming only one user is found)
			$user = $result->fetch_assoc();
			// Check if there is exactly one user found
			if ($result->num_rows === 1) {
				$user_id = $user['user_id'];
			} else {
				return ["message" => "Token is not unique"];
			}
		} else {
			return ["message" => "Auth: " . $hashedAuthToken];
		}


	    $sql = $conn->prepare("INSERT INTO Todo (name, description, user_id, due_date, duration) VALUES (?, ?, ?, ?, ?)");
		$sql->bind_param("sssss", $name, $description, $user_id, $due_date, $duration);
	    $success = $sql->execute();
	    $conn->close();
	    return $success ? "Todo added successfully" : "Error adding todo";
	}
	$raw_post = file_get_contents("php://input");

	$data = json_decode($raw_post, true);

	$token = $data['authtoken'];
	$due_date = $data['due_date'];
	$duration = $data['duration'];
	$name = $data['name'];
	$description = $data['description'];
	$hat = hash("sha256", $token);
	$response = addTodo($hat, $name, $description, $due_date, $duration);
	echo json_encode(['message' => $response]);
?>

