<?php
header("Access-Control-Allow-Origin: *");  // Allows all origins. For production, you might want to restrict this to specific origins.
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Adjust according to which HTTP methods you want to allow.
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allows the Content-Type header (and Authorization if needed)
	// retreive provided authtoken
    $token = $_POST['authtoken'];

    $hashedAuthToken = hash("sha256", $token);

    // establish connection to sql db
    require('db-credentials.php');
    $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);

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
            // There is exactly one user, and you can access their data
            $username = $user['username'];
            // return this information to the front end
            $response = ["message" => "Token valid", "username" => $username];
            echo json_encode($response);
        } else {
            // More than one user found - auth token was not unique
            $response = ["message" => "Token is not unique"];
            echo json_encode($response);
        }
    } else {
        // No user found with the provided authtoken
        $response = ["message" => "No username"];
            echo json_encode($response);
    }
?>
