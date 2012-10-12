var http = require('http')
  , assert = require('assert')
  , request = require('../main.js')
  ;

var portOne = 8968
  , portTwo = 8969
  ;


// server one
var s1 = http.createServer(function (req, resp)
{
  var parsed = require('url').parse(req.url);
  console.log('parsed', req.url, parsed);

  if (parsed.pathname == '/original')
  {
    resp.writeHeader(302, {'location': '/redirected' + (parsed.search || '')});
    resp.end()
  }
  else if (parsed.pathname == '/redirected')
  {
    resp.writeHeader(200, {'content-type': 'text/plain'})
    resp.write(parsed.query);
    resp.end()
  }

}).listen(portOne);


// server two
var s2 = http.createServer(function (req, resp)
{

  var x = request('http://localhost:'+portOne+'/original')
  req.pipe(x)
  x.pipe(resp)

}).listen(portTwo, function()
{

    var query = 'query_key=queryvalue';
    var r = request('http://localhost:'+portTwo+'/original?' + query, function (err, res, body) {

    assert.equal(body, query)

    s1.close()
    s2.close()

  });

  // it hangs, so wait a second :)
  r.timeout = 1000;

});
