# Word Guess Game - Server-side Dynamic Site

Skills Used :  `express`, `cookie-parser`, and `uuid` modules only


## Goals

- Building a web-based word guessing game
  - this site will use only backend-generated HTML and to demonstrate skills using cookies and session ids
 

## Functionalities:

- A "game" means one specific secret word is chosen and the user takes multiple turns making guesses
  - A "new game" means a new secret word is selected, the number of guesses made is reset to 0, and the list of possible words is reset to the full list
- "valid guess" means a guess that is one of the possible words that has not already been guessed this game
  - guess are not case-sensitive, so "these" is a valid guess if one of the possible words is "THESE"
- "invalid guess" means a guess that is not one of remaining possible words
  - This includes words that would never be valid (are not on the full list of possible words) and words that are on the list of possible words that have been previously guessed this game.
- "incorrect guess" means a valid guess that is not the secret word
- "correct guess" means a valid guess that IS the secret word (case-insensitive)
  - A guess that shares all of the letters of the secret word but is NOT the secret word (such as EAT vs TEA), is NOT a correct guess and does not win the game

### Home Page

When the User loads the page (path: `/`)
- the site will check if the user is logged in (based on `sid` session cookie)

- If the user is not logged in:
  - the page will display a login form instead of the below content
  - the login form will ask for a username but will NOT ask for a password
  - the login form will POST to `/login` 

- A logged in user will see:
  - A list of words the secret word could be
  - A list of any previously guessed words and how many letters each matched( between secret word and guessed word)
  - A count of how many valid guesses they have made so far this game (essentially, a score a player wants to keep low)
  - If their previous guess was correct: a message saying they have won
  - If their previous guess was incorrect: an option to make another guess 
  - An option to logout
  - An option to start a new game
  - Notice:  even if they reload the page. The user stays logged in and the displayed information does not change
  
- A different user will see the above information for themselves, not the information of a different user, and their game is not altered if another player is playing a separate game at the same time

### Making a Guess

A guess will be sent as a POST to the path `/check`
- The server will check for a valid session id
  - If there is not a valid session id, the page will display a message and a login form
- The server will check for a valid guess
  - If the guess is not valid, the server will update the server state for that player and respond with a redirect to the Home Page 
  - If the guess is valid, the server will update the server state for that player and respond with a redirect to the Home Page


### Starting a New Game

A new game begins when a user starts a new game or logs in for the first time.
- A secret word is picked at random from the list of available wordsusing  Math.random()
  - The list of available words is exported by the provided `words.js` file
    

If the user is manually starting a new game, it is done as a POST to `/new-game`
- The server will check for a valid session id(cookie)
  - If there is not a valid session id, the page will display a message and a login form
- If there is a valid session, after updating the state, the response will redirect to the Home Page.


### The Login Flow

Login is performed as a POST to `/login`
- It will send only the username, no password
- If the username is valid the server will respond with a `sid` cookie using a uuid.
  - a "valid username" is one composed only of allowed characters
    - You select the list of valid characters
  - Enforce the validity of the username by having an allowlist of valid characters
  - explicitly disallow username "dog" 
    - This simulates a user with a bad password, since we aren't using passwords
  - after setting the cookie header, respond with a redirect to the Home Page
  - a user with a valid username will always be treated as if the are an existing user
    - There is no user registration
- If the username is invalid (including "dog"), respond with a login form that contains a message about the username being invalid

If a username that is in the middle of a game logs in
- They will be able to resume their existing game

### The Logout Flow

A user logs out with a POST to `/logout`
- Even a user with no session id or an invalid session id can logout
- This will clear the session id cookie (if any) on the browser
- This will remove the session information (if any) from the server
- Logout does NOT clear the game information from the server
  - The user can log in as the same username and resume the game
- After the logout process the server will respond with a redirect to the Home Page

## Implementation
- The game must be runnable via: 
  - `npm install` 
  - `node server.js`
  - going to `http://localhost:3000`
- Multiple players must be able to play separate games (from different browsers) simultaneously
- Logout and a later login must allow you to resume a game
  - as long as the server has not restarted.  No long-term persistence is expected.
"# Guess-Game" 
