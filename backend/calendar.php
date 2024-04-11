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

	$sql = "SELECT * FROM Event WHERE user_id = ? AND DATE(start_date) = ?";
    $stmt = $conn->prepare($sql);	
    $stmt->bind_param("ss", $user_id, $date);
	$stmt->execute();
    $result = $stmt->get_result();
	
	$ret_arr = array(); 
    if ($result->num_rows > 0) {
    // output data of each row 100% copped from SO
		while($row = $result->fetch_assoc()) {
			//echo "event_id: " . $row["event_id"]. " - Name: " . $row["name"]. " " . $row["description"];
			//echo $row["name"];
			$ret_arr[] = '{"name":"' . $row["name"] . '", "description":"' . $row["description"] . '", "start_date":"' .
			   	$row["start_date"]. '","duration":"'. $row["duration"]. '","event_id":"'. $row["event_id"].'", "location":"'.$row["location"] .'", "is_shared":false}';
		}   
	}  
	
	$sql = "SELECT * FROM Event INNER JOIN Shared WHERE Shared.user_id= ? AND DATE(Event.start_date) = ? AND Shared.event_id = Event.event_id";
    $stmt = $conn->prepare($sql);	
    $stmt->bind_param("ss", $user_id, $date);
	$stmt->execute();
    $result = $stmt->get_result();
	
	if ($result->num_rows > 0){
		while($row = $result->fetch_assoc()) {
			$ret_arr[] = '{"name":"' . $row["name"] . '", "description":"' . $row["description"] . '", "start_date":"' .
			   	$row["start_date"]. '","duration":"'. $row["duration"]. '","event_id":"'. $row["event_id"].'", "location":"'.$row["location"] .'", "is_shared":true}';
		}
	}
	return $ret_arr;

	$conn->close();
}
	
	$data = json_decode(file_get_contents("php://input"), true);
	$date = $_GET['date'];
	$token = $_GET['authtoken'];	
	$hat = hash("sha256", $token);
	$response = getEvents($date, $hat);
	echo json_encode($response);
?>
