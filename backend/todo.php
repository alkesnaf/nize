<?php
header("Access-Control-Allow-Origin: *");  // Allows all origins. For production, you might want to restrict this to specific origins.
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Adjust according to which HTTP methods you want to allow.
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allows the Content-Type header (and Authorization if needed)

function getEvents($date, $hashedAuthToken){    
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
        return ["message" => "Auth"];
	}
	$sql = "SELECT * FROM Todo WHERE user_id = ?";
    $stmt = $conn->prepare($sql);	
    $stmt->bind_param("s", $user_id);
	$stmt->execute();
    $result = $stmt->get_result();
	
	$ret_arr = array(); 
	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			$ret_arr[] = '{"name":"' . $row["name"] . '", "due_date":"' . 
			$row["due_date"].'", "todo_id":"'.$row["todo_id"].'", "user_id":"'
			. $row["user_id"] .'", "description":"' . $row["description"].
			'", "duration":"' . $row["duration"]. 
			'", "completed":' . $row["completed"]. '}';  
		}   
	}  

	$conn->close();
	return $ret_arr;
}
	
	$data = json_decode(file_get_contents("php://input"), true);
	$token = $_GET['authtoken'];	
	$hat = hash("sha256", $token);
	$response = getEvents($date, $hat);
	echo json_encode($response);
?>
