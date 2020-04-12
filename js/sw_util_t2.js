  
function actualizaCacheDinamico(dynCache, req, res){

	if( res.ok ){ 

		return caches.open(dynCache).then( cache => {

			cache.put(req, res.clone());
			return res.clone();

		});

	}else{
			return res;
	}
 

} 

function limpiarCache(nombreCache){

	caches.open(nombreCache).then( cache => {

		return cache.keys().then(keys => {
			Object.keys(keys).forEach(function(key) {				
				cache.delete(keys[key]);
			});

		});

	});


}