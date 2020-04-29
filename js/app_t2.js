   
var url =  window.location.href;   
var urlSw = '/tienddy/sw_t2.js'; 
     
if(navigator.serviceWorker){

   if( url.includes('localhost') || url.includes('127.0.0.1') ){
      urlSw = '/sw_t2.js'; 
   }

   navigator.serviceWorker.register(urlSw);
} 

var usuario = {};
var tienda = {};
var carrito = {};

var resPouch = false;
var db = false;
var mymap = false;

const url_string = window.location.href;
const urlv = new URL(url_string);
let u = urlv.searchParams.get("source");
const mobMode = (u == 'pwa' && (window.matchMedia('(display-mode: standalone)').matches ? true : false) );


if( mobMode ){
    db = new PouchDB('TNDFY_v1.0.0.0');   
}

var remoteCouch = false;

const database = iniFiBa();

const refTiendas = database.ref('tiendas');

window.onload = function() {          
                      
          if( mobMode ){             
             pasosCompra('usuario');
                 
          }else{ 
             pasosCompra('instalacion'); 
          }          

          document.getElementById("cargando").style.opacity = "0";
          document.getElementById("modpop").style.display = "none";
          document.getElementById("modpopFoot").style.display = "none";

          obj = window.document.getElementById("autocomplete-input");
          obj.addEventListener("keydown", function(event){
            buscar(event);
          });

          const buttonAdd = document.getElementById('instalar');

          let deferredPrompt;
          window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later. ////////////////////////////////////////
            deferredPrompt = e;
          });

          // Add event click function for Add button
          buttonAdd.addEventListener('click', (e) => {

            if(navigator.userAgent.match(/SAMSUNG|SGH-[I|N|T]|GT-[I|P|N]|SM-[N|P|T|Z|G]|SHV-E|SCH-[I|J|R|S]|SPH-L/i))  {
                alert('Por favor abrí esta página en Google Chrome para poder instalar la aplicación.');
            }else{
            
            // Show the prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice
              .then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {                  
                  aplicacionInstalda();
                }
                deferredPrompt = null;
              });
            }

          });

          window.addEventListener('appinstalled', (evt) => {
             aplicacionInstalda();
          });

};

        document.addEventListener('DOMContentLoaded', function() {

          if(db != false){
            db.allDocs({include_docs: true, descending: true}).then(doc => {
              
              resPouch = doc; 
              if(resPouch.rows.length > 0){
                
                document.getElementById("nombre_usuario").value = resPouch.rows[0].doc.nombre;
                document.getElementById("telefono_usuario").value = resPouch.rows[0].doc.telefono;
                document.getElementById("domicilio_usuario").value = resPouch.rows[0].doc.domicilio;
                usuario = { 
                            nombre:    resPouch.rows[0].doc.nombre,
                            telefono:  resPouch.rows[0].doc.telefono,
                            domicilio: resPouch.rows[0].doc.domicilio
                          };

                document.getElementById("nombre_usuario").focus();
                document.getElementById("telefono_usuario").focus();
                document.getElementById("domicilio_usuario").focus();                
            
                if( mobMode ){
                  pasosCompra('tienda');
                }
                
              }
              
            });
          } 

          var elemsMod = document.querySelectorAll('.modal');
          modalpop = M.Modal.init(elemsMod);

          var elemsSid = document.querySelectorAll('.sidenav');
          var instancesSid = M.Sidenav.init(elemsSid);

          var elemsSel = document.querySelectorAll('select');
          instances = M.FormSelect.init(elemsSel);       

        });

        function pasosCompra(operacion){

          switch(operacion){
            case 'instalacion':
              document.getElementById("instalacion").style.display = "block";
              document.getElementById("usuario").style.display = "none";                  
              document.getElementById("tienda").style.display = "none";
              document.getElementById("compra").style.display = "none";
            break;
            case 'usuario':
              document.getElementById("instalacion").style.display = "none";
              document.getElementById("usuario").style.display = "block";                  
              document.getElementById("tienda").style.display = "none";
              document.getElementById("compra").style.display = "none";
            break;

            case 'tienda':
              if(usuario){
                iniMap();
                document.getElementById("instalacion").style.display = "none";                                 
                document.getElementById("usuario").style.display = "none";
                document.getElementById("tienda").style.display = "block";
                document.getElementById("compra").style.display = "none";
              }
            break;

            case 'compra':
              document.getElementById("instalacion").style.display = "none";
              document.getElementById("usuario").style.display = "none";
              document.getElementById("tienda").style.display = "none";
              document.getElementById("compra").style.display = "block";
            break;
            
          }

        }

        function confirmar(){
          let pedidoWhatsApp = 'Nuevo pedido desde Tienddify! \n\ \n\ ';
          let cont = 1;

          pedidoWhatsApp +=  usuario.nombre + ' ';
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
          setTimeout(function(){ location.reload() }, 4000);
                  
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
          
          if(carrito[''+idprod+''].cantidad > 1 ){
            carrito[''+idprod+''].cantidad--;
            document.getElementById('cant_'+idprod+'').innerHTML =  carrito[''+idprod+''].cantidad;
          }else{
            delete carrito[''+idprod+''];
            document.getElementById('_'+idprod+'').parentElement.remove();

            if(Object.keys(carrito).length  == 0){
              document.getElementById('agregandoCarrito').innerHTML = 'No hay productos en tu lista.';
            }
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
                      let img_prod = (element.image).replace('http', 'https');  
                      let conts = 
                                  '<li class="collection-item avatar">' + 
                                    '<img src="'+img_prod+'" class="circle">'+
                                    '<span class="title">'+element.title+'</span>'+
                                      '<a href="#!" id="'+element.product_id+'" class="secondary-content"></a>'
                                  '</li>';
                        document.getElementById('lista').innerHTML += conts;
                        let tagI = document.createElement("i");                    
                        tagI.innerHTML = "add_shopping_cart";
                        tagI.setAttribute("class", "material-icons");                   
                        tagI.setAttribute("onclick", "agregar('"+element.product_id+"','"+element.title+"','"+img_prod+"','"+conts+"')");
                        document.getElementById(''+element.product_id+'').appendChild(tagI);

                        database.ref('/productos/'+element.product_id).set({
                          product_id: element.product_id,
                          title: element.title,
                          image: img_prod
                        });

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
              addPouch(tel, nomb, domi);              
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
          
          
          let error   = '';
          if( tienda.telefono == false ){              
            
            
            error += '<span class="title"> - Tenés que elegir una tienda.</span><br/><br/>';
            
              document.getElementById('tituloAgregando').innerHTML = 'Ups!'; 
              document.getElementById('agregando').innerHTML = '<ul class="collection">'+
                                                                '<li class="collection-item avatar">'+
                                                                  '<img src="img/alerta.png" class="circle">'+
                                                                  '<span class="title">Los datos no son correctos.</span><br/><br/>'+
                                                                  error
                                                                '</li>'+
                                                               '</ul>';              
              document.getElementById('modpop').click();
          }else if( tienda.telefono != false && tienda.nombre != false && tienda.ciudad != false  ){            
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

        function aplicacionInstalda(){
 
          document.getElementById('instalacion').innerHTML = '<div class="row s6">'+
                                                              '<div class="col s12 m4">'+
                                                                '<div class="card">'+
                                                                  '<div class="card-image waves-effect waves-block waves-light">'+
                                                                    '<img class="activator" src="img/instalado.png">'+
                                                                  '</div>'+ 
                                                                '</div>'+
                                                              '</div>'+
                                                            '</div>';
        

        }
  
        function addPouch(telefono, nombre, domicilio) {
          var datos = {
            _id: telefono,
            nombre: nombre,
            domicilio: domicilio,
            telefono: telefono
          };
          
          db.put(datos).catch( err => {
             console.log(err);
          });          
        }

        function titleCase(str) {
           var splitStr = str.toLowerCase().split(' ');
           for (var i = 0; i < splitStr.length; i++) {
               
               splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
           }

           return splitStr.join(' '); 
        }

        function iniFiBa(){

          let firebaseConfig = {
            apiKey: "AIzaSyDRGOxIAYpWoD4oXBShCLg5yBIFgoUO7H4",
            authDomain: "tienddify.firebaseapp.com",
            databaseURL: "https://tienddify.firebaseio.com",
            projectId: "tienddify",
            storageBucket: "tienddify.appspot.com",
            messagingSenderId: "525503514957",
            appId: "1:525503514957:web:4934e7fb8d33d0b8494f04",
            measurementId: "G-928KVGB365"
          };

          // Initialize Firebase 
          firebase.initializeApp(firebaseConfig);
          //firebase.analytics(); 
          return firebase.database();

        }

        function iniMap(){

          if(mymap == false){

              if (navigator.geolocation) {
                 navigator.geolocation.getCurrentPosition( geoPos => {

                    mymap = L.map('mapid').
                    setView([geoPos.coords.latitude,geoPos.coords.longitude], 
                    16);
                     
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: 'Tienddify',
                        maxZoom: 16
                    }).addTo(mymap);

                    L.control.scale().addTo(mymap);

                    let geoUsuaruioIcon = L.icon({
                    iconUrl: 'img/icons/geo_user.png',
                    iconSize: [32, 32], 
                    });

                    L.marker([geoPos.coords.latitude,geoPos.coords.longitude], {icon: geoUsuaruioIcon}).addTo(mymap);
                    L.circle([geoPos.coords.latitude,geoPos.coords.longitude], {radius: 300, opacity:0.5, color:'#ee6e73'}).addTo(mymap);
                    
                    let urlGeo = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+geoPos.coords.latitude+'&lon='+geoPos.coords.longitude+'&zoom=10';

                    let h = new Headers();
                    h.append('Accept','aplication/json');

                    let req = new Request(urlGeo, {
                      method: 'GET',
                      headers: h,
                      mode: 'cors'
                    });
                    
                    fetch(req)
                    .then( res => {
                      
                      if(res.ok){
                        return res.json();
                      }

                    })
                    .then( mapa => {
                      tienda = {telefono: false, nombre:false, ciudad: mapa.name };
                      obtenerTiendasCiudad(mapa.name);              
                    });
                    
                 });
                
              }
          }         

        }

        function obtenerTiendasCiudad(ciudad){

          let geoTiendaIcon = L.icon({
                iconUrl: 'img/icons/geo_shop.png',
                iconSize: [32, 32], 
          });

          refTiendas.orderByChild('ciudad').equalTo(ciudad).on('value', snapshot => {
              let tiendas = snapshot.val();
              Object.keys(tiendas).forEach(function(key) {                
                L.marker([tiendas[key].geo_lat,tiendas[key].geo_lon],{icon: geoTiendaIcon})
                .on('click', function() { 
                  tienda.telefono = tiendas[key].telefono;
                  tienda.nombre = tiendas[key].nombre;
                  document.getElementById('tiendaSeleccionada').innerHTML = '<div class="chip">Seleccionaste la tienda</div><div class="chip"><img src="img/icons/geo_shop.png" alt="Contact Person">'+tiendas[key].nombre+'</div><br/><br/><br/>';
                })
                .addTo(mymap).bindPopup('<p>'+tiendas[key].nombre+'</p>');
              });
              tienda.telefono = false;
              tienda.nombre = false;
          });

        }