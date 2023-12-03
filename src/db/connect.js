const mongoose = require('mongoose');

const url = `mongodb+srv://root:12345@sandbox.fmop9nj.mongodb.net/appchat?retryWrites=true&w=majority`;

mongoose.connect(url, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
})
    .then(() => console.log('Connected to DB'))
    .catch((e) => console.log('Error :' + e.message))
