| **User** | | |  
| ----- | ----- | ----- |  
| user_id | BIGINT | PRIMARY_KEY |  
| username | varchar(20) | UNIQUE |   
| email | varchar(320) | |          
| password | varchar(60) | password_hash(PASSWORD_BCRYPT) |  
| auth_token | json | |  
| OTP | char(8) | |  
<br/>

| **Friend** | | |    
| ----- | ----- | ----- |  
| frendship_id | BIGINT | PRIMARY_KEY |  
| user_id | BIGINT | FOREIGN_KEY -> User.user_id |  
| friend_id | BIGINT | FOREIGN_KEY -> User.user_id |  
| status | INT | 0 = Pending, 1 = Accepted, 2 = Close Friends |  
<br/>

| **Category** | | |    
| ----- | ----- | ----- |  
| category_id | BIGINT | PRIMARY_KEY |  
| user_id | BIGINT | FOREIGN_KEY -> User.user_id |  
| category_name | varchar(255) | |  
| color | INT | RGB color value |  
<br/>

| **Event** | | |  
| ----- | ----- | ----- |  
| event_id | BIGINT | primary_key |  
| name | varchar(255) | |  
| description | varchar(1023) | |  
| user_id | BIGINT | FOREIGN_KEY -> User.user_id |  
| category_id | BIGINT | FOREIGN_KEY -> Category.category_id |  
| start_date | DATETIME | DATETIME used for future proofing |
| duration | INT | Duration in minutes for the event |  
| does_repeat | BOOLEAN | TRUE = event repeats |  
| repeat_interval | INT | Duration in days between the start time of the events |  
| end_date | DATETIME | NULL if !does_repeat ELSE the maximum start date |  
<br/>

| **File** | | |  
| ----- | ----- | ----- |  
| file_id | BIGINT | PRIMARY_KEY |  
| user_id | BIGINT | FOREIGN_KEY -> User.user_id |  
| is_directory | BOOLEAN | TRUE = file is a directory |  
| parent_id | BIGINT | FOREIGN_KEY -> File.file_id |  
| file | BLOB | |            
| date_created | DATETIME | |  
| last_modified | DATETIME | |  
<br/>

| **Todo** | | |  
| ----- | ----- | ----- |  
| todo_id | BIGINT | PRIMARY_KEY |  
| user_id | BIGINT | FORIGN_KEY -> User.user_id |  
| name | varchar(255) | |  
| description | varchar(1023) | |  
| category_id | BIGINT | FOREIGN_KEY -> Category.category_id |  
| due_date | DATETIME | |  
| priority | INT | |  
<br/>  

## Acknowledgements  
Sam: Sam Anderson  
Dylan: Dylan Zinsley  
Marvin:  Marvin Pierre-Pierre  
Milton: Milton Morris  
Al-Kesna: Al-kesna Foster  
Ryan: Ryan Lacki  
