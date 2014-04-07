// ����� �����մϴ�.
var express = require('express');
var http = require('http');
var path = require('path');
var everyauth = require('everyauth');
var mongojs = require('mongojs');
var redis = require('redis');

// ���� ����� �����մϴ�.
var rintAuth = require('./routes/auth');
var rintMain = require('./routes/main');
var rintPosts = require('./routes/posts');
var rintFriends = require('./routes/friends');
var rintReplies = require('./routes/replies');
var rintSockets = require('./routes/sockets');

// �⺻ �޼��带 �߰��մϴ�.
Object.defineProperties(Array.prototype, {
    contain: {
        value: function (data) {
            if (this.indexOf(data) != -1) {
                return true;
            } else {
                return false;
            }
        }
    },
    remove: {
        value: function (data) {
            var index = this.indexOf(data);
            if (index) { removeAt(index); }
            return this;
        }
    },
    removeAt: {
        value: function (index) {
            this.splice(index, 1);
            return this;
        }
    }
});

// �����ͺ��̽��� �����մϴ�.
var db = mongojs.connect('social', ['posts', 'users', 'socket']);
var client = redis.createClient();
process.on('exit', function () {
    client.quit();
});

// �⺻ �Լ��� �����մϴ�.
var ObjectId = db.ObjectId;
var parse = require('express/node_modules/cookie').parse;
var parseSignedCookies = require('express/node_modules/connect/lib/utils').parseSignedCookies;
var parseCookie = function (cookie) {
    return parseSignedCookies(parse(cookie), 'your secret here')
};

// ������ �����մϴ�.
var app = express();
var server = http.createServer(app);

// ���� ����Ҹ� �����մϴ�: ���� ����Ҹ� Redis �����ͺ��̽��� �����ص� �����ϴ�.
var sessionStore = new express.session.MemoryStore({ reapInterval: 60000 * 10 });

// EveryAuth ����� �⺻ �����մϴ�.
rintAuth.active(everyauth, db);

// ������ �����մϴ�: �⺻ ����
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session({
        key: 'session',
        store: sessionStore
    }));
    app.use(everyauth.middleware());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

// ������ �����մϴ�: ���� ���
app.configure('development', function(){
    app.use(express.errorHandler());
});

// ���� ������ �����մϴ�.
var io = require('socket.io').listen(server);
io.set('log level', 2);

// ���Ʈ�� �����մϴ�.
rintMain.active(app, db);
rintPosts.active(app, db, io.sockets.sockets);
rintFriends.active(app, db, io.sockets.sockets);
rintReplies.active(app, db, io.sockets.sockets);
rintSockets.active(io, client, parseCookie, sessionStore);

// ������ �����մϴ�.
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});