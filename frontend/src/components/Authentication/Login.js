import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack ,useToast} from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backend } from '../../backend';

const Login = () => {
  const [show, setShow] = useState(false)
  const [email , setEmail] = useState("")
  const [password , setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const toast= useToast();
 const navigate = useNavigate()
 

  const handleClick = () => setShow(!show)
 
  const submitHandler= async() => {
    setLoading(true);
      if(!email || !password ){
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
      
      try {
        const config ={
          headers: {
            "Content-type" : "application/json",
          },
        };
        const data = await axios.post(`${backend}api/user/login` , {email,password}
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
  <FormControl id='email' isRequired>
      <FormLabel> Email </FormLabel>
      <Input placeholder='Enter your email'
      value={email}
      onChange={(e) => setEmail(e.target.value) }/>
  </FormControl>
  <FormControl id='password' isRequired>
      <FormLabel> Password </FormLabel>
      <InputGroup>
        <Input
        type={show?"text":"password"}
        placeholder='Enter your password'
        value={password}
        onChange={(e) => setPassword(e.target.value) }/>
        <InputRightElement marginRight={"1"}>
        <Button h={"1.75rem"}  size="sm" onClick={handleClick}>
          {show ? "Hide" : "Show"}
        </Button>
        </InputRightElement>
      </InputGroup>
      
  </FormControl>
 

  <Button
  colorScheme={"blue"}
  width="100%"
  style={{marginTop: 15}}
  onClick={submitHandler}
  isLoading={loading}>
   Login
  </Button>
  <Button
  variant={"solid"}
  colorScheme={"red"}
  width="100%"
  style={{marginTop: 15}}
  onClick={() => {
    setEmail("guest@example.com")
    setPassword("123456")
  }}>
    Guest User Credentials
  </Button>

</VStack>
}

export default Login