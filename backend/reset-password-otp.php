<?php
 /* Invariants:
        - Login credentials are provided via a HTTP POST request with Content-Type: application/x-www-form-urlencoded or multipart/form-data
            - Email has key "email"
        - User table has format prescribed in project Schema
        - Script is run from machine with fixed IP associated with UB
    */
    
    //global var for creating otp
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // retrieve credentials
    $email =  htmlspecialchars($_POST['email'],ENT_NOQUOTES);

    //establish connection to sql db
    require('db-credentials.php');
    $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);
    
    //check that email is not empty
    $empty = false;
    if(strlen($email)==0){
        $empty = true;
    }
    if($empty===false){
        //check that email is valid 
        $valid = strpos($email, '@');
        if($valid){
            //verify that email exists in db
            $query = sprintf("SELECT *  FROM User WHERE email = '%s'",
            $mysqli->real_escape_string($email));
            $result = $mysqli->query($query);
            $notFound = mysqli_num_rows($result)==0;
            if(!$notFound){
                //generate otp and put in db
                $otp = substr(str_shuffle($characters),0,8);
                $stmt = $mysqli->prepare("UPDATE User SET OTP  = ? WHERE email = ?");
                $stmt->bind_param("ss", $otp, $email);
                $stmt->execute();
                //send email
                $msg = "This is your one time password to reset your password: " . $otp;
                mail($email, "Nize OTP", $msg);
                //successful
                $response = ["message" => "email sent"];
                echo json_encode($response);
            }else{
                //invalid email->redirect to this page
                $response = ["message" => "invalid email"];
                echo json_encode($response);
            }
        }else{
            //not an email
            $response = ["message" => "not an email"];
            echo json_encode($response);
        }
    }else{
    //no email given
        $response = ["message" => "no email givent"];
        echo json_encode($response);
    }
    $mysqli->close()
?>