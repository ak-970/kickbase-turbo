const Carousel = ({ children }) => {

  return (
    <div className='carousel'>
      <div className='content'>
        {children.map((child, index) =>
          <div key={index} className='item'>
            {child}
          </div>
        )}
      </div>
      <div className='left'></div>
      <div className='right'></div>
    </div>
  )
}

export default Carousel