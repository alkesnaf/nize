<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
	header("Access-Control-Allow-Headers: Content-Type, Authorization");

	function addEvent($hashedAuthToken, $start_date, $duration, $name, $description, $location, $eid) {
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
		
		$stmt = $conn->prepare("SELECT * FROM Event WHERE user_id = ? AND event_id = ?");
		$stmt->bind_param("ss", $user_id, $eid);
		$stmt->execute();
		$result = $stmt->get_result();

		if ($result->num_rows < 1) {
			return ["message" => "You are not editing your own event"];
		}


	    $sql = $conn->prepare("UPDATE Event set name=?, description=?, user_id=?, start_date=?, duration = ?, location=? WHERE event_id = ?");
		$sql->bind_param("sssssss", $name, $description, $user_id, $start_date, $duration, $location, $eid);
	    $success = $sql->execute();
	    $conn->close();
	    return $success ? "Event edited successfully" : "Error adding event";
	}
	$raw_post = file_get_contents("php://input");

	$data = json_decode($raw_post, true);

	$token = $data['authtoken'];
	$start_date = $data['start_date'];
	$duration = $data['duration'];
	$name = $data['name'];
	$description = $data['description'];
	$location = $data['location'];
	$eid = $data['event_id'];
	$hat = hash("sha256", $token);
	$response = addEvent($hat, $start_date, $duration, $name, $description, $location, $eid);
	echo json_encode(['message' => $response]);
?>

