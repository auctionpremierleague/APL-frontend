import React from 'react';



class SignUp extends React.Component {
  state = {
    userName:"",
    password:""
  };

  handleSubmit = e => {
    e.preventDefault();
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  
  handleClick=()=> {

    this.setState(
      {
       userName:this.state.userName,
       password:this.state.password
      },
      () =>{
        fetch('http://192.168.29.191:4000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept':'application/json'
      },
      body:JSON.stringify({userName:this.state.userName,password:this.state.password})
    }).then(res=>console.log(res)).catch(err =>console.log(err));
      }
    );
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
  <input type="text" name="userName" placeholder="UserName" value={this.state.userName} onChange={this.handleChange} />
  <input type="password" name="password" placeholder="PassWord" value={this.state.password} onChange={this.handleChange} />

      
        <button onClick={this.handleClick}>Send data!</button>
      </form>
    );
  }
}




export default SignUp;
