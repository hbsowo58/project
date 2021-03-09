const express =require('express');
const app = express();
const morgan = require('morgan');
const PORT = 8000;
const routes = require('./routes')
const cors = require('cors');

app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(morgan("dev"));
app.use("/", routes);

app.listen(PORT,() => console.log(`this server listening on ${PORT}`));