var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var userSchema = new mongoose.Schema({
  id_sec: { type: String, unique: true, index:true },
  name: String,
  username: String,
  tags: { type: [String], index:true },
  lista1: { type: Number, default: 0},
  lista2: { type: Number, default: 0},
});

userSchema.plugin(mongoosePaginate);

userSchema.statics.setTags  = function (callback){ //metodos para definir as keyswords que representam um usuario
  var dbFunctions = require('../dbFunctions');
  this.find({}).cursor()
     .on('data', function(user){
        dbFunctions.createTagsField(user.name,user.username,function(err,tags){
          user.set('tags', tags);
          user.save(function (error) {
            if (error) throw error;
          });
        });
  })
  .on('error', function(error) {
      throw error;
  })
  .on('end', function() {
      // final callback
      return callback();
  });
};

userSchema.statics.setPriorityLists  = function (callback){ //metodo de leitura das listas de relevancia e atualizacao dos documentos no BD
  var dbFunctions = require('../dbFunctions');
  var async = require('async');
  var lista_relevancia_1 = './static/files/lista_relevancia_1.txt';
  var lista_relevancia_2 = './static/files/lista_relevancia_2.txt';
  var arrayIdsAll = [];
  var arrayIds1 = [];
  var arrayIds2 = [];
  async.parallel([ //fazendo leitura dos arquivos lista e inserindo no banco, de acordo com os ids
    function(cb) {
      dbFunctions.getPriorityLists(lista_relevancia_1,function(err,arrayIds){ //le a primeira lista_relevancia
        if (err) return cb(err);
        arrayIds1=arrayIds;
        return cb();
      });
    },
    function(cb) {
      dbFunctions.getPriorityLists(lista_relevancia_2,function(err,arrayIds){ //le a segunda lista_relevancia
        if (err) return cb(err);
        arrayIds2=arrayIds;
        return cb();
      });
    }
  ], function(err) { //terminou a leitura dos arquivos, hora de inserir no banco
    if (err) return callback(err);
    var count2 = 0;
    var count1 = 0;
    async.parallel([ //setar variaveis no banco
      function(cb) { //setar lista1
        for (var i = 0, len1 = arrayIds1.length; i < len1; i++){ //for mais eficiente, nao le o tamanho do vetor a cada iteracao
          User.update({id_sec: arrayIds1[i]}, { lista1: 1 }, function(err) {
              if (err) return cb(err);
              count1++;
              if(count1 == len1) return cb();//terminou de atualizar todas as entradas para lista1
            });
        }
      },
      function(cb) { //setar lista2
        for (var j = 0, len2 = arrayIds2.length; j < len2; j++){ //for mais eficiente, nao le o tamanho do vetor a cada iteracao
          User.update({id_sec: arrayIds2[j]}, { lista2: 1 }, function(err) {
              if (err) return cb(err);
              count2++;
              if(count2 == len2) return cb();//terminou de atualizar todas as entradas para lista2
            });
        }
      }
    ], function(err) { //terminou a atualizacao dos dados
      if (err) return callback(err);
      return callback();
    });
  });
};

userSchema.statics.setDatabase  = function (callback){ //aplica os dois matodos acima de forma serial para indexar o banco
  var async = require('async');
  async.series([
      function(cb) { //setar tags
        console.log("Gerando keywords de usuários...");
        User.setTags(function(err){
          if (err) return cb(err);
          console.log("Keywords geradas e indexadas.");
          return cb();
        });
      },
      function(cb) { //setar listas
        console.log("Lendo arquivos de lista de relevância...");
        User.setPriorityLists(function(err){
          if (err) return cb(err);
          console.log("Informações de lista de relevância inseridas.");
          return cb();
        });
      }
  ], function(err) { //banco indexado
      if (err) return callback(err);
      return callback();
  });
};

var User = mongoose.model('User', userSchema);
module.exports = User;
