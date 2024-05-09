const path = require('node:path');
const fs = require('node:fs');

const config = require('./config.js');

const express = require('express');
const app = express();
app.disable('x-powered-by');

const dotenv = require('dotenv')
dotenv.config();

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['miao','wang'],
  maxAge: 24 * 60 * 60 * 1000
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const cors = require('cors');
app.use(cors());

const methodOverride = require('method-override');
app.use(methodOverride('X-HTTP-Method-Override'));

// 解析 HTTP BODY
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const responseTime = require('response-time');
app.use(responseTime());

// 静态目录
app.use(express.static('public'));

// 模板引擎
app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, '../admin/views'), path.join(__dirname, '../home/views')] );
app.engine('.html', require('ejs').__express);

// i18n 国际化
const i18n = require('./utils/i18n/index.js');
i18n(app);

// 子模块
if ( config.modules.indexOf('home') != -1) {
  const home = require('../home/index.js');
  home(app);
}
if ( config.modules.indexOf('admin') != -1) {
  const admin = require('../admin/index.js');
  admin(app);
}

// 路由
const router = require('./router');
app.use(router);

// 错误处理
const error = require('./middlewares/error.js');
app.use(error);

const port = config.service.port;
app.listen(port, () => {
  console.log(`[boar] running on: http://127.0.0.1:${port}`);
});
