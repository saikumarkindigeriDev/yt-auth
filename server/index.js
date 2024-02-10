const express=require('express') 

const mysql=require('mysql2') 

const cors=require("cors") 
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt=require('bcrypt')

const app=express() 

app.use(cors());



app.use(express.urlencoded({extended: false}))
app.use(express.json())


const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'youtubedb'
})



app.post('/register', async(req, res) => {
    const { username, email, password ,confirmPassword} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    
    const checkUserSql = `SELECT * FROM reusers WHERE username =?   LIMIT 1`;
   const value=[username]
  
    connection.query(checkUserSql,value, (err, results) => {
      if (err) {
        console.error('Error checking user existence:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (results.length > 0) {
          
          res.status(409).json({ error: 'User already registered' });
        } else {
          
          const insertUserSql = 'INSERT INTO reusers (username, email, password) VALUES (?, ?,?)';
          const insertUserValues = [username, email, hashedPassword];
  
          connection.query(insertUserSql, insertUserValues, (err, results) => {
            if (err) {
              console.error('Error inserting user:', err);
              res.status(500).json({ error: 'Internal Server Error' });
            } else {
              console.log('User registered successfully');
              res.status(200).json({ message: 'User registered successfully' });
            }
          });
        }
      }
    });
  });
  
  app.post('/login',(req,res)=>{

    const {username,password}=req.body
    const query = 'SELECT * FROM reusers WHERE username = ? ';
  const values = [username]

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
    
      return;
    }
    console.log(results[0])
    const data = results;
    console.log(data)
    const token = jwt.sign({ userId: data.id, username: data.username }, 'your_secret_key', { expiresIn: '24h' });
    if (data) {
        
        const isPasswordMatched=bcrypt.compare(password,data.password) 
        if (isPasswordMatched){
            console.log("Password Matched")

            

    
            return res.status(200).json({token})

           
        }else{ 
            console.log("Password didn't Matched")
            return res.json("Password didn't Matched")
           
        }
     
       
      
        }else{
          console.log('User not found');
         return res.json("You are not registerd")
        }
  })

})

 
app.listen(6000, () => {
  console.log(`Server is running on port 6000`);
});