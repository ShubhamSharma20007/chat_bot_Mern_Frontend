import React from 'react'
import { Box, Typography } from '@mui/material';
import ChatItem from '../chatItem';
import LottieLoader from '../lottie';


const ChatContainer = (props:any) => {
  return (
    <Box
      ref={props.chatContainer}
      sx={{
        width: "100%",
        mx: "auto",
        borderRadius: 5,
        height: "100%",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        scrollBehavior: "smooth",
      }}
    >
      {!props.switchValue ? (
        // Chat mode (when switchValue is false)
        <>
          {props.chatMessages.length > 0 &&
            props.chatMessages.map((chat:any, idx:number) => {
              return <ChatItem message={chat} key={idx} />;
            })}
          {props.chatMessages.length === 0 && (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LottieLoader/>
            </Box>
          )}
        </>
      ) : (
        // Presentation mode (when switchValue is true)
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {props.presentationComponent ? (
            <div dangerouslySetInnerHTML={{ __html: '<div id="presentation-container"></div>' }} />
          ) : (
            <Typography variant="body1">
              Enter a presentation theme and click send to generate a presentation
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

export default ChatContainer