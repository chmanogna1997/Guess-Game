const express = require('express');

// create session ids
const uuidv4 = require('uuid').v4

// to create cookies
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

const sessions = {};
const userWordsList = {};

// importing words:
const words = require('./words');

//getting secret word
let secret_Word;

// score is 
let score = 0;

app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static('./Public'));

// ---------- display list of word
const word_array = words.map((e) =>
    `<li> ${e} </li>`
).join('');

const words_cotainer = (`
    <div class = "container">
        <div class="word_container">
        <h2> Secret Word Could be ... </h2>
        <ul> ${word_array}</ul>
         </div>
        <div>
    `);
// ---------- display list of word

// ------- getting secret word
function secretWord() {
    const max = words.length
    let index = Math.floor(Math.random() * max);
    return words[index]
  }
// -------- getting secret word

// -----------taking user inputs:
function user_input(sid){
    return(`
    <form action = "/check" method = "post">
        <input type="text" name="userGuess" placeholder = "Guess your word here"/>
        <input hidden name=sid value = ${sid} />
        <button type="submit">Check</button>
    </form>
    `)
}
// -----------taking user inputs

// compare function :
function compare( word, guess ) {
    let matched = 0;
    const wordLetters = word.toUpperCase().split('');
    const guessLetters = guess.toUpperCase().split('');
    for( let wordAt = 0; wordAt< wordLetters.length; wordAt++ ){
    const matchAt = guessLetters.indexOf(wordLetters[wordAt]);
    if( matchAt > -1 ) {
    matched++;
    guessLetters.splice(matchAt,1);
    }
    }
    return matched;
    }



// checking if the user guess is correct or not
app.post("/check", (req,res) => {
    const userGuess = (req.body.userGuess).toLowerCase();
    const sid = req.body.sid;
    if(!isValid(sid)){
        res.clearCookie('sid')
        res.status(401).send(`<p> Session Timedout. Please <a href = 'http://localhost:3000/'> LOGIN </a> again </p>` )
    }
    else{
        const user = sessions[sid]
        let obj_str = ""
        word_count = compare(userGuess, secret_Word)
        if(words.includes(userGuess) && secret_Word === userGuess){
        obj_str = userGuess + " is " + "CORRECT GUESS"
        }
        else if(words.includes(userGuess) && secret_Word !== userGuess){
            obj_str = userGuess + " is " + "Valid Guess but NOT SECRET WORD" + " has " + word_count + " letter/letters in common "
            score = score + 1
        }
        else{
            obj_str = userGuess + " is "+ "Invalid Guess" + " has " + word_count + " letter/letters in common "
            // score = score + 1
        }

        // if user is not in the list add new array
        if(!userWordsList[user]){
            // check if the word is included
            userWordsList[user] = [obj_str]
        }
        // if user is not in the list add word to exsisting array
        else{
            userWordsList[user].push(obj_str)
        }
        res.redirect("/")
    }
})

// finction to check valid session id
function isValid(sid){
    return sessions.hasOwnProperty(sid)
}

// login form 
function login_form(){
    return(`
    <div class = "login_form">
    <h1> LOGIN !!! </h1>
    <form action= "/addUser" method = "post">
        <input type="text" required name="userName" placeholder = "Username"/>
        <button type="submit">Login</button>
    </form>
    </div>

`)
}


// -------- creating a session and adding user
app.post("/addUser", (req,res)=>{
    // creating a secret word on page load 
    secret_Word = secretWord()
    console.log("secret word is ", secret_Word)

    const user = req.body.userName.trim()
    // username can only have aplphabets and numbers:
    const letterNumOnlyRegex = /^[A-Za-z0-9]+$/;
    if(user === 'dog'){
        res.status(403).send(`<p> Username cannot be dog. Please <a href = "http://localhost:3000/">Login</a> again</p>`)
    }
    else if(!user.match(letterNumOnlyRegex)){
        res.status(401).send(`<p> Username can only have letters and numbers. Please <a href = "http://localhost:3000/" >Login</a> again </p>`)
    }
    else{
        const session_id = uuidv4();
        sessions[session_id] = user
        // setting up the cookie
        res.cookie("sid", session_id)
        res.redirect("/")
    }
})

function userGuessData(id){
        let user = sessions[id]
        let user_list = userWordsList[user]
        let guess_log = user_list.map((e) => {
            return(`
            <li> ${JSON.stringify(e)} </li>
            `)
        }).join('')
    return(`
    <p> ${guess_log}</p>
    `)   
  }
// new game button
  function newGame(id){
    return(`
    <form action= "/clearData" method = "post">
        <input type="text" hidden name="userId" value = ${id} />
        <button type="submit">New Game</button>
    </form>
    `)
  }

// show home page
function showHomePage(id){
    show_guessed_words = (isValid(id) && userWordsList[sessions[id]])  ? userGuessData(id) : "";
    let list_b = userWordsList[sessions[id]]
    show_score = (isValid(id) && userWordsList[sessions[id]])  ? `<p> YOUR SCORE is :  ${score} </p>` : `<p> YOUR SCORE IS 0 </p>` ;
    newGame_btn = (isValid(id) && userWordsList[sessions[id]])  ? newGame(id) : "" ;
    welocme_msg = sessions[id] ? `<h1> Hi ${sessions[id].toUpperCase()} !!!  Welcome To The Game </h1>` : `<h1>Hi !!! Welcome To The Game</h1>`
    return(`
    <div class = "show_home_page">
    ${welocme_msg}
    ${words_cotainer}
    <div class= output_container>
    ${user_input(id)}
    ${show_guessed_words}
    ${show_score}
    ${newGame_btn}
    </div>
    </div>
    `)
}
  // -------- creating a session and adding user

app.post('/clearData', (req,res) => {
    id = req.body.userId;
    count = 0 ;
    // secret_Word = secretWord()
    // console.log("secret word ")
    userWordsList[sessions[id]] = []
    res.redirect('/')
})

// logout
app.post('/logout', (req,res) =>{
    sid = req.body.sid
    if(sid){
            delete sessions[sid]
            res.clearCookie('sid')
        }
    res.redirect('/')
})

app.get('/', (req,res)=>{
    let comp = req.cookies.sid? showHomePage(req.cookies.sid) : login_form()
     res.send(`
        <!DOCTYPE html>
        <html>
        <head> <title> Guess Game</title></head>
        <link rel="stylesheet" href='./public.css'>
        <body>
        <header class ="header">

        <h1> Guess Game </h1>

        <form action= "/logout" method = "post">
        <input type="text" hidden name="sid" value = ${req.cookies.sid} />
        <button type="submit" class= "logout_btn" >Logout</button>
        </form>
        
        </header>
        <div class="show_comp"> ${comp} </div>
        </body>
        </html>
        `)
})

app.listen(port, () => {
    console.log(`listeing to port : ${port}`)
})
