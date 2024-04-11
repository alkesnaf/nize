<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    // script accepts two usernames and returns the friendship status between them
    $username1 = $_POST['username1'];
    $username2 = $_POST['username2'];
    // need auth token to authenticate the person requesting this info is username1
    $auth_token = hash("sha256", $_POST['authtoken']);

    // establish connection to sql db
    require('../db-credentials.php');
    $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);

    // Construct the SQL query with a prepared statement
    $stmt = $mysqli->prepare("SELECT user_id, username FROM User WHERE JSON_SEARCH(auth_token, 'one', ?) IS NOT NULL");
    $stmt->bind_param("s", $auth_token);
    $stmt->execute();
    $stmt->store_result();

    // if we do not have exactly one corresponding user
    if ($stmt->num_rows != 1) {
        $response = ["message"=> "failure", "error"=> "could not validate user"];
        echo json_encode($response);
        $stmt->close();
        $mysqli->close();
        exit;
    }

    $stmt->bind_result($uid1, $user);
    $stmt->fetch();
    $stmt->close();

    // if provided username does not match the username associated with the authtoken
    if (!($user === $username1)) {
        $response = ["message"=> "failure", "error"=> "user mismatch"];
        echo json_encode($response);
        $mysqli->close();
        exit;
    }

    // Construct the SQL query with a prepared statement
    $stmt = $mysqli->prepare("SELECT user_id FROM User WHERE username = ?");

    // Bind the parameters and execute the statement
    $stmt->bind_param("s", $username2);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows != 1) {
        // only gets executed if there is an error in the provided username2
        $response = ["message" => "failure"];
        echo json_encode($response);
        // Close the prepared statement and the database connection
        $stmt->close();
        $mysqli->close();
        exit;
    }

    // get the result
    $stmt->bind_result($uid2);
    $stmt->fetch();
    $stmt->close();

    // now need the friendship status of this pair of users
    $stmt = $mysqli->prepare("SELECT status FROM Friend WHERE user_id = ? AND friend_id = ?");
    $stmt->bind_param("ii", $uid1, $uid2);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        // the users are not friends and there are no pending requests
        $response = ["message" => "success", "status" => -1];
        echo json_encode($response);
        $stmt->close();
        $mysqli->close();
        exit;
    }

    $stmt->bind_result($status);
    $stmt->fetch();
    $stmt->close();
    $mysqli->close();

    if ($status === 0) {
        // pending friendship
        $response = ["message" => "success", "status" => 0];
        echo json_encode($response);
    } else if ($status === 1) {
        // pending request
        $response = ["message" => "success", "status" => 1];
        echo json_encode($response);
    } else if ($status === 2) {
        // current friends
        $response = ["message" => "success", "status" => 2];
        echo json_encode($response);
    } else if( $status === 3) {
        $response = ["message"=> "success", "status"=> 3];
        echo json_encode($response);
    } else if ( $status === 4) {
        $response = ["message"=> "success", "status"=> 4];
        echo json_encode($response);
    } else {
        $response = ["message" => "failure"];
        echo json_encode($response);
    }    
?>