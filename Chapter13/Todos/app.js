// ����� �����մϴ�.
var express = require('express');
var http = require('http');

// �� ������ �����մϴ�.
var app = express();

// �����ͺ��̽��� �����մϴ�.
var db = require('mongojs').connect('rest', ['todos', 'users']);

// �� ������ �����մϴ�.
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.cookieParser('secret key'));
app.use(express.session());
app.use(express.static('public'));
app.use(app.router);

// ���Ʈ�մϴ�.                        
app.get('/todos', function (request, response) {
    if (request.session.me) {
        db.todos.find({
            author: request.session.me._id.toString()
        }, function (error, results) {
            if (error) {
                // Status Code 500(���� ���� ����)
                response.send(500);
            } else {
                // Status Code 200(����)
                response.send(results);
            }
        });
    } else {
        // Status Code 401(���� ����)
        response.send(401);
    }
});

app.get('/todos/:id', function (request, response) {
    if (request.session.me) {
        db.todos.findOne({
            _id: db.ObjectId(request.param('id')),
            author: request.session.me._id.toString()
        }, function (error, result) {
            if (error) {
                // Status Code 500(���� ���� ����)
                response.send(500);
            } else if (result) {
                // Status Code 200(����)
                response.send(result);
            } else {
                // Status Code 404(ã�� �� ����)
                response.send(404);
            }
        });
    } else {
        // Status Code 401(���� ����)
        response.send(401);
    }
});

app.post('/todos', function (request, response) {
    if (request.session.me) {
        if (request.param('title')) {
            db.todos.insert({
                title: request.param('title'),
                completed: false,
                author: request.session.me._id.toString()
            }, function (error, results) {
                if (error) {
                    // Status Code 500(���� ���� ����)
                    response.send(500);
                } else {
                    // Status Code 200(����)
                    response.send(results);
                }
            });
        } else {
            // Status Code 400(�߸��� ��û)
            response.send(400);
        }
    } else {
        // Status Code 401(���� ����)
        response.send(401);
    }
});
app.put('/todos/:id', function (request, response) {
    if (request.session.me) {
        if (request.param('completed')) {
            db.todos.update({
                _id: db.ObjectId(request.param('id')),
                author: request.session.me._id.toString()
            }, {
                $set: {
                    completed: (function () {
                        if (request.param('completed') == 'true')
                            return true;
                        else if (request.param('completed') == true)
                            return true;
                        else
                            return false;
                    })()
                }
            }, function (error, result) {
                if (error) {
                    // Status Code 500(���� ���� ����)
                    response.send(500);
                } else {
                    // Status Code 200(����)
                    response.send(200);
                }
            });
        } else {
            // Status Code 400(�߸��� ��û)
            response.send(400);
        }
    } else {
        // Status Code 401(���� ����)
        response.send(401);
    }
});

app.del('/todos/:id', function (request, response) {
    if (request.session.me) {
        db.todos.remove({
            _id: db.ObjectId(request.param('id')),
            author: request.session.me._id.toString()
        }, function (error, result) {
            if (error) {
                // Status Code 500(���� ���� ����)
                response.send(500);
            } else {
                // Status Code 200(����)
                response.send(200);
            }
        });
    } else {
        // Status Code 401(���� ����)
        response.send(401);
    }
});

app.get('/users', function (request, response) {
    db.users.find(function (error, results) {
        response.send(results);
    });
});

app.post('/users', function (request, response) {
    // ������ �����մϴ�.
    var login = request.param('login');
    var password = request.param('password');
    if (login && password) {
        // ���̵� �ߺ��� Ȯ���մϴ�.
        db.users.findOne({
            login: login
        }, function (error, result) {
            if (result) {
                // Status Code 409(�浹)
                response.send(409);
            } else {
                // �ؽø� �����մϴ�.
                var shasum = require('crypto').createHash('sha1');
                shasum.update(password);
                var hash = shasum.digest('hex');
                // �����ͺ��̽� ��û�� �����մϴ�.
                db.users.insert({
                    login: login,
                    hash: hash
                }, function (error, result) {
                    if (error) {
                        // Status Code 500(���� ���� ����)
                        response.send(500);
                    } else {
                        // Status Code 200(����)
                        response.send(result);
                    }
                });
            }
        });
    } else {
        // Status Code 400(�߸��� ��û)
        response.send(400);
    }
});

app.post('/users/login', function (request, response) {
    // ������ �����մϴ�.
    var login = request.param('login');
    var password = request.param('password');
    if (login && password) {
        // �����ͺ��̽����� ����ڸ� ã���ϴ�.
        db.users.findOne({
            login: login
        }, function (error, result) {
            if (error) {
                // Status Code 500(���� ���� ����)
                response.send(500);
            } else if (result) {
                // �ؽø� �����մϴ�.
                var shasum = require('crypto').createHash('sha1');
                shasum.update(password);
                var hash = shasum.digest('hex');
                // ���մϴ�.
                if (hash == result.hash) {
                    // Status Code 200(����)
                    request.session.me = result;
                    response.send(200);
                } else {
                    // Status Code 400(�߸��� ��û)
                    response.send({ message: '��й�ȣ�� ���� ����' }, 400);
                }
            } else {
                // Status Code 400(�߸��� ��û)
                response.send({ message: '���̵� ����' }, 400);
            }
        });
    } else {
        // Status Code 400(�߸��� ��û)
        response.send({ message: '��û �Ű������� �������� ����' }, 400);
    }
});

app.get('/users/me', function (request, response) {
    // �α��� ���� Ȯ��
    if (request.session.me) {
        // Status Code 200(����)
        response.send(request.session.me);
    } else {
        // Status Code 401(���� ����)
        response.send(401);
    }
});

app.get('/users/logout', function (request, response) {
    // �α��� ���� Ȯ��
    if (request.session.me) {
        // ������ �����մϴ�.
        request.session.destroy();
        // Status Code 200(����)
        response.send(200);
    } else {
        // Status Code 401(���� ����)
        response.send(401);
    }
});

// �� ������ �����մϴ�.
http.createServer(app).listen(52273, function () {
    console.log('Express server listening on port 52273');
});