const path = require('path')
const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('koa-router')
const server = require('koa-static')
const multer = require('koa-multer')

const app = new Koa()
const upload = multer({ dest: './uploads'})
const uploadRoute = new Router()

uploadRoute.post('/upload', upload.single('test'), async (ctx, next) => {
  console.log(ctx.req.file)
  ctx.body = 'got'
})

app
  .use(server(path.join(__dirname, '/static')))
  .use(koaBody())
  .use(uploadRoute.routes())
  .use(uploadRoute.allowedMethods())

app.listen(3000)