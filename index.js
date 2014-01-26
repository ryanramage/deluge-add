var request = require('request'),
    zlib = require('zlib');

var host_body = {method:"web.get_hosts",params:[],            "id":1};

module.exports = function(deluge_url, password, magnet_url, download_location, cb) {
  if (!cb) cb = function(){}; //

  var jar = request.jar(),
      d = function(body, callback) {
        deluge(deluge_url, body, jar, callback);
      }

  d(getAuthBody(password), function(err, resp) {
    if(err) return cb(err);

    d(host_body, function(err, resp){
      if(err) return cb(err);

      var host = parseHostBody(resp);
      d(getConnectBody(host), function(err, resp){
        if(err) return cb(err);

        d(getAddBody(magnet_url, download_location), cb)
      })
    })
  });
}

function getAuthBody(password) {
  return {method:"auth.login",   params: [password], "id": 0}
}

function parseHostBody(resp) {
  if (!resp.result) resp = JSON.parse(resp);

  // return the first host entry. resp looks like
  //{"id": 1, "result": [["f16e04a60638b758c247ce76371ed464aeb4adf1", "127.0.0.1", 58846, "Offline"]], "error": null}
  return resp.result[0][0];
}

function getConnectBody(host){
  return {method: "web.connect", params: [host], "id": 2};
}

function getAddBody(magnet_url, download_location) {
  return {
    method:"web.add_torrents",
    id: 2,
    params: [[{
          path: magnet_url,
          options:{
            file_priorities:[],
            add_paused:false,
            compact_allocation:false,
            download_location: download_location,
            max_connections:-1,
            max_download_speed:-1,
            max_upload_slots:-1,
            max_upload_speed:-1,
            prioritize_first_last_pieces:false
          }
    }]],
  }
}

function deluge(url, body, jar, callback) {
  var req = request({
    url: url,
    method:'POST',
    headers: {'Content-type':'application/json'},
    body: JSON.stringify(body),
    jar: jar
  });

  req.on('response', function(res) {
      var chunks = [];
      res.on('data', function(chunk) {
        chunks.push(chunk);
      });

      res.on('end', function() {
        var buffer = Buffer.concat(chunks);
        var encoding = res.headers['content-encoding'];
        if (encoding == 'gzip') {
          zlib.gunzip(buffer, function(err, decoded) {
            callback(err, decoded && decoded.toString());
          });
        } else if (encoding == 'deflate') {
          zlib.inflate(buffer, function(err, decoded) {
            callback(err, decoded && decoded.toString());
          })
        } else {
          callback(null, buffer.toString());
        }
      });
    });
}
