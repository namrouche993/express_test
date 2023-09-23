const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');  // Import the cors package
const mongoose = require('mongoose'); // Import mongoose for MongoDB connection
const jwt = require('jsonwebtoken');
const generateRandomString = require('./Rand_test_server.js');

//const bcrypt = require('bcryptjs');


const app = express();
app.use(cookieParser());
app.use(cors({origin: 'http://localhost:3001',credentials: true}));  // Use the cors middleware
//app.use(cors({}));   //   U se the cors middleware
app.use(express.json()); // Add this middleware to parse request body as JSON

const secretKey = '425cac990d726cd10669e2957c6f2ebef6e2b1f4f61dffc011c7327e73031620'; // Replace with your actual secret key

mongoose.connect('mongodb://localhost:27017/mydatabase_for_test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a mongoose schema and model for the names
const nameSchema = new mongoose.Schema({
  name: String,
});

const Name = mongoose.model('Name', nameSchema);


app.get('/api/firstconnect',(req,res)=>{
  const idusername_first = generateRandomString(14);
  console.log(idusername_first);
  const token_first = jwt.sign({ idusername_first }, secretKey);
  //res.cookie('jwtToken_first', token_first, { httpOnly: true,  maxAge: 8640000000 });
  res.json({ idusername_first,token_first });
});

app.post('/api/addname', async (req, res) => {
  console.log('we are inside /api/addname')
  console.log(req.body);
  const receivedName = req.body.name;
  const receivedToke = req.body.token;
  const receivedusername = req.body.username;
  
  //const userAgent = req.headers['user-agent'];
  //console.log(userAgent);

  const decoded = jwt.verify(receivedToke, secretKey);
  console.log('decoded :')
  console.log(decoded)
  if (decoded.idusername_first !== receivedusername) {
    console.log('we are inside decoded.idusername !== idusername')
    return res.status(403).json({ message: 'Forbidden' });
  } else {
    console.log('they are equal')
  }

  try {
    // Create a new Name document and  save it to the database
    const newName = new Name({ name: receivedName });
    await newName.save();
    console.log('Name added to the database:', newName);
    res.status(200).send('Name added successfully.');
  } catch (error) {
    console.error('Error adding name to the database:', error);
    res.status(500).send('Internal server error.');
  }

})

app.get('/api/getlistnames', async (req,res)=>{
  console.log('we are inside api/getlistnames : ')
   try {
    // Retrieve all names from the database
    const names = await Name.find();
    console.log('List of names:', names);
    console.log(names)
    console.log('jsonstpar :')
    console.log(typeof names)
    console.log(names[0].name)
    //console.log(JSON.stringify(names))
    //console.log(JSON.parse(JSON.stringify(names)))
    //console.log(JSON.parse(JSON.stringify(names))[0][0] )
    res.status(200).json(names);

  } catch (error) {
    console.error('Error retrieving names from the database:', error);
    res.status(500).send('Internal server error.');
  }
})


app.post('/beacondata',express.json(), express.text(), (req, res) => {
  console.log('we are in becondata 5500 : ')
  // Handle the received data
  const receivedData = JSON.parse(req.body);
  console.log(receivedData)
  //console.log(receivedData[7][1])

  res.status(200).send('Data received successfully.');
});


app.listen(5500, () => {
  console.log('Server is running on port 5500 !!!!');
});
