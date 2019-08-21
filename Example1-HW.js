//Title:    Hello World 
//Date:     6.19.2019

const express = require('express')
const app = express()

app.get('/', function (req, res)
    {
        res.send('Hello World')
    }
)  

app.listen(3000)