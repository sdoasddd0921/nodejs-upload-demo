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

const app = new Koa()
const uploadRoute = new Router()
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log(file);
    cb(null, uploadFolder);
  },
  filename: function(req, file, cb) {
    const originalnames = file.originalname.split('.')
    const ext = '.' + originalnames.pop()
    cb(null, originalnames + ext)
  }
});
const upload = multer({ storage: storage })

uploadRoute.post(
  '/upload',
  checkFolder(),
  upload.single('test'),
  async (ctx, next) => {
    ctx.body = ctx.req.file
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
