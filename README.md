# Folders

## src
The src folder contains all of the source code and folders

### Backend
The backend code contains the Python code for the client, apis, and databases

#### services
##### database.py
This file contains functions that interact with your Supabase database.
FastAPI endpoints call these functions.

Functions:
get_items_from_db
create_item_in_db
update_item_in_db
delete_item_in_db

##### stock_api.py
This file makes calls to apis to get data

##### user_database.py
User functions that interact with the user database

##### supabase_client.py
Creates the supabase client

### components
Contains the components for react

#### auth
##### login.jsx
Login popup 
##### signup.jsx
Signup popup

#### random
##### hamburger.jsx
Hamburger drop down

#### stocks
##### AddStockForm.jsx
Form to add stocks
Contains: id, symbol, name, current price, buy price, buy date,
gain or loss, gain or loss percent, added at, is weekend buy
##### FullInfo.jsx
Will show the full info of a selected stock, this will include the pe ratio
and other important stock information
##### StockChart.jsx
Chart of a selected stock
##### StockHeader.jsx
Renders the header for the stock portfolio page
Refreshes prices and has a back to home button
##### StockRow.jsx
Stock row within the stock table
##### StockTable.jsx
Stock table

#### images
Contains the images within the pages

#### pages
##### Home.jsx
Home page where you can select where you want to go
##### LoginPage.jsx
Login page 
##### Stock.jsx
Stock page

#### services
##### api.js
API client which is the frontend service that calls Python FastAPI backend
React Component -> api.js -> FastAPI Backend -> DB
#### supabase_client.js
Creates the client for a user to login and sign up

#### utils
##### App.jsx
Defines the app's routing structure
##### Main.jsx
The entry point that initializes React and renders the app

## eslint.config.js
Configures ESLint which is a js/react linter that checks code for errors, bugs, and style