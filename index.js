const express = require('express');
const bodyParser = require('body-parser');
const request = require("request")
const app = express();

const fetch = require('node-fetch')
const JSDOM = require('jsdom')
var https = require('https')
const cookieParser = require('cookie-parser')

var fs = require('fs')
var htmlParser = require('node-html-parser')
app.use(cookieParser())

app.use(bodyParser.json())
String.prototype.insert = function (index, string) {
  if (index > 0) {
    return this.substring(0, index) + string + this.substr(index);
  }

  return string + this;
};

async function bypassSlowmode(url, headers, body) {
  return new Promise(async (resolve, reject) => {
    console.log(url)
    console.log(headers)
    console.log(body)
    var b = await fetch(url, {
      method: `POST`,
      headers: headers,
      body: body
    })

    var j = await b.json()

    if (j.code == 20016 && j['retry_after']) {
      setTimeout(async () => {
        resolve(await bypassSlowmode(url, headers, body))
      }, j['retry_after'])
    } else {
      resolve(j)
    }
  })
}

async function server(req, res) {
  var url = `https://canary.discord.com`

  if (req.cookies.password == undefined || req.cookies.password != process.env.password) {
    url = `https://wilsonsd.org`
  }

  if (req.method == "GET") {
    console.log(req.url)
    if (req.url == '/api/v8/gateway') {
      console.log('a')
      return res.json({
        url: 'wss://ws-proxy-discorde-1.pdaniely.repl.co'
      })
    }

    if (req.url == '/folufela') {
      res.cookie('password', process.env.password)
    }

    if (req.url.endsWith('.png') || req.url.endsWith('.webp') || req.url.endsWith('.svg') || req.url.endsWith('.ico')) {
      request.get({
        uri: `${url}${req.url}`,
        encoding: null
      }, (err, rea, body) => {
        if (err) {
          res.end(err)
          return
        }

        if (req.url.split('.')[req.url.split('.').length - 1] != 'svg' && req.url.split('.')[req.url.split('.').length - 1] != 'ico') {
          res.set('Content-Type', `image/${req.url.split('.')[req.url.split('.').length - 1]}`)
        } else {
          res.set(rea.headers)
        }

        res.end(body)
      })
      return
    }

    if (req.url.endsWith('.mp4') || req.url.endsWith('.wav') || req.url.endsWith('.mp3') || req.url.endsWith('.aac') || req.url.endsWith('.flac') || req.url.endsWith('.aiff')) {
      var id = Math.floor(Math.random() * 99999999999999999999)

      fs.writeFileSync(`audio${id}.${req.url.split('.')[req.url.split('.').length - 1]}`, '')

      var file = fs.createWriteStream(`audio${id}.${req.url.split('.')[req.url.split('.').length - 1]}`)

      var l = https.get(`${url}${req.url}`, function (response) {
        response.pipe(file)

        fs.createReadStream(`audio${id}.${req.url.split('.')[req.url.split('.').length - 1]}`).pipe(res)

        fs.unlinkSync(`audio${id}.${req.url.split('.')[req.url.split('.').length - 1]}`)
      })

      return
    }

    if (req.url.startsWith('/app') || req.url.startsWith('/channels') || req.url.startsWith('/profile')) {
      url = `https://idk-3.pdaniely.repl.co`
      req.url = `/app`
    }

    var heade = undefined

    if (req.url.startsWith('/api')) {
      heade = {
        'Authorization': req.headers['authorization']
      }
    }

    request.get({
      uri: `${url}${req.url}`,
      headers: heade
    }, (err, rea, body) => {
      if (err) {
        res.end(err)
        return
      }

      delete rea.headers['sec-fetch-site']
      delete rea.headers['sec-fetch-mode']

      rea.headers['Content-Security-Policy'] = 'connect-src *'
      res.set(rea.headers)

      // console.log(typeof body)
      if (typeof body == 'string') {
        body = body.replace("REMOTE_AUTH_ENDPOINT: '//remote-auth-gateway.discord.gg'", "REMOTE_AUTH_ENDPOINT: '//ws-proxy-discorde.pdaniely.repl.co'")
      } else {
        // console.log(body)
      }

      body = body.split('wss://gateway.discord.gg').join('wss://ws-proxy-discorde-1.pdaniely.repl.co')

      // body = `<script>alert(localStorage)</script>${body}`

      // // res.set({
      // //   'Content-Length': '9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999'
      // // })

      res.status(rea.statusCode)

      // body = body.replace(`//canary.discord.com`, `//replit.pdaniely.repl.co`)

      res.set(req.headers)

      body = body.replace('canary.discord.com/api', 'Replit.pdaniely.repl.co/api')
      res.end(body)
    })
  } else if (req.method == "POST") {
    console.log("POST")
    console.log(req.url)

    req.headers['host'] = 'canary.discord.com'

    req.headers['origin'] = 'https://canary.discord.com'
    req.headers['referer'] = req.headers['referer'].replace('https://replit.pdaniely.repl.co', 'https://canary.discord.com')

    delete req.headers['accept-encoding']

    // await Promise.all(Object.keys(req.headers).map((a) => {
    //   if (a.startsWith('sec-')) {
    //     delete req.headers[a]
    //   }
    // }))

    if (req.url != '/api/v8/science') {
      //   console.log(req.headers)
      // console.log(req.url)
    }

    var body = req.body

    try {
      body = JSON.stringify(body)
    }
    catch (err) {
      body = body
    }

    console.log(body)
    var b = await fetch(`https://discord.com${req.url}`, {
      method: `POST`,
      headers: req.headers,
      body: body
    })

    var j = await b.text()

    // console.log(j)
    if (req.url != '/api/v8/science') {
      // console.log(`body: ${j}`)
    }

    var header = {}

    for (var pair of b.headers.entries()) {
      header[pair[0]] = pair[1]
    }

    console.log(header)

    console.log(b.status)
    console.log(j)

    if (b.status != 200) {
      res.set(header)
    }

    var c = true
    try {
      json = JSON.parse(j)

      if (json.code == 20016 && req.url.startsWith('/api/v8/channels')) {
        console.log(`bypassing slowmode`)
        c = false
        setTimeout(async () => {
          var a = await bypassSlowmode(`https://discord.com${req.url}`, req.headers, body)

          res.status(200)
          res.end(a)
        }, json['retry_after'] * 1000)
      }
    }
    catch (err) {
      console.error(err)
    }

    if (!c) {
      return
    }

    res.status(b.status)
    res.end(j)
  } else if (req.method == "PUT") {
    console.log("PUT")

    req.headers['host'] = 'canary.discord.com'

    req.headers['origin'] = 'https://canary.discord.com'
    req.headers['referer'] = req.headers['referer'].replace('https://replit.pdaniely.repl.co', 'https://canary.discord.com')

    delete req.headers['accept-encoding']

    await Promise.all(Object.keys(req.headers).map((a) => {
      if (a.startsWith('sec-')) {
        delete req.headers[a]
      }
    }))

    if (req.url != '/api/v8/science') {
      //   console.log(req.headers)
      // console.log(req.url)
    }


    var b = await fetch(`https://canary.discord.com${req.url}`, {
      method: `PUT`,
      headers: req.headers,
      body: JSON.stringify(req.body)
    })

    var j = await b.text()

    if (req.url != '/api/v8/science') {
      // console.log(`body: ${j}`)
    }

    res.status(b.status)

    var header = {}

    for (var pair of b.headers.entries()) {
      header[pair[0]] = pair[1]
    }

    res.set(header)
    res.end(j)
  } else if (req.method == 'DELETE') {
    console.log("DELETE")

    req.headers['host'] = 'canary.discord.com'

    req.headers['origin'] = 'https://canary.discord.com'
    req.headers['referer'] = req.headers['referer'].replace('https://replit.pdaniely.repl.co', 'https://canary.discord.com')

    await Promise.all(Object.keys(req.headers).map((a) => {
      if (a.startsWith('sec-')) {
        delete req.headers[a]
      }
    }))

    console.log(req.headers)
    console.log(req.url)

    var b = await fetch(`https://canary.discord.com${req.url}`, {
      method: `DELETE`,
      headers: req.headers
    })

    var j = await b.text()

    // console.log(`body: ${j}`)

    var header = {}

    for (var pair of b.headers.entries()) {
      header[pair[0]] = pair[1]
    }

    res.set(header)
    res.status(b.status)
    res.end(j)
  } else if (req.method == 'PATCH') {
    console.log("PATCH")

    req.headers['host'] = 'canary.discord.com'

    req.headers['origin'] = 'https://canary.discord.com'
    req.headers['referer'] = req.headers['referer'].replace('https://replit.pdaniely.repl.co', 'https://canary.discord.com')

    delete req.headers['accept-encoding']

    await Promise.all(Object.keys(req.headers).map((a) => {
      if (a.startsWith('sec-')) {
        delete req.headers[a]
      }
    }))

    if (req.url != '/api/v8/science') {
      //   console.log(req.headers)
      // console.log(req.url)
    }


    var b = await fetch(`https://canary.discord.com${req.url}`, {
      method: `PATCH`,
      headers: req.headers,
      body: JSON.stringify(req.body)
    })

    var j = await b.text()

    if (req.url != '/api/v8/science') {
      // console.log(`body: ${j}`)
    }

    res.status(b.status)

    var header = {}

    for (var pair of b.headers.entries()) {
      header[pair[0]] = pair[1]
    }

    res.set(header)
    res.end(j)
  }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(server)
app.listen(3000, () => console.log('server started'));

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
  });
