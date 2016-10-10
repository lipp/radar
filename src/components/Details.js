import React from 'react'
import State from './State'
import Method from './Method'

const getSelected = (statesOrMethods, path) => {
  return statesOrMethods.filter((stateOrMethod) => {
    return stateOrMethod.path === decodeURIComponent(path)
  })[0]
}

const Details = ({params: {path}, statesAndMethods, backUrl}) => {
  // const method = getSelected(methods, path)
  const stateOrMethod = getSelected(statesAndMethods, path)
  if (!stateOrMethod) {
    return <div></div>
  }
  if (typeof stateOrMethod.value === 'undefined') {
    return <Method method={stateOrMethod} backUrl={backUrl} />
  }
  return <State state={stateOrMethod} backUrl={backUrl} />
}

export default Details
