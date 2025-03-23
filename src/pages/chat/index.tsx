import { useEffect, useLayoutEffect, useRef, useState } from "react";
import React from "react";
import Header from "../../components/header/index.tsx";
import { Box, Avatar, Typography, Button, FormControlLabel, Switch, Stack, styled } from "@mui/material";
import { useAuth } from "../../context/AuthContext.tsx";
import ChatItem from "../../components/chatItem/index.tsx";
import { IoIosSend } from "react-icons/io";
import Tooltip from '@mui/material/Tooltip';
import toast from "react-hot-toast";
import { Instance } from "../../lib/Instance.ts";
import Lottie from "react-lottie";
import IconButton from '@mui/material/IconButton';
import Gradient from "../../../public/lottie-animate.json";
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
import prompt from "../../data/prompt.ts";
import { AntSwitch } from "../../shared/switchTheme.ts";
import ChatContainer from "../../components/chatContainer/index.tsx";
type ChatMessageType = {
  role: string;
  content: string;
  refusal?: boolean | null;
  user_msg: string;
  receiverId: string;
};

const Chat = () => {
  const { socket, chatMessages, setChatMessages,   
    setPresentationComponent,
    presentationComponent  } = useSocket();
    const [isLoading, setIsLoading] = useState(false)
  const { user, isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = searchParams.get("tab");
  const [DynamicComponent, setDynamicComponent]= useState<React.FC | null>(null)
  const navigate = useNavigate();
  const [chatTabs, setChatTabs] = useState<any>([]);
  const [switchValue, setSwitchValue] = useState<boolean>()
  let textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  let chatContainer = useRef<HTMLElement | null>(null);
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
      const req = await toast.promise(Instance.get(CHATS_GET, {
        params: {
          chatTabId: params,
        },
      }), {
        loading: 'Fetching Chats...',

      })
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

  function handleTitleOfTabs(tab: any) {
    let message;
    if (tab.userId.chats?.length > 0) {
      const res = tab.userId.chats.find(
        (firstTab: any) => firstTab.chatTabId.toString() === tab._id.toString()
      );
      if (res) {
        res.user_msg?.length > 30
          ? message = `${res.user_msg?.slice(0, 20)}...`
          : message = res.user_msg
      } else {
        message = "New Chat";
      }
      if (tab.isDuplicate) {
        message += ' (copy)'
      }
    } else {
      message = "New Chat";
    }
    return message
  }


function handleSwitchValue(e:React.ChangeEvent<HTMLInputElement>){
  const value = e.target.checked;
  setSwitchValue(value)
  localStorage.setItem("switchValue", JSON.stringify(value))
}



const loadComponent = () => {
  let Component:any;

  try {
    if (!presentationComponent) {
      throw new Error("presentationComponent is empty or undefined");
    }
      console.log("Raw presentationComponent:", presentationComponent);
    

    const cleanedCode = presentationComponent.trim();

    // if (!cleanedCode.includes("function PresentationComponent")) {
    //   throw new Error("Invalid component definition");
    // }
    const ComponentFactory = new Function("React", `
      ${cleanedCode}
      return PresentationComponent;
    `);

    Component = ComponentFactory(React);
    setDynamicComponent(() => Component); 
    setIsLoading(false)
  } catch (error:any) {
    setDynamicComponent(null);
    toast.dismiss("presentation")
    setIsLoading(false)
    console.error("Error loading dynamic component:", error);
  }
 
};

useEffect(() => {
  if(switchValue ){
    const script = document.createElement('script');
    script.src = 'https://cdn.tailwindcss.com';
    script.async = true;
    script.onload = () => {
      loadComponent();
    };

    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      document.head.appendChild(script);
    } else {
      loadComponent();
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

useLayoutEffect(()=>{
  setSwitchValue(localStorage.getItem("switchValue") ? JSON.parse(localStorage.getItem("switchValue") as string) : false)
},[])





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
            flex: 0.3,
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
                        className={`line-clamp-1 capitalize ${params && params!.toString() === tab?._id.toString() ? "bg-[#4A90E2] text-white" : "bg-blue-300 "}`}
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
                        {handleTitleOfTabs(tab)}


                        <Tooltip title="Make Duplicate">
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
          </Box>
        </Box>

{/*  result container */}
     
 
          <Box
          className="shadow-md h-[calc(100vh-100px)] "
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            borderRadius: 5,
           
            bgcolor: "#D9EAFD",
            maxWidth: "75%",
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

         <Box sx={{
           flex:1,
           overflowY:'auto',
           scrollbarWidth:'none'
          }}>
           {/* user chats  and  presentation container*/}
           {
            !switchValue ?
            <ChatContainer
            chatContainer={chatContainer}
            switchValue={switchValue}
            chatMessages={chatMessages}
            presentationComponent={presentationComponent}
          />
          : 
          DynamicComponent ? <DynamicComponent/> : ''
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
