<?php
    /* 
    Script accepts a username, and authtoken, and a status to set
    authtoken is validated using the db to ensure this request comes from a valid user - username is retreived
    the current friend record of the user is checked to see if the provided status can be applied

    If the status is 1 - we are sending a new pending request from username1 to username2
        in this case, we should check that there are no current records existing between username1 and username2 in the db
        if there are no concerns, we can insert into the db:
            user_id = username1, friend_id = username2, status = 0 (signifying that user1 has sent a request to user2)
            user_id = username2, friend_id = username1, status = 1 (signifying that user2 has a request pending from user1)
    if the status is 2 - user is accepting a friend request sent by username
        in this case, we should check the db. There should be a record with status 1 for user_id = User(username -> authtoken), friend_id = username2
        there should also be a record with status 0 for user_id = username2, friend_id = User(username -> authtoken)
            If there are no concerns, we update both records in the db to have status 2
    */
    
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    $set_status = $_POST['status'];
    $target_user = $_POST['username'];
    $auth_token = hash("sha256", $_POST['authtoken']);

    if ($set_status != '1' and $set_status != '2') {
        $response = ["message"=> "failure", "error"=> "invalid status"];
        echo json_encode($response);
        exit();
    }

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

    if ($set_status === "1"){
        // sending a friend request to the other user
        // check that there is no prexisting record between these users
        $stmt = $mysqli->prepare("SELECT status FROM Friend WHERE user_id = ? AND friend_id = ?");
        $stmt->bind_param("ii", $uid1, $uid2);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows != 0) {
            $response = ["message" => "failure", "error"=> "prexisting records during add friend"];
            echo json_encode($response);
            $stmt->close();
            $mysqli->close();
            exit();
        }

        $stmt->close();

        // insert first record
        $stmt = $mysqli->prepare("INSERT INTO Friend (user_id, friend_id, status) VALUES (?, ?, 0)");
        $stmt->bind_param("ii", $uid1, $uid2);
        $result1 = $stmt->execute();
        $stmt->close();
        // insert second record
        $stmt = $mysqli->prepare("INSERT INTO Friend (user_id, friend_id, status) VALUES (?, ?, 1)");
        $stmt->bind_param("ii", $uid2, $uid1);
        $result2 = $stmt->execute();
        $stmt->close();

        if ($result1 and $result2) {
            $response = ["message" => "success"];
            echo json_encode($response);
            exit();
        } else {
            $response = ["message" => "failure", "error"=> "unable to update"];
            echo json_encode($response);
            exit();
        }
    } else {
        // check that the current record exists and currently has a status of 1
        $stmt = $mysqli->prepare("SELECT status FROM Friend WHERE user_id = ? AND friend_id = ?");
        $stmt->bind_param("ii", $uid1, $uid2);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows == 0) {
            $response = ["message" => "failure", "error"=> "no prexisting records"];
            echo json_encode($response);
            $stmt->close();
            $mysqli->close();
            exit();
        }

        $stmt->bind_result($current_status);
        $stmt->fetch();
        $stmt->close();

        if ($current_status != 1) {
            $response = ["message" => "failure", "error"=> "existing record has invalid status"];
            echo json_encode($response);
            $mysqli->close();
            exit();
        }
        
        // update this users record
        $stmt = $mysqli->prepare("UPDATE Friend SET status = 2 WHERE user_id = ? AND friend_id = ?");
        $stmt->bind_param("ii", $uid1, $uid2);
        $result1 = $stmt->execute();
        $stmt->close();
        // update other record
        $stmt = $mysqli->prepare("UPDATE Friend SET status = 2 WHERE user_id = ? AND friend_id = ?");
        $stmt->bind_param("ii", $uid2, $uid1);
        $result2 = $stmt->execute();
        $stmt->close();
        $mysqli->close();

        if ($result1 and $result2) {
            $response = ["message" => "success"];
            echo json_encode($response);
            exit();
        } else {
            $response = ["message" => "failure", "error"=> "unable to update"];
            echo json_encode($response);
            exit();
        }
    }
?>