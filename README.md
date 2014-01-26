deleuge-add
============

A simple way to add torrents to the deluge web client.

Usage
------

    var deluge_add = require('deluge-add'),
        deluge_url = 'http://yourhost.com/json',
        magnet_url = 'magnet:?xt=urn:btih:CT76LXJDDCH5LS2TUHKH6EUJ3NYKX4Y6',
        password = 'deluge',
        download_location = '/path/on/deluge/server';

    deluge_add(deluge_url, password, magnet_url, download_location, function(err, result){

    });

