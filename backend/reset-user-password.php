<?php
    /* Invariants:
        - Login credentials are provided via a HTTP POST request with Content-Type: application/x-www-form-urlencoded or multipart/form-data
            - Username has key "username"
            - One-time password has key "otp"
            - New password has key "npassword"
            - Confirm new password has key "cpassword"
        - User table has format prescribed in project Schema
        - Script is run from a machine with a fixed IP associated with UB
    */

    // Retrieve posted credentials
    $user = htmlspecialchars($_POST['username'], ENT_NOQUOTES);
    $otp = $_POST['otp'];
    $npass = $_POST['npassword'];
    $cpass = $_POST['cpassword'];

    // Establish connection to SQL db
    require('db-credentials.php');
    $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);

    // Check for connection errors
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    // Prepare a SELECT statement using a prepared statement
    $stmt = $mysqli->prepare("SELECT user_id, OTP, password FROM User WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->store_result();

    // Check if a record was retrieved
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($uid, $storedOTP, $storedPassword);
        $stmt->fetch();
        
        // Verify OTP
        if ($otp === $storedOTP) {
            // OTP is valid, verify passwords match
            if ($npass === $cpass) {
                // User provided a valid username, OTP, and matching passwords. Set a new password
                
                // Hash the provided password
                $new_pass = password_hash($npass, PASSWORD_BCRYPT);

                // Prepare an UPDATE statement using a prepared statement
                $stmt = $mysqli->prepare("UPDATE User SET password = ?, OTP = NULL, auth_token = NULL WHERE user_id = ?");
                $stmt->bind_param("si", $new_pass, $uid);
                
                if ($stmt->execute()) {
                    // Return success message to the front end
                    $response = ["message" => "Success"];
                    echo json_encode($response);
                } else {
                    // Return failure message to the front end
                    $response = ["message" => "Failed to update password"];
                    echo json_encode($response);
                }
            } else {
                // Return failure message - non-matching passwords to the front end
                $response = ["message" => "Provided passwords do not match"];
                echo json_encode($response);
            }
        } else {
            // Return failure message - provided OTP does not match to the front end
            $response = ["message" => "Invalid OTP"];
            echo json_encode($response);
        }
    } else {
        // No record with this username was found
        $response = ["message" => "Invalid username"];
        echo json_encode($response);
    }

    // Close connection
    $mysqli->close();
?>