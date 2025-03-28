import React, { useEffect, useState } from 'react'

const ImgEditor = ({targetElement,setTargetElement}: {targetElement:HTMLElement | null,setTargetElement:(targetElement:HTMLElement | null)=>void}) => {
  const [position, setPosition] = useState({top:0, left:0})
  const [imageUrl, setImageUrl] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')

  useEffect(() => {
    const rect = targetElement?.getBoundingClientRect()
    if(rect){
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      })
    }
  },[targetElement])

  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.contains(document.querySelector('.presentation-container'))) {
        setTargetElement(null);
      }
    };
  
    document.addEventListener("click", handleClickOutside);
  
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleConfirm = () => {
    if(targetElement){
      const imgElement = targetElement as HTMLImageElement;
      imgElement.src = imageUrl;
      imgElement.style.width = `${width}%`;
      imgElement.style.height = `${height}%`;
    }
    setTargetElement(null)
  }

  useEffect(() => {
    if(targetElement){
      const imgElement = targetElement as HTMLImageElement;
      const parentWidth = imgElement.parentElement?.offsetWidth || 1;
      const parentHeight = imgElement.parentElement?.offsetHeight || 1;
      setImageUrl(imgElement.src);
      

      const widthPercentage = Math.min(Math.ceil((imgElement.naturalWidth / parentWidth) * 100), 100).toString();
      const heightPercentage = Math.min(Math.ceil((imgElement.naturalHeight / parentHeight) * 100), 100).toString();
      
      setWidth(widthPercentage);
      setHeight(heightPercentage);
    }
  },[targetElement])

  useEffect(() => {
    if(targetElement){
      const imgElement = targetElement as HTMLImageElement;
      imgElement.style.width = `${width}%`;
      imgElement.style.height = `${height}%`;
    }
  },[width,height])

  return (
    <div 
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 1000,
      }}
      className="max-w-2xl bg-white rounded-xl border shadow-lg p-4"
    >
      {/* Toolbar */}
      <div className='text-xs border-gray-200 absolute -top-2 -left-2 rounded-lg px-2 py-1 bg-gray-100 shadow-lg flex items-center font-medium'>
        {targetElement?.tagName}
      </div>

      <div className="flex items-center space-x-2">
        {/* URL, Width, and Height Inputs */}
        <input 
          type="text" 
          placeholder="Paste Image URL" 
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="flex-grow border rounded px-2 py-1 text-xs outline-none"
        />
        <input 
          type="number" 
          placeholder="Width %" 
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          min="1"
          max="100"
          className="w-14 border rounded px-2 py-1 text-xs outline-none"
        />
        <sup className='text-xs'>%</sup>
        <input 
          type="number" 
          placeholder="Height %" 
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          min="1" 
          max="100"
          className="w-14 border rounded px-2 py-1 text-xs outline-none"
        />
        <sup className='text-xs'>%</sup>
        

        {/* Confirm Button */}
        <button 
          onClick={handleConfirm}
          className="bg-blue-500 text-white rounded px-3 py-1 text-sm hover:bg-blue-600 transition-colors"
        >
          ✓
        </button>
      </div>
    </div>
  )
}

export default ImgEditor