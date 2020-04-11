importScripts('js/sw_util.js'); 

  
const STATIC_CACHE = 'static-v9.3';
const DYNAMIC_CACHE = 'dynamic-v9.5';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL =  [
	//'/',   
	'index.html',
	'img/favicon.png',
	'img/agradecimiento.png',
	'img/alerta.png',
	'img/compras.png',
	'img/feliz.png',
	'img/instalado.png',
	'img/instalar.png',
	//'js/app.js', 
	//'js/sw_util.js'  
];
 
const APP_SHELL_INMUT = [
	'css/materialize.min.css',
	'css/pwa.css',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'js/materialize.min.js',
	'js/pouchdb.min.js'
];

self.addEventListener('install', e => {

	const cacheStatic = caches.open( STATIC_CACHE ).then(cache => {
		cache.addAll(APP_SHELL);
	});

	const cacheInmut= caches.open( INMUTABLE_CACHE ).then(cache => {
		cache.addAll(APP_SHELL_INMUT);
	});

	e.waitUntil( Promise.all([{cacheStatic,cacheInmut}]) );

	self.skipWaiting();

});

self.addEventListener('activate', e => {   
 
    const respuesta = caches.keys().then( keys => {
        keys.forEach( key => {
 
            if (  key !== STATIC_CACHE && key.includes('static') ) {
            	caches.delete(key);
            	localStorage.clear();
            	location.reload();	 			
            }
 
            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
            	caches.delete(key);
            	localStorage.clear();
            	location.reload();           
            }
 
        });
 
    });
 
    e.waitUntil( respuesta );
 
});

self.addEventListener('fetch', e => {

	
	let respuesta;
	if( e.request.url.includes('walmart') || e.request.url.includes('app.js') ){

		respuesta = fetch(e.request).then( res => {
		 	if(res.ok){
			 	actualizaCacheDinamico(DYNAMIC_CACHE, e.request, res);
			 	return res.clone();
		 	}else{
		 		return 'Ups, parece que algo falló. Intenta de nuevo.';
		 	}
		}).catch(err => {
			return caches.match(e.request);
		});

	}else{

		respuesta = caches.match(e.request).then( res => {
			if(res){				
				return res;
			}else{
				return fetch(e.request).then( newRes => {
					return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
				});
					
			}
		});


	}
	


	e.respondWith(respuesta);
	respuesta = null;
 
});