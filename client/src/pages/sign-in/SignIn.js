import React from 'react';



class SignIn extends React.Component {
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
        fetch(`user/${this.state.userName}/${this.state.password}`, {
      method: 'GET'
    }).then(res=>{if(res.status===400){
console.log("fail");}
else{
console.log("success")
}
    }).catch(err =>console.log(err));
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




export default SignIn;
