const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(cors())

morgan.token('data', function(req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :data :status :res[content-length] - :response-time ms'))

app.get('/api/persons', (req, res) => {
  Person
    .find({})
    .then(people => {
      return people.map(Person.format)
    })
    .then((formattedPeople) => {
      res.json(formattedPeople)
    })
    .catch(err => {
      console.log('Error in person read: ', err)
    })
})

app.get('/api/persons/:id', (req, res) => {
  Person
    .findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(Person.format(person))
      } else {
        res.status(404).end()
      }
    })
    .catch(err => {
      console.log('Error in single person read: ', err)
      res.status(400).send({ error: 'bad id' })
    })
})

app.delete('/api/persons/:id', (req, res) => {
  Person
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(err => {
      console.log('Error in person delete', err)
      res.status(400).send({ error: 'bad id' })
    })
})

app.post('/api/persons/', (req, res) => {
  const person = req.body

  if (!person.name) {
    return res.status(400).send({ error: 'name was not provided' })
  }
  if (!person.number) {
    return res.status(400).send({ error: 'number not provided' })
  }

  Person
    .find({ name: person.name })
    .then(result => {
      if (result.length > 0) {
        return Promise.reject('Unexpected post request: name already exists')
      }
      return result
    })
    .then(() => {
      const newPerson = new Person({
        name: person.name,
        number: person.number
      })
      return newPerson
        .save()
        .then(savedPerson => {
          return Person.format(savedPerson)
        })
        .then(savedAndFormattedPerson => {
          res.json(savedAndFormattedPerson)
        })
        .catch(err => {
          throw err
        })
    })
    .catch(err => {
      console.log('Error in person write: ', err)
      res.status(400).send({ error: err })
    })
})

app.put('/api/persons/:id', (req, res) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person
    .findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      return Person.format(updatedPerson)
    })
    .then(updatedAndFormattedPerson => {
      res.json(updatedAndFormattedPerson)
    })
    .catch(err => {
      console.log('Error in person update', err)
      res.status(400).send({ error: 'bad id' })
    })
})

app.get('/info', (req, res) => {
  Person
    .find({})
    .then(persons => {
      res.send(
        '<div>puhelinluettelossa ' + persons.length + ' henkilön tiedot</div>' +
        '<br>' +
        '<div>' + Date() + '</div>'
      )
    })
    .catch(err => {
      console.log('Error in getting person info: ', err)
    })
})

/* function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max)) + 1;
} */

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})