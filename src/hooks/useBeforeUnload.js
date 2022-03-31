import {useEffect} from 'react'

export const useBeforeUnload = (value) => {
    const hadleBeforeUnload =(e) => {
        let returnValue;
        if ( typeof value ==='function' ) {
            returnValue = value(e)
        } else {
            returnValue = value
        }
        if (returnValue){
            e.preventDefault()
            e.returnValue = returnValue
        }
        return returnValue;
    }
    useEffect(()=>{
        window.addEventListener('beforeunload', hadleBeforeUnload)
    },[])
}