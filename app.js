const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const port = 4000;
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const session = require('express-session');

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src", "assets")));
app.use(
    session({
      name: "my-session",
      secret: "korewakaizokuogininaruatokoda",
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );
app.use(flash());
app.use((req, res, next) => {
    res.locals.session = {
      user: req.session.user,
    };
    next();
  });

hbs.registerPartials(path.join(__dirname, "src", "views", "partials"));


app.get('/', async (req, res) => {
    console.log(req.session.user);
    try {
        const result = await prisma.collections_tb.findMany({
            where: { user_id: req.session.user.id },
            include: {
                task_tb: true,
                _count: true
            },
            orderBy: {
                id: 'asc'
            }
        });
        const updatedResult = result.map(collection => {
            const taskTrue = collection.task_tb.filter(task => task.is_done).length;
            return {
                ...collection,
                task_true: taskTrue
            };
        });
        res.render("collections", { data: updatedResult });
    } catch (error) {
        res.render("index");
    }
});
app.get('/register', (req, res) => {
    res.render('register')
});
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const isEmail = await prisma.users_tb.findUnique({
            where: { email }
        });
        if(isEmail){
            req.flash('error', 'Email already exist');
            return res.redirect('/register')
        }
        await prisma.users_tb.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
        req.flash('success', 'Register success');
        res.redirect('/login');
    } catch (error) {
        req.flash('error', 'Unable to register right now')
        res.redirect('register');
    }
});
app.get('/login', (req, res) => {
    res.render('login')
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const theUser = await prisma.users_tb.findUnique({
            where: { email }
        });
        if(!theUser){
            req.flash('error', 'Incorrect email or password');
            return res.redirect('/login');
        }
        const isValidPassword = await bcrypt.compare(password, theUser.password);
        if(!isValidPassword){
            req.flash('error', 'Incorrect email or password');
            return res.redirect('/login');
        }

        req.flash('success', 'Login success');
        req.session.user = theUser;
        res.redirect('/')
    } catch (error) {
        req.flash('error', 'Server error');
        res.redirect('/login')
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        console.log('info', 'Logout success');
        res.redirect('/');
    })
});
app.get('/users', async (req, res) => {
    try {
        const result = await prisma.users_tb.findMany()
        // res.render("users", { data: result })
        res.json({ result });
    } catch (error) {
        res.json({message: "gagal"})
    }
});

app.post('/collections', async (req, res) => {
    const { name, user_id } = req.body;
    try {
        await prisma.collections_tb.create({
            data: { name: name ? name : 'Unnamed', user_id: parseInt(user_id) }
        });
        req.flash('success', 'Create new collection success');
        res.redirect('/');
    } catch (error) {
        console.log(error)
        redirect('/');
    }
});
app.post('/collections/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await prisma.collections_tb.update({
            where: { id: parseInt(id) },
            data: {
                name,
            }
        });
        console.log('update collections success')
        req.flash('success', 'update collections success');
        res.redirect(`/collections/${id}`);
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
});
app.post('/collections/api/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await prisma.collections_tb.update({
            where: { id: parseInt(id) },
            data: {
                name,
            }
        });
        console.log('update collections success')
        res.status(201).json({
            message: 'Update name success'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        })
    }
});
app.get('/collections/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await prisma.collections_tb.findUnique({
            where: { id: parseInt(id) }
        });
        const resultTask = await prisma.task_tb.findMany({
            where: { collections_id: parseInt(id) }
        });
        const resultLength = resultTask.length
        const resultTaskTrue = resultTask.filter(item => item.is_done === true);
        const resultTaskFalse = resultTask.filter(item => item.is_done === false);
        // res.json({ collection_id: id, id, collection: result, tasksTrue: resultTaskTrue, tasksFalse: resultTaskFalse, falseLength: resultTaskFalse.length, trueLength: resultTaskTrue.length, resultLength })
        res.render('task', { collection_id: id, id, collection: result, tasksTrue: resultTaskTrue, tasksFalse: resultTaskFalse, falseLength: resultTaskFalse.length, trueLength: resultTaskTrue.length, resultLength });
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
});
app.get('/collections-delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.collections_tb.delete({
            where: { id: parseInt(id) }
        });
        req.flash('success', 'Delete collection succes')
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.redirect(`/collections/${id}`)
    }
})

app.post('/task/:id', async (req, res) => {
    const { id } = req.params;
    const { name, collection_id } = req.body;
    console.log(collection_id)
    try {
        await prisma.task_tb.create({
            data: {
                name,
                is_done: false,
                collections_id: parseInt(collection_id)
            }
        });
        res.redirect(`/collections/${id}`);
    } catch (error) {
        console.log(error);
        res.redirect(`/collections/${id}`);
    }
});
app.post('/task-done', async (req, res) => {
    const { collection_id, task_id, is_done }= req.body;
    try {
        await prisma.task_tb.update({
            where: { id: parseInt(task_id) },
            data: {
                is_done: is_done == "true" ? true : false
            }
        })
        res.redirect(`/collections/${collection_id}`);
    } catch (error) {
        console.log(error);
        res.redirect(`/collections/${collection_id}`);
    }
});
app.post('/task-delete', async (req, res) => {
    const { id, collection_id } = req.body;
    try {
        await prisma.task_tb.delete({
            where: { id: parseInt(id) }
        });
        req.flash('success', 'Delete task success')
        res.redirect(`/collections/${collection_id}`)
    } catch (error) {
        console.log(error);
        res.redirect(`/collections/${collection_id}`)
    }
});

app.listen(port, () => console.log(`Running on port: ${port}`));