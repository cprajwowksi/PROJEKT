
const PORT = 8000

const yup = require('yup');
const express = require('express')
const {MongoClient, ObjectId} = require('mongodb')
const {v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cors = require('cors')
const app = express()

app.use(cors());
app.use(express.json());

const userSchema = yup.object({
    user_id: yup.string().required(),
    about: yup.string().required(),
    dob_day: yup.number().required().max(31),
    dob_month: yup.number().required().max(12),
    dob_year: yup.number().required().max(2024),
    first_name: yup.string().required(),
    gender_identity: yup.string().required().oneOf(['man', 'woman', 'more']),
    gender_interest: yup.string().required().oneOf(['man', 'woman', 'more']),
    show_gender: yup.boolean().required(),
    nation: yup.string().required(),
});

const messageSchema = yup.object({
    timestamp: yup.date().required(),
    from_userId: yup.string().required(),
    to_userId: yup.string().required(),
    message: yup.string().required()
})

const uri = 'mongodb+srv://smaczniutkietosty:mypassword@cluster0.oxudjvz.mongodb.net/?retryWrites=true&w=majority'
app.get('/', (req, res) => {
    res.json('Hello to my app')
})
app.post('/signup', async (req, res) => {

    const client = new MongoClient(uri)
    const {email, password, first_name, dob_day, dob_month, dob_year, show_gender, gender_identity, gender_interest, url, about, nation} = req.body
    const generatedUserId = uuidv4()
    const hashedpassword = await bcrypt.hash(password, 10)
    try {
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const existingUser = await users.findOne({email})
        if (existingUser) {
            return res.status(409).send('User already exists. Please login')

        }
        const sanitizedEmail = email.toLowerCase()

        function validateEmail(email) {
            const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(email);
        }

        if (!validateEmail(sanitizedEmail)) {
            return res.status(400).send("Niepoprawny email")
        }

        const data = {
            user_id: generatedUserId,
            email: sanitizedEmail,
            hashed_password: hashedpassword,
            first_name: first_name,
            dob_day: dob_day,
            dob_month: dob_month,
            dob_year: dob_year,
            show_gender: show_gender,
            gender_identity: gender_identity,
            gender_interest: gender_interest,
            url: url,
            about: about,
            matches: [],
            nation: nation
        }

        await userSchema.validate(data, { abortEarly: false })
        const insertedUser = await users.insertOne(data)

        const token = jwt.sign(insertedUser, sanitizedEmail, {
            expiresIn: 60 * 24,
        })
        res.status(201).json({token, userId: generatedUserId, email: sanitizedEmail})
    } catch (err) {
        return res.status(400).send('Nieprawidłowe parametry')
    } finally {
        await client.close()
    }
})

app.post('/login', async (req, res) => {
    const client = new MongoClient(uri)
    const {email, password} = req.body

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
            console.log(token)
            return res.status(201).json({token, userId: user.user_id, email})
        }
        return res.status(400).send('Invalid')

    } catch (err) {
        console.log(err)
    }


})

app.get('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const userId = req.query.userId
    client.connect()
        .then(() => {
            const database = client.db('Tinder');
            const users = database.collection('users');
            const query = { user_id: userId };
            return users.findOne(query);
        })
        .then((user) => {
            if (user) {
                return res.send(user)
            } else {
                return res.send('Nie znaleziono użytkownika o podanym ID')
            }
        })
        .catch((err) => {
            console.error(err)
        })
        .finally(() => client.close());
});

app.delete('/user', async (req, res) => {
    const client = new MongoClient(uri);
    const userId = req.query.userId;

    try {
        await client.connect();
        const database = client.db('Tinder');
        const users = database.collection('users');
        const query = { user_id: userId };

        const result = await users.deleteOne(query);

        if (result.deletedCount === 0) {
            res.send('Nikogo nie usunięto, nie ma użytkownika o takim ID');
        } else {
            res.send(`Usunięto użytkownika. Liczba usuniętych: ${result.deletedCount}`);
        }
    } finally {
        await client.close();
    }
});


app.get('/users', async (req, res) => {
    const client = new MongoClient(uri)

    try {
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const returnedUsers = await users.find().toArray()
        res.send(returnedUsers)

    } finally {
        await client.close()
    }
})

app.get('/gendered-users', async (req, res) => {
    const client = new MongoClient(uri);
    const userId = req.query.userId;

    try {
        await client.connect();
        const database = client.db('Tinder');
        const users = database.collection('users');
        const userquery = { user_id: userId };
        const user = await users.findOne(userquery);

        if (user === null) {
            return res.status(404).send('Nie ma takiego użytkownika');
        }

        const minAge = user.dob_year - 4;
        const maxAge = user.dob_year + 4;

        const query = {
            gender_identity: user.gender_interest,
            nation: user.nation,
            dob_year: { $gte: minAge, $lte: maxAge },
            user_id: { $nin: user.matches }
        };

        const foundUsers = await users.find(query).toArray();
        res.send(foundUsers);
    } catch(err) {
        console.log(err)
    }
    finally
    {
        await client.close();
    }
});



app.put('/user', async (req, res) => {
    const client = new MongoClient(uri)
    const formData = req.body.values
    try {

        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')

        const query = {user_id: formData.user_id}
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
                about: formData.about,
                matches: formData.matches

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

        await userSchema.validate(formData, { abortEarly: false });
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
                about: formData.about,
                nation: formData.nation
            }
        }

        const existingUser = await users.findOne(query);

        if (!existingUser) {
            return res.status(404).send('Użytkownik nie istnieje');
        }

        const isUpdateNeeded = Object.keys(updateDocument.$set).some(key => existingUser[key] !== formData[key]);

        if (!isUpdateNeeded) {
            return res.status(409).send('Nowe dane są takie same jak obecne');
        }

        const modifiedUser = await users.updateOne(query, updateDocument)
        return res.send(modifiedUser)
    } catch (err) {
        return res.status(400).send('Nieprawidłowe parametry')
    }
    finally {
        await client.close()
    }
})


app.put('/match', async (req, res) => {
    const client = new MongoClient(uri)
    const {userId, matchedUserId} = req.body
    try {
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const query = {user_id: userId}
        const gosc = await users.findOne(query)
        const query2 = { user_id: matchedUserId}
        const match = await users.findOne(query2)
        if (match === null){
            return res.status(404).send('Nie ma takiego użytkownika')
        }

        if (gosc.matches.filter((x) => x.user_id === matchedUserId).length !== 0){
            return res.status(409).send('Wystarczy jedno w bazie')
        }

        const updateDocument = {
            $push: {matches: {user_id: matchedUserId}}
        }
        const user = await users.updateOne(query, updateDocument)
        res.send(user)
    } catch (err){
        res.status(404).send('Zle parametry')
    }
    finally {
        await client.close()
    }
})
app.delete('/match', async (req, res) => {
    const client = new MongoClient(uri)
    const {userId, matchedUserId} = req.body
    try {
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const query = {user_id: userId}

        const updateDocument = {
            $pull: {matches: {user_id: matchedUserId}}
        }
        const gosc = await users.findOne(query)

        if (gosc.matches.filter((x) => x.user_id === matchedUserId).length === 0){
            return res.status(404).send('Nie ma czego usunac')
        }

        const user = await users.updateOne(query, updateDocument)
        res.send(user)
    } catch (err){
        res.status(404).send('Zle parametry')
    }
    finally
    {
        await client.close()
    }
})

app.get('/users', async (req, res) => {
    const client = new MongoClient(uri)
    const userIds = JSON.parse(req.query.userIds)
    try {
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

app.post('/messages', async (req, res) => {
    const client = new MongoClient(uri)
    const message = req.body.message
    try {
        await client.connect()
        const database = client.db('Tinder')

        const users= database.collection('users')

        const messages = database.collection('messages')

        await messageSchema.validate(message, { abortEarly: false });

        const usersQuery = { $or: [{ user_id: message.from_userId }, { user_id: message.to_userId }] };

        const foundUsers = await users.find(usersQuery).toArray()

        if (foundUsers.length === 0 ){
            return res.status(404).send('Nie ma takich użytkowników')
        }
        if (foundUsers.length === 1 ) {
            return res.status(404).send('Nie ma jednego użytkownika')
        }
        const insertedmessage = await messages.insertOne(message)
        res.send(insertedmessage)
    } catch {
        res.status(400).send('Zle parametry')
    }
    finally {
        await client.close()
    }
})
app.get('/messages', async (req, res) => {
        const client = new MongoClient(uri)
        const {userId, correspondingUserId} = req.query
        try {
            await client.connect()
            const database = client.db('Tinder')
            const messages = database.collection('messages')
            const users = database.collection('users')
            if (userId === undefined || correspondingUserId === undefined){
                return res.status(400).send('Zle parametry')
            }

            const usersQuery = { $or: [{ user_id: userId }, { user_id: correspondingUserId }] };
            const foundUsers = await users.find(usersQuery).toArray()

            if (foundUsers.length === 0 ){
                return res.status(404).send('Nie ma takich użytkowników')
            } else if (foundUsers.length === 1 ){
                return res.status(404).send('Nie ma jednego użytkownika')
            } else {
                const query = {
                    from_userId: userId, to_userId: correspondingUserId
                }
                const query2 = {
                    from_userId: correspondingUserId, to_userId: userId
                }
                const foundMessages = await messages.find(query).toArray()
                const theirMessages = await messages.find(query2).toArray()

                const allMessages = [...foundMessages,...theirMessages].sort((a,b) => a.timestamp.localeCompare(b.timestamp))

                return res.send(allMessages)
            }

        } catch (err) {
            console.log(err)
            res.send('ERROR UWAGA')
        }
        finally
        {
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
        const query = {_id: toDelete}
        const message = await messages.findOne(query)
        if (!message){
            return res.status(404).send('Nie ma wiadomosci o takim ID')
        }

        const result = await messages.deleteOne(query)
        res.send(result)


    } finally {
        await client.close()
    }
})

app.patch('/message', async (req, res) => {
    const client = new MongoClient(uri)
    const { messageId, editedMessage } = req.body

    try {
        await client.connect()
        const database = client.db('Tinder')
        const messages = database.collection('messages')
        const toEdited = new ObjectId(messageId)
        const query = {_id: toEdited}

        const message = await messages.findOne(query)
        if (!message){
            return res.status(404).send('Nie ma wiadomosci o takim ID')
        }

        const updateDocument = {
            $set: {
                message: editedMessage
            }
        }
        const result = await messages.updateOne(query, updateDocument)
        res.send(result)

    } finally {
        await client.close()
    }
})

app.get('/gmails', async (req, res) => {
    const client = new MongoClient(uri)

    try {
        const regex = /@gmail\.com$/;

        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const returnedUsers = await users.find().toArray()
        const ilosc = returnedUsers.map((user) => user.email).reduce((acc, curr) => regex.test(curr) ? acc + 1 : acc , 0)
        res.status(200).send(`ilosc wynosi ${ilosc}`)
    } catch (err) {
        console.log(err)
    }
    finally
    {
        await client.close()
    }
})

app.get('/agregate', async (req, res) => {
    const client = new MongoClient(uri)

    try {
        await client.connect()
        const database = client.db('Tinder')
        const users = database.collection('users')
        const aggregationResult = await users.aggregate([
            {
                $group: {
                    _id: '$gender_identity',
                    users: { $push: '$first_name',
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    users: { $slice: ['$users', 5] }
                }
            },
            {
                $limit: 3
            },
        ]).toArray();

        res.status(200).send(aggregationResult);

    } catch {

    }
})

app.get('/imionaMatches', (req, res) => {

    const client = new MongoClient(uri);

    let users;

    client.connect()
        .then(() => {
            const database = client.db('Tinder');
            users = database.collection('users');
            return users.find().toArray();
        })
        .then(user => {
            const uzytkownicyZImionami = user.map(curr =>
                Promise.all(
                    curr.matches.map(match =>
                        users.findOne({ "user_id": match.user_id })
                            .then(matchUser => ({ [curr.first_name]: matchUser ? matchUser.first_name : null }))
                    )
                )
            );

            return Promise.all(uzytkownicyZImionami)
                .then(result => {
                    return result.flat();
                });
        })
        .then(toReduce => {
            const result = toReduce.reduce((acc, obj) => {
                const user = Object.keys(obj)[0];
                const value = obj[user];
                if (!acc[user]) {
                    acc[user] = [];
                }
                if (value){
                    acc[user].push(value);
                }
                return acc;
            }, {});

            res.status(200).send(result);
        })
        .catch(error => {
            res.status(400).send(error);
        })
        .finally(() => {
            client.close()
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
        });
});
app.listen(PORT,
    () => console.log(`Server running on port ${PORT}`))



