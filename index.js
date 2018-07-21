var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const axios = require('axios')
var apiKey = 'xxxxxxxx' //Add your bot key here

var keywordToUrlMap = {
  'bitcoin': 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD',
  'news': 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN'
}

app.use(bodyParser.json()) 
app.use(
  bodyParser.urlencoded({
    extended: true
  })
) 

var checkKeyword = function(text) {
  text = text.toLowerCase();
  if (text.indexOf('bitcoin') > -1) {
    return {'hasKeyword': true, 'keyword': 'bitcoin'}
  }
  if (text.indexOf('btc') > -1) {
    return {'hasKeyword': true, 'keyword': 'bitcoin'}
  }
  if (text.indexOf('news') > -1) {
    return {'hasKeyword': true, 'keyword': 'news'}
  }
  return {'hasKeyword': false, 'keyword': ''};
}

var getTextResponse = function(response, keyword){
  let text = ""
  switch (keyword) {
    case 'bitcoin':
      text = 'Bitcoin is at ' + response.data.USD;
      break;
    case 'news':
      text = response.data.Data[0].title + '\n' + response.data.Data[0].url
      break;
  }
  return text;
}

var getInfo = function(keyword) {
  return new Promise(resolve => {
    var url = keywordToUrlMap[keyword];
    console.log(url);
    axios
    .get(url)
    .then(response => {
        resolve(response);
    })
  })
}

app.post('/new-message', function(req, res) {
  const { message } = req.body

  if (!message) {
    return res.end()
  }
  var kResult = checkKeyword(message.text)
  if (!kResult.hasKeyword) {
    return res.end()
  }

  getInfo(kResult.keyword)
  .then(infoResponse => {
    var text = getTextResponse(infoResponse, kResult.keyword);
    var url = 'https://api.telegram.org/bot' + apiKey + '/sendMessage'
    console.log(url, message.chat.id, text)
    axios
    .post(
      url,
      {
        chat_id: message.chat.id,
        text: text
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