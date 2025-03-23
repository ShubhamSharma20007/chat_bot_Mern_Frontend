import { Box, Avatar, Typography, FormControlLabel, Switch } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "../../context/AuthContext";
import { LuClipboardList } from "react-icons/lu";
import { LuClipboardCheck } from "react-icons/lu";
import { IoIosNavigate } from "react-icons/io";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useState } from "react";

type UserChatType = {
  role: string;
  content?: string;
  refusal?: boolean | null;
  user_msg: string;
};

interface ChatItemProps {
  message: UserChatType;
}

function extractCodeBlock(message: string) {
  const regex = /```(\w+)?\n([\s\S]+?)```/g;
  let match;
  const blocks: string[] = [];
  let lastIndex = 0;

  while ((match = regex.exec(message)) !== null) {
    // Push the text before the code block as a normal text block
    if (match.index > lastIndex) {
      blocks.push(message.substring(lastIndex, match.index));
    }

    // Push the extracted code block
    blocks.push(match[2]); // The actual code inside triple backticks
    lastIndex = regex.lastIndex;
  }

  // Push any remaining text after the last code block
  if (lastIndex < message.length) {
    blocks.push(message.substring(lastIndex));
  }

  console.log

  return blocks;
}


function isCodeBlock(message: string) {
  if (message.includes('https://www.google.com') || message.includes('https://accounts.google.com')) {
    return false;
  }
  
  // Check if it's a markdown-formatted list with bold items (your weather case)
  const boldListPattern = /\s*-\s*\*\*.*?\*\*:.*/;
  if (boldListPattern.test(message)) {
    return false;
  }
  
  // More robust code detection - check for multiple indicators
  let codeIndicators = 0;
  
  if (message.includes(";")) codeIndicators++;
  if (message.includes("=")) codeIndicators++;
  if (message.includes("{") && message.includes("}")) codeIndicators++;
  if (message.includes("[") && message.includes("]")) codeIndicators++;
  if (message.includes("//")) codeIndicators++;
  if (message.includes("#include")) codeIndicators++;
  if (message.includes("function ")) codeIndicators++;
  if (message.includes("const ") || message.includes("let ") || message.includes("var ")) codeIndicators++;
  
  // If multiple code indicators are present, it's more likely to be code
  return codeIndicators >= 2;
}

const ChatItem = ({ message }: ChatItemProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = searchParams.get("tab");
  const navigate = useNavigate();
  const [copied, setCopied] = useState<boolean[]>([]);
  const { role, content = "", user_msg } = message;
  const { user } = useAuth();
  const messageBlocks = extractCodeBlock(content);

  function copyToClipboard(text: string, index: number): void {
    navigator.clipboard.writeText(text.trim());
    setCopied((prev: any) => ({
      ...prev,
      [index]: true,
    }));
    setTimeout(
      () =>
        setCopied((prev: any) => ({
          ...prev,
          [index]: false,
        })),
      4000
    );
  }


  const handleNavigate = async (block: string) => {
    navigate('/preview?iscode=true', { state: { code: block } })
  }
const textContainer = useRef<HTMLDivElement>(null)
function extractTheLink(str: string) {
  if (typeof str === "string") {
    const regex = /(https?:\/\/[^\s)]+)/g;

    return str.split(regex).map((part, index) =>(
      regex.test(part) ? <a key={index} href={part} target="_blank"  style={{ color: "blue" }}>{part}</a>:
      part
    )
    );
  }
  return str;
}

  return role === "assistant" ? (
    <>

      <Box
        className="shadow-sm"
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "white",
          borderRadius: 2,
          p: 2,
          gap: 2,
        }}
      >
        <Avatar sx={{ ml: 0 }}>
          {user?.username?.charAt(0).toUpperCase()}
          {user && user?.username?.split(" ").length > 1
            ? user?.username?.split(" ")[1]?.charAt(0).toUpperCase()
            : ""}
        </Avatar>
        <Typography color="black" fontSize={"15px"}>
          {user_msg.trim()}
        </Typography>
      </Box>

      <Box
        className="shadow-sm mt-2"
        sx={{
          width: "100%",
          display: "flex",
          bgcolor: "#F2F9FF",
          borderRadius: 2,
          justifyContent: "start",
          p: 2,
          my: 2,
          gap: 2,
        }}
      >
        {/* <Avatar
          sx={{
            ml: 0,
            width: 40,
            borderRadius: "50%",
            border: "1px solid lightgray",
          }}
          src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg"
        /> */}
        <Box className="w-full">
        {messageBlocks.map((block: string, index: number) => {
  return isCodeBlock(block) ? (
    <Box key={`code-block-${index}`}>
      {copied[index] ? (
        <LuClipboardCheck style={{ marginTop: 1, marginLeft: "auto", color: "lightgreen" }} />
      ) : (
        <div className="flex justify-end">
          <div className="flex items-center">
            <div
              onClick={() => handleNavigate(block)}
              title="preview"
              className="transition-all duration-300 rounded-lg inline-flex p-2 hover:bg-zinc-200 cursor-pointer"
            >
              <IoIosNavigate size={22} />
            </div>
            <div
              title="Copy to clipboard"
              onClick={() => copyToClipboard(block, index)}
              className="transition-all duration-300 rounded-lg inline-flex p-2 hover:bg-zinc-200 cursor-pointer"
            >
              <LuClipboardList size={20} />
            </div>
          </div>
        </div>
      )}

      <SyntaxHighlighter
        wrapLines
        customStyle={{ borderRadius: 10 }}
        style={darcula}
        language="javascript"
      >
        {block.trim()}
      </SyntaxHighlighter>
    </Box>
  ) : (
    <Typography key={`text-block-${index}`} color="black" sx={{ width: "100%", whiteSpace: "pre-wrap", marginTop: 1 }} fontSize={"15px"}>
      {extractTheLink(block)}
    </Typography>
  );
})}

        </Box>
      </Box>
    </>
  ) : (
    <Box
      className="shadow-sm "
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "white",
        borderRadius: 2,
        p: 2,
        gap: 2,
      }}
    >
      <Avatar sx={{ ml: 0 }}>
        {user?.username?.charAt(0).toUpperCase()}
        {user && user?.username?.split(" ").length > 1
          ? user?.username?.split(" ")[1]?.charAt(0).toUpperCase()
          : ""}
      </Avatar>
      <Typography color="black" fontSize={"15px"}>
        {user_msg?.trim()}
      </Typography>
    </Box>
  );
};


export default ChatItem;
