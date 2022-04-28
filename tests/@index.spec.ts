import "reflect-metadata"

import { Provider, paramTypes } from "../index"

@Provider()
class Some {
    constructor(){        
    }    
}

@Provider()
class Some1 {
    constructor(public ss: Some){        
    }    
}


function main() {    
    console.log(paramTypes(Some))
    console.log(paramTypes(Some1))
}

// process.nextTick(main)