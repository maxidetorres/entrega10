const faker = require('faker')
faker.locale = 'es'

exports.generateProductFaker = async (cant) => {
  let arrayProductFake = [] 
  for (let i = 0; i< cant ; i++){
    const productFake = {
      title: faker.commerce.product(),
      price: faker.commerce.price(),
      thumbnail: faker.image.image()
    }
    arrayProductFake.push(productFake)
  }
  return arrayProductFake
} 