

function actualizaCacheDinamico(dynCache, req, res){

	if( res.ok ){

		caches.open(dynCache).then( cache => {

			cache.put(req, res.clone());
			return res.clone();

		});

	}else{
			return res;
	}


}  