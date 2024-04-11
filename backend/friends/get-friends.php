<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    // script takes an auth token and returns a list of all their friends

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

    $stmt->bind_result($user_id, $user);
    $stmt->fetch();
    $stmt->close();

    // Construct the next SQL query with a prepared statement
    $stmt = $mysqli->prepare("SELECT u.username FROM Friend f join User u on f.friend_id = u.user_id 
                WHERE f.user_id = ? AND f.status = 2");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->store_result();

    // sad, no friends
    if ($stmt->num_rows <= 0) {
        $response = ["message"=> "none"];
        echo json_encode($response);
        $stmt->close();
        $mysqli->close();
        exit;
    }

    // Initialize an array to store friend usernames
    $friendUsernames = array();

    // Bind the result of the query to a variable
    $stmt->bind_result($friendUsername);

    // Fetch the results and store them in the array
    while ($stmt->fetch()) {
        $friendUsernames[] = $friendUsername;
    }

    $response = ["message" => "success", "friends" => $friendUsernames];
    echo json_encode($response);

    $stmt->close();
    $mysqli->close();
?>