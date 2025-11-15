const express = require('express');
const app = express();
const router = require('./routes/routes');

const PORT = process.env.PORT || 3000;

app.use(express.json());    
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});