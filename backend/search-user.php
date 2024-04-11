<?php
    // Invariants:
    // - Input is provided via HTTP POST request
    // - User table has format prescribed in project Schema
    // - Script is run from a machine with a fixed IP associated with UB
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        error_reporting(E_ALL);
        ini_set('display_errors', 1);

        // Retrieve posted input from the user
        $user = $_POST['user'];

        // Create a connection to the SQL database
        require('db-credentials.php');
        $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);

        // Check that the connection is established
        if ($mysqli->connect_error) {
            die("Connection failed: " . $mysqli->connect_error);
        }

        // Prepare a statement with placeholders
        $stmt = $mysqli->prepare("SELECT username FROM User WHERE username LIKE CONCAT(?, '%')");

        // Bind the parameter and execute the statement
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $result = $stmt->get_result();

        // Check if any users were found
        if ($result->num_rows > 0) {
            $users = array();
            while ($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
            echo json_encode($users);
         } 
        else {
            $response = ["message" => "No Users were found"];
            echo json_encode($response); // Return an empty array if no matches found
         }

        // Close the database connection
        $stmt->close();
        $mysqli->close();
    
?>
