
var url =  window.location.href;
var urlSw = '/tienddy/sw.js';

if(navigator.serviceWorker){

   if( url.includes('localhost') || url.includes('127.0.0.1') ){
      urlSw = '/sw.js';
   }

   navigator.serviceWorker.register(urlSw);
   
}

var usuario = {};
var tienda = {};
var carrito = {};
window.onload = function() {          

          pasosCompra('usuario');
          document.getElementById("cargando").style.opacity = "0";
          document.getElementById("modpop").style.display = "none";
          document.getElementById("modpopFoot").style.display = "none";

          obj = window.document.getElementById("autocomplete-input");
          obj.addEventListener("keydown", function(event){
            buscar(event);
          });

};

        document.addEventListener('DOMContentLoaded', function() {
          var elemsMod = document.querySelectorAll('.modal');
          modalpop = M.Modal.init(elemsMod);

          var elemsSid = document.querySelectorAll('.sidenav');
          var instancesSid = M.Sidenav.init(elemsSid);

          var elemsSel = document.querySelectorAll('select');
          instances = M.FormSelect.init(elemsSel);

        });

        function pasosCompra(operacion){

          switch(operacion){
            case 'usuario':
              document.getElementById("usuario").style.display = "block";                  
              document.getElementById("tienda").style.display = "none";
              document.getElementById("compra").style.display = "none";
            break;

            case 'tienda':
              if(usuario){                                 
                document.getElementById("usuario").style.display = "none";
                document.getElementById("tienda").style.display = "block";
                document.getElementById("compra").style.display = "none";
              }
            break;

            case 'compra':
              document.getElementById("usuario").style.display = "none";
              document.getElementById("tienda").style.display = "none";
              document.getElementById("compra").style.display = "block";
            break;
            
          }

        }

        function confirmar(){
          let pedidoWhatsApp = 'Nuevo pedido desde Tienddify! \n\ \n\ ';
          let cont = 1;

          pedidoWhatsApp += ' El usuario ' + usuario.nombre + ' \n ';
          pedidoWhatsApp += ' solicitó el siguiente pedido: \n \n ';

          Object.keys(carrito).forEach(function(key) {
              pedidoWhatsApp += ''+cont+')'+carrito[key].descripcion+' ('+carrito[key].cantidad+' unidad/es) \n\ \n\ ';
              cont++;              
          });

          pedidoWhatsApp += ' Domicilio de entrega: '+usuario.domicilio+' \n  ';
          pedidoWhatsApp += ' Teléfono de contacto: '+usuario.telefono+' \n  ';

          pedidoWhatsApp = "https://api.whatsapp.com/send?phone=549"+tienda.telefono+"&text=" + encodeURI(pedidoWhatsApp);          
          carrito = {};
          document.getElementById('agregandoCarrito').innerHTML = 'No hay productos en tu lista.';
          document.getElementById('agregandoCerrar').click(); 
          document.getElementById('carritoCerrar').click();       
          agradecimiento();
          window.location.replace(pedidoWhatsApp);          
        }

        function validarCompra(){

         if(Object.keys(carrito).length > 0 ){
            document.getElementById('tituloAgregando').innerHTML = 'Ya casi terminás!';          
            document.getElementById('agregando').innerHTML = '<ul class="collection">'+
                                                                '<li class="collection-item avatar">'+
                                                                  '<img src="img/feliz.png" class="circle">'+
                                                                  '<span class="title">Estás por confirmar el pedido.</span><br/><br/>'+
                                                                  '<div class="center-align">'+
                                                                  '<a class="waves-effect waves-light btn" id="confirmar"><i class="material-icons right">check_circle</i>Ok</a>'+
                                                                  '<div/>'+
                                                                '</li>'+
                                                              '</ul>';

              document.getElementById('confirmar').setAttribute("onclick", "confirmar()");
              document.getElementById('modpop').click();
           }

        }

        function agregar(id,descripcion,url,dataPop){

          if( carrito[''+id+''] == window.undefined){
            document.getElementById('tituloAgregando').innerHTML = 'Se agregó a tu pedido:'; 
            document.getElementById('agregando').innerHTML = '';
            carrito[''+id+''] = {descripcion: descripcion, url: url, cantidad: 1};          
            document.getElementById('agregando').innerHTML = '<ul class="collection">'+dataPop+'</ul>';
            document.getElementById('modpop').click();
            setTimeout(function(){ document.getElementById('agregandoCerrar').click() }, 1000);
          }else{
            document.getElementById('tituloAgregando').innerHTML = 'Ups!';  
            document.getElementById('agregando').innerHTML = '<ul class="collection">'+
                                                              '<li class="collection-item avatar">'+
                                                              '<img src="img/alerta.png" class="circle">'+
                                                                '<span class="title">Este producto ya esta en tu lista.</span>'+
                                                              '</li></ul>';
            document.getElementById('modpop').click();
            setTimeout(function(){ document.getElementById('agregandoCerrar').click() }, 1000);
          }
        }

        function mostrarCarrito(){
            if( Object.keys(usuario).length > 0 && Object.keys(tienda).length > 0){
              document.getElementById('agregandoCarrito').innerHTML = 'No hay productos en tu lista.';
              if(Object.keys(carrito).length > 0 ){

                  document.getElementById('agregandoCarrito').innerHTML = '';
                  Object.keys(carrito).forEach(function(key) {
                    let dataCarrito = 
                          '<li class="collection-item avatar">' + 
                            '<img src="'+carrito[key].url+'" class="circle">'+
                            '<span class="title">'+carrito[key].descripcion+'</span>'+
                              '<a href="#!" id="_'+key+'" class="secondary-content"></a>'+ 
                          '</li>';           
                    document.getElementById('agregandoCarrito').innerHTML += dataCarrito;
                    
                    let tagImenos = document.createElement("i");                    
                    tagImenos.innerHTML = "remove_circle";
                    tagImenos.setAttribute("class", "material-icons");                   
                    tagImenos.setAttribute("onclick", "restar("+key+")");
                    document.getElementById('_'+key+'').appendChild(tagImenos);
                    
                    let spanCant = document.createElement("span");                    
                    spanCant.innerHTML = carrito[key].cantidad;
                    spanCant.setAttribute("class", "title");
                    spanCant.setAttribute("id", 'cant_'+key+'');                
                    document.getElementById('_'+key+'').appendChild(spanCant);


                    let tagImas = document.createElement("i");                    
                    tagImas.innerHTML = "add_circle";
                    tagImas.setAttribute("class", "material-icons");                   
                    tagImas.setAttribute("onclick", "sumar("+key+")");
                    document.getElementById('_'+key+'').appendChild(tagImas);

                  
                  });
                        
              }
              document.getElementById('modpopFoot').click();

          }
        }

        function restar(idprod){          
          
          if(carrito[''+idprod+''].cantidad >= 1 ){
            carrito[''+idprod+''].cantidad--;
            document.getElementById('cant_'+idprod+'').innerHTML =  carrito[''+idprod+''].cantidad;
          }

        }

        function sumar(idprod){
          if(carrito[''+idprod+''].cantidad <=14 ){
            carrito[''+idprod+''].cantidad++;
            document.getElementById('cant_'+idprod+'').innerHTML =  carrito[''+idprod+''].cantidad;
          }

        }

        function buscar(evento){

          if(event.which == 13 ){

              document.getElementById("cargando").style.opacity = "1";
 
              let url = "";
              let producto = window.document.getElementById("autocomplete-input").value;
              document.getElementById('lista').innerHTML = '';

              url = "https://ucustom.walmart.com.ar/suggest/full.json?bucket=walmart_search_stage&f=product&q=" + encodeURI(producto) + "&attributes[sales_channel][]=15";
              fetch(url)
              .then(result => {
                result = result.json();
                return result;
              }).
              then(res => {

                document.getElementById("cargando").style.opacity = "0";
                
                if( Object.keys(res.data.views).length > 0 ){                      
                      
                      (res.data.views).forEach(element => {
                      let conts = 
                                  '<li class="collection-item avatar">' + 
                                    '<img src="'+element.image+'" class="circle">'+
                                    '<span class="title">'+element.title+'</span>'+
                                      '<a href="#!" id="'+element.product_id+'" class="secondary-content"></a>'
                                  '</li>';
                        document.getElementById('lista').innerHTML += conts;
                        let tagI = document.createElement("i");                    
                        tagI.innerHTML = "add_shopping_cart";
                        tagI.setAttribute("class", "material-icons");                   
                        tagI.setAttribute("onclick", "agregar('"+element.product_id+"','"+element.title+"','"+element.image+"','"+conts+"')");
                        document.getElementById(''+element.product_id+'').appendChild(tagI);

                      });                      
                }else{                      
                      document.getElementById('lista').innerHTML = 'No hay resultados...';
                      return false;
                }
                
              });
          }

        }

        function validarUsuario(){
          
          let nomb  = document.getElementById('nombre_usuario').value;
          let tel   = document.getElementById('telefono_usuario').value;
          let domi = document.getElementById('domicilio_usuario').value;
          if(nomb.length >= 3 && tel.length == 10 && domi.length >= 4 ){
              usuario = {nombre: nomb,telefono: tel, domicilio: domi};             
              pasosCompra('tienda');
          }else{
              let error = ''
              if(nomb.length < 3){
                error += '<span class="title"> - El nombre es demasiado corto.</span><br/><br/>';
              }
              if(tel.length != 10){
                error += '<span class="title"> - El teléfono debe tener 10 caractéres.</span><br/><br/>';
              }
              if(domi.length < 4){
                error += '<span class="title"> - El domicilio es demasiado corto.</span><br/><br/>';
              }
              document.getElementById('tituloAgregando').innerHTML = 'Ups!'; 
              document.getElementById('agregando').innerHTML = '<ul class="collection">'+
                                                                '<li class="collection-item avatar">'+
                                                                  '<img src="img/alerta.png" class="circle">'+
                                                                  '<span class="title">Los datos no son correctos.</span><br/><br/>'+
                                                                  error
                                                                '</li>'+
                                                               '</ul>';              
              document.getElementById('modpop').click();              
          }

        }

        function validarTienda(){
          
          let ciudad  = document.getElementById('ciudad_tienda').value;
          let tiendaSel  = document.getElementById('id_tienda').value;
          let error   = '';
          if( ciudad == '' || tiendaSel == ""){              
            
            if(ciudad == ''){
               error += '<span class="title"> - Tenés que elegir una ciudad.</span><br/><br/>';
            }
            if(tiendaSel == ''){
               error += '<span class="title"> - Tenés que elegir una tienda.</span><br/><br/>';
            }
              document.getElementById('tituloAgregando').innerHTML = 'Ups!'; 
              document.getElementById('agregando').innerHTML = '<ul class="collection">'+
                                                                '<li class="collection-item avatar">'+
                                                                  '<img src="img/alerta.png" class="circle">'+
                                                                  '<span class="title">Los datos no son correctos.</span><br/><br/>'+
                                                                  error
                                                                '</li>'+
                                                               '</ul>';              
              document.getElementById('modpop').click();
          }else if( ciudad != '' && tiendaSel != ""){
            tienda = {telefono: tiendaSel, ciudad: ciudad };
            pasosCompra('compra');
          }        
        }

        function agradecimiento(){

          document.getElementById('lista').innerHTML = '<div class="row s6">'+
                                                              '<div class="col s12 m4">'+
                                                                '<div class="card">'+
                                                                  '<div class="card-image waves-effect waves-block waves-light">'+
                                                                    '<img class="activator" src="img/agradecimiento.png">'+
                                                                  '</div>'+ 
                                                                '</div>'+
                                                              '</div>'+
                                                            '</div>';

        }  

        function validarTiendaBtn(){
          if( Object.keys(usuario).length > 0 ){
            pasosCompra('tienda');
          }
        }

        function validarUsuarioBtn(){
           if( Object.keys(usuario).length > 0 ){
            pasosCompra('usuario');
          } 
        }