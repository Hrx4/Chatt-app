import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import { getSender } from '../config/ChatLogic'
import { ChatState } from '../Context/ChatProvider'
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal'
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import { backend } from '../backend';

const ENDPOINT = backend
var socket , selectedChatCompare;

const SingleChat = () => {

    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [newMessage, setNewMessage] = useState("")
    const [socketConnected, setSocketConnected] = useState(false)
    const {user ,selectedChat, setSelectedChat ,notification ,setNotification } = ChatState()
    const [typing, setTyping] = useState(false)
    const toast = useToast();
    const{fetchAgain , setFetchAgain} = ChatState()


    const fetchMessages = async () => {
      if (!selectedChat) return;
  
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.data.token}`,
          },
        };
  
        setLoading(true);
  
        const { data } = await axios.get(
          `${backend}api/message/${selectedChat._id}`,
          config
        );
        setMessages(data);
        setLoading(false);
  
        socket.emit("join chat", selectedChat._id);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Messages",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    };

    const sendMessage = async (event) => {
      if(event.key==="Enter" && newMessage){
        socket.emit("stop typing" , selectedChat._id)
        try {
          const config = {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user.data.token}`,
            },
          };
          setNewMessage("");
          const { data } = await axios.post(
            `${backend}api/message`,
            {
              content: newMessage,
              chatId: selectedChat,
            },
            config
          );
          socket.emit("new message", data);
          setMessages([...messages, data]);
          
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      }

    }

    useEffect(() => {
      socket = io(ENDPOINT)
      socket.emit("setup" , user)
      socket.on("connected" , () => setSocketConnected(true))


    }, [user])

    useEffect(() => {
      fetchMessages()
      selectedChatCompare = selectedChat;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ selectedChat ]);
    useEffect(() => {
      socket.on('message recived' , (newMessageRecived) => {
        if(!selectedChatCompare || selectedChatCompare?._id !== newMessageRecived.chat._id){
          if(!notification.includes(newMessageRecived)){
            setNotification([newMessageRecived,...notification]);
            setFetchAgain(!fetchAgain)
          }
        }
        else{
          setMessages([...messages , newMessageRecived])
        }
      })
      socket.on("remove user" , (user)=>{
        console.log('====================================');
        console.log(user);
        console.log('====================================');
      })

    })
    
    
    const typingHandler = (e) => {
      setNewMessage(e.target.value)
   

      if(!socketConnected){
        
        return ;
      } 
      if(!typing) {
        setTyping(true)
        socket.emit('typing' , selectedChat._id)
      }
      let lastTypingTime = new Date().getTime();
      var timerLength = 3000;
      setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;
        if (timeDiff >= timerLength && typing) {
          socket.emit("stop typing", selectedChat._id);
          setTyping(false);
        }
      }, timerLength);
    }

    



  return <>{
    selectedChat? (
        <>
        <Text
         fontSize={{ base: "28px", md: "30px" }}
         pb={3}
         px={2}
         w="100%"
         fontFamily="Work sans"
         display="flex"
         justifyContent={{ base: "space-between" }}
         alignItems="center">
            

            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")
               }
            />
             { !selectedChat.isGroupChat ? (
                <>
                  {getSender(user,selectedChat.users)}

                  {/* <ProfileModal user={getSenderFull(user , selectedChat.users)}/> */}
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    
                  />
                </>
              )}

        </Text>
        <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
             {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {/* {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                  loading
                </div>
              ) : (
                <></>
              )} */}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage} 
                onChange={typingHandler}
              />
            </FormControl>

            </Box>
        </>
    ): (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} >
            Click on a user to start chatting
          </Text>
        </Box>
    )
  }
  </>
}

export default SingleChat