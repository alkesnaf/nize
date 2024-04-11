<?php
/* Invariants:
        - Register credentials are provided via a HTTP POST request with Content-Type: application/x-www-form-urlencoded or multipart/form-data
            - Username has key "username"
            - 1st Password has key "password1"
            - 2nd Password has key "password2"
            - Email has key "email"
            - Birthmonth has key "month"
            - Birthday had key "day"
            - Birthyear has key "year"
        - User table has format prescribed in project Schema
        - Script is run from machine with fixed IP associated with UB
    */

	header("Access-Control-Allow-Origin: *");  // Allows all origins. For production, you might want to restrict this to specific origins.
	header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Adjust according to which HTTP methods you want to allow.
	header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allows the Content-Type header (and Authorization if needed)
	
	$tgt_dir = "static/";

    //PHASE 1: verify they can register
    //retrieve username, email, password
    $email = htmlspecialchars($_POST['email'],ENT_NOQUOTES);
    $username = htmlspecialchars($_POST['username'], ENT_NOQUOTES);
    $pass1 = $_POST['password1'];
	$pass2 = $_POST['password2'];
	$profile_pic = $_FILES['profilePicture']['name'];
    
    //check that email is valid
    //$valid_e = strpos($email, '@');
    if($_POST['password1']===$_POST['password2']){
        //check that passwords match
        $valid_p = strcmp($_POST['password1'], $_POST['password2']);
        if($valid_p===0){
            //establish connection to sql db
            require('db-credentials.php');
            $mysqli = new mysqli($host, $dbusername, $dbpassword, $dbname);
        
            //check db for duplicate email
            
            //prepare a statement with placeholders
            $stmt = $mysqli->prepare("SELECT *  FROM User WHERE email = ?");

            //bind the parameters and execute the statement
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $stmt->store_result();

            //get the # of rows 
            $rows = $stmt->num_rows();
            if($rows===0){
                //check db for duplicate username
                
                //prepare a statement with placeholders
                $stmt = $mysqli->prepare("SELECT *  FROM User WHERE username = ?");

                //bind the parameters and execute the statement
                $stmt->bind_param("s", $username);
                $stmt->execute();
                $stmt->store_result();

                //get the result
                $rows = $stmt->num_rows();
                if($rows===0){
                //PHASE 2: getting data into db
                    //generate unique id
                    $id = $mysqli->insert_id;
                    $result = $mysqli->query("SELECT * FROM User Where user_id = $id");
                    while(mysqli_num_rows($result)!=0){
                        $id+=1;
                        $result = $mysqli->query("SELECT * FROM User Where user_id = $id");
                    }
                    //salt and hash password
                    $hashed_pw = password_hash($pass1, PASSWORD_BCRYPT);
                    //insert into db
                    $stmt = $mysqli->prepare("INSERT INTO User(user_id, username, email, `password`, auth_token, OTP ) VALUES (?, ?, ?, ?, NULL, NULL)");
                    $stmt->bind_param("ssss", $id, $username, $email, $hashed_pw);
                    $stmt->execute();
                    if($stmt){
						//if everything has gone right we can add the image
						$target_file = $tgt_dir . $username . "_" . "profile_pic";		
						$check = getimagesize($_FILES["profilePicture"]["tmp_name"]);
					    if($check !== false) {
							if (!file_exists($tgt_dir)) {
							    mkdir($tgt_dir, 0755, true); // Create the directory if it does not exist
							}	
							if (move_uploaded_file($_FILES["profilePicture"]["tmp_name"], $target_file)) {
								//successful
								//redirect to login
								$response = ["message" => "Register successful"];
								echo json_encode($response);
							} else {
								$response = ["message" => "something went wrong with pfp"];
								echo json_encode($response);
							}
						} else {
							$response = ["message" => "something went wrong with pfp check"];
							echo json_encode($response);
						}	
					}else{
                        //error
                        $response = ["message" => "something went wrong"];
                        echo json_encode($response);
                    }
                }else{
                    $response = ["message" => "an account with this username already exists"];
                    echo json_encode($response);
                }  
            }else{
                    //display "an account with this email use already exists"
                    $response = ["message" => "an account with this email already exists"];
                    echo json_encode($response);
            }  
        }else{
            //display "passwords do not match"
            $response = ["message" => "passwords do not match"];
            echo json_encode($response);
        }       
    }else{
        //redirect to register and set cookie so that frontend can display "invalid email"
        $response = ["message" => "not a valid email"];
        echo json_encode($response);
    }
$mysqli->close()
?>
