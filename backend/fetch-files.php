<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
error_reporting(E_ALL);
ini_set('display_errors', 1);

function getFiles($hashedAuthToken) {
    // Create a connection to the SQL database
    require('db-credentials.php');

    $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);


    // Check that the connection is established
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    // Construct the SQL query with a prepared statement
    $sql = "SELECT * FROM User WHERE JSON_SEARCH(auth_token, 'one', ?) IS NOT NULL";

    // Create a prepared statement
    $stmt = $mysqli->prepare($sql);
    
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

    $sql = "SELECT file_name, file_content, date_created, last_modified, file_type FROM File WHERE user_id = ?";
    $stmt = $mysqli->prepare($sql);

    // Bind the parameter to the statement
    $stmt->bind_param("i", $user_id); // Assuming user_id is an integer

    // Execute the query
    $stmt->execute();

    // Get the result
    $result = $stmt->get_result();
    $ret_arr = array();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            //$row['file_content'] = base64_encode($row['file_content']);
            $ret_arr[] = $row; // Push the row directly to the array
        }
        return $ret_arr;
    } else {
        // No files found for the user
        return []; // Return an empty array if no files found
    }
	
	// Close the database connection
	//$mysqli->close();

}

$data = json_decode(file_get_contents("php://input"), true);
$token = $_GET['authtoken'];
$hat = hash("sha256", $token);
$response = getFiles($hat);

// Output the data as JSON
echo json_encode($response);
?>