import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if(form.password !== form.confirmPassword){
      return alert("Passwords is not match");
    }
    console.log(form);
    // send to backend
    try{
      const res = await axios.post('http://localhost:3000/api/auth/register', form);
      console.log(res);
      
    }catch(err){
      console.log(err);
    }
  }

  return (
    <div>
      Register
      <form onSubmit={handleSubmit}>
        Username
        <input 
          className="border" 
          name="username" 
          type="text"
          onChange={handleChange}
        />
        Email
        <input 
          className="border" 
          name="email" 
          type="email"
          onChange={handleChange}
        />
        Password
        <input 
          className="border" 
          name="password" 
          type="text" 
          onChange={handleChange}
        />
        Confirm Password
        <input 
          className="border" 
          name="confirmPassword" 
          type="text"  
          onChange={handleChange}
        />
        <button className="bg-blue-500 rounded-md">Register</button>
      </form>
    </div>
  );
}
