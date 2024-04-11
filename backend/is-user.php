<?php
    header("Access-Control-Allow-Origin: *");
    // scripts sole purpose is to check if there is a registered account for the provided username
    $username = htmlspecialchars($_POST['username'], ENT_NOQUOTES);

    // establish connection to sql db
    require('db-credentials.php');
    $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);

    // Construct the SQL query with a prepared statement
    $stmt = $mysqli->prepare("SELECT * FROM User WHERE username = ?");

    // Bind the parameters and execute the statement
    $stmt->bind_param("s", $username);
    $stmt->execute();

    // Get the result
    $stmt->store_result();

    // Check the number of rows returned
    if ($stmt->num_rows === 1) {
        // If exactly one result is returned, return true
        $response = ["message" => "true"];
        echo json_encode($response);
    } else {
        // If not exactly one result is returned, return false
        $response = ["message" => "false"];
        echo json_encode($response);
    }

    // Close the prepared statement and the database connection
    $stmt->close();
    $mysqli->close();
?>