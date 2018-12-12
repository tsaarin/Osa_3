const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url, { useNewUrlParser: true })

const Person = mongoose.model('Person', {
  name: String,
  number: String
})

if (process.argv.length === 2) {
  Person
    .find({})
    .then(result => {
      result.forEach(person => {
        console.log(person)
      })
      mongoose.connection.close()
    })
} else if (process.argv.length === 4) {
  const person = new Person({
    name: process.argv[2],
    number: process.argv[3]
  })

  person
    .save()
    .then(() => {
      console.log('lisätän henkilö ', person.name, ' numero ', person.number, ' luetteloon')
      mongoose.connection.close()
    })

} else {
  console.log('Invalid amount of parameters')
  mongoose.connection.close()
}
