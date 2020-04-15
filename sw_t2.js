importScripts('js/sw_util_t2.js'); 

///
 
const STATIC_CACHE = 'static-v1.3.2';
const DYNAMIC_CACHE = 'dynamic-v1.3.2';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL =  [
	'index.html',
	'img/favicon.png',
	'img/agradecimiento.png',
	'img/alerta.png',
	'img/compras.png',
	'img/feliz.png',
	'img/instalado.png',
	'img/instalar.png',
	'img/icons/geo_shop.png',
	'img/icons/geo_user.png'
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
	
	self.skipWaiting();

	e.waitUntil( Promise.all([{cacheStatic,cacheInmut}]) );

}); 

self.addEventListener('activate', e => {   
 
    const respuesta = caches.keys().then( keys => {
        keys.forEach( key => {
 
            if (  key !== STATIC_CACHE && key.includes('static') ) {
            	caches.delete(key); 			
            }
 
            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
            	caches.delete(key);          
            }
 
        });
 
    });
 
    e.waitUntil( respuesta );
 
});

self.addEventListener('fetch', e => {

	

		return fetch(e.request).then( newRes => {
				return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
		});				
		


	e.respondWith(respuesta);
 
}); 