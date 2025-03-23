import { createContext, useContext, useEffect, useState } from "react";
import { connect } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
type ChatMessageType = {
  role: string;
  content: string;
  refusal?: boolean | null;
  user_msg: string;
  chatTabId: string;
};

export const SocketContext = createContext<any>(null);

export const SocketProvider = ({ children }: any) => {
  const { user } = useAuth();
  const socket = connect(import.meta.env.VITE_BACKEND_URL);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [presentationComponent, setPresentationComponent] = useState<string | null>('')
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("response-new-chat", (data: ChatMessageType) => {
      const { role, content, user_msg, chatTabId } = data;

      setChatMessages((prev) => [
        ...prev,
        { role, content, user_msg, chatTabId },
      ]);
      toast.dismiss("chat");
    });
    
    socket.on('response-new-presentation',(component:string)=>{
     console.log(component)
      try {
        component = component.replace(/```js/g, '')
        .replace(/```/g, '')
        .replace(/`/g, '')
        .trim();
        setPresentationComponent(component)
      } catch (error) {
        console.log(error);
      }
    })

    // socket.on("send-ai-response", (data: any) => {
    //   console.log(data, 1212);
    // });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  });

  const value = {
    socket,
    chatMessages,
    setChatMessages,
    setPresentationComponent,
    presentationComponent
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
