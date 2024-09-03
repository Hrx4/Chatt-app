import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import {BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UsrAvatar/UserListItem';
import { getSender } from '../../config/ChatLogic';
import { backend } from '../../backend';
const SideDrwaer = () => {

  const navigate = useNavigate();
  const [search , setSearch] = useState("");
  const [searchResult , setSearchResult] = useState([]);
  const [loading , setLoading] = useState(false);
  const [loadingChat , setLoadingChat] = useState();

  const {user , setChats , setSelectedChat , chats, notification , setNotification} = ChatState();
  const {isOpen , onOpen , onClose} =useDisclosure()  
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate('/');
  }
  const toast = useToast()
  const handleSearch =async () => {
    if(!search){
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left"
      });
      return 
    }
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.data.token}`,
        },
      }

      const {data} = await axios.get(`${backend}api/user?search=${search}` , config);
      console.log(data);
      setLoading(false);
      setSearchResult(data);

    } catch (error) {
      toast({
        title: "Error Occured",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.data.token}`,
        },
      };
      const { data } = await axios.post(`${backend}api/chat`, { userId }, config);
      console.log(data);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return <>
  <Box display={"flex"} justifyContent="space-between" alignItems={"center"} bg="white" w={"100%"} p="5px 10px 5px 10px" borderWidth={"5px"}>
    <Tooltip label="search Users to chat" hasArrow placement='bottom-end'>
      <Button variant={"ghost"} onClick={onOpen}>
        <i className='fas fa-search'></i>
        <Text display={{base: "none" , md:"flex"}} px="4">
          Search User
        </Text>
      </Button>
    </Tooltip>

    <Text fontSize={"2xl"} >
    CHAT-APP
    </Text>
    <div>
      <Menu>
        <MenuButton p={1}>
        <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
          <BellIcon fontSize={"2xl"} m={1}/>
        </MenuButton>

        <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>

      </Menu>
      <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon/> } >
          <Avatar size={"sm"} 
          cursor="pointer" 
          name={user.data.name} 
          src={user.data.pic}/>
        </MenuButton>
        <MenuList>
          <ProfileModal user={user}>
          <MenuItem>My Profile</MenuItem>
          </ProfileModal>
          <MenuDivider/>
          <MenuItem onClick={logoutHandler}>Log Out</MenuItem>
        </MenuList>
      </Menu>
    </div>
  </Box>

  <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
    <DrawerOverlay/>
    <DrawerContent>
      <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
      <DrawerBody>
      <Box display={"flex"} pb={2}>
        <Input
        placeholder='Search by name or email'
        mr={2}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={handleSearch}>Go</Button>
      </Box>
      {loading ? (<ChatLoading/>): (
        searchResult.map((user) => (
          <UserListItem
          key={user._id}
          user={user}
          handleFunction ={()=> accessChat(user._id)}
          />
        ))
      )}

      {loadingChat && <Spinner ml={"auto"} display="flex"/>}

    </DrawerBody>
    </DrawerContent>
    
  </Drawer>


  </>
}

export default SideDrwaer