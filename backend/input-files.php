<?php
header('Access-Control-Allow-Origin: *'); // This allows all origins
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');


require('db-credentials.php');
$conn = new mysqli($host, $dbusername, $dbpassword, $dbname);

// Ensure the connection is established
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_FILES["myfile"])) {
    $hashedAuthToken = hash("sha256", $_POST['authtoken']);

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


    // Retrieve the filename
    $file_name = $conn->real_escape_string($_FILES["myfile"]["name"]);

    // Retrieve the filetype
    $file_type = $_FILES["myfile"]["type"];

    // Retireve the fileszie
    $file_size = $_FILES["myfile"]["size"];

    // The temporary location where the uploaded file is stored before moving to premaanent location
    $file_tmp_name = $_FILES["myfile"]["tmp_name"];

    $file_content = base64_encode(file_get_contents($file_tmp_name)); // Gets the file's contents and encode as base64

    // Prepared SQL Statement
    $sql = "INSERT INTO File (user_id, file_name, file_type, file_size, file_content) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    // Binds the parameters with their data type
    $stmt->bind_param("sssis", $user_id, $file_name, $file_type, $file_size, $file_content);

    // Send the binary data for the blob column
    $stmt->send_long_data(3, $file_content);

    // Execute the query
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["message" => "File uploaded and recorded successfully"]);
        // Delete the temporary file
        unlink($file_tmp_name);
    } else {
        echo json_encode(["message" => "File uploaded but failed to record in database"]);
    }

    $stmt->close();

} else {
    echo json_encode(["message" => "No file uploaded"]);
}
    // Close the connection
    $conn->close();
    
?>