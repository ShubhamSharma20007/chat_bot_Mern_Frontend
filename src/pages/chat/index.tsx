import { ChangeEvent, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import React from "react";
import Header from "../../components/header/index.tsx";
import { Box, Avatar, Typography, Button ,Stack, styled } from "@mui/material";
import { useAuth } from "../../context/AuthContext.tsx";
import { IoIosSend } from "react-icons/io";
import Tooltip from '@mui/material/Tooltip';
import toast from "react-hot-toast";
import { Instance } from "../../lib/Instance.ts";
import IconButton from '@mui/material/IconButton';
import {
  CHAT_DUPLICATE,
  CHAT_GET_TABS,
  CHAT_NEW_START,
  CHAT_TAB_CREATE,
  CHATS,
  CHATS_DELETE,
  CHATS_GET,
} from "../../helpers/api.ts";
import { useSocket } from "../../context/SocketContext.tsx";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { AntSwitch } from "../../shared/switchTheme.ts";
import LottieLoader from "../../components/lottie/index.tsx";
import { generateAttributes,cleanupAttributes } from "../../utils/codeUtils.ts";
import TextEditor from "../../components/editor/text-editor/index.tsx";
import ImgEditor from "../../components/editor/img-editor/index.tsx";
const ChatContainer = React.lazy(()=> import('../../components/chatContainer/index.tsx'))
const Chat = () => {
  const { socket, chatMessages, setChatMessages,   
    presentationComponent  } = useSocket();
    const [isLoading, setIsLoading] = useState(false)
  const { user, isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editToggle,setEditToogle] = useState<string>('preview')
  const params = searchParams.get("tab");
  const [tabTitles, setTabTitles] = useState<string[]>([]);
  const [DynamicComponent, setDynamicComponent]= useState<React.FC | null>(null)
  const [orignalComponent, setOrignalComponent] = useState<React.FC | null>(null)
  const navigate = useNavigate();
  const [chatTabs, setChatTabs] = useState<any>([]);
  const [switchValue, setSwitchValue] = useState<boolean>()
  let textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  let chatContainer = useRef<HTMLElement | null>(null);
  const [targetElement ,setTargetElement] = useState<HTMLElement | null>(null)
  const handleSendMessage = async () => {
    const inputContent = textAreaRef.current?.value as string;
    if (!inputContent.trim()) return;
    toast.loading("Generating Response...", {
      id: "chat",
    });

    // reseting the input field value
    if (textAreaRef.current && textAreaRef) {
      textAreaRef.current.value = "";
    }

    // emit the socket event
    socket.emit("new-chat", {
      role: "user",
      user_msg: inputContent,
      receiverId: socket.id,
      userId: user?._id,
      tabId: params,
    });



  };

  const handlePresentation = async()=>{
    const inputContent = textAreaRef.current?.value as string;
    if(inputContent.length <2){
      return toast.error("Please enter a valid presentation theme")
    }
    if (textAreaRef.current && textAreaRef) {
      textAreaRef.current.value = "";
    }
    socket.emit("new-presentation", {
      role: "user",
      user_msg: inputContent,
      receiverId: socket.id,
      // userId: user?._id,
      // tabId: params,
    });
    setDynamicComponent(null)
    setIsLoading(true)
  }


  // handle the scrollbottom
  useEffect(() => {
    if (chatContainer.current && chatContainer) {
      chatContainer.current?.scrollBy({
        behavior: "smooth",
        top: chatContainer.current.scrollHeight,
      });
    }
  }, [chatMessages]);

  // get all chats

  const getChats = async () => {
    try {
      const req = await Instance.get(CHATS_GET, {
        params: {
          chatTabId: params,
        },
      });
      const res = await req.data;
      if (res.success) {
        setChatMessages(res.data.chats);
      } else {
        setChatMessages([]);
      }
    } catch (error: any) {
      console.log(error, 12);
    }
  };

  const handleDeleteChat = async () => {
    const confirmation = confirm("Are you sure you want to delete this chat?");
    if (!confirmation) return;
    toast.loading("Deleting Chat...", {
      id: "delete-chat",
    });
    try {
      const req = await Instance.delete(CHATS_DELETE);
      const res = await req.data;
      if (res.success) {
        setChatMessages([]);
        setChatTabs([])
        toast.dismiss("delete-chat");
        if (!!params) {
          setSearchParams((prev) => {
            return ''
          })
        }
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message, {
        id: "delete-chat",
      });
    }
  };

  //  for create a new assistant and new thread id
  async function createNewAssistantAndThreadId() {
    try {
      const req = await Instance.get(CHAT_NEW_START);
      if (req.status === 200) {
        return req.data;
      }
    } catch (error) {
      console.log(error);
    }
  }

  //  create a new tabs
  const handleNewTab = async () => {
    try {
      const req = await toast.promise(Instance.post(CHAT_TAB_CREATE), {
        loading: "Creating new tab...",
        success: "New tab created successfully",
        error: "Error creating new tab"
      })
      if (req.status === 200) {
        setChatTabs((prev: any) => [...prev, req.data.data.chatTab])
        await createNewAssistantAndThreadId()
        navigate(
          {
            search: `?tab=${req.data.data.chatTab._id}`,
          },
          { replace: true }
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  //  fetch tabs
  const getTabs = async () => {
    try {
      const req = await Instance.get(CHAT_GET_TABS);
      const res = await req.data;
      console.log(res, 21);
      if (res.success) {
        setChatTabs(res.data.chatTabs);
      }
    } catch (error) {
      console.log(error);
    }
  };


  // handle duplicate tab
  const handleDuplicateTab = async (id: string) => {
    const response = await toast.promise(Instance.post(CHAT_DUPLICATE, { id }), {
      loading: "Genrating Duplicate tab...",
      success: "Tab duplicated successfully",
      error: "Error duplicating tab"
    })
    if (response.status === 201) {
      setChatTabs((prev: any) => [...prev, response.data.duplicatedTab])
    }
  }

  useEffect(() => {
    if (isLoggedIn && !!user) {
      getTabs();
    }
  }, [user]);

  useEffect(() => {

    new Promise((resolve, reject) => {
      if (isLoggedIn) {
        resolve(getChats());
      } else {
        reject()
      }
    })
  }, [params, chatTabs])

  useEffect(() => {
    if (!params && chatTabs.length > 0) {
      navigate({
        search: `?tab=${chatTabs[0]?._id}`,
      })
    }
  }, [chatTabs])


  // change the url tab id
  const handleTabChange = (id: string, index: number) => {
    navigate({
      search: `?tab=${id}`,
    });
  };



  function getTitleForTab(tab: any) {
    let message = "New Chat";
    if (tab.userId.chats?.length > 0) {
      const res = tab.userId.chats.find(
        (firstTab: any) => firstTab.chatTabId.toString() === tab._id.toString()
      );
      if (res) {
        message = res.user_msg?.length > 30 ? `${res.user_msg.slice(0, 20)}...` : res.user_msg;
      }
      if (tab.isDuplicate) {
        message += " (copy)";
      }
    }
    return message;
  }

  useEffect(() => {
    const updatedTitles = chatTabs.map((tab:any) => getTitleForTab(tab));
    setTabTitles(updatedTitles);
  }, [chatTabs]);


function handleSwitchValue(e:React.ChangeEvent<HTMLInputElement>){
  const value = e.target.checked;
  setSwitchValue(value)
}

function PresentationComponent() {
  const data = {
  "title": "Hoili Presentation",
  "slides": [
    {
      "title": "Introduction to Hoili",
      "bulletPoints": [
        "Overview of Hoili and its significance.",
        "Cultural background and importance in the community.",
        "Celebration details including date and location."
      ],
      "image": "https://images.unsplash.com/photo-1608363789086-9082f58e281f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MjY4NDl8MHwxfHNlYXJjaHwxfHxJbnRyb2R1Y3Rpb24lMjB0byUyMEhvaWxpfGVufDB8fHx8MTc0Mjg4NTIyMXww&ixlib=rb-4.0.3&q=80&w=1080"
    },
    {
      "title": "Traditions and Customs",
      "bulletPoints": [
        "Specific rituals performed during Hoili.",
        "Traditional foods and their meanings.",
        "Songs and dances associated with the festival."
      ],
      "image": "https://images.unsplash.com/photo-1722252798917-d8daa704a2b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MjY4NDl8MHwxfHNlYXJjaHwxfHxUcmFkaXRpb25zJTIwYW5kJTIwQ3VzdG9tc3xlbnwwfHx8fDE3NDI4ODUyMjF8MA&ixlib=rb-4.0.3&q=80&w=1080"
    },
    {
      "title": "Colors and Decorations",
      "bulletPoints": [
        "Symbolism of colors used in Hoili celebrations.",
        "Common decorations and how they are made.",
        "Community involvement in decorating spaces."
      ],
      "image": "https://images.unsplash.com/photo-1489864341077-e204d82219b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MjY4NDl8MHwxfHNlYXJjaHwxfHxDb2xvcnMlMjBhbmQlMjBEZWNvcmF0aW9uc3xlbnwwfHx8fDE3NDI4ODUyMjF8MA&ixlib=rb-4.0.3&q=80&w=1080"
    },
    {
      "title": "Celebration Activities",
      "bulletPoints": [
        "Games and activities typically seen during Hoili.",
        "Role of community gatherings and events.",
        "Safety tips for celebrating Hoili."
      ],
      "image": "https://images.unsplash.com/photo-1717347547110-2476ee5c7932?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MjY4NDl8MHwxfHNlYXJjaHwxfHxDZWxlYnJhdGlvbiUyMEFjdGl2aXRpZXN8ZW58MHx8fHwxNzQyODIxNjY2fDA&ixlib=rb-4.0.3&q=80&w=1080"
    },
    {
      "title": "Conclusion and Significance",
      "bulletPoints": [
        "Reflection on the impact of Hoili in modern times.",
        "Importance of preserving traditions and customs.",
        "Encouragement to participate and celebrate joyfully."
      ],
      "image": "https://images.unsplash.com/photo-1722252798917-d8daa704a2b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MjY4NDl8MHwxfHNlYXJjaHwxfHxDb25jbHVzaW9uJTIwYW5kJTIwU2lnbmlmaWNhbmNlfGVufDB8fHx8MTc0Mjg4NTIyMXww&ixlib=rb-4.0.3&q=80&w=1080"
    }
  ]
};

  const layouts = [
    {
      container: "flex flex-col w-full max-w-7xl mx-auto md:flex-row rounded-2xl shadow-lg overflow-hidden",
      imageWrapper: "md:w-1/2 relative group", 
      contentWrapper: "md:w-1/2 p-8 space-y-6 backdrop-blur-sm bg-white/30"
    },
    {
      container: "relative w-full max-w-7xl mx-auto rounded-2xl  overflow-hidden min-h-[500px]",
      imageWrapper: "absolute inset-0 z-0",
      contentWrapper: "relative z-10 p-8 bg-gradient-to-r from-white/90 w-full to-transparent text-white"
    },
    {
      container: "grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-7xl mx-auto rounded-2xl  p-8",
      imageWrapper: "relative aspect-square rounded-xl overflow-hidden",
      contentWrapper: "flex flex-col justify-center space-y-6"
    },
     {
      container: "flex flex-col w-full max-w-7xl mx-auto md:flex-row-reverse rounded-2xl shadow-lg overflow-hidden",
      imageWrapper: "md:w-1/2 relative group", 
      contentWrapper: "md:w-1/2 p-8 space-y-6 backdrop-blur-sm bg-white/30"
    },
    {
      container: "flex flex-col items-center w-full max-w-7xl mx-auto rounded-2xl  p-12 text-center",
      imageWrapper: "w-64 h-64 rounded-full overflow-hidden mx-auto mb-8",
      contentWrapper: "max-w-2xl mx-auto space-y-6"
    },
   
  ];

  const gradients = [
    "bg-gradient-to-br from-rose-100 via-pink-100 to-teal-100",
    "bg-gradient-to-tr from-purple-100 via-violet-100 to-indigo-100", 
    "bg-gradient-to-bl from-blue-100 via-sky-100 to-emerald-100",
    "bg-gradient-to-tl from-amber-100 via-orange-100 to-yellow-100"
  ];

  return React.createElement('div',
    {
      className: "relative w-full  presentation-container  min-h-screen flex flex-col items-center justify-center gap-12 py-16 "
    },
    React.createElement('h1',
      {
        className: "text-6xl w-full text-center font-black  bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 [text-shadow:_0_1px_2px_rgb(0_0_0_/_20%)] animate-float"
      },
      data.title
    ),
    data.slides.map((slide, index) => {
      const layout = layouts[index % layouts.length];
      return React.createElement('div',
        {
          className: layout.container + " " + gradients[index % gradients.length] + " transform transition-all duration-500 hover:scale-[1.02] mb-12"
        },
        [
          React.createElement('div',
            {
              className: layout.imageWrapper
            },
            React.createElement('img',
              {
                src: slide.image,
                className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              }
            )
          ),
          React.createElement('div',
            {
              className: layout.contentWrapper
            },
            [
              React.createElement('h2',
                {
                  className: "text-3xl font-bold bg-clip-text text-gray-700 bg-gradient-to-r from-gray-400 to-gray-700 pb-2 border-b-2 border-gray-200/50"
                },
                slide.title
              ),
              React.createElement('ul',
                {
                  className: "space-y-4 pt-6"
                },
                slide.bulletPoints.map(point =>
                  React.createElement('li',
                    {
                      className: "flex items-center gap-4 text-gray-700 transform transition-all duration-300 hover:translate-x-2"
                    },
                    [
                      React.createElement('span',
                        {
                          className: "text-2xl text-gray-600 rotate-12"
                        },
                        "✦"
                      ),
                      React.createElement('span',
                        {
                          className: "font-medium leading-relaxed text-md"
                        },
                        point
                      )
                    ]
                  )
                )
              )
            ]
          )
        ]
      );
    })
  );
}


const loadPresentationComponent = () => {
  // let Component:any;

  // try {
  //   if (!presentationComponent) {
  //     throw new Error("presentationComponent is empty or undefined");
  //   }
  //     console.log("Raw presentationComponent:", presentationComponent);
    

  //   const cleanedCode = presentationComponent.trim();
  //   const ComponentConstrucFun = new Function("React", `
  //     ${cleanedCode}
  //     return PresentationComponent;
  //   `);

  //   Component = ComponentConstrucFun(React);
  //   setOrignalComponent(() =>cleanedCode ) 
  //   setDynamicComponent(() => Component); 
  //   setIsLoading(false)
  // } catch (error:any) {
  //   setDynamicComponent(null);
  //   toast.dismiss("presentation")
  //   setIsLoading(false)
  //   console.error("Error loading dynamic component:", error);
  // }
};

useEffect(()=>{
  setDynamicComponent(()=> PresentationComponent)
},[])

useEffect(() => {
  if(switchValue ){
    const script = document.createElement('script');
    script.src = 'https://cdn.tailwindcss.com';
    script.async = true;
    script.onload = () => {
      loadPresentationComponent();
    };

    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      document.head.appendChild(script);
    } else {
      loadPresentationComponent();
    }
  }
}, [presentationComponent]);


useEffect(()=>{
  if(isLoading){
    toast.loading("Generating Presentation...", {
      id: "presentation",
    });
  }
  if(!isLoading){
    toast.dismiss("presentation")
  }
},[isLoading])


////////////////////////////// Toggle and Edit Presentaiton //////////////////////////////


function handleEditToogle(e:ChangeEvent<HTMLInputElement>){
  const value = e.target.checked;
  let output;
  if(value){
    output ='edit'
  }else{
    output = 'preview'
  }
  setEditToogle(output)
}





useEffect(() => {
  const container = document.querySelector('.presentation-container') as HTMLDivElement | null;
  if (!container) return;
  if (editToggle === 'edit') {
    generateAttributes(container,setTargetElement);
  } else {
    cleanupAttributes(container);
  }
}, [editToggle]);





  return (
    <>
      <Header />

      <Box
        sx={{
          display: "flex",
          flex: 1,
          width: "100%",
          pt: 2,
          px: 2,
          gap: 2,
        }}
      >

        <Box
          sx={{
            display: { md: "flex", xs: "none", sm: "none" },
            width:'20%',
            flexDirection: "column",
          }}
        >
          <Stack direction="row" spacing={1} sx={{
            alignItems: 'center', bgcolor: "#D9EAFD", borderRadius: 5,
            mb: 2,
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'row',
            py: 2,
            px: 1,
          }}>
            <Typography sx={{
              color: "black",
              fontSize: "14px",
              opacity : switchValue ? 0.5 : 1
            }}>Chat Bot</Typography>
            <AntSwitch 
            
            onChange={(e)=>{
              handleSwitchValue(e)
            }}  inputProps={{ 'aria-label': 'ant design' }} />
            <Typography sx={{
              color: "black",
              fontSize: "14px",
              opacity : !switchValue ? 0.5 : 1
            }}>Presentation</Typography>
          </Stack>

          <Box
            className="shadow-md"
            sx={{
              flex:1,
              display: "flex",
              width: "100%",
              height: "fit-content",
              bgcolor: "#D9EAFD",
              borderRadius: 5,
              flexDirection: "column",
              py: 2,
              px: 1,
            }}
          >
            {
              !switchValue ? 
              <>
               <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  mx: "auto",
              
                  bgcolor: "white",
                  color: "black",
                  fontWeight: 700,
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
                {user && user?.username?.split(" ").length > 0
                  ? user?.username?.split(" ")[1]?.charAt(0).toUpperCase()
                  : ""}
              </Avatar>
              <Box className="transition-all duration-300 rounded-md p-2  cursor-pointer flex justify-center items-center hover:bg-[#4A90E2] hover:text-white ">
                <FaRegEdit onClick={handleNewTab} />
              </Box>
            </Box>
            {/* tabs */}
            <Box
              sx={{
                overflowY: "auto ",
                scrollbarWidth: "thin",
                maxHeight: "calc(100vh - 300px)",
                p: 2,
                my: 1,
              }}
            >
              {chatTabs.length > 0 &&
                chatTabs.map((tab: any, idx: number) => {
                  return (
                    <Box position={'relative'}>
                      <Typography
                        className={`line-clamp-1  tab_container capitalize ${params && params!.toString() === tab?._id.toString() ? "bg-[#4A90E2] text-white" : "bg-blue-300 "}`}
                        onClick={() => {
                          handleTabChange(tab._id, idx);
                        }}
                        sx={{
                          textAlign: "start",
                          mb: 0.8,
                          fontSize: "14px",
                          borderRadius: "5px",
                          p: 1,
                          cursor: "pointer",
                          mx: "auto",
                        }}
                      >
                        {tabTitles[idx]}


                        <Tooltip title="Make Duplicate" className=" tooltip ">
                          <Box
                            onClick={() => {
                              handleDuplicateTab(tab._id)
                            }}
                            className="absolute top-1/2 -translate-y-1/2 right-2  bg-gray-100 cursor-pointer rounded-md p-1 w-7 h-7 flex justify-center items-center">
                            <FaRegCopy color="black" />
                          </Box>
                        </Tooltip>
                      </Typography>

                    </Box>
                  );
                })}
            </Box>

            <Button
              onClick={handleDeleteChat}
              sx={{
                textAlign: "center",
                mx: 2,
                mb: 0.6,
                color: "white",
                borderRadius: "5px",
                p: 1,
                cursor: "pointer",
                backgroundColor: "#F72C5B",
                ":hover": {
                  backgroundColor: "#FF748B",
                },
              }}
            >
              Clear Chats
            </Button>
              </> 
              :  DynamicComponent 
              // && presentationComponent.trim().length > 0
                ?
              <Stack direction="row" spacing={1} sx={{
                alignItems: 'center', bgcolor: "#D9EAFD", borderRadius: 5,
                mb: 2,
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'row',
                py: 2,
                px: 1,
              }}>
                <Typography sx={{
                  color: "black",
                  fontSize: "14px",
                  opacity : !switchValue ? 0.5 : 1
                }}>Preview</Typography>
                <AntSwitch 
                
                onChange={(e)=>{
                  handleEditToogle(e)
                }}  inputProps={{ 'aria-label': 'ant design' }} />
                <Typography sx={{
                  color: "black",
                  fontSize: "14px",
                  opacity : switchValue ? 0.5 : 1
                }}>Edit</Typography>
              </Stack>
              : null
            }
           
          </Box>
       
        </Box>

{/*  result container */}
     
 
          <Box
          className="shadow-md h-[calc(100vh-100px)] "
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "80%",
            borderRadius: 5,
           
            bgcolor: "#D9EAFD",
       
            flex: {
              md: 1,
              xs: 1,
              sm: 1,
            },
            flexDirection: "column",
            px: 3,
            py: 2,
          }}
        >
      {
      targetElement?.tagName !== 'IMG' ?
      targetElement && editToggle == 'edit' && <TextEditor targetElement={targetElement} setTargetElement={setTargetElement} />
      :  targetElement && editToggle == 'edit' && <ImgEditor targetElement={targetElement} setTargetElement={setTargetElement} />
}
         <Box
         sx={{
           flex:1,
           overflowY:'auto',
           scrollbarWidth:'none'
          }} >
           {/* user chats  and  presentation container*/}
           {
            !switchValue ?
            <Suspense fallback={
              <div className="w-full h-full flex justify-center items-center">
                 <LottieLoader/>
              </div>
            }>
            <ChatContainer
            chatContainer={chatContainer}
            switchValue={switchValue}
            chatMessages={chatMessages}
            presentationComponent={presentationComponent}
          />
            </Suspense>
          : 
          <>
          {
            !DynamicComponent ? 
            <div className="w-full h-full flex justify-center items-center">
                 <LottieLoader/>
              </div>
            :
            DynamicComponent ? <DynamicComponent/> : ''
          }
          </>
           }

         </Box>

          {
            !!params && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  pt: 2,
                }}
              >
                <textarea
                  rows={2}
                  onKeyUp={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      // handleSendMessage(Number.MAX_SAFE_INTEGER + prompt.ASSISTANT_AI_EVENT_CREATION_PROMPT);
                     !switchValue ?
                     handleSendMessage()
                     :
                     handlePresentation()
                    }

                  }}
                  ref={textAreaRef}
                  style={{
                    width: "100%",
                    marginTop: 1,
                    backgroundColor: "white",
                    border: 0,
                    borderRadius: 3,
                    paddingLeft: 5,
                    height: "100%",
                    outline: "none",
                  }}
                  placeholder={`enter the ${!switchValue ? "prompt" : 'presentaiton theme'}`}
                />
                <Box sx={{
                  display: 'flex',
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}>

                  <Box
                    onClick={() => {
                      !switchValue ?
                      handleSendMessage()
                      :
                      handlePresentation()
                    }}>
                    <Tooltip title="">
                      <IconButton sx={{

                        bgcolor: "#344CB7",
                        borderRadius: 2,
                        p: 0.8,
                        color: 'white',
                        cursor: "pointer",
                        ":hover": {
                          backgroundColor: "#577BC1",
                        },
                      }}>
                        <IoIosSend className="text-white" />
                      </IconButton>
                    </Tooltip>




                  </Box>

                </Box>

              </Box>
            )
          }
        </Box>
   
        
       
      
      </Box>
    </>
  );
};

export default Chat;
