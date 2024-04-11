<?php
header("Access-Control-Allow-Origin: *");  // Allows all origins. For production, you might want to restrict this to specific origins.
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Adjust according to which HTTP methods you want to allow.
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allows the Content-Type header (and Authorization if needed)
	
$tgt_dir = "static/";

$username = $_GET['username'];

if (!file_exists($tgt_dir . $username)) {
	//take a default image
	echo "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/static/default_profile_pic";
}else{
	//grab actual
	echo "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/static/" . $username . "_profile_pic";
}

?>
