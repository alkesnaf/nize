<?php
/* 
Script is provided with an authtoken, a start date, and an end date
    - input is assumed to take form authtoken = <AUTHTOKEN>, startdate = <STARTDATE> and enddate = <ENDDATE>

Script retrieves all tasks for a specific user between start and end date (inclusive) and returns them in a list, in order by due date

DB Schema:
User(user_id, username, email, password, auth_token, OTP, birthday)
Todo(todo_id, user_id, name, description, category_id, due_date, priority, duration)
*/
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    // Retrieve posted credentials
    $hashed_auth = isset($_POST['authtoken']) ? hash("sha256", $_POST['authtoken']) : null;
    $start_date = isset($_POST['startdate']) ? $_POST['startdate'] : null;
    $end_date = isset($_POST['enddate']) ? $_POST['enddate'] : null;

    if (!$hashed_auth || !$start_date || !$end_date) {
        $response = ["message" => "Invalid input"];
        echo json_encode($response);
        exit;
    }

    // verify auth token and retrieve user_id
    require('db-credentials.php');
    $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);

    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    $stmt = $mysqli->prepare("SELECT user_id FROM User WHERE JSON_SEARCH(auth_token, 'one', ?) IS NOT NULL");
    $stmt->bind_param("s", $hashed_auth);
    $stmt->execute();

    if ($stmt->error) {
        die("Error: " . $stmt->error);
    }

    $stmt->store_result();
    if ($stmt->num_rows != 1) {
        $response = ["message" => "Error finding user"];
        echo json_encode($response);
        exit;
    }

    $stmt->bind_result($uid);
    $stmt->fetch();
    $stmt->close();

    // Retrieve users todo list items checking if any such items even exist
    $stmt = $mysqli->prepare("SELECT name, due_date FROM Todo WHERE user_id = ? AND ? <= due_date AND ? >= due_date");
    $stmt->bind_param("iss", $uid, $start_date, $end_date);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows < 1) {
        // if there are no tasks on the todolist
        $response = ["message" => "No tasks"];
        echo json_encode($response);
    } else {
        // if there are tasks on the todo list, return them to the front end
        $stmt->bind_result($todo_name, $todo_due);
        while ($stmt->fetch()) {
            $todoDetails[] = [
                "name" => $todo_name,
                "due" => $todo_due
            ];
        }

        $response = ["message" => $todoDetails];
        echo json_encode($response);
    }
    
    $stmt->close();
    $mysqli->close();
?>