import { Box } from '@mui/material';
import React, { useEffect, useRef } from 'react'
import { useLocation } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';
import { Instance } from '../../lib/Instance';
import { CHAT_CONVERT_CODE } from '../../helpers/api';
import prompt from '../../data/prompt';
import toast from 'react-hot-toast';

const Preview = () => {
  const iFrameRef =useRef<HTMLIFrameElement>(null)
  const [searchParams] = useSearchParams();
  const params = searchParams.get('iscode');
  const {state:{code}} = useLocation();
  console.log('%cStart Block Code',"color: red; font-size: 20px;background-color: yellow;\n")
  let newCode = code.indexOf('\n')
  if(newCode <= 10 && newCode !== -1){
    newCode =code.substring(newCode)
  }
  console.log({newCode})

  console.log('%cEnd Block Code',"color: red; font-size: 20px;background-color: yellow;\n")
  useEffect(() => {
    if(iFrameRef.current && code){
      (async () => {
        try {
          const res = await toast.promise(Instance.post(CHAT_CONVERT_CODE, {
            code: newCode.toString() + prompt.CONVERT_INTO_HTML
          }),{
            loading: 'Waiting for preview...',
          })
          let output = res.data;
          
          if (output.length > 0) {
            output = output.replace(/```/g, '');
    
            const firstNewlineIndex = output.indexOf('\n');
            if (firstNewlineIndex <= 10 && firstNewlineIndex !== -1) {
              const presentCode = output.substring(firstNewlineIndex); // Extract valid substring
              if(iFrameRef.current && iFrameRef){
                iFrameRef.current.srcdoc = presentCode;
              }
  
            }
          }
        } catch (error) {
          console.error("Error fetching converted code:", error);
        }
      })();
    }
    
  }, [code,!!params]);

  // useEffect(()=>{
  //   const tailwindLink = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
  //   const link = document.createElement('link')
  //   link.rel = 'stylesheet'
  //   link.href = tailwindLink
  //   document.head.appendChild(link)
  //   return ()=>{
  //     document.head.removeChild(link)
  //   }
  // },[])
  return (
    <Box sx={{
      height: '100vh',
    }}>
      <iframe className='h-full w-full' ref={iFrameRef} id="output" sandbox="allow-scripts allow-same-origin"></iframe>
    </Box>
  )
}

export default Preview