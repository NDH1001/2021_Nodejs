// import cái express cái mình vừa cài để dùng
const express = require('express')
// tạo 1 app
const app = express()
// để truyền đc giá trị vào body trong request
const bodyparser = require('body-parser');
const urlencodedParser = app.use(bodyparser.urlencoded({extended:true}))



// set view engine
app.set('view engine', 'ejs')

// khởi tạo 1 router, tên là route(từ cái express mk cài lúc đầu) npm i express
//route: kiểu điều hướng

const route = express.Router();
app.use('/', route)


/**
 * database
 */
// import mongodb
const mongoose = require('mongoose')
const mongoConnection = "mongodb+srv://root:a12345@cluster0.nxwbg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const connectDB = async() => {
    try {
        const con = await mongoose.connect(mongoConnection)
        console.log('MongoDB connected: ' + con.connection.host);
    } catch (err) {
        console.log('MongoDB connection error: ' + err);
    }
}
// gọi hàm để chạy
connectDB();

app.listen( 3000,  () => {
    console.log("server running at port: 3000")
});

// create table in Db
   var schema = new mongoose.Schema( {
       taskName: {
           type: String,
           required: true
       },
       isDone: {
           type: String,
           default: "false"
       }
   })
const taskDB = mongoose.model('taskDB', schema)
/**
 * CONTROLER
 * @type {string/number}
 */
const createTask = (req, res) => {
    if (!req.body.taskName) {
        return res.redirect('/name-is-required')
    }

    const newTask = new taskDB({
        taskName: req.body.taskName
    })
    newTask
        .save(newTask)
        .then(data => {
            //res.send(data)
            return res.redirect('/')
        })
        .catch(err => {
            res.status(500).send('controler create: error save to dbs:' + err);
        })

}

const getAllTasks = (req, res) => {
    taskDB.find()
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send('Controler getAllTasks:' + err)
        })
}

const deleteTask = (req, res) => {
    console.log('delete: vao day chua')
    let idTask = req.params.id;
    console.log('delete: id task: ' + idTask)
    taskDB.findByIdAndRemove(idTask)
        .then(data => {
            if (!data) {
                res.status(404).send({message: "can not delete challenge with " + idTask + "maybe challenge not found"})
            } else {
                // res.send(data)
                // res.json(req.body)
                return res.redirect('/');
            }
        })
        .catch(err => {
            res.status(500).send({message: "delete: error while deleting challenge"})
        })
}
const updateTask = (req, res) => {
    console.log('update: vao day chua')
    let idTask = req.params.id;
    console.log('update: id task: ' + idTask)
    taskDB.findByIdAndUpdate(idTask, req.body)
        .then(data => {
            if (!data) {
                res.status(404).send({message: "can not update challenge with " + idTask + "maybe challenge not found"})
            } else {
                return res.redirect('/');
            }
        })
        .catch(err => {
            res.status(500).send({message: "update: error while deleting task"})
        })


}

/**
 * API
 * @type{ string/number}
 */
route.post('/api/create', createTask);
route.get('/api/all', getAllTasks);
route.post('/api/delete/:id', deleteTask);
route.post('/api/update/:id', updateTask);

const port = process.env.PORT || 3000;

app.listen(port, () => {

})


/**
 * @param req
 * @param res
 */
const  API_GET_ALL = "http://hainguyen11.herokuapp.com/api/all"
const axios = require('axios')
homeRoute = (req, res) => {
    // gọi đến 1 api request get all tasks
    axios.get(API_GET_ALL)
        .then(function (response) {
            res.render('home', {tasks: response.data})
        })
        .catch(err => {
            throw err
        })
}
route.get('/', homeRoute);
// để import dùng các file trong thư mục css
app.use(express.static(__dirname + '/css'));
 homeRouteWithErrorMsg = (req, res) => {
     // gọi đến 1 api request get all tasks
     axios.get(API_GET_ALL)
         .then(function (response) {
             res.render('home', {tasks: response.data, errorMsg: 'Task name is required' })
         })
         .catch(err => {
             throw err
         })
 }
 route.get('/name-is-required', homeRouteWithErrorMsg)



