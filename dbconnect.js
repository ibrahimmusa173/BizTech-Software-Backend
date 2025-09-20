const sql= require('mysql');

const sqlconnect= sql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'practice_db',
    multipleStatements:true
});

sqlconnect.connect((err)=>{
    if(!err){
        console.log('DB connection succeeded');
    } else{
        console.log('DB connection failed');
    }
});

module.exports= sqlconnect;
