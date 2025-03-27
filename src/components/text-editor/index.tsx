import React, { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Undo2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { BiColor } from 'react-icons/bi';

function TextEditor({targetElement,setTargetElement}: {targetElement:HTMLElement | null,setTargetElement:(targetElement:HTMLElement | null)=>void}) {
  const [content, setContent] = useState('');
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('');
  const [fontWeight, setFontWeight] = useState('');
  const [textAlign, setTextAlign] = useState('');
  const [backgroundClip, setBackgroundClip] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [textDecoration, setTextDecoration] = useState('');
  const formatButtons = [
    { icon: <Bold size={18} />, tooltip: 'Bold' },
    { icon: <Italic size={18} />, tooltip: 'Italic' },
    { icon: <Underline size={18} />, tooltip: 'Underline' },
    { icon: <Strikethrough size={18} />, tooltip: 'Strikethrough' },
    { icon: <Link size={18} />, tooltip: 'Insert Link' },
  ];

  const alignmentButtons = [
    { icon: <AlignLeft size={18} />, tooltip: 'Align Left' },
    { icon: <AlignCenter size={18} />, tooltip: 'Align Center' },
    { icon: <AlignRight size={18} />, tooltip: 'Align Right' },
    { icon: <AlignJustify size={18} />, tooltip: 'Justify' },
  ];

  const listButtons = [
    { icon: <List size={18} />, tooltip: 'Bullet List' },
    { icon: <ListOrdered size={18} />, tooltip: 'Numbered List' },
  ];

  useEffect(() => {
    if (targetElement && editorRef.current) {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });
      // Get initial font size
      const style = window.getComputedStyle(targetElement);
      setFontSize(parseInt(style.fontSize));
    }
  }, [targetElement]);

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


  //  handle font size change
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    
    setFontSize(newSize);
    if (targetElement) {
      targetElement.style.fontSize = `${newSize}px`;
    }
  };

  // handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setTextColor(newColor);
    if (targetElement) {
      targetElement.style.color = newColor;
    }
  };

  const handleBoldElement = () => {
    if (targetElement) {
      const currentWeight = window.getComputedStyle(targetElement).fontWeight;
      const bold400 = currentWeight === '400';
     const bold500 = currentWeight === '500';
     const bold600 = currentWeight === '600';
     const bold700 = currentWeight === '700';
     const bold800 = currentWeight === '800';
     const bold900 = currentWeight === '900';
     if(bold400){
      targetElement.style.fontWeight = '500';
      setFontWeight('500');
     }else if(bold500){
      targetElement.style.fontWeight = '600';
      setFontWeight('600');
     }else if(bold600){
      targetElement.style.fontWeight = '700';
      setFontWeight('700');
     }else if(bold700){
      targetElement.style.fontWeight = '800';
      setFontWeight('800');
     }else if(bold800){
      targetElement.style.fontWeight = '900';
      setFontWeight('900');
     }else if(bold900){
      targetElement.style.fontWeight = '400';
      setFontWeight('400');
     }
  
    }
  };

  const handleItalicElement = () => {
   if(targetElement){
    const currentStyle = window.getComputedStyle(targetElement);
    const isItalic = currentStyle.fontStyle === 'italic';
    if(isItalic){
      targetElement.style.fontStyle = 'normal';
    }else{
      targetElement.style.fontStyle = 'italic';
    }
  }
}
const handleUnderlineElement = () => {
  if(targetElement){
    const currentStyle = window.getComputedStyle(targetElement);
    const isUnderline = currentStyle.textDecoration === 'underline';
    if(isUnderline){
      targetElement.style.textDecoration = 'none';
    }else{
      targetElement.style.textDecoration = 'underline';
    }
  }
}
const handleStrikethroughElement = () => {
  if(targetElement){
    const currentStyle = window.getComputedStyle(targetElement);
    const isStrikethrough = currentStyle.textDecoration.includes('line-through');
    if(isStrikethrough){
      targetElement.style.textDecoration = 'none';
    }else{
      targetElement.style.textDecoration = 'line-through';
    }
  }
}

const handleLinkElement = () => {
  if(targetElement){

  }
}

  useEffect(() => {
    if(targetElement){
      const style = window.getComputedStyle(targetElement);
      const {
        fontWeight,
        textAlign,
        color,
        backgroundClip,
        backgroundImage,
        textDecoration
      } = style;
      console.log(fontWeight,textAlign,color,backgroundClip,backgroundImage,textDecoration)
      setTextColor(color);
      setFontWeight(fontWeight);
      setTextAlign(textAlign);
      setBackgroundClip(backgroundClip);
      setBackgroundImage(backgroundImage);
      setTextDecoration(textDecoration);
    }
  },[targetElement])


  return (
  <>
    <div ref={editorRef}
    style={{
      position: 'absolute',
      top: `${position.top}px`,
      left: `${position.left}px`,
      zIndex: 1000,
    }}
    className="max-w-2xl bg-white rounded-xl border-none outline-none ">
      {/* Toolbar */}
      <div className='text-xs border-gray-200 absolute -top-2 -left-2 rounded-lg px-2 py-1 bg-gray-100 shadow-lg flex items-center font-medium '>{targetElement?.tagName}</div>
      <div className=" p-4">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          {/* Font Size Range Slider */}
          <div className="relative pr-3 border-r border-gray-200 flex items-center gap-2">
            <span className="text-sm">{fontSize}px</span>
            <input
              type="range"
              min="8"
              max="72"
              value={fontSize}
              onChange={handleFontSizeChange}
              color='black'
              className="w-20 bg-black "
            />
          </div>

          {/* Format Buttons */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
          <input type="color"  id="favcolor" name="favcolor" value={textColor}  onChange={handleColorChange}/>
            {formatButtons.map((button, index) => (
              <button
              onClick={()=>{
                if(button.tooltip === 'Bold'){
                  handleBoldElement()
                }else if(button.tooltip === 'Italic'){
                  handleItalicElement()
                }else if(button.tooltip === 'Underline'){
                  handleUnderlineElement()
                }else if(button.tooltip === 'Strikethrough'){
                  handleStrikethroughElement()
                }else if(button.tooltip === 'Insert Link'){
                  handleLinkElement()
                }
              }}
                key={index}
                className={`p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200 group relative ${
                  button.tooltip === 'Bold' && fontWeight === 'bold' ? 'bg-gray-200' : ''
                }`}
                title={button.tooltip}
              >
                {button.icon}
                <span className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {button.tooltip}
                </span>
              </button>
            ))}
          </div>

          {/* Alignment Buttons */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200 ">
            {alignmentButtons.map((button, index) => (
              <button
                key={index}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group relative"
                title={button.tooltip}
              >
                {button.icon}
                <span className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200  whitespace-nowrap">
                  {button.tooltip}
                </span>
              </button>
            ))}
          </div>

          {/* List Buttons */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
            {listButtons.map((button, index) => (
              <button
                key={index}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group relative"
                title={button.tooltip}
              >
                {button.icon}
                <span className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200  whitespace-nowrap">
                  {button.tooltip}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
  );
}

export default TextEditor;