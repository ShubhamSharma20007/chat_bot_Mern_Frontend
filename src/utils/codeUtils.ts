import React, { useState } from "react";
const handleClickOutside = (event:Event,selectedElement: HTMLElement) => {
    if (!selectedElement.contains(event.target as Node)) {
        selectedElement.removeAttribute("contenteditable");
        selectedElement.classList.remove("editable-element");
        selectedElement.style.outline = "none";
    }
  };


export const generateAttributes = (container: HTMLDivElement,setTargetElement:React.Dispatch<React.SetStateAction<HTMLElement | null>>) => {
    let selectedElement: HTMLElement | null = null;
    const elements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, label, button, div, img, ul');

    elements.forEach((element: any, idx: number) => {
        if (!element.textContent?.trim() && !['IMG', 'UL'].includes(element.tagName)) return;
    
        const createAttribute = `editable-${idx}-${element.tagName.toLowerCase()}`;
        element.setAttribute('data-editable', createAttribute);
        element.style.cursor = 'pointer';

        const mouseoverHover = () => {
            element.style.outline = '1px dashed #4F46E5';
        };

        const mouseoutHover = () => {
            element.style.outline = 'none';
        };

        const handleClick = (event: Event) => {
            event.stopPropagation();
            const clickedElement = event.currentTarget as HTMLElement;
            if(selectedElement && selectedElement !== clickedElement){
                selectedElement.removeAttribute("contenteditable");
                selectedElement.classList.remove("editable-element");
            }
            selectedElement = clickedElement;
            setTargetElement(element);
            clickedElement.setAttribute("contenteditable", "true");
           
            clickedElement.classList.add("editable-element");
            document.addEventListener("click", outsideClickListener);
            
        };
        const outsideClickListener = (event: Event) => {
            if (selectedElement) {
                handleClickOutside(event, selectedElement);
                selectedElement = null;
                document.removeEventListener("click", outsideClickListener);
            }
           
        };
        // Add event listeners
        element.addEventListener('mouseover', mouseoverHover);
        element.addEventListener('mouseout', mouseoutHover);
        element.addEventListener('dblclick', handleClick);
        (element as any)._editableEventListeners ={
            mouseover: mouseoverHover,
            mouseout: mouseoutHover,
            click: handleClick
        }
    });
};

export const cleanupAttributes = (container: HTMLDivElement) => {
    const elements = container.querySelectorAll('[data-editable]');
    elements.forEach((element: any) => {
        const events = (element as any)._editableEventListeners;
        if (events) {
            element.removeEventListener('mouseover', events.mouseover);
            element.removeEventListener('mouseout', events.mouseout);
            element.removeEventListener('dblclick', events.click);
        }
        element.removeAttribute('data-editable');
        element.style.outline = 'none';
        element.style.cursor = '';
    });
};

