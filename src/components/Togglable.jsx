import { useState, forwardRef, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'

const Togglable = forwardRef((props, refs) => {
  const [visible, setVisible] = useState(false)

  // const hideWhenVisible = { display: visible ? 'none' : '' }
  // const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => { setVisible(!visible) }

  // return (
  //   <div>
  //     <div style={hideWhenVisible}>
  //       <button onClick={toggleVisibility}>{props.buttonLabel}</button>
  //     </div>
  //     <div style={showWhenVisible}>
  //       {props.children}
  //       <button onClick={toggleVisibility}>cancel</button>
  //     </div>
  //   </div>
  // )

  useImperativeHandle(refs, () => {
    return {
      toggleVisibility
    }
  })

  return !visible
    ? <div className='button-wrap'><button onClick={toggleVisibility}>{props.buttonLabel}</button></div>
    : <div>
      {props.children}
      <div className='button-wrap'><button onClick={toggleVisibility}>cancel</button></div>
    </div>
})

Togglable.displayName = 'Togglable'

Togglable.propTypes = {
  buttonLabel: PropTypes.string.isRequired
}

export default Togglable