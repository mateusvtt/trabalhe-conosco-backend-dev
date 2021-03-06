
$(function() { //shorthand document.ready function

  $('#searchInput').tagsinput({
    confirmKeys: [ 32 ]
  });

  $('#searchBarForm').on('submit', function(e) { //use on if jQuery 1.7+
    e.preventDefault();  //prevent form from submitting
    goToPage(1);
  });

  $('.searchButton').on('click',function(){
    goToPage(1);
  });

  $(".bootstrap-tagsinput").addClass("form-control");
  $(".bootstrap-tagsinput").find("input").focus();

});

function goToPage(page){
  if (page == null){ //foi passado via input
    var page = $('#pageTarget').val();
  }
  search.init(page);
}

var search = {
  init: function(page){
    search.ajaxData(page);
  },
  ajaxData : function (page){
    var searchOperator = ($('input[name=options]:checked', '#searchOperator').val()); //busca do tipo OR ou AND
    var query = $('#searchInput').tagsinput('items');
    if(query != ""){
      $(".user-table thead").empty();
      $(".user-table tbody").empty();
      $(".user-table tfoot").empty();
      $('<i class="fa fa-spinner fa-spin"></i>').appendTo('.user-table thead')
      var url = "/users/"+page+"/"+searchOperator+"/"+query;
      $.getJSON( url, function( result ) {
        $(".user-table thead").empty();
        var users = result.docs;
        var total = Number(result.total);
        var limit = Number(result.limit);
        var page = Number(result.page);
        var nextPage = page + 1;
        var nextNextPage = page + 2;
        var nextPageButton = page + 3;
        var previousPageButton = page -1;
        var pages = result.pages;
        $(`<tr>
          <th><b>ID</b></td>
          <th><b>Nome</b></td>
          <th><b>Username</b></td>
          <th><b>Listas de Relevancia</b></td>
        </tr>`).appendTo(".user-table thead");
        users.forEach(function(user,index){
          $(`
          <tr>
            <td>
                <p>${user.id_sec}</p>
            </td>
            <td>
              <p>${user.name}</p>
            </td>
            <td>
              <p>${user.username}</p>
            </td>
            <td id="listaUser`+index+`">

            </td>
          </tr>
          `).appendTo(".user-table tbody");
          if(user.lista1){
            $('<span class="label label-success">  Lista 1  </span>').appendTo('#listaUser'+index);
          }
          else if(user.lista2){
            $('<span class="label label-primary">  Lista 2  </span>').appendTo('#listaUser'+index);
          }
          else{
            $('<span class="label label-default"> Nenhuma </span>').appendTo('#listaUser'+index);
          }

        });

            $(`<tr>
              <td><b id="usuarios">`+total+` usuário(s) encontrados</b></td>
              <td><b id="paginas">`+pages+` página(s)</b></td>
              <td><ul class="pagination pagination-sm right">
                <li id="previousPageButton" class="goToPage disabled"><a>&laquo;</a></li>
                <li class="active goToPage" onclick="goToPage(`+page+`);"><a>`+page+`<span class="sr-only">(current)</span></a></li>
                <li class="goToPage" onclick="goToPage(`+nextPage+`);"><a>`+nextPage+`</a></li>
                <li class="goToPage" onclick="goToPage(`+nextNextPage+`);"><a>`+nextNextPage+`</a></li>
                <li class="goToPage" onclick="goToPage(`+nextPageButton+`);"><a>&raquo;</a></li>
              </ul></td>
              <td> <div class="input-group col-sm-7">
                <input type="Number" min=1 id="pageTarget" class="form-control" placeholder="`+page+`" >
                <div title="Pular para página" class="input-group-addon goToPage"  onclick="goToPage();"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></div>

              </div> </td>
            </tr>`).appendTo(".user-table tfoot");
            if(page>1){
              $( "#previousPageButton" ).removeClass( "disabled" );
              $( "#previousPageButton" ).click(function(){ goToPage(previousPageButton); });
            }
      });
    }
  },
};
