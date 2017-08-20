
module.exports = {

  checkDB: function(callback){
      var pathExists = require('path-exists');
      pathExists('indexed.lock').then(exists => {
        if(!exists){ //eh a primeira execucao, o banco nao esta indexado
          console.log("Primeira execução, indexando banco de dados...");
          prepareDatabase(function (err){
            if (err) return callback(err);
            console.log("Banco de dados pronto.");
            return callback();
          });
        }else{ //o banco ja esta indexado, pode executar a aplicacao normalmente
          return callback();
        }
      });
  },

  createTagsField: function(name,username,callback){
    var async = require('async');
    async.parallel([ //padronizando as strings de username e user em paralelo
      function(cb) {
        standardizeString(name,function(err,stdName){ //padroniza name
          if (err) return cb(err);
          name=stdName;
          return cb();
        });
      },
      function(cb) {
        standardizeString(username,function(err,stdUsername){ //padroniza username
          if (err) return cb(err);
          username=stdUsername;
          return cb();
        });
      }
    ], function(err) { //terminou de padronizar as duas, insere o field tags no elemento
      if (err) return callback(err);
      removeDuplicatesFromArrays(name,username,function (err,tags) { //remove elementos repetidos
        return callback(null,tags);
      });
    });
  },

  getPriorityLists: function(filePath,callback){
    var arrayIds = [];
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(filePath)
    });
    lineReader.on('line', function (line) {
      arrayIds.push(line);
    })
    .on('close', function () {
      return callback(null,arrayIds);
    });
  }
}

function removeDuplicatesFromArrays(array1,array2,callback){
  var a = new Set(array1);
  var b = new Set(array2);
  var onlyArray1Has = (new Set([...a].filter(x => !b.has(x)))); //a\b
  var onlyArray2Has = (new Set([...b].filter(x => !a.has(x)))); //b\a
  var bothArraysHas = (new Set([...a].filter(x => b.has(x))));  //a∩b
  var arrStd = new Set([...onlyArray1Has, ...onlyArray2Has, ...bothArraysHas])
  arrStd = [...arrStd]; //convertendo set em array
  return callback(null,arrStd);
};

function standardizeString (str,callback){
  str = str.toLowerCase(); //coloca em minusculo
  str = str.split(/[ .]+/); //remove pontos e espacos
  var temp = [];
  for(let i of str)
      i && temp.push(i); // copia os valores nao vazios para um array temporario
  str = temp;
  delete temp; // discard the variable
  return callback(null,str);
};

function prepareDatabase(callback){
  var User = require('./models/user');
  var lockFile = require('lockfile')
  var filename = 'index_tags.lock'
  var async = require('async');
  async.series([ //
    function(cb) {
      lockFile.lock(filename, function (){ //cria lockfile da indexacao do banco
        return cb();
      });
    },
    function(cb) { //gera tags, seta listas e indexa no banco
      User.setDatabase(function(err){
        if (err) return cb(err);
        return cb();
      });
    },
    function(cb) { //libera lockfile
      lockFile.unlock(filename, function (err){
        if (err) return cb(err);
        return cb();
      });
    },
    function(cb) {
      lockFile.lock('indexed.lock', function (err){ //cria lockfile para indicar que o banco ja foi preparado e nao precisa executar essa funcao novamente
        if (err) return cb(err);
        return cb();
      });
    }
  ], function(err) { //
    if (err) return callback(err);
    return callback();
  });
};