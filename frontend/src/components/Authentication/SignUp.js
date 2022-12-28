import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from "axios";
import { useNavigate } from "react-router-dom";



const SignUp = () => {
    const [show, setShow] = useState(false)
    const [name , setName] = useState()
    const [email , setEmail] = useState()
    const [password , setPassword] = useState()
    const [confirmPassword , setConfirmPassword] = useState()
    const [pic , setPic] = useState("")
    const [loading, setLoading] = useState(false)
    const toast= useToast();
    const navigate = useNavigate()

    const handleClick = () => setShow(!show)
    const postDetails = (pics) => {
      setLoading(true);
      if(pics=== undefined){
        toast({
          title: "PLease select an image",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        return 
      }
      if(pics.type === "image/jpeg" || pics.type === "image/png"){
        const data = new FormData();
        data.append("file" , pics);
        data.append("upload_preset" , "chatApp");
        data.append("cloud_name" , "dkm3nxmk5")
        fetch("https://api.cloudinary.com/v1_1/dkm3nxmk5/image/upload" , {
           method:"post",
           body:data,
        }).then((res) => res.json())
        .then((data)=> {
          setPic(data.url.toString());
          console.log(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
      }
      else {
        toast({
          title: "PLease select an image",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        setLoading(false);
        return ;
      }
    }
    
    const submitHandler= async () => {
      setLoading(true);
      if(!name || !email || !password || !confirmPassword){
        toast({
          title: "PLease select an image",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        setLoading(false);
        return;
      }
      if(password!==confirmPassword){
        toast({
          title: "Password do not match",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
      }
      try {
        const config ={
          headers: {
            "Content-type" : "application/json",
          },
        };
        const data = await axios.post("/api/user" , {name,email,password,pic}
        ,config);
        toast({
          title: "Registration successfull",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        localStorage.setItem('userInfo' , JSON.stringify(data));
        setLoading(false)
        navigate('/chats')
      } catch (error) {
        toast({
          title: "Error ",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom"
        });
        console.log(error);
        setLoading(false)
      }
    }

  return <VStack spacing={"5px"} color= "black" >
    <FormControl id='firstName' isRequired>
        <FormLabel> Name </FormLabel>
        <Input placeholder='Enter your name'
        onChange={(e) => setName(e.target.value) }/>
    </FormControl>
    <FormControl id='email' isRequired>
        <FormLabel> Email </FormLabel>
        <Input placeholder='Enter your email'
        onChange={(e) => setEmail(e.target.value) }/>
    </FormControl>
    <FormControl id='password' isRequired>
        <FormLabel> Password </FormLabel>
        <InputGroup>
          <Input
          type={show?"text":"password"}
          placeholder='Enter your password'
          onChange={(e) => setPassword(e.target.value) }/>
          <InputRightElement marginRight={"1"}>
          <Button h={"1.75rem"}  size="sm" onClick={handleClick}>
            {show ? "Hide" : "Show"}
          </Button>
          </InputRightElement>
        </InputGroup>
        
    </FormControl>
    <FormControl id='confirmPassword' isRequired>
        <FormLabel> confirmPassword </FormLabel>
        <InputGroup>
          <Input
          type={show?"text":"password"}
          placeholder='Enter your confirmPassword'
          onChange={(e) => setConfirmPassword(e.target.value) }/>
          <InputRightElement marginRight={"1"}>
          <Button h={"1.75rem"} size="sm" onClick={handleClick}>
            {show ? "Hide" : "Show"}
          </Button>
          </InputRightElement>
        </InputGroup>
        
    </FormControl>

    <FormControl id='pic'>
      <FormLabel>
        Upload your picture
      </FormLabel>
      <Input type={"file"}
      p="1.5"
      accept='image/*'
      onChange={(e) => postDetails(e.target.files[0])}/>
    </FormControl>

    <Button
    colorScheme={"blue"}
    width="100%"
    style={{marginTop: 15}}
    onClick={submitHandler}
    isLoading={loading}>
      Sign Up
    </Button>

  </VStack>
}

export default SignUp