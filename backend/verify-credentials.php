<?php
    // Invariants:
    // - Login credentials are provided via a HTTP POST request with Content-Type: application/x-www-form-urlencoded or multipart/form-data
    //   - Username has key "username"
    //   - Password has key "password"
    // - User table has format prescribed in project Schema
    // - Script is run from machine with fixed IP associated with UB
	header("Access-Control-Allow-Origin: *");  // Allows all origins. For production, you might want to restrict this to specific origins.
	header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Adjust according to which HTTP methods you want to allow.
	header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allows the Content-Type header (and Authorization if needed)

    // Retrieve posted credentials
    $user = htmlspecialchars($_POST['username'], ENT_NOQUOTES);
    $pass = $_POST['password'];

    // Establish connection to SQL db
    require('db-credentials.php');
    $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);

    // Prepare a statement with placeholders
    $stmt = $mysqli->prepare("SELECT * FROM User WHERE username = ?");

    // Bind the parameters and execute the statement
    $stmt->bind_param("s", $user);
    $stmt->execute();

    // Get the result
    $result = $stmt->get_result();

    // Process results
    if ($data = $result->fetch_assoc()) {
        if (password_verify($pass, $data['password'])) {
            // This user has provided correct credentials, generate a new auth token
            $str = rand();
            $token = hash("sha256", $str);
            $hash = hash("sha256", $token);

            // See if there are other auth_tokens for the user
            if ($tklist = $data['auth_token']) {
                $tkarr = json_decode($tklist);
                array_push($tkarr, $hash);
                if (count($tkarr) > 5) {
                    // Pop an old token if there are already 5 saved for this user
                    array_shift($tkarr);
                }
            } else {
                // If no auth tokens, we can create a new JSON string
                $tkarr = [$hash];
            }

            $tokenjson = json_encode($tkarr);
            $uid = $data['user_id'];

            // Update the record with the new token using a prepared statement
            $updateStmt = $mysqli->prepare("UPDATE User SET auth_token = ? WHERE user_id = ?");
            $updateStmt->bind_param("si", $tokenjson, $uid);
            $updateStmt->execute();
            $updateStmt->close();

            // Return the auth token to the front end
            $response = ["message" => "Login successful", "authtoken" => $token, "user_id"=>$uid];
            echo json_encode($response);
        } else {
            // Incorrect password
            $response = ["message" => "Bad password"];
            echo json_encode($response);
        }
    } else {
        // Username does not exist
        $response = ["message" => "No username"];
        echo json_encode($response);
    }

    // Close the connection
    $stmt->close();
    $mysqli->close();
?>
