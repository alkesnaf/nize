<?php
    /*
    Script removes db records associating two users as friends
    Can be used to cancel a friend request or remove a friend (block them from viewing your calendar)
    */

    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    $auth_token = hash("sha256", $_POST['authtoken']);
    $target_user = $_POST['username'];

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

    // now need the second user_id
    // Construct the SQL query with a prepared statement
    $stmt = $mysqli->prepare("SELECT user_id FROM User WHERE username = ?");

    // Bind the parameters and execute the statement
    $stmt->bind_param("s", $target_user);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows != 1) {
        // only gets executed if there is an error in the provided username2
        $response = ["message" => "failure", "error"=> "could not find target user"];
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

    // final query will remove any records between these two users from the Friend table
    $stmt = $mysqli->prepare("DELETE FROM Friend WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)");
    $stmt->bind_param("iiii", $uid1, $uid2, $uid2, $uid1);
    $result = $stmt->execute();
    $stmt->close();
    $mysqli->close();

    $response = ["message" => "success", "result" => $result];
    echo json_encode($response);
?>