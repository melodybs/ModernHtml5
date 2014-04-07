// ����� �����մϴ�.
var http = require('http');
var express = require('express');
var app = express();

// ����� �����մϴ�.
app.use(express.static('public'));
app.use(express.bodyParser());
app.use(app.router);

// �����͸� �����մϴ�.
var books = [{
    _id: 0,
    name: '��� ���� ���� JavaScript + jQuery �Թ�',
    isbn: '9788979148749',
    today_count: 10
}, {
    _id: 1,
    name: '��� ���� ���� Node.js ���α׷���',
    isbn: '9788979148886',
    today_count: 10
}, {
    _id: 2,
    name: '��� ���� ���� HTML5 + CSS3 �Թ�',
    isbn: '9788979149555',
    today_count: 10
}];

// ���Ʈ�մϴ�.
app.get('/books', function (request, response) {
    response.send(books);
});

app.get('/books/:id', function (request, response) {
    response.send(books[Number(request.param('id'))]);
});

app.all('*', function (request, response) {
    // url�� body �Ӽ��� ����մϴ�.
    console.log();
    console.log(request.method + ' : ' + request.url);
    console.log('body: ' + JSON.stringify(request.body, null, 2));
    // �����մϴ�.
    response.send();
});

// ������ �����մϴ�.
http.createServer(app).listen(52273, function () {
    console.log('Server Running at http://127.0.0.1:52273');
});