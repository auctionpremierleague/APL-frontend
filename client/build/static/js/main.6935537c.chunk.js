(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{75:function(e,t,a){e.exports=a(88)},80:function(e,t,a){},81:function(e,t,a){},88:function(e,t,a){"use strict";a.r(t);var n=a(0),c=a.n(n),r=a(9),l=a.n(r),o=(a(80),a(81),a(30)),s=a(10),i=function(){return c.a.createElement(c.a.Fragment,null,c.a.createElement("h1",null,"hello"),c.a.createElement("p",null,"this is homepage"))},u=a(31),m=a(41),d=a(42),h=a(49),p=a(48),b=function(e){Object(h.a)(a,e);var t=Object(p.a)(a);function a(){var e;Object(m.a)(this,a);for(var n=arguments.length,c=new Array(n),r=0;r<n;r++)c[r]=arguments[r];return(e=t.call.apply(t,[this].concat(c))).state={userName:"",password:""},e.handleSubmit=function(e){e.preventDefault()},e.handleChange=function(t){e.setState(Object(u.a)({},t.target.name,t.target.value))},e.handleClick=function(){e.setState({userName:e.state.userName,password:e.state.password},(function(){fetch("/users",{method:"POST",headers:{"Content-Type":"application/json",accept:"application/json"},body:JSON.stringify({userName:e.state.userName,password:e.state.password})}).then((function(e){return console.log(e)})).catch((function(e){return console.log(e)}))}))},e}return Object(d.a)(a,[{key:"render",value:function(){return c.a.createElement("form",{onSubmit:this.handleSubmit},c.a.createElement("input",{type:"text",name:"userName",placeholder:"UserName",value:this.state.userName,onChange:this.handleChange}),c.a.createElement("input",{type:"password",name:"password",placeholder:"PassWord",value:this.state.password,onChange:this.handleChange}),c.a.createElement("button",{onClick:this.handleClick},"Send data!"))}}]),a}(c.a.Component),E=function(e){Object(h.a)(a,e);var t=Object(p.a)(a);function a(){var e;Object(m.a)(this,a);for(var n=arguments.length,c=new Array(n),r=0;r<n;r++)c[r]=arguments[r];return(e=t.call.apply(t,[this].concat(c))).state={userName:"",password:""},e.handleSubmit=function(e){e.preventDefault()},e.handleChange=function(t){e.setState(Object(u.a)({},t.target.name,t.target.value))},e.handleClick=function(){e.setState({userName:e.state.userName,password:e.state.password},(function(){fetch("http://192.168.29.191:4000/users/".concat(e.state.userName,"/").concat(e.state.password),{method:"GET"}).then((function(e){400===e.status?console.log("fail"):console.log("success")})).catch((function(e){return console.log(e)}))}))},e}return Object(d.a)(a,[{key:"render",value:function(){return c.a.createElement("form",{onSubmit:this.handleSubmit},c.a.createElement("input",{type:"text",name:"userName",placeholder:"UserName",value:this.state.userName,onChange:this.handleChange}),c.a.createElement("input",{type:"password",name:"password",placeholder:"PassWord",value:this.state.password,onChange:this.handleChange}),c.a.createElement("button",{onClick:this.handleClick},"Send data!"))}}]),a}(c.a.Component),f=a(19),g=a(51),O=a(124),j=a(16),v=a(131),w=a(130),S=a(127),C=a(59),y=a.n(C),N=a(63),k=a.n(N),x=a(129),I=a(136),T=a(64),U=a.n(T),z=a(65),B=a.n(z),P=a(133),A=a(60),D=a.n(A),R=a(61),W=a.n(R),F=a(62),J=a.n(F),G=a(134),H=Object(O.a)((function(e){return{margin:{margin:e.spacing(1)},image:{height:"200px"},container:{backgroundImage:'url("../RCB/5334.jpg")',backgroundSize:"cover"},drawer:{width:100,flexShrink:0},drawerPaper:{width:100},drawerHeader:Object(g.a)(Object(g.a)({display:"flex",alignItems:"center",padding:e.spacing(0,1)},e.mixins.toolbar),{},{justifyContent:"flex-start"})}}));function L(){var e=H(),t=Object(j.a)(),a=Object(n.useState)(!1),r=Object(f.a)(a,2),l=r[0],o=r[1],s=Object(n.useState)([]),i=Object(f.a)(s,2),u=i[0],m=i[1],d=Object(n.useState)(""),h=Object(f.a)(d,2),p=h[0],b=h[1],E=Object(n.useState)(0),g=Object(f.a)(E,2),O=g[0],C=g[1],N=Object(n.useState)(""),T=Object(f.a)(N,2),z=T[0],A=T[1],R=Object(n.useState)(""),F=Object(f.a)(R,2),L=F[0],M=F[1],$=Object(n.useState)(""),q=Object(f.a)($,2),K=q[0],Q=q[1],V=Object(n.useState)(""),X=Object(f.a)(V,2),Y=X[0],Z=X[1],_=Object(n.useState)(""),ee=Object(f.a)(_,2),te=ee[0],ae=ee[1],ne=Object(n.useState)(!1),ce=Object(f.a)(ne,2),re=ce[0],le=ce[1],oe=Object(n.useState)("Info"),se=Object(f.a)(oe,2),ie=(se[0],se[1]);function ue(){return c.a.createElement(c.a.Fragment,null,c.a.createElement("img",{className:e.image,alt:"Contemplative Reptile",src:z,title:"Contemplative Reptile"}))}function me(){return c.a.createElement(c.a.Fragment,null,c.a.createElement(S.a,null,"Team : ",L),c.a.createElement(S.a,null,"Role : ",K),c.a.createElement(S.a,null,"Bat : ",Y),c.a.createElement(S.a,null,"Bowl : ",te))}return Object(n.useEffect)((function(){u[O]&&(b(u[O].name),A("../".concat(u[O].Team,"/").concat(u[O].pid,".jpg")),M(u[O].Team),Q(u[O].role),Z(u[O].battingStyle),ae(u[O].bowlingStyle),o(!0))}),[O,u,l]),0===u.length&&fetch("http://192.168.29.191:4000/players",{method:"GET"}).then((function(e){e.json().then((function(e){m(e),C(0)}))})),c.a.createElement("div",{className:e.root},c.a.createElement(x.a,{container:!0,alignContent:"center",alignItems:"center"},c.a.createElement(x.a,{item:!0,xs:3},c.a.createElement(w.a,{variant:"contained",color:"secondary",size:"small",className:e.button,startIcon:c.a.createElement(y.a,null),onClick:function(){return C(O-1)}})),c.a.createElement(x.a,{item:!0,lg:6,xs:6},c.a.createElement(v.a,{direction:"left",in:l,mountOnEnter:!0,unmountOnExit:!0},c.a.createElement("div",null,c.a.createElement(ue,null),c.a.createElement(D.a,{onClick:function(){le(!0)}}),c.a.createElement(S.a,null,p),c.a.createElement(w.a,{variant:"contained",color:"secondary",size:"small",className:e.button,startIcon:c.a.createElement(W.a,null),onClick:function(){le(!0),ie("franchiseInfo")}},"SOLD"),c.a.createElement(w.a,{variant:"contained",color:"secondary",size:"small",className:e.button,startIcon:c.a.createElement(J.a,null),onClick:function(){return C(O-1)}},"UNSOLD"),c.a.createElement(G.a,{id:"outlined-basic",label:"Outlined",variant:"outlined"})))),c.a.createElement(x.a,{item:!0,xs:3},c.a.createElement(w.a,{variant:"contained",color:"secondary",size:"small",className:e.button,endIcon:c.a.createElement(k.a,null),onClick:function(){return C(O+1)}}))),c.a.createElement(I.a,{variant:"persistent",anchor:"right",open:re,classes:{paper:e.drawerPaper}},c.a.createElement(P.a,{onClick:function(){le(!1)}},"rtl"===t.direction?c.a.createElement(U.a,null):c.a.createElement(B.a,null)),c.a.createElement(me,null)))}var M=function(){return c.a.createElement("nav",null,c.a.createElement("ul",null,c.a.createElement("li",null,c.a.createElement(o.b,{to:"/about"},"Home"),c.a.createElement(o.b,{to:"/signUp"},"signUp"),c.a.createElement(o.b,{to:"/signIn"},"signIn"),c.a.createElement(o.b,{to:"/auction"},"Auction"))))};var $=function(){return c.a.createElement(o.a,null,c.a.createElement("div",{className:"App"},c.a.createElement(M,null),c.a.createElement("div",{id:"page-body"},c.a.createElement(s.a,{path:"/",component:i,exact:!0}),c.a.createElement(s.a,{path:"/auction",component:L,exact:!0}),c.a.createElement(s.a,{path:"/signUp",component:b,exact:!0}),c.a.createElement(s.a,{path:"/signIn",component:E,exact:!0}))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(c.a.createElement(c.a.StrictMode,null,c.a.createElement($,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[75,1,2]]]);
//# sourceMappingURL=main.6935537c.chunk.js.map