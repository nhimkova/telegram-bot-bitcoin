var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const axios = require('axios')
var apiKey = 'xxxxxxx' //Add your bot key here
var btcUrl = 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD'

app.use(bodyParser.json()) 
app.use(
  bodyParser.urlencoded({
    extended: true
  })
) 

var hasBTC = function(text) {
  text = text.toLowerCase();
  if (text.indexOf('bitcoin') > -1) {
    return true
  }
  if (text.indexOf('btc') > -1) {
    return true
  }
  return false;
}

var getBTCPrice = function() {
  return new Promise(resolve => {
    axios
    .get(btcUrl)
    .then(response => {
        resolve(response);
    })
  })
}

app.post('/new-message', function(req, res) {
  const { message } = req.body

  if (!message || !hasBTC(message.text)) {
    return res.end()
  }

  var url = 'https://api.telegram.org/bot' + apiKey + '/sendMessage'
  console.log(url, message.chat.id)
  getBTCPrice()
  .then(btcPrice => {
    console.log(url, message.chat.id)
    axios
    .post(
      url,
      {
        chat_id: message.chat.id,
        text: "Bitcoin is at " + btcPrice.data.USD
      }
    )
    .then(response => {
      console.log('Message posted')
      res.end('ok')
    })
    .catch(err => {
      console.log('Error :', err)
      res.end('Error :' + err)
    })
  })
  
})

// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!')
})