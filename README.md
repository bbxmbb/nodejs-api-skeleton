# run code
run\
`npm install`\
to install all dependencies
# Then setup the .env file for
`DB_HOST=<your-host>`\
`DB_USER=<your-username>`\
`DB_DATABASE=<your-databasename>`\
`DB_PASSWORD=<your-database-password>`

`SECRET_KEY=<your-secret-key-for-jwt>`\
`REFRESH_TOKEN_KEY=`

# create 2 tables in database
## items table
1. id(int-primarykey)
2. name(text)
3. description(text)
4. number(float)
5. bool(BOOLEAN)
6. array(text)
7. object(text)
## users table
1. id(int-primarykey)
2. username(text)
3.  password(text)
4.  token(text)
