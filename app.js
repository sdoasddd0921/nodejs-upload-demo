const fs      = require('fs')
const Koa     = require('koa')
const path    = require('path')
const koaBody = require('koa-body')
const Router  = require('koa-router')
const server  = require('koa-static')
const multer  = require('koa-multer')

const uploadFolder = './uploads'

// has uploads folder?
function checkFolder() {
  return async function (ctx, next) {
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder)
    }
    if (next) {
      await next()
    }
  }
}
checkFolder()()

function getUploads(folderPath=uploadFolder) {
  let result = []
  const files = fs.readdirSync(path.join(__dirname, folderPath))
  files.forEach((val, index) => {
    const filePath = path.join(__dirname, folderPath, val)
    if (fs.statSync(filePath).isFile) {
      result.push(val)
    }
  })
  return result
}

function deleteFile(file) {
  if (fs.existsSync(path.join('./uploads/'+file))) {
    fs.unlinkSync(path.join('./uploads/'+file))
  } else {
    console.log('do not have such file.')
  }
}

const app = new Koa()
const uploadRoute = new Router()
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadFolder)
  },
  filename: function(req, file, cb) {
    const originalnames = file.originalname.split('.')
    const ext = '.' + originalnames.pop()
    cb(null, originalnames + ext)
  }
});
const upload = multer({ storage: storage })

uploadRoute
  .use(checkFolder())
  .post(
    '/upload',
    upload.single('test'),
    async (ctx, next) => {
      ctx.body = getUploads()
      if (next) {
        await next()
      }
    }
  ).get(
    '/getUploadedFiles',
    async (ctx, next) => {
      ctx.body = getUploads()
    }
  ).post(
    '/deleteFile',
    async (ctx, next) => {
      const fileName = JSON.parse(ctx.request.body).file
      if (fileName !== '') {
        deleteFile(fileName)
      }
      ctx.body = getUploads()
      if (next) {
        await next()
      }
    }
  )

app
  .use(server(path.join(__dirname, '/static')))
  .use(koaBody())
  .use(uploadRoute.routes())
  .use(uploadRoute.allowedMethods())

app.listen(3000)
