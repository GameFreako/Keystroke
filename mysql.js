const fs = require('fs');
const dbFile = './.data/sqlite.db';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbFile);

db.serialize();


const sc = require('./sqlchar.json');

// TABLE LIST
// warns ("server" LONGINT, "user" LONGINT, "reason" LONGTEXT, "by" LONGTEXT, "time" LONGINT)



exports.code = function (code) {
  console.log('running ' + code + ' !');
  db.run(code);
  console.log('executed');
};

exports.get = function(table, query) {
  db.all(`SELECT * FROM ${table} WHERE ${query}`, function(err, rows) {
    if (err) throw err;
    if (rows) {
      return(JSON.stringify(rows));
    }
  });
};

exports.db = db;

exports.insert = function(table, data) {
  if (!table || !data) return false;
  var i;
  for (i=0; i<sc.length; i++) {
    data.replace(/sc[i]/g, )
  };
  var da = data.split("^");
  var insert = `(`
  var i;
  for (i=0; i<da.length; i++) {
    var d = da[i];
    if (i+1 == da.length) {
      var insert = insert + `"${d}");`;
    } else {
      var insert = insert + `"${d}", `;
    };
  };
  if (!insert) return false;
  db.run(`INSERT INTO ${table} VALUES ${insert}`);
  return true;
};