<?php
    /*
    Script removes db records associating two users as friends (if any) and replaces with new records representing blocked status
    Can also be used to unblock someone
    Action: block (causes a block)
    Action: unblock (causes unblock)
    */

    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    $auth_token = hash("sha256", $_POST['authtoken']);
    $target_user = $_POST['username'];
    $action = $_POST['action'];

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

    if ($uid1 === $uid2) {
        $response = ["message"=> "failure", "error"=> "Provided authtoken and username are for same account"];
        echo json_encode($response);
        $mysqli->close();
        exit();
    }

    if ($action === "block") {
        // query will remove any records between these two users from the Friend table
        $stmt = $mysqli->prepare("DELETE FROM Friend WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)");
        $stmt->bind_param("iiii", $uid1, $uid2, $uid2, $uid1);
        $result = $stmt->execute();
        $stmt->close();

        // need to insert record that blocks the other user before returning
        // insert first record
        $stmt = $mysqli->prepare("INSERT INTO Friend (user_id, friend_id, status) VALUES (?, ?, 3)");
        $stmt->bind_param("ii", $uid1, $uid2);
        $result1 = $stmt->execute();
        $stmt->close();
        // insert second record
        $stmt = $mysqli->prepare("INSERT INTO Friend (user_id, friend_id, status) VALUES (?, ?, 4)");
        $stmt->bind_param("ii", $uid2, $uid1);
        $result2 = $stmt->execute();
        $stmt->close();
        $mysqli->close();

        if ($result1 and $result2) {
            $response = ["message" => "success"];
            echo json_encode($response);
        } else {
            $response = ["message" => "failure", "error"=> "could not insert records to block user"];
            echo json_encode($response);
        }
    } else if ($action === "unblock") {
        // ublock a user - must first check that THIS user is the one who blocked the other user
        $stmt = $mysqli->prepare("SELECT status FROM Friend WHERE user_id = ? AND friend_id = ?");
        $stmt->bind_param("ii", $uid1, $uid2);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows == 0) {
            // the users are not friends and there are no pending requests
            $response = ["message" => "failure", "error"=> "no current friend record between users - cannot unblock"];
            echo json_encode($response);
            $stmt->close();
            $mysqli->close();
            exit;
        }

        $stmt->bind_result($status);
        $stmt->fetch();
        $stmt->close();

        if ($status === 3) {
            // query will remove any records between these two users from the Friend table
            $stmt = $mysqli->prepare("DELETE FROM Friend WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)");
            $stmt->bind_param("iiii", $uid1, $uid2, $uid2, $uid1);
            $result = $stmt->execute();
            $stmt->close();
            if ($result) {
                $response = ["message" => "success"];
                echo json_encode($response);
            } else {
                $response = ["message" => "failure", "error"=> "could not remove current records during verified unblock"];
                echo json_encode($response);
            }
            $mysqli->close();
        } else {
            $response = ["message" => "failure", "error"=> "current status does not match expected value - cannot unblock"];
            echo json_encode($response);
            $mysqli->close();
        }
    } else {
        $mysqli->close();
        $response = ["message" => "failure", "error"=> "invalid action"];
        echo json_encode($response);
    }
?>