const express = require("express")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const dbPath = path.join(__dirname,"mydb.sqlite")
const app = express()
app.use(express.json());
const format = require('date-fns/format')
const toDate = require('date-fns/toDate')
const isValid = require('date-fns/isValid')


let db = null

const initializeDBToServer = async() => {
  try{
    db = await open ({
      filename : dbPath,
      driver : sqlite3.Database
    })
    app.listen(3000,() => (
      console.log("Server is Running at http://localhost:3000/")
    ))
  }
  catch(error){
    console.log(`DB Error : ${error.message}`);
    process.exit(1)
  }
}

initializeDBToServer();

const checkPossibleQuery = async (request, response, next) => {
  const {type,date,category} = request.query
  const {id} = request.params
  if (type !== undefined) { 
    const typeArray = ["income","expense"]
    const typeInArray = typeArray.includes(type)
    if (typeInArray === true) {
      request.type = type
    } else {
      response.status(400)
      response.send('Invalid TType')
      return
    }
  }

  if (category !== undefined) {
    const categoryArray = ['work', 'home', 'learning',"food"]
    const categoryIsInArray = categoryArray.includes(category)
    if (categoryIsInArray === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Category')
      return
    }
  }
  if (date !== undefined) {
    try {
      const myDate = new Date(date)
      const formatedDate = format(new Date(date), 'yyyy-MM-dd')
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${
            myDate.getMonth() + 1
          }-${myDate.getDate()}`,
        ),
      )
   
      const isValidDate = await isValid(result)
      if (isValidDate === true) {
        request.date = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Date')
      return
    }
  }
  request.id = id
  next()
}



//API Endpoints

// Add transactions - 1

  app.post('/transactions', checkPossibleQuery,async (request, response) => {
    const {id, expense, category, amount, date, description} = request.body
      const addTransactQuery = `INSERT INTO user
      (id,expense,category,amount,date,description) VALUES (
      ${id},
      ${expense},
      "${category}",
      ${amount},
      "${date}"),"${description};`
      await db.run(addTransactQuery)
      response.status(200)
      response.send('Transactions successfully Added')
    })

// Get transactions - 2
app.get('/transactions', checkPossibleQuery, async (request, response) => {
  const {type = '', date = " ", category = ''} = request
  const selectTransactQuery = `SELECT * FROM 
  transactions LIMIT 20`;
  transactionsArray = await db.all(selectTransactQuery)
  response.send(transactionsArray)
})

// Get transactions/:id - 3 
app.get('/transactions/:id/', checkPossibleQuery, async (request, response) => {
  const {id} = request
  const selectTransactQuery = `SELECT * FROM tranasctions
  WHERE id = ${id};`
  const transactArray = await db.get(selectTodoQuery)
  response.send(transactArray)
})

// Update transactions - 4
app.put('/transactions/:id/', checkPossibleQuery, async (request, response) => {
  const {type,category,amount,Date} = request
  let updateTransact = null
  const {id} = request
  switch (true) {


    case type !== undefined:
      updateTransact = `UPDATE transactions SET
      type= "${type}" WHERE 
      id = ${id};`
      await db.run(updateTransact)
      response.send('Type Updated')
      break

    case amount !== undefined:
      updateTransact = `UPDATE transactions SET
      amount = "${amount}" WHERE 
      id = ${id};`
      await db.run(updateTransact)
      response.send('Amount Updated')
      break

    case category !== undefined:
      updateTransact = `UPDATE transactions SET
      category = "${category}" WHERE 
      id = ${id};`
      await db.run(updateTransact)
      response.send('Category Updated')
      break

    case Date !== undefined:
      updateTransact = `UPDATE transactions SET
      date = "${Date}" WHERE 
      id = ${id};`
      await db.run(updateTransact)
      response.send('Due Date Updated')
      break
  }
})

// Delete transaction - 5
app.delete('/transactions/:id/', checkPossibleQuery, async (request, response) => {
  const {id} = request.params
  const deleteQuery = `DELETE FROM transactions WHERE 
  id = ${id};`
  await db.run(deleteQuery)
  response.send('Transaction Deleted')
})

module.exports= app;