const PORT = 8000

const express = require('express')
const { MongoClient, ObjectId  } = require('mongodb')
const  {v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cors = require('cors')
const app = express()

app.use(cors());
app.use(express.json());


const uri = 'mongodb+srv://smaczniutkietosty:mypassword@cluster0.oxudjvz.mongodb.net/?retryWrites=true&w=majority'
app.get('/', (req, res) => {
    res.json('Hello to my app')
})
app.post('/signup', async (req, res) => {

    const client = new MongoClient(uri)
    const { email, password } = req.body
    const generatedUserId = uuidv4()
    const hashedpassword = await bcrypt.hash(password, 10)

    try {
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const existingUser = await users.findOne({email})
        if (existingUser){
            return res.status(409).send('User already exists. Please login')

        }
        const sanitizedEmail = email.toLowerCase()

        const data = {
            user_id:generatedUserId,
            email:sanitizedEmail,
            hashed_password:hashedpassword
        }
        const insertedUser = await users.insertOne(data)

        const token = jwt.sign(insertedUser, sanitizedEmail, {
            expiresIn: 60 * 24,
        })
        res.status(201).json({token, userId: generatedUserId, email: sanitizedEmail})
    } catch (err) {
        console.log(err)
    }
})

app.post('/login', async (req, res) => {
    const client = new MongoClient(uri)
    const { email, password } = req.body

    try {
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const user = await users.findOne({email})

        const correctPassword = await bcrypt.compare(password, user.hashed_password)

        if (user && correctPassword) {
            const token = jwt.sign(
                user,
                email,
                {expiresIn: 60 * 24})
            res.status(201).json({token, userId: user.user_id, email})
        }
        res.status(400).send('Invalid')

    } catch (err) {
        console.log(err)
    }


})

app.get('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const userId = req.query.userId
    try{
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const query = { user_id: userId }
        const user = await users.findOne(query)
        res.send(user)
    } finally {
        await client.close()
    }
})

app.delete('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const userId = req.query.userId
    try {
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const query = { user_id: userId }
        const user = await users.deleteOne(query)
        res.send('DELETED')
    } finally {
        await client.close()
    }
})


app.get('/users',async (req, res) => {
    const client = new MongoClient(uri)

    try{
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const returnedUsers = await users.find().toArray()
        res.send(returnedUsers)

    } finally {
        await client.close()
    }
})

app.get('/gendered-users',async (req, res) => {
    const client = new MongoClient(uri)
    const gender = req.query.gender

    try{
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const query = { gender_identity: gender}
        const foundUsers = await users.find(query).toArray()
        res.send(foundUsers)

    } finally {
        await client.close()
    }
})


app.put('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const formData = req.body.values
    console.log(formData)
    try {

        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')

        const query = { user_id: formData.user_id }
        const updateDocument = {
            $set: {
                first_name: formData.first_name,
                dob_day: formData.dob_day,
                dob_month: formData.dob_month,
                dob_year: formData.dob_year,
                show_gender: formData.show_gender,
                gender_identity: formData.gender_identity,
                gender_interest: formData.gender_interest,
                url: formData.url,
                about:formData.about,
                matches:formData.matches

            }
        }
        const insertedUser = await users.updateOne(query, updateDocument)
        res.send(insertedUser)
    } finally {
        await client.close()
    }
})

app.patch('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const formData = req.body.values
    console.log(formData)
    try {

        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')

        const query = { user_id: formData.user_id }
        const updateDocument = {
            $set: {
                first_name: formData.first_name,
                dob_day: formData.dob_day,
                dob_month: formData.dob_month,
                dob_year: formData.dob_year,
                show_gender: formData.show_gender,
                gender_identity: formData.gender_identity,
                gender_interest: formData.gender_interest,
                about:formData.about,
            }
        }
        const modifiedUser = await users.updateOne(query, updateDocument)
        res.send(modifiedUser)
    } finally {
        await client.close()
    }
})



app.put('/addmatch', async (req, res) => {
    const client = new MongoClient(uri)
    const { userId, matchedUserId } = req.body
    try {
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const query = { user_id: userId}
        const updateDocument = {
            $push: { matches: { user_id: matchedUserId}}
        }
        const user = await users.updateOne(query, updateDocument)
        res.send(user)
    } finally {
        await client.close()
    }
})

app.get('/users', async (req, res) => {
    const client = new MongoClient(uri)
    const userIds = JSON.parse(req.query.userIds)
    try{
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')

        const pipeline = [
            {
                '$match': {
                    'user_id': {
                        '$in': userIds
                    }
                }
            }
        ]
        const foundUsers = await users.aggregate(pipeline).toArray()
        res.send(foundUsers)

    } finally {
        await client.close()
    }
})

app.post('/messages', async(req ,res) => {
    const client = new MongoClient(uri)
    const message = req.body.message
    try {
        await client.connect()
        const database =client.db('Tinder')
        const messages = database.collection('messages')
        const insertedmessage = await messages.insertOne(message)
        res.send(insertedmessage)

    } finally {
        await client.close()
    }
})
app.get('/messages',async (req, res) => {
    const client = new MongoClient(uri)
    const { userId, correspondingUserId } = req.query
   try{
        await client.connect()
       const database = client.db('Tinder')
       const messages = database.collection('messages')

       const query = {
           from_userId: userId, to_userId: correspondingUserId
       }

       const foundMessages = await messages.find(query).toArray()
       res.send(foundMessages)
   } finally {
       await client.close()
   }
}
)

app.delete('/message', async (req, res) => {
    const client = new MongoClient(uri)
    const messageId = req.query.messageId
    try {
        await client.connect()
        const database = client.db('Tinder')
        const messages = database.collection('messages')
        const toDelete = new ObjectId(messageId)
        const query = { _id: toDelete }
        const result = await messages.deleteOne(query)
        res.send('DELETED')


    } finally {
        await client.close()
    }
})

app.patch('/message', async (req, res) => {
    const client = new MongoClient(uri)
    const {messageId, editedMessage} = req.body.params
    try {
        await client.connect()
        const database = client.db('Tinder')
        const messages = database.collection('messages')
        const toEdited = new ObjectId(messageId)
        const query = { _id: toEdited}
        const updateDocument = {
            $set: {
                message: editedMessage
            }
        }
        const result = await messages.updateOne(query, updateDocument)
        res.send('EDITED')

    } finally {
        await client.close()
    }
})

app.listen(PORT,
    () => console.log(`Server running on port ${PORT}`))



