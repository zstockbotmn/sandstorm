var cu=0,ll=1,lu=2;var Lr=1,ha=2,Ls=3,Mi=0,Re=1,On=2,zn=0,Ns=1,Hi=2,hl=3,ul=4,hu=5;var Gi=100,uu=101,du=102,fu=103,pu=104,mu=200,gu=201,xu=202,_u=203,dl=204,fl=205,vu=206,yu=207,Su=208,Mu=209,bu=210,wu=211,Eu=212,Tu=213,Au=214,Io=0,Po=1,Lo=2,Ss=3,No=4,Fo=5,Do=6,Bo=7,ua=0,Cu=1,Ru=2,yn=0,pl=1,ml=2,gl=3,xl=4,_l=5,vl=6,yl=7;var Sl=300,bi=301,Wi=302,da=303,fa=304,Nr=306,Ln=1e3,Pn=1001,Uo=1002,Be=1003,Iu=1004;var Fr=1005;var Ve=1006,pa=1007;var wi=1008;var je=1009,Ml=1010,bl=1011,Fs=1012,ma=1013,Sn=1014,Mn=1015,bn=1016,ga=1017,xa=1018,Ds=1020,wl=35902,El=35899,Tl=1021,Al=1022,un=1023,Nn=1026,Ei=1027,Cl=1028,_a=1029,Ti=1030,va=1031;var ya=1033,Dr=33776,Br=33777,Ur=33778,Or=33779,Sa=35840,Ma=35841,ba=35842,wa=35843,Ea=36196,Ta=37492,Aa=37496,Ca=37488,Ra=37489,zr=37490,Ia=37491,Pa=37808,La=37809,Na=37810,Fa=37811,Da=37812,Ba=37813,Ua=37814,Oa=37815,za=37816,Va=37817,ka=37818,Ha=37819,Ga=37820,Wa=37821,qa=36492,Xa=36494,Ya=36495,Za=36283,$a=36284,Vr=36285,Ja=36286;var cr=2300,Oo=2301,Co=2302,tl=2303,el=2400,nl=2401,il=2402;var Pu=3200;var kr=0,Lu=1,ni="",_e="srgb",lr="srgb-linear",hr="linear",se="srgb";var Ro=7680;var Nu=519,Fu=512,Du=513,Bu=514,Ka=515,Uu=516,Ou=517,ja=518,zu=519,Rl=35044;var Il="300 es",xn=2e3,Ms=2001;function If(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function Pf(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function ur(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Vu(){let s=ur("canvas");return s.style.display="block",s}var Dh={},bs=null;function dr(...s){let t="THREE."+s.shift();bs?bs("log",t,...s):console.log(t,...s)}function ku(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Ot(...s){s=ku(s);let t="THREE."+s.shift();if(bs)bs("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function Ut(...s){s=ku(s);let t="THREE."+s.shift();if(bs)bs("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function Oi(...s){let t=s.join(" ");t in Dh||(Dh[t]=!0,Ot(...s))}function Hu(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Gu={[Io]:Po,[Lo]:Do,[No]:Bo,[Ss]:Fo,[Po]:Io,[Do]:Lo,[Bo]:No,[Fo]:Ss},Fn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let i=n[t];if(i!==void 0){let r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,t);t.target=null}}},Ge=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Rc=Math.PI/180,zo=180/Math.PI;function gi(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ge[s&255]+Ge[s>>8&255]+Ge[s>>16&255]+Ge[s>>24&255]+"-"+Ge[t&255]+Ge[t>>8&255]+"-"+Ge[t>>16&15|64]+Ge[t>>24&255]+"-"+Ge[e&63|128]+Ge[e>>8&255]+"-"+Ge[e>>16&255]+Ge[e>>24&255]+Ge[n&255]+Ge[n>>8&255]+Ge[n>>16&255]+Ge[n>>24&255]).toLowerCase()}function jt(s,t,e){return Math.max(t,Math.min(e,s))}function Lf(s,t){return(s%t+t)%t}function Ic(s,t,e){return(1-e)*s+e*t}function In(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ce(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Dl=class Dl{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(jt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*i+t.x,this.y=r*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Dl.prototype.isVector2=!0;var Vt=Dl,hn=class{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,o,a){let c=n[i+0],l=n[i+1],u=n[i+2],d=n[i+3],h=r[o+0],f=r[o+1],p=r[o+2],x=r[o+3];if(d!==x||c!==h||l!==f||u!==p){let g=c*h+l*f+u*p+d*x;g<0&&(h=-h,f=-f,p=-p,x=-x,g=-g);let m=1-a;if(g<.9995){let v=Math.acos(g),N=Math.sin(v);m=Math.sin(m*v)/N,a=Math.sin(a*v)/N,c=c*m+h*a,l=l*m+f*a,u=u*m+p*a,d=d*m+x*a}else{c=c*m+h*a,l=l*m+f*a,u=u*m+p*a,d=d*m+x*a;let v=1/Math.sqrt(c*c+l*l+u*u+d*d);c*=v,l*=v,u*=v,d*=v}}t[e]=c,t[e+1]=l,t[e+2]=u,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,i,r,o){let a=n[i],c=n[i+1],l=n[i+2],u=n[i+3],d=r[o],h=r[o+1],f=r[o+2],p=r[o+3];return t[e]=a*p+u*d+c*f-l*h,t[e+1]=c*p+u*h+l*d-a*f,t[e+2]=l*p+u*f+a*h-c*d,t[e+3]=u*p-a*d-c*h-l*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,i=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(n/2),u=a(i/2),d=a(r/2),h=c(n/2),f=c(i/2),p=c(r/2);switch(o){case"XYZ":this._x=h*u*d+l*f*p,this._y=l*f*d-h*u*p,this._z=l*u*p+h*f*d,this._w=l*u*d-h*f*p;break;case"YXZ":this._x=h*u*d+l*f*p,this._y=l*f*d-h*u*p,this._z=l*u*p-h*f*d,this._w=l*u*d+h*f*p;break;case"ZXY":this._x=h*u*d-l*f*p,this._y=l*f*d+h*u*p,this._z=l*u*p+h*f*d,this._w=l*u*d-h*f*p;break;case"ZYX":this._x=h*u*d-l*f*p,this._y=l*f*d+h*u*p,this._z=l*u*p-h*f*d,this._w=l*u*d+h*f*p;break;case"YZX":this._x=h*u*d+l*f*p,this._y=l*f*d+h*u*p,this._z=l*u*p-h*f*d,this._w=l*u*d-h*f*p;break;case"XZY":this._x=h*u*d-l*f*p,this._y=l*f*d-h*u*p,this._z=l*u*p+h*f*d,this._w=l*u*d+h*f*p;break;default:Ot("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],r=e[8],o=e[1],a=e[5],c=e[9],l=e[2],u=e[6],d=e[10],h=n+a+d;if(h>0){let f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-c)*f,this._y=(r-l)*f,this._z=(o-i)*f}else if(n>a&&n>d){let f=2*Math.sqrt(1+n-a-d);this._w=(u-c)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+l)/f}else if(a>d){let f=2*Math.sqrt(1+a-n-d);this._w=(r-l)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(c+u)/f}else{let f=2*Math.sqrt(1+d-n-a);this._w=(o-i)/f,this._x=(r+l)/f,this._y=(c+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(jt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,i=t._y,r=t._z,o=t._w,a=e._x,c=e._y,l=e._z,u=e._w;return this._x=n*u+o*a+i*l-r*c,this._y=i*u+o*c+r*a-n*l,this._z=r*u+o*l+n*c-i*a,this._w=o*u-n*a-i*c-r*l,this._onChangeCallback(),this}slerp(t,e){let n=t._x,i=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,i=-i,r=-r,o=-o,a=-a);let c=1-e;if(a<.9995){let l=Math.acos(a),u=Math.sin(l);c=Math.sin(c*l)/u,e=Math.sin(e*l)/u,this._x=this._x*c+n*e,this._y=this._y*c+i*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this._onChangeCallback()}else this._x=this._x*c+n*e,this._y=this._y*c+i*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Bl=class Bl{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Bh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Bh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*i-a*n),u=2*(a*e-r*i),d=2*(r*n-o*e);return this.x=e+c*l+o*d-a*u,this.y=n+c*u+a*l-r*d,this.z=i+c*d+r*u-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this.z=jt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this.z=jt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,i=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=i*c-r*a,this.y=r*o-n*c,this.z=n*a-i*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Pc.copy(this).projectOnVector(t),this.sub(Pc)}reflect(t){return this.sub(Pc.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(jt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Bl.prototype.isVector3=!0;var V=Bl,Pc=new V,Bh=new hn,Ul=class Ul{constructor(t,e,n,i,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,c,l)}set(t,e,n,i,r,o,a,c,l){let u=this.elements;return u[0]=t,u[1]=i,u[2]=a,u[3]=e,u[4]=r,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],u=n[4],d=n[7],h=n[2],f=n[5],p=n[8],x=i[0],g=i[3],m=i[6],v=i[1],N=i[4],S=i[7],E=i[2],w=i[5],P=i[8];return r[0]=o*x+a*v+c*E,r[3]=o*g+a*N+c*w,r[6]=o*m+a*S+c*P,r[1]=l*x+u*v+d*E,r[4]=l*g+u*N+d*w,r[7]=l*m+u*S+d*P,r[2]=h*x+f*v+p*E,r[5]=h*g+f*N+p*w,r[8]=h*m+f*S+p*P,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],u=t[8];return e*o*u-e*a*l-n*r*u+n*a*c+i*r*l-i*o*c}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],u=t[8],d=u*o-a*l,h=a*c-u*r,f=l*r-o*c,p=e*d+n*h+i*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/p;return t[0]=d*x,t[1]=(i*l-u*n)*x,t[2]=(a*n-i*o)*x,t[3]=h*x,t[4]=(u*e-i*c)*x,t[5]=(i*r-a*e)*x,t[6]=f*x,t[7]=(n*c-l*e)*x,t[8]=(o*e-n*r)*x,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+t,-i*l,i*c,-i*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return Oi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Lc.makeScale(t,e)),this}rotate(t){return Oi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Lc.makeRotation(-t)),this}translate(t,e){return Oi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Lc.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Ul.prototype.isMatrix3=!0;var kt=Ul,Lc=new kt,Uh=new kt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Oh=new kt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Nf(){let s={enabled:!0,workingColorSpace:lr,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===se&&(i.r=ti(i.r),i.g=ti(i.g),i.b=ti(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===se&&(i.r=ys(i.r),i.g=ys(i.g),i.b=ys(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===ni?hr:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Oi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Oi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[lr]:{primaries:t,whitePoint:n,transfer:hr,toXYZ:Uh,fromXYZ:Oh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:_e},outputColorSpaceConfig:{drawingBufferColorSpace:_e}},[_e]:{primaries:t,whitePoint:n,transfer:se,toXYZ:Uh,fromXYZ:Oh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:_e}}}),s}var Jt=Nf();function ti(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ys(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var is,Vo=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{is===void 0&&(is=ur("canvas")),is.width=t.width,is.height=t.height;let i=is.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),n=is}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=ur("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=ti(r[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ti(e[n]/255)*255):e[n]=ti(e[n]);return{data:e,width:t.width,height:t.height}}else return Ot("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Ff=0,ws=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Ff++}),this.uuid=gi(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Nc(i[o].image)):r.push(Nc(i[o]))}else r=Nc(i);n.url=r}return e||(t.images[this.uuid]=n),n}};function Nc(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Vo.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Ot("Texture: Unable to serialize Texture."),{})}var Df=0,Fc=new V,Je=class s extends Fn{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,n=Pn,i=Pn,r=Ve,o=wi,a=un,c=je,l=s.DEFAULT_ANISOTROPY,u=ni){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Df++}),this.uuid=gi(),this.name="",this.source=new ws(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Vt(0,0),this.repeat=new Vt(1,1),this.center=new Vt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new kt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Fc).x}get height(){return this.source.getSize(Fc).y}get depth(){return this.source.getSize(Fc).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Ot(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Ot(`Texture.setValues(): property '${e}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Sl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ln:t.x=t.x-Math.floor(t.x);break;case Pn:t.x=t.x<0?0:1;break;case Uo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ln:t.y=t.y-Math.floor(t.y);break;case Pn:t.y=t.y<0?0:1;break;case Uo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Je.DEFAULT_IMAGE=null;Je.DEFAULT_MAPPING=Sl;Je.DEFAULT_ANISOTROPY=1;var Ol=class Ol{constructor(t=0,e=0,n=0,i=1){this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r,c=t.elements,l=c[0],u=c[4],d=c[8],h=c[1],f=c[5],p=c[9],x=c[2],g=c[6],m=c[10];if(Math.abs(u-h)<.01&&Math.abs(d-x)<.01&&Math.abs(p-g)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+x)<.1&&Math.abs(p+g)<.1&&Math.abs(l+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let N=(l+1)/2,S=(f+1)/2,E=(m+1)/2,w=(u+h)/4,P=(d+x)/4,_=(p+g)/4;return N>S&&N>E?N<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(N),i=w/n,r=P/n):S>E?S<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(S),n=w/i,r=_/i):E<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(E),n=P/r,i=_/r),this.set(n,i,r,e),this}let v=Math.sqrt((g-p)*(g-p)+(d-x)*(d-x)+(h-u)*(h-u));return Math.abs(v)<.001&&(v=1),this.x=(g-p)/v,this.y=(d-x)/v,this.z=(h-u)/v,this.w=Math.acos((l+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this.z=jt(this.z,t.z,e.z),this.w=jt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this.z=jt(this.z,t,e),this.w=jt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Ol.prototype.isVector4=!0;var ve=Ol,ko=class extends Fn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ve,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new ve(0,0,t,e),this.scissorTest=!1,this.viewport=new ve(0,0,t,e),this.textures=[];let i={width:t,height:e,depth:n.depth},r=new Je(i),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ve,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let i=Object.assign({},t.textures[e].image);this.textures[e].source=new ws(i)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ke=class extends ko{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},fr=class extends Je{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Be,this.minFilter=Be,this.wrapR=Pn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ho=class extends Je{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Be,this.minFilter=Be,this.wrapR=Pn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var la=class la{constructor(t,e,n,i,r,o,a,c,l,u,d,h,f,p,x,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,c,l,u,d,h,f,p,x,g)}set(t,e,n,i,r,o,a,c,l,u,d,h,f,p,x,g){let m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=i,m[1]=r,m[5]=o,m[9]=a,m[13]=c,m[2]=l,m[6]=u,m[10]=d,m[14]=h,m[3]=f,m[7]=p,m[11]=x,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new la().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,i=1/ss.setFromMatrixColumn(t,0).length(),r=1/ss.setFromMatrixColumn(t,1).length(),o=1/ss.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,i=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(i),l=Math.sin(i),u=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let h=o*u,f=o*d,p=a*u,x=a*d;e[0]=c*u,e[4]=-c*d,e[8]=l,e[1]=f+p*l,e[5]=h-x*l,e[9]=-a*c,e[2]=x-h*l,e[6]=p+f*l,e[10]=o*c}else if(t.order==="YXZ"){let h=c*u,f=c*d,p=l*u,x=l*d;e[0]=h+x*a,e[4]=p*a-f,e[8]=o*l,e[1]=o*d,e[5]=o*u,e[9]=-a,e[2]=f*a-p,e[6]=x+h*a,e[10]=o*c}else if(t.order==="ZXY"){let h=c*u,f=c*d,p=l*u,x=l*d;e[0]=h-x*a,e[4]=-o*d,e[8]=p+f*a,e[1]=f+p*a,e[5]=o*u,e[9]=x-h*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){let h=o*u,f=o*d,p=a*u,x=a*d;e[0]=c*u,e[4]=p*l-f,e[8]=h*l+x,e[1]=c*d,e[5]=x*l+h,e[9]=f*l-p,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){let h=o*c,f=o*l,p=a*c,x=a*l;e[0]=c*u,e[4]=x-h*d,e[8]=p*d+f,e[1]=d,e[5]=o*u,e[9]=-a*u,e[2]=-l*u,e[6]=f*d+p,e[10]=h-x*d}else if(t.order==="XZY"){let h=o*c,f=o*l,p=a*c,x=a*l;e[0]=c*u,e[4]=-d,e[8]=l*u,e[1]=h*d+x,e[5]=o*u,e[9]=f*d-p,e[2]=p*d-f,e[6]=a*u,e[10]=x*d+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Bf,t,Uf)}lookAt(t,e,n){let i=this.elements;return tn.subVectors(t,e),tn.lengthSq()===0&&(tn.z=1),tn.normalize(),ui.crossVectors(n,tn),ui.lengthSq()===0&&(Math.abs(n.z)===1?tn.x+=1e-4:tn.z+=1e-4,tn.normalize(),ui.crossVectors(n,tn)),ui.normalize(),io.crossVectors(tn,ui),i[0]=ui.x,i[4]=io.x,i[8]=tn.x,i[1]=ui.y,i[5]=io.y,i[9]=tn.y,i[2]=ui.z,i[6]=io.z,i[10]=tn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],u=n[1],d=n[5],h=n[9],f=n[13],p=n[2],x=n[6],g=n[10],m=n[14],v=n[3],N=n[7],S=n[11],E=n[15],w=i[0],P=i[4],_=i[8],b=i[12],M=i[1],R=i[5],F=i[9],I=i[13],C=i[2],L=i[6],D=i[10],z=i[14],q=i[3],G=i[7],Z=i[11],W=i[15];return r[0]=o*w+a*M+c*C+l*q,r[4]=o*P+a*R+c*L+l*G,r[8]=o*_+a*F+c*D+l*Z,r[12]=o*b+a*I+c*z+l*W,r[1]=u*w+d*M+h*C+f*q,r[5]=u*P+d*R+h*L+f*G,r[9]=u*_+d*F+h*D+f*Z,r[13]=u*b+d*I+h*z+f*W,r[2]=p*w+x*M+g*C+m*q,r[6]=p*P+x*R+g*L+m*G,r[10]=p*_+x*F+g*D+m*Z,r[14]=p*b+x*I+g*z+m*W,r[3]=v*w+N*M+S*C+E*q,r[7]=v*P+N*R+S*L+E*G,r[11]=v*_+N*F+S*D+E*Z,r[15]=v*b+N*I+S*z+E*W,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],o=t[1],a=t[5],c=t[9],l=t[13],u=t[2],d=t[6],h=t[10],f=t[14],p=t[3],x=t[7],g=t[11],m=t[15],v=c*f-l*h,N=a*f-l*d,S=a*h-c*d,E=o*f-l*u,w=o*h-c*u,P=o*d-a*u;return e*(x*v-g*N+m*S)-n*(p*v-g*E+m*w)+i*(p*N-x*E+m*P)-r*(p*S-x*w+g*P)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[1],o=t[5],a=t[9],c=t[2],l=t[6],u=t[10];return e*(o*u-a*l)-n*(r*u-a*c)+i*(r*l-o*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],u=t[8],d=t[9],h=t[10],f=t[11],p=t[12],x=t[13],g=t[14],m=t[15],v=e*a-n*o,N=e*c-i*o,S=e*l-r*o,E=n*c-i*a,w=n*l-r*a,P=i*l-r*c,_=u*x-d*p,b=u*g-h*p,M=u*m-f*p,R=d*g-h*x,F=d*m-f*x,I=h*m-f*g,C=v*I-N*F+S*R+E*M-w*b+P*_;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let L=1/C;return t[0]=(a*I-c*F+l*R)*L,t[1]=(i*F-n*I-r*R)*L,t[2]=(x*P-g*w+m*E)*L,t[3]=(h*w-d*P-f*E)*L,t[4]=(c*M-o*I-l*b)*L,t[5]=(e*I-i*M+r*b)*L,t[6]=(g*S-p*P-m*N)*L,t[7]=(u*P-h*S+f*N)*L,t[8]=(o*F-a*M+l*_)*L,t[9]=(n*M-e*F-r*_)*L,t[10]=(p*w-x*S+m*v)*L,t[11]=(d*S-u*w-f*v)*L,t[12]=(a*b-o*R-c*_)*L,t[13]=(e*R-n*b+i*_)*L,t[14]=(x*N-p*E-g*v)*L,t[15]=(u*E-d*N+h*v)*L,this}scale(t){let e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),r=1-n,o=t.x,a=t.y,c=t.z,l=r*o,u=r*a;return this.set(l*o+n,l*a-i*c,l*c+i*a,0,l*a+i*c,u*a+n,u*c-i*o,0,l*c-i*a,u*c+i*o,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,o){return this.set(1,n,r,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,l=r+r,u=o+o,d=a+a,h=r*l,f=r*u,p=r*d,x=o*u,g=o*d,m=a*d,v=c*l,N=c*u,S=c*d,E=n.x,w=n.y,P=n.z;return i[0]=(1-(x+m))*E,i[1]=(f+S)*E,i[2]=(p-N)*E,i[3]=0,i[4]=(f-S)*w,i[5]=(1-(h+m))*w,i[6]=(g+v)*w,i[7]=0,i[8]=(p+N)*P,i[9]=(g-v)*P,i[10]=(1-(h+x))*P,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements;t.x=i[12],t.y=i[13],t.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=ss.set(i[0],i[1],i[2]).length(),a=ss.set(i[4],i[5],i[6]).length(),c=ss.set(i[8],i[9],i[10]).length();r<0&&(o=-o),fn.copy(this);let l=1/o,u=1/a,d=1/c;return fn.elements[0]*=l,fn.elements[1]*=l,fn.elements[2]*=l,fn.elements[4]*=u,fn.elements[5]*=u,fn.elements[6]*=u,fn.elements[8]*=d,fn.elements[9]*=d,fn.elements[10]*=d,e.setFromRotationMatrix(fn),n.x=o,n.y=a,n.z=c,this}makePerspective(t,e,n,i,r,o,a=xn,c=!1){let l=this.elements,u=2*r/(e-t),d=2*r/(n-i),h=(e+t)/(e-t),f=(n+i)/(n-i),p,x;if(c)p=r/(o-r),x=o*r/(o-r);else if(a===xn)p=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===Ms)p=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=d,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,r,o,a=xn,c=!1){let l=this.elements,u=2/(e-t),d=2/(n-i),h=-(e+t)/(e-t),f=-(n+i)/(n-i),p,x;if(c)p=1/(o-r),x=o/(o-r);else if(a===xn)p=-2/(o-r),x=-(o+r)/(o-r);else if(a===Ms)p=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=h,l[1]=0,l[5]=d,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};la.prototype.isMatrix4=!0;var fe=la,ss=new V,fn=new fe,Bf=new V(0,0,0),Uf=new V(1,1,1),ui=new V,io=new V,tn=new V,zh=new fe,Vh=new hn,Dn=class s{constructor(t=0,e=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,r=i[0],o=i[4],a=i[8],c=i[1],l=i[5],u=i[9],d=i[2],h=i[6],f=i[10];switch(e){case"XYZ":this._y=Math.asin(jt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-jt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(jt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-jt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(jt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-jt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Ot("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return zh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(zh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Vh.setFromEuler(this),this.setFromQuaternion(Vh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Dn.DEFAULT_ORDER="XYZ";var Es=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Of=0,kh=new V,rs=new hn,Zn=new fe,so=new V,tr=new V,zf=new V,Vf=new hn,Hh=new V(1,0,0),Gh=new V(0,1,0),Wh=new V(0,0,1),qh={type:"added"},kf={type:"removed"},os={type:"childadded",child:null},Dc={type:"childremoved",child:null},Ue=class s extends Fn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Of++}),this.uuid=gi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new V,e=new Dn,n=new hn,i=new V(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new fe},normalMatrix:{value:new kt}}),this.matrix=new fe,this.matrixWorld=new fe,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Es,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return rs.setFromAxisAngle(t,e),this.quaternion.multiply(rs),this}rotateOnWorldAxis(t,e){return rs.setFromAxisAngle(t,e),this.quaternion.premultiply(rs),this}rotateX(t){return this.rotateOnAxis(Hh,t)}rotateY(t){return this.rotateOnAxis(Gh,t)}rotateZ(t){return this.rotateOnAxis(Wh,t)}translateOnAxis(t,e){return kh.copy(t).applyQuaternion(this.quaternion),this.position.add(kh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Hh,t)}translateY(t){return this.translateOnAxis(Gh,t)}translateZ(t){return this.translateOnAxis(Wh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Zn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?so.copy(t):so.set(t,e,n);let i=this.parent;this.updateWorldMatrix(!0,!1),tr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Zn.lookAt(tr,so,this.up):Zn.lookAt(so,tr,this.up),this.quaternion.setFromRotationMatrix(Zn),i&&(Zn.extractRotation(i.matrixWorld),rs.setFromRotationMatrix(Zn),this.quaternion.premultiply(rs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Ut("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(qh),os.child=t,this.dispatchEvent(os),os.child=null):Ut("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(kf),Dc.child=t,this.dispatchEvent(Dc),Dc.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Zn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Zn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Zn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(qh),os.child=t,this.dispatchEvent(os),os.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,t,zf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,Vf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,i=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*i,r[13]+=n-r[1]*e-r[5]*n-r[9]*i,r[14]+=i-r[2]*e-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let d=c[l];r(t.shapes,d)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(t.materials,this.material[c]));i.material=a}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];i.animations.push(r(t.animations,c))}}if(e){let a=o(t.geometries),c=o(t.materials),l=o(t.textures),u=o(t.images),d=o(t.shapes),h=o(t.skeletons),f=o(t.animations),p=o(t.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),p.length>0&&(n.nodes=p)}return n.object=i,n;function o(a){let c=[];for(let l in a){let u=a[l];delete u.metadata,c.push(u)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ue.DEFAULT_UP=new V(0,1,0);Ue.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ue.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var qe=class extends Ue{constructor(){super(),this.isGroup=!0,this.type="Group"}},Hf={type:"move"},Ts=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new qe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new qe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new qe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(let x of t.hand.values()){let g=e.getJointPose(x,n),m=this._getHandJoint(l,x);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}let u=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,p=.005;l.inputState.pinching&&h>f+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&h<=f-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Hf)))}return a!==null&&(a.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new qe;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Wu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},di={h:0,s:0,l:0},ro={h:0,s:0,l:0};function Bc(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var Ht=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=_e){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Jt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=Jt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Jt.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=Jt.workingColorSpace){if(t=Lf(t,1),e=jt(e,0,1),n=jt(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Bc(o,r,t+1/3),this.g=Bc(o,r,t),this.b=Bc(o,r,t-1/3)}return Jt.colorSpaceToWorking(this,i),this}setStyle(t,e=_e){function n(r){r!==void 0&&parseFloat(r)<1&&Ot("Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Ot("Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Ot("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=_e){let n=Wu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Ot("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ti(t.r),this.g=ti(t.g),this.b=ti(t.b),this}copyLinearToSRGB(t){return this.r=ys(t.r),this.g=ys(t.g),this.b=ys(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=_e){return Jt.workingToColorSpace(We.copy(this),t),Math.round(jt(We.r*255,0,255))*65536+Math.round(jt(We.g*255,0,255))*256+Math.round(jt(We.b*255,0,255))}getHexString(t=_e){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Jt.workingColorSpace){Jt.workingToColorSpace(We.copy(this),e);let n=We.r,i=We.g,r=We.b,o=Math.max(n,i,r),a=Math.min(n,i,r),c,l,u=(a+o)/2;if(a===o)c=0,l=0;else{let d=o-a;switch(l=u<=.5?d/(o+a):d/(2-o-a),o){case n:c=(i-r)/d+(i<r?6:0);break;case i:c=(r-n)/d+2;break;case r:c=(n-i)/d+4;break}c/=6}return t.h=c,t.s=l,t.l=u,t}getRGB(t,e=Jt.workingColorSpace){return Jt.workingToColorSpace(We.copy(this),e),t.r=We.r,t.g=We.g,t.b=We.b,t}getStyle(t=_e){Jt.workingToColorSpace(We.copy(this),t);let e=We.r,n=We.g,i=We.b;return t!==_e?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(di),this.setHSL(di.h+t,di.s+e,di.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(di),t.getHSL(ro);let n=Ic(di.h,ro.h,e),i=Ic(di.s,ro.s,e),r=Ic(di.l,ro.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},We=new Ht;Ht.NAMES=Wu;var pr=class s{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ht(t),this.density=e}clone(){return new s(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var mr=class extends Ue{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Dn,this.environmentIntensity=1,this.environmentRotation=new Dn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},pn=new V,$n=new V,Uc=new V,Jn=new V,as=new V,cs=new V,Xh=new V,Oc=new V,zc=new V,Vc=new V,kc=new ve,Hc=new ve,Gc=new ve,Qn=class s{constructor(t=new V,e=new V,n=new V){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),pn.subVectors(t,e),i.cross(pn);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){pn.subVectors(i,e),$n.subVectors(n,e),Uc.subVectors(t,e);let o=pn.dot(pn),a=pn.dot($n),c=pn.dot(Uc),l=$n.dot($n),u=$n.dot(Uc),d=o*l-a*a;if(d===0)return r.set(0,0,0),null;let h=1/d,f=(l*c-a*u)*h,p=(o*u-a*c)*h;return r.set(1-f-p,p,f)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Jn)===null?!1:Jn.x>=0&&Jn.y>=0&&Jn.x+Jn.y<=1}static getInterpolation(t,e,n,i,r,o,a,c){return this.getBarycoord(t,e,n,i,Jn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Jn.x),c.addScaledVector(o,Jn.y),c.addScaledVector(a,Jn.z),c)}static getInterpolatedAttribute(t,e,n,i,r,o){return kc.setScalar(0),Hc.setScalar(0),Gc.setScalar(0),kc.fromBufferAttribute(t,e),Hc.fromBufferAttribute(t,n),Gc.fromBufferAttribute(t,i),o.setScalar(0),o.addScaledVector(kc,r.x),o.addScaledVector(Hc,r.y),o.addScaledVector(Gc,r.z),o}static isFrontFacing(t,e,n,i){return pn.subVectors(n,e),$n.subVectors(t,e),pn.cross($n).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return pn.subVectors(this.c,this.b),$n.subVectors(this.a,this.b),pn.cross($n).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return s.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,r=this.c,o,a;as.subVectors(i,n),cs.subVectors(r,n),Oc.subVectors(t,n);let c=as.dot(Oc),l=cs.dot(Oc);if(c<=0&&l<=0)return e.copy(n);zc.subVectors(t,i);let u=as.dot(zc),d=cs.dot(zc);if(u>=0&&d<=u)return e.copy(i);let h=c*d-u*l;if(h<=0&&c>=0&&u<=0)return o=c/(c-u),e.copy(n).addScaledVector(as,o);Vc.subVectors(t,r);let f=as.dot(Vc),p=cs.dot(Vc);if(p>=0&&f<=p)return e.copy(r);let x=f*l-c*p;if(x<=0&&l>=0&&p<=0)return a=l/(l-p),e.copy(n).addScaledVector(cs,a);let g=u*p-f*d;if(g<=0&&d-u>=0&&f-p>=0)return Xh.subVectors(r,i),a=(d-u)/(d-u+(f-p)),e.copy(i).addScaledVector(Xh,a);let m=1/(g+x+h);return o=x*m,a=h*m,e.copy(n).addScaledVector(as,o).addScaledVector(cs,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},xi=class{constructor(t=new V(1/0,1/0,1/0),e=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(mn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(mn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=mn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,mn):mn.fromBufferAttribute(r,o),mn.applyMatrix4(t.matrixWorld),this.expandByPoint(mn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),oo.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),oo.copy(n.boundingBox)),oo.applyMatrix4(t.matrixWorld),this.union(oo)}let i=t.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,mn),mn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(er),ao.subVectors(this.max,er),ls.subVectors(t.a,er),hs.subVectors(t.b,er),us.subVectors(t.c,er),fi.subVectors(hs,ls),pi.subVectors(us,hs),Fi.subVectors(ls,us);let e=[0,-fi.z,fi.y,0,-pi.z,pi.y,0,-Fi.z,Fi.y,fi.z,0,-fi.x,pi.z,0,-pi.x,Fi.z,0,-Fi.x,-fi.y,fi.x,0,-pi.y,pi.x,0,-Fi.y,Fi.x,0];return!Wc(e,ls,hs,us,ao)||(e=[1,0,0,0,1,0,0,0,1],!Wc(e,ls,hs,us,ao))?!1:(co.crossVectors(fi,pi),e=[co.x,co.y,co.z],Wc(e,ls,hs,us,ao))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,mn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(mn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Kn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Kn=[new V,new V,new V,new V,new V,new V,new V,new V],mn=new V,oo=new xi,ls=new V,hs=new V,us=new V,fi=new V,pi=new V,Fi=new V,er=new V,ao=new V,co=new V,Di=new V;function Wc(s,t,e,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){Di.fromArray(s,r);let a=i.x*Math.abs(Di.x)+i.y*Math.abs(Di.y)+i.z*Math.abs(Di.z),c=t.dot(Di),l=e.dot(Di),u=n.dot(Di);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var Ae=new V,lo=new Vt,Gf=0,$e=class extends Fn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Gf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Rl,this.updateRanges=[],this.gpuType=Mn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)lo.fromBufferAttribute(this,e),lo.applyMatrix3(t),this.setXY(e,lo.x,lo.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ae.fromBufferAttribute(this,e),Ae.applyMatrix3(t),this.setXYZ(e,Ae.x,Ae.y,Ae.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ae.fromBufferAttribute(this,e),Ae.applyMatrix4(t),this.setXYZ(e,Ae.x,Ae.y,Ae.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ae.fromBufferAttribute(this,e),Ae.applyNormalMatrix(t),this.setXYZ(e,Ae.x,Ae.y,Ae.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ae.fromBufferAttribute(this,e),Ae.transformDirection(t),this.setXYZ(e,Ae.x,Ae.y,Ae.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=In(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ce(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=In(e,this.array)),e}setX(t,e){return this.normalized&&(e=ce(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=In(e,this.array)),e}setY(t,e){return this.normalized&&(e=ce(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=In(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ce(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=In(e,this.array)),e}setW(t,e){return this.normalized&&(e=ce(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ce(e,this.array),n=ce(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=ce(e,this.array),n=ce(n,this.array),i=ce(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=ce(e,this.array),n=ce(n,this.array),i=ce(i,this.array),r=ce(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var gr=class extends $e{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var xr=class extends $e{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ge=class extends $e{constructor(t,e,n){super(new Float32Array(t),e,n)}},Wf=new xi,nr=new V,qc=new V,zi=class{constructor(t=new V,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Wf.setFromPoints(t).getCenter(n);let i=0;for(let r=0,o=t.length;r<o;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;nr.subVectors(t,this.center);let e=nr.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(nr,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(qc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(nr.copy(t.center).add(qc)),this.expandByPoint(nr.copy(t.center).sub(qc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},qf=0,ln=new fe,Xc=new Ue,ds=new V,en=new xi,ir=new xi,De=new V,Oe=class s extends Fn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:qf++}),this.uuid=gi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(If(t)?xr:gr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new kt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return ln.makeRotationFromQuaternion(t),this.applyMatrix4(ln),this}rotateX(t){return ln.makeRotationX(t),this.applyMatrix4(ln),this}rotateY(t){return ln.makeRotationY(t),this.applyMatrix4(ln),this}rotateZ(t){return ln.makeRotationZ(t),this.applyMatrix4(ln),this}translate(t,e,n){return ln.makeTranslation(t,e,n),this.applyMatrix4(ln),this}scale(t,e,n){return ln.makeScale(t,e,n),this.applyMatrix4(ln),this}lookAt(t){return Xc.lookAt(t),Xc.updateMatrix(),this.applyMatrix4(Xc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ds).negate(),this.translate(ds.x,ds.y,ds.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let i=0,r=t.length;i<r;i++){let o=t[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ge(n,3))}else{let n=Math.min(t.length,e.count);for(let i=0;i<n;i++){let r=t[i];e.setXYZ(i,r.x,r.y,r.z||0)}t.length>e.count&&Ot("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new xi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ut("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let r=e[n];en.setFromBufferAttribute(r),this.morphTargetsRelative?(De.addVectors(this.boundingBox.min,en.min),this.boundingBox.expandByPoint(De),De.addVectors(this.boundingBox.max,en.max),this.boundingBox.expandByPoint(De)):(this.boundingBox.expandByPoint(en.min),this.boundingBox.expandByPoint(en.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ut('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new zi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ut("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new V,1/0);return}if(t){let n=this.boundingSphere.center;if(en.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];ir.setFromBufferAttribute(a),this.morphTargetsRelative?(De.addVectors(en.min,ir.min),en.expandByPoint(De),De.addVectors(en.max,ir.max),en.expandByPoint(De)):(en.expandByPoint(ir.min),en.expandByPoint(ir.max))}en.getCenter(n);let i=0;for(let r=0,o=t.count;r<o;r++)De.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(De));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)De.fromBufferAttribute(a,l),c&&(ds.fromBufferAttribute(t,l),De.add(ds)),i=Math.max(i,n.distanceToSquared(De))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&Ut('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Ut("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,i=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new $e(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],c=[];for(let _=0;_<n.count;_++)a[_]=new V,c[_]=new V;let l=new V,u=new V,d=new V,h=new Vt,f=new Vt,p=new Vt,x=new V,g=new V;function m(_,b,M){l.fromBufferAttribute(n,_),u.fromBufferAttribute(n,b),d.fromBufferAttribute(n,M),h.fromBufferAttribute(r,_),f.fromBufferAttribute(r,b),p.fromBufferAttribute(r,M),u.sub(l),d.sub(l),f.sub(h),p.sub(h);let R=1/(f.x*p.y-p.x*f.y);isFinite(R)&&(x.copy(u).multiplyScalar(p.y).addScaledVector(d,-f.y).multiplyScalar(R),g.copy(d).multiplyScalar(f.x).addScaledVector(u,-p.x).multiplyScalar(R),a[_].add(x),a[b].add(x),a[M].add(x),c[_].add(g),c[b].add(g),c[M].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:t.count}]);for(let _=0,b=v.length;_<b;++_){let M=v[_],R=M.start,F=M.count;for(let I=R,C=R+F;I<C;I+=3)m(t.getX(I+0),t.getX(I+1),t.getX(I+2))}let N=new V,S=new V,E=new V,w=new V;function P(_){E.fromBufferAttribute(i,_),w.copy(E);let b=a[_];N.copy(b),N.sub(E.multiplyScalar(E.dot(b))).normalize(),S.crossVectors(w,b);let R=S.dot(c[_])<0?-1:1;o.setXYZW(_,N.x,N.y,N.z,R)}for(let _=0,b=v.length;_<b;++_){let M=v[_],R=M.start,F=M.count;for(let I=R,C=R+F;I<C;I+=3)P(t.getX(I+0)),P(t.getX(I+1)),P(t.getX(I+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new $e(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);let i=new V,r=new V,o=new V,a=new V,c=new V,l=new V,u=new V,d=new V;if(t)for(let h=0,f=t.count;h<f;h+=3){let p=t.getX(h+0),x=t.getX(h+1),g=t.getX(h+2);i.fromBufferAttribute(e,p),r.fromBufferAttribute(e,x),o.fromBufferAttribute(e,g),u.subVectors(o,r),d.subVectors(i,r),u.cross(d),a.fromBufferAttribute(n,p),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,g),a.add(u),c.add(u),l.add(u),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let h=0,f=e.count;h<f;h+=3)i.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),o.fromBufferAttribute(e,h+2),u.subVectors(o,r),d.subVectors(i,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)De.fromBufferAttribute(t,e),De.normalize(),t.setXYZ(e,De.x,De.y,De.z)}toNonIndexed(){function t(a,c){let l=a.array,u=a.itemSize,d=a.normalized,h=new l.constructor(c.length*u),f=0,p=0;for(let x=0,g=c.length;x<g;x++){a.isInterleavedBufferAttribute?f=c[x]*a.data.stride+a.offset:f=c[x]*u;for(let m=0;m<u;m++)h[p++]=l[f++]}return new $e(h,u,d)}if(this.index===null)return Ot("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,n=this.index.array,i=this.attributes;for(let a in i){let c=i[a],l=t(c,n);e.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let u=0,d=l.length;u<d;u++){let h=l[u],f=t(h,n);c.push(f)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let l=n[c];t.data.attributes[c]=l.toJSON(t.data)}let i={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let d=0,h=l.length;d<h;d++){let f=l[d];u.push(f.toJSON(t.data))}u.length>0&&(i[c]=u,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let i=t.attributes;for(let l in i){let u=i[l];this.setAttribute(l,u.clone(e))}let r=t.morphAttributes;for(let l in r){let u=[],d=r[l];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(e));this.morphAttributes[l]=u}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let l=0,u=o.length;l<u;l++){let d=o[l];this.addGroup(d.start,d.count,d.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Go=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Rl,this.updateRanges=[],this.version=0,this.uuid=gi()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,r=this.stride;i<r;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=gi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=gi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},Ze=new V,_r=class s{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.applyMatrix4(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.applyNormalMatrix(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.transformDirection(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=In(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ce(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=ce(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ce(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ce(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ce(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=In(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=In(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=In(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=In(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=ce(e,this.array),n=ce(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=ce(e,this.array),n=ce(n,this.array),i=ce(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=ce(e,this.array),n=ce(n,this.array),i=ce(i,this.array),r=ce(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=r,this}clone(t){if(t===void 0){dr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return new $e(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new s(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){dr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Yc=new V,Xf=new V,Yf=new kt,gn=class{constructor(t=new V(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=Yc.subVectors(n,e).cross(Xf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let i=t.delta(Yc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(i,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Yf.getNormalMatrix(t),i=this.coplanarPoint(Yc).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Zf=0,_n=class extends Fn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Zf++}),this.uuid=gi(),this.name="",this.type="Material",this.blending=Ns,this.side=Mi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=dl,this.blendDst=fl,this.blendEquation=Gi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ht(0,0,0),this.blendAlpha=0,this.depthFunc=Ss,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Nu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ro,this.stencilZFail=Ro,this.stencilZPass=Ro,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Ot(`Material: parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Ot(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(e){let r=i(t.textures),o=i(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Ht().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new gn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Vt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Vt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},vn=class extends _n{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ht(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},fs,sr=new V,ps=new V,ms=new V,gs=new Vt,rr=new Vt,qu=new fe,ho=new V,or=new V,uo=new V,Yh=new Vt,Zc=new Vt,Zh=new Vt,Bn=class extends Ue{constructor(t=new vn){if(super(),this.isSprite=!0,this.type="Sprite",fs===void 0){fs=new Oe;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Go(e,5);fs.setIndex([0,1,2,0,2,3]),fs.setAttribute("position",new _r(n,3,0,!1)),fs.setAttribute("uv",new _r(n,2,3,!1))}this.geometry=fs,this.material=t,this.center=new Vt(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&Ut('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ps.setFromMatrixScale(this.matrixWorld),qu.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),ms.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ps.multiplyScalar(-ms.z);let n=this.material.rotation,i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));let o=this.center;fo(ho.set(-.5,-.5,0),ms,o,ps,i,r),fo(or.set(.5,-.5,0),ms,o,ps,i,r),fo(uo.set(.5,.5,0),ms,o,ps,i,r),Yh.set(0,0),Zc.set(1,0),Zh.set(1,1);let a=t.ray.intersectTriangle(ho,or,uo,!1,sr);if(a===null&&(fo(or.set(-.5,.5,0),ms,o,ps,i,r),Zc.set(0,1),a=t.ray.intersectTriangle(ho,uo,or,!1,sr),a===null))return;let c=t.ray.origin.distanceTo(sr);c<t.near||c>t.far||e.push({distance:c,point:sr.clone(),uv:Qn.getInterpolation(sr,ho,or,uo,Yh,Zc,Zh,new Vt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function fo(s,t,e,n,i,r){gs.subVectors(s,e).addScalar(.5).multiply(n),i!==void 0?(rr.x=r*gs.x-i*gs.y,rr.y=i*gs.x+r*gs.y):rr.copy(gs),s.copy(t),s.x+=rr.x,s.y+=rr.y,s.applyMatrix4(qu)}var jn=new V,$c=new V,po=new V,mo=new V,As=class{constructor(t=new V,e=new V(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,jn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=jn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(jn.copy(this.origin).addScaledVector(this.direction,e),jn.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){$c.copy(t).add(e).multiplyScalar(.5),po.copy(e).sub(t).normalize(),mo.copy(this.origin).sub($c);let r=t.distanceTo(e)*.5,o=-this.direction.dot(po),a=mo.dot(this.direction),c=-mo.dot(po),l=mo.lengthSq(),u=Math.abs(1-o*o),d,h,f,p;if(u>0)if(d=o*c-a,h=o*a-c,p=r*u,d>=0)if(h>=-p)if(h<=p){let x=1/u;d*=x,h*=x,f=d*(d+o*h+2*a)+h*(o*d+h+2*c)+l}else h=r,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*c)+l;else h=-r,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*c)+l;else h<=-p?(d=Math.max(0,-(-o*r+a)),h=d>0?-r:Math.min(Math.max(-r,-c),r),f=-d*d+h*(h+2*c)+l):h<=p?(d=0,h=Math.min(Math.max(-r,-c),r),f=h*(h+2*c)+l):(d=Math.max(0,-(o*r+a)),h=d>0?r:Math.min(Math.max(-r,-c),r),f=-d*d+h*(h+2*c)+l);else h=o>0?-r:r,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),i&&i.copy($c).addScaledVector(po,h),f}intersectSphere(t,e){if(t.radius<0)return null;jn.subVectors(t.center,this.origin);let n=jn.dot(this.direction),i=jn.dot(jn)-n*n,r=t.radius*t.radius;if(i>r)return null;let o=Math.sqrt(r-i),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,o,a,c,l=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return l>=0?(n=(t.min.x-h.x)*l,i=(t.max.x-h.x)*l):(n=(t.max.x-h.x)*l,i=(t.min.x-h.x)*l),u>=0?(r=(t.min.y-h.y)*u,o=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,o=(t.min.y-h.y)*u),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),d>=0?(a=(t.min.z-h.z)*d,c=(t.max.z-h.z)*d):(a=(t.max.z-h.z)*d,c=(t.min.z-h.z)*d),n>c||a>i)||((a>n||n!==n)&&(n=a),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,jn)!==null}intersectTriangle(t,e,n,i,r){let o=this.origin,a=this.direction,c=a.x,l=a.y,u=a.z,d=t.x-o.x,h=t.y-o.y,f=t.z-o.z,p=e.x-o.x,x=e.y-o.y,g=e.z-o.z,m=n.x-o.x,v=n.y-o.y,N=n.z-o.z,S=Math.abs(c),E=Math.abs(l),w=Math.abs(u),P,_,b,M,R,F,I,C,L,D,z,q;if(S>=E&&S>=w?(b=c,F=d,L=p,q=m,c>=0?(P=l,_=u,M=h,R=f,I=x,C=g,D=v,z=N):(P=u,_=l,M=f,R=h,I=g,C=x,D=N,z=v)):E>=w?(b=l,F=h,L=x,q=v,l>=0?(P=u,_=c,M=f,R=d,I=g,C=p,D=N,z=m):(P=c,_=u,M=d,R=f,I=p,C=g,D=m,z=N)):(b=u,F=f,L=g,q=N,u>=0?(P=c,_=l,M=d,R=h,I=p,C=x,D=m,z=v):(P=l,_=c,M=h,R=d,I=x,C=p,D=v,z=m)),b===0)return null;let G=P/b,Z=_/b,W=1/b,et=M-G*F,ut=R-Z*F,Ft=I-G*L,At=C-Z*L,Bt=D-G*q,K=z-Z*q,ot=Bt*At-K*Ft,vt=et*K-ut*Bt,Dt=Ft*ut-At*et;if(i){if(ot<0||vt<0||Dt<0)return null}else if((ot<0||vt<0||Dt<0)&&(ot>0||vt>0||Dt>0))return null;let xt=ot+vt+Dt;if(xt===0)return null;let zt=W*(ot*F+vt*L+Dt*q);return(xt>0?zt<0:zt>0)?null:this.at(zt/xt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Un=class extends _n{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ht(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Dn,this.combine=ua,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},$h=new fe,Bi=new As,go=new zi,Jh=new V,xo=new V,_o=new V,vo=new V,Jc=new V,yo=new V,Kh=new V,So=new V,$t=class extends Ue{constructor(t=new Oe,e=new Un){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);let a=this.morphTargetInfluences;if(r&&a){yo.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=a[c],d=r[c];u!==0&&(Jc.fromBufferAttribute(d,t),o?yo.addScaledVector(Jc,u):yo.addScaledVector(Jc.sub(e),u))}e.add(yo)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),go.copy(n.boundingSphere),go.applyMatrix4(r),Bi.copy(t.ray).recast(t.near),!(go.containsPoint(Bi.origin)===!1&&(Bi.intersectSphere(go,Jh)===null||Bi.origin.distanceToSquared(Jh)>(t.far-t.near)**2))&&($h.copy(r).invert(),Bi.copy(t.ray).applyMatrix4($h),!(n.boundingBox!==null&&Bi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Bi)))}_computeIntersections(t,e,n){let i,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,x=h.length;p<x;p++){let g=h[p],m=o[g.materialIndex],v=Math.max(g.start,f.start),N=Math.min(a.count,Math.min(g.start+g.count,f.start+f.count));for(let S=v,E=N;S<E;S+=3){let w=a.getX(S),P=a.getX(S+1),_=a.getX(S+2);i=Mo(this,m,t,n,l,u,d,w,P,_),i&&(i.faceIndex=Math.floor(S/3),i.face.materialIndex=g.materialIndex,e.push(i))}}else{let p=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let g=p,m=x;g<m;g+=3){let v=a.getX(g),N=a.getX(g+1),S=a.getX(g+2);i=Mo(this,o,t,n,l,u,d,v,N,S),i&&(i.faceIndex=Math.floor(g/3),e.push(i))}}else if(c!==void 0)if(Array.isArray(o))for(let p=0,x=h.length;p<x;p++){let g=h[p],m=o[g.materialIndex],v=Math.max(g.start,f.start),N=Math.min(c.count,Math.min(g.start+g.count,f.start+f.count));for(let S=v,E=N;S<E;S+=3){let w=S,P=S+1,_=S+2;i=Mo(this,m,t,n,l,u,d,w,P,_),i&&(i.faceIndex=Math.floor(S/3),i.face.materialIndex=g.materialIndex,e.push(i))}}else{let p=Math.max(0,f.start),x=Math.min(c.count,f.start+f.count);for(let g=p,m=x;g<m;g+=3){let v=g,N=g+1,S=g+2;i=Mo(this,o,t,n,l,u,d,v,N,S),i&&(i.faceIndex=Math.floor(g/3),e.push(i))}}}};function $f(s,t,e,n,i,r,o,a){let c;if(t.side===Re?c=n.intersectTriangle(o,r,i,!0,a):c=n.intersectTriangle(i,r,o,t.side===Mi,a),c===null)return null;So.copy(a),So.applyMatrix4(s.matrixWorld);let l=e.ray.origin.distanceTo(So);return l<e.near||l>e.far?null:{distance:l,point:So.clone(),object:s}}function Mo(s,t,e,n,i,r,o,a,c,l){s.getVertexPosition(a,xo),s.getVertexPosition(c,_o),s.getVertexPosition(l,vo);let u=$f(s,t,e,n,xo,_o,vo,Kh);if(u){let d=new V;Qn.getBarycoord(Kh,xo,_o,vo,d),i&&(u.uv=Qn.getInterpolatedAttribute(i,a,c,l,d,new Vt)),r&&(u.uv1=Qn.getInterpolatedAttribute(r,a,c,l,d,new Vt)),o&&(u.normal=Qn.getInterpolatedAttribute(o,a,c,l,d,new V),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:c,c:l,normal:new V,materialIndex:0};Qn.getNormal(xo,_o,vo,h.normal),u.face=h,u.barycoord=d}return u}var Wo=class extends Je{constructor(t=null,e=1,n=1,i,r,o,a,c,l=Be,u=Be,d,h){super(null,o,a,c,l,u,i,r,d,h),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ui=new zi,Jf=new Vt(.5,.5),bo=new V,Cs=class{constructor(t=new gn,e=new gn,n=new gn,i=new gn,r=new gn,o=new gn){this.planes=[t,e,n,i,r,o]}set(t,e,n,i,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=xn,n=!1){let i=this.planes,r=t.elements,o=r[0],a=r[1],c=r[2],l=r[3],u=r[4],d=r[5],h=r[6],f=r[7],p=r[8],x=r[9],g=r[10],m=r[11],v=r[12],N=r[13],S=r[14],E=r[15];if(i[0].setComponents(l-o,f-u,m-p,E-v).normalize(),i[1].setComponents(l+o,f+u,m+p,E+v).normalize(),i[2].setComponents(l+a,f+d,m+x,E+N).normalize(),i[3].setComponents(l-a,f-d,m-x,E-N).normalize(),n)i[4].setComponents(c,h,g,S).normalize(),i[5].setComponents(l-c,f-h,m-g,E-S).normalize();else if(i[4].setComponents(l-c,f-h,m-g,E-S).normalize(),e===xn)i[5].setComponents(l+c,f+h,m+g,E+S).normalize();else if(e===Ms)i[5].setComponents(c,h,g,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ui.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ui.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ui)}intersectsSprite(t){Ui.center.set(0,0,0);let e=Jf.distanceTo(t.center);return Ui.radius=.7071067811865476+e,Ui.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ui)}intersectsSphere(t){let e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let i=e[n];if(bo.x=i.normal.x>0?t.max.x:t.min.x,bo.y=i.normal.y>0?t.max.y:t.min.y,bo.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(bo)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Rs=class extends _n{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ht(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},qo=new V,Xo=new V,jh=new fe,ar=new As,wo=new zi,Kc=new V,Qh=new V,vr=class extends Ue{constructor(t=new Oe,e=new Rs){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let i=1,r=e.count;i<r;i++)qo.fromBufferAttribute(e,i-1),Xo.fromBufferAttribute(e,i),n[i]=n[i-1],n[i]+=qo.distanceTo(Xo);t.setAttribute("lineDistance",new ge(n,1))}else Ot("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),wo.copy(n.boundingSphere),wo.applyMatrix4(i),wo.radius+=r,t.ray.intersectsSphere(wo)===!1)return;jh.copy(i).invert(),ar.copy(t.ray).applyMatrix4(jh);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){let f=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let x=f,g=p-1;x<g;x+=l){let m=u.getX(x),v=u.getX(x+1),N=Eo(this,t,ar,c,m,v,x);N&&e.push(N)}if(this.isLineLoop){let x=u.getX(p-1),g=u.getX(f),m=Eo(this,t,ar,c,x,g,p-1);m&&e.push(m)}}else{let f=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let x=f,g=p-1;x<g;x+=l){let m=Eo(this,t,ar,c,x,x+1,x);m&&e.push(m)}if(this.isLineLoop){let x=Eo(this,t,ar,c,p-1,f,p-1);x&&e.push(x)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Eo(s,t,e,n,i,r,o){let a=s.geometry.attributes.position;if(qo.fromBufferAttribute(a,i),Xo.fromBufferAttribute(a,r),e.distanceSqToSegment(qo,Xo,Kc,Qh)>n)return;Kc.applyMatrix4(s.matrixWorld);let l=t.ray.origin.distanceTo(Kc);if(!(l<t.near||l>t.far))return{distance:l,point:Qh.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}var yr=class extends Je{constructor(t=[],e=bi,n,i,r,o,a,c,l,u){super(t,e,n,i,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},nn=class extends Je{constructor(t,e,n,i,r,o,a,c,l){super(t,e,n,i,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var _i=class extends Je{constructor(t,e,n=Sn,i,r,o,a=Be,c=Be,l,u=Nn,d=1){if(u!==Nn&&u!==Ei)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:t,height:e,depth:d};super(h,i,r,o,a,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new ws(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Yo=class extends _i{constructor(t,e=Sn,n=bi,i,r,o=Be,a=Be,c,l=Nn){let u={width:t,height:t,depth:1},d=[u,u,u,u,u,u];super(t,t,e,n,i,r,o,a,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Sr=class extends Je{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Ce=class s extends Oe{constructor(t=1,e=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};let a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],u=[],d=[],h=0,f=0;p("z","y","x",-1,-1,n,e,t,o,r,0),p("z","y","x",1,-1,n,e,-t,o,r,1),p("x","z","y",1,1,t,n,e,i,o,2),p("x","z","y",1,-1,t,n,-e,i,o,3),p("x","y","z",1,-1,t,e,n,i,r,4),p("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new ge(l,3)),this.setAttribute("normal",new ge(u,3)),this.setAttribute("uv",new ge(d,2));function p(x,g,m,v,N,S,E,w,P,_,b){let M=S/P,R=E/_,F=S/2,I=E/2,C=w/2,L=P+1,D=_+1,z=0,q=0,G=new V;for(let Z=0;Z<D;Z++){let W=Z*R-I;for(let et=0;et<L;et++){let ut=et*M-F;G[x]=ut*v,G[g]=W*N,G[m]=C,l.push(G.x,G.y,G.z),G[x]=0,G[g]=0,G[m]=w>0?1:-1,u.push(G.x,G.y,G.z),d.push(et/P),d.push(1-Z/_),z+=1}}for(let Z=0;Z<_;Z++)for(let W=0;W<P;W++){let et=h+W+L*Z,ut=h+W+L*(Z+1),Ft=h+(W+1)+L*(Z+1),At=h+(W+1)+L*Z;c.push(et,ut,At),c.push(ut,Ft,At),q+=6}a.addGroup(f,q,b),f+=q,h+=z}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Mr=class s extends Oe{constructor(t=1,e=1,n=4,i=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:i,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),i=Math.max(3,Math.floor(i)),r=Math.max(1,Math.floor(r));let o=[],a=[],c=[],l=[],u=e/2,d=Math.PI/2*t,h=e,f=2*d+h,p=n*2+r,x=i+1,g=new V,m=new V;for(let v=0;v<=p;v++){let N=0,S=0,E=0,w=0;if(v<=n){let b=v/n,M=b*Math.PI/2;S=-u-t*Math.cos(M),E=t*Math.sin(M),w=-t*Math.cos(M),N=b*d}else if(v<=n+r){let b=(v-n)/r;S=-u+b*e,E=t,w=0,N=d+b*h}else{let b=(v-n-r)/n,M=b*Math.PI/2;S=u+t*Math.sin(M),E=t*Math.cos(M),w=t*Math.sin(M),N=d+h+b*d}let P=Math.max(0,Math.min(1,N/f)),_=0;v===0?_=.5/i:v===p&&(_=-.5/i);for(let b=0;b<=i;b++){let M=b/i,R=M*Math.PI*2,F=Math.sin(R),I=Math.cos(R);m.x=-E*I,m.y=S,m.z=E*F,a.push(m.x,m.y,m.z),g.set(-E*I,w,E*F),g.normalize(),c.push(g.x,g.y,g.z),l.push(M+_,P)}if(v>0){let b=(v-1)*x;for(let M=0;M<i;M++){let R=b+M,F=b+M+1,I=v*x+M,C=v*x+M+1;o.push(R,F,I),o.push(F,C,I)}}}this.setIndex(o),this.setAttribute("position",new ge(a,3)),this.setAttribute("normal",new ge(c,3)),this.setAttribute("uv",new ge(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},br=class s extends Oe{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);let r=[],o=[],a=[],c=[],l=new V,u=new Vt;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let d=0,h=3;d<=e;d++,h+=3){let f=n+d/e*i;l.x=t*Math.cos(f),l.y=t*Math.sin(f),o.push(l.x,l.y,l.z),a.push(0,0,1),u.x=(o[h]/t+1)/2,u.y=(o[h+1]/t+1)/2,c.push(u.x,u.y)}for(let d=1;d<=e;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new ge(o,3)),this.setAttribute("normal",new ge(a,3)),this.setAttribute("uv",new ge(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.segments,t.thetaStart,t.thetaLength)}},wr=class s extends Oe{constructor(t=1,e=1,n=1,i=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;i=Math.floor(i),r=Math.floor(r);let u=[],d=[],h=[],f=[],p=0,x=[],g=n/2,m=0;v(),o===!1&&(t>0&&N(!0),e>0&&N(!1)),this.setIndex(u),this.setAttribute("position",new ge(d,3)),this.setAttribute("normal",new ge(h,3)),this.setAttribute("uv",new ge(f,2));function v(){let S=new V,E=new V,w=0,P=(e-t)/n;for(let _=0;_<=r;_++){let b=[],M=_/r,R=M*(e-t)+t;for(let F=0;F<=i;F++){let I=F/i,C=I*c+a,L=Math.sin(C),D=Math.cos(C);E.x=R*L,E.y=-M*n+g,E.z=R*D,d.push(E.x,E.y,E.z),S.set(L,P,D).normalize(),h.push(S.x,S.y,S.z),f.push(I,1-M),b.push(p++)}x.push(b)}for(let _=0;_<i;_++)for(let b=0;b<r;b++){let M=x[b][_],R=x[b+1][_],F=x[b+1][_+1],I=x[b][_+1];(t>0||b!==0)&&(u.push(M,R,I),w+=3),(e>0||b!==r-1)&&(u.push(R,F,I),w+=3)}l.addGroup(m,w,0),m+=w}function N(S){let E=p,w=new Vt,P=new V,_=0,b=S===!0?t:e,M=S===!0?1:-1;for(let F=1;F<=i;F++)d.push(0,g*M,0),h.push(0,M,0),f.push(.5,.5),p++;let R=p;for(let F=0;F<=i;F++){let C=F/i*c+a,L=Math.cos(C),D=Math.sin(C);P.x=b*D,P.y=g*M,P.z=b*L,d.push(P.x,P.y,P.z),h.push(0,M,0),w.x=L*.5+.5,w.y=D*.5*M+.5,f.push(w.x,w.y),p++}for(let F=0;F<i;F++){let I=E+F,C=R+F;S===!0?u.push(C,C+1,I):u.push(C+1,C,I),_+=3}l.addGroup(m,_,S===!0?1:2),m+=_}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var Vi=class s extends Oe{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let r=t/2,o=e/2,a=Math.floor(n),c=Math.floor(i),l=a+1,u=c+1,d=t/a,h=e/c,f=[],p=[],x=[],g=[];for(let m=0;m<u;m++){let v=m*h-o;for(let N=0;N<l;N++){let S=N*d-r;p.push(S,-v,0),x.push(0,0,1),g.push(N/a),g.push(1-m/c)}}for(let m=0;m<c;m++)for(let v=0;v<a;v++){let N=v+l*m,S=v+l*(m+1),E=v+1+l*(m+1),w=v+1+l*m;f.push(N,S,w),f.push(S,E,w)}this.setIndex(f),this.setAttribute("position",new ge(p,3)),this.setAttribute("normal",new ge(x,3)),this.setAttribute("uv",new ge(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}};var ei=class s extends Oe{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,u=[],d=new V,h=new V,f=[],p=[],x=[],g=[];for(let m=0;m<=n;m++){let v=[],N=m/n,S=o+N*a,E=t*Math.cos(S),w=Math.sqrt(t*t-E*E),P=0;m===0&&o===0?P=.5/e:m===n&&c===Math.PI&&(P=-.5/e);for(let _=0;_<=e;_++){let b=_/e,M=i+b*r;d.x=-w*Math.cos(M),d.y=E,d.z=w*Math.sin(M),p.push(d.x,d.y,d.z),h.copy(d).normalize(),x.push(h.x,h.y,h.z),g.push(b+P,1-N),v.push(l++)}u.push(v)}for(let m=0;m<n;m++)for(let v=0;v<e;v++){let N=u[m][v+1],S=u[m][v],E=u[m+1][v],w=u[m+1][v+1];(m!==0||o>0)&&f.push(N,S,w),(m!==n-1||c<Math.PI)&&f.push(S,E,w)}this.setIndex(f),this.setAttribute("position",new ge(p,3)),this.setAttribute("normal",new ge(x,3)),this.setAttribute("uv",new ge(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function qi(s){let t={};for(let e in s){t[e]={};for(let n in s[e]){let i=s[e][n];if(tu(i))i.isRenderTargetTexture?(Ot("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone();else if(Array.isArray(i))if(tu(i[0])){let r=[];for(let o=0,a=i.length;o<a;o++)r[o]=i[o].clone();t[e][n]=r}else t[e][n]=i.slice();else t[e][n]=i}}return t}function Xe(s){let t={};for(let e=0;e<s.length;e++){let n=qi(s[e]);for(let i in n)t[i]=n[i]}return t}function tu(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function Kf(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Pl(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Jt.workingColorSpace}var Xu={clone:qi,merge:Xe},jf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Qf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,sn=class extends _n{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=jf,this.fragmentShader=Qf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=qi(t.uniforms),this.uniformsGroups=Kf(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let i=t.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=e[i.value]||null;break;case"c":this.uniforms[n].value=new Ht().setHex(i.value);break;case"v2":this.uniforms[n].value=new Vt().fromArray(i.value);break;case"v3":this.uniforms[n].value=new V().fromArray(i.value);break;case"v4":this.uniforms[n].value=new ve().fromArray(i.value);break;case"m3":this.uniforms[n].value=new kt().fromArray(i.value);break;case"m4":this.uniforms[n].value=new fe().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Zo=class extends sn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},be=class extends _n{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ht(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ht(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=kr,this.normalScale=new Vt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Dn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Er=class extends _n{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ht(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ht(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=kr,this.normalScale=new Vt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Dn,this.combine=ua,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},$o=class extends _n{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Pu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Jo=class extends _n{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function xs(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function jc(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var vi=class{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<i)){for(let a=n+2;;){if(i===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=e[++n],t<i)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(i=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=t*i;for(let o=0;o!==i;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ko=class extends vi{constructor(t,e,n,i){super(t,e,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:el,endingEnd:el}}intervalChanged_(t,e,n){let i=this.parameterPositions,r=t-2,o=t+1,a=i[r],c=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case nl:r=t,a=2*e-n;break;case il:r=i.length-2,a=e+i[r]-i[r+1];break;default:r=t,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case nl:o=t,c=2*n-e;break;case il:o=1,c=n+i[1]-i[0];break;default:o=t-1,c=e}let l=(n-e)*.5,u=this.valueSize;this._weightPrev=l/(e-a),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,f=this._weightNext,p=(n-e)/(i-e),x=p*p,g=x*p,m=-h*g+2*h*x-h*p,v=(1+h)*g+(-1.5-2*h)*x+(-.5+h)*p+1,N=(-1-f)*g+(1.5+f)*x+.5*p,S=f*g-f*x;for(let E=0;E!==a;++E)r[E]=m*o[u+E]+v*o[l+E]+N*o[c+E]+S*o[d+E];return r}},jo=class extends vi{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,u=(n-e)/(i-e),d=1-u;for(let h=0;h!==a;++h)r[h]=o[l+h]*d+o[c+h]*u;return r}},Qo=class extends vi{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}},ta=class extends vi{interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,u=this.inTangents,d=this.outTangents;if(!u||!d){let p=(n-e)/(i-e),x=1-p;for(let g=0;g!==a;++g)r[g]=o[l+g]*x+o[c+g]*p;return r}let h=a*2,f=t-1;for(let p=0;p!==a;++p){let x=o[l+p],g=o[c+p],m=f*h+p*2,v=d[m],N=d[m+1],S=t*h+p*2,E=u[S],w=u[S+1],P=ep(n,e,v,E,i);r[p]=Yu(P,x,N,w,g)}return r}};function Yu(s,t,e,n,i){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*n+s*s*s*i}function tp(s,t,e,n,i){let r=1-s;return 3*r*r*(e-t)+6*r*s*(n-e)+3*s*s*(i-n)}function ep(s,t,e,n,i){let r=(s-t)/(i-t);for(let o=0;o<8;o++){let a=Yu(r,t,e,n,i)-s;if(Math.abs(a)<1e-10)break;let c=tp(r,t,e,n,i);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-a/c))}return r}var rn=class{constructor(t,e,n,i){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=xs(e,this.TimeBufferType),this.values=xs(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:xs(t.times,Array),values:xs(t.values,Array)};let i=t.getInterpolation();i!==t.DefaultInterpolation&&(n.interpolation=i),jc(t.settings)&&(n.settings={inTangents:xs(t.settings.inTangents,Array),outTangents:xs(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Qo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new jo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Ko(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new ta(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case cr:e=this.InterpolantFactoryMethodDiscrete;break;case Oo:e=this.InterpolantFactoryMethodLinear;break;case Co:e=this.InterpolantFactoryMethodSmooth;break;case tl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Ot("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return cr;case this.InterpolantFactoryMethodLinear:return Oo;case this.InterpolantFactoryMethodSmooth:return Co;case this.InterpolantFactoryMethodBezier:return tl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t;jc(this.settings)&&(eu(this.settings.inTangents,t),eu(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,i=n.length,r=0,o=i-1;for(;r!==i&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Ut("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,i=this.values,r=n.length;r===0&&(Ut("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){Ut("KeyframeTrack: Time is not a valid number.",this,a,c),t=!1;break}if(o!==null&&o>c){Ut("KeyframeTrack: Out of order keys.",this,a,c,o),t=!1;break}o=c}if(i!==void 0&&Pf(i))for(let a=0,c=i.length;a!==c;++a){let l=i[a];if(isNaN(l)){Ut("KeyframeTrack: Value is not a valid number.",this,a,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Co,r=t.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=t[a],u=t[a+1];if(l!==u&&(a!==1||l!==t[0]))if(i)c=!0;else{let d=a*n,h=d-n,f=d+n;for(let p=0;p!==n;++p){let x=e[d+p];if(x!==e[h+p]||x!==e[f+p]){c=!0;break}}}if(c){if(a!==o){t[o]=t[a];let d=a*n,h=o*n;for(let f=0;f!==n;++f)e[h+f]=e[d+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)e[c+l]=e[a+l];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,i=new n(this.name,t,e);return i.createInterpolant=this.createInterpolant,jc(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function eu(s,t){for(let e=0,n=s.length;e!==n;e+=2)s[e]*=t}rn.prototype.ValueTypeName="";rn.prototype.TimeBufferType=Float32Array;rn.prototype.ValueBufferType=Float32Array;rn.prototype.DefaultInterpolation=Oo;var yi=class extends rn{constructor(t,e,n){super(t,e,n)}};yi.prototype.ValueTypeName="bool";yi.prototype.ValueBufferType=Array;yi.prototype.DefaultInterpolation=cr;yi.prototype.InterpolantFactoryMethodLinear=void 0;yi.prototype.InterpolantFactoryMethodSmooth=void 0;var ea=class extends rn{constructor(t,e,n,i){super(t,e,n,i)}};ea.prototype.ValueTypeName="color";var na=class extends rn{constructor(t,e,n,i){super(t,e,n,i)}};na.prototype.ValueTypeName="number";var ia=class extends vi{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-e)/(i-e),l=t*a;for(let u=l+a;l!==u;l+=4)hn.slerpFlat(r,0,o,l-a,o,l,c);return r}},Tr=class extends rn{constructor(t,e,n,i){super(t,e,n,i)}InterpolantFactoryMethodLinear(t){return new ia(this.times,this.values,this.getValueSize(),t)}};Tr.prototype.ValueTypeName="quaternion";Tr.prototype.InterpolantFactoryMethodSmooth=void 0;var Si=class extends rn{constructor(t,e,n){super(t,e,n)}};Si.prototype.ValueTypeName="string";Si.prototype.ValueBufferType=Array;Si.prototype.DefaultInterpolation=cr;Si.prototype.InterpolantFactoryMethodLinear=void 0;Si.prototype.InterpolantFactoryMethodSmooth=void 0;var sa=class extends rn{constructor(t,e,n,i){super(t,e,n,i)}};sa.prototype.ValueTypeName="vector";var ra=class{constructor(t,e,n){let i=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(u){a++,r===!1&&i.onStart!==void 0&&i.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,i.onProgress!==void 0&&i.onProgress(u,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,d){return l.push(u,d),this},this.removeHandler=function(u){let d=l.indexOf(u);return d!==-1&&l.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=l.length;d<h;d+=2){let f=l[d],p=l[d+1];if(f.global&&(f.lastIndex=0),f.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Zu=new ra,oa=class{constructor(t){this.manager=t!==void 0?t:Zu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,r){n.load(t,i,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};oa.DEFAULT_MATERIAL_NAME="__DEFAULT";var Is=class extends Ue{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ht(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Ar=class extends Is{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ue.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ht(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Qc=new fe,nu=new V,iu=new V,Cr=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Vt(512,512),this.mapType=je,this.map=null,this.mapPass=null,this.matrix=new fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Cs,this._frameExtents=new Vt(1,1),this._viewportCount=1,this._viewports=[new ve(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;nu.setFromMatrixPosition(t.matrixWorld),e.position.copy(nu),iu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(iu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,i){Qc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Qc,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=i?i.z/r.x:1,a=i?i.w/r.y:1,c=i?i.x/r.x:0,l=i?i.y/r.y:0;t.coordinateSystem===Ms||t.reversedDepth?e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,.5,.5,0,0,0,1),e.multiply(Qc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},To=new V,Ao=new hn,Rn=new V,Rr=class extends Ue{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new fe,this.projectionMatrix=new fe,this.projectionMatrixInverse=new fe,this.coordinateSystem=xn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(To,Ao,Rn),Rn.x===1&&Rn.y===1&&Rn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(To,Ao,Rn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(To,Ao,Rn),Rn.x===1&&Rn.y===1&&Rn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(To,Ao,Rn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},mi=new V,su=new Vt,ru=new Vt,ze=class extends Rr{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=zo*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Rc*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return zo*2*Math.atan(Math.tan(Rc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(mi.x,mi.y).multiplyScalar(-t/mi.z),mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(mi.x,mi.y).multiplyScalar(-t/mi.z)}getViewSize(t,e){return this.getViewBounds(t,su,ru),e.subVectors(ru,su)}setViewOffset(t,e,n,i,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Rc*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*i/c,e-=o.offsetY*n/l,i*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var sl=class extends Cr{constructor(){super(new ze(90,1,.5,500)),this.isPointLightShadow=!0}},Ir=class extends Is{constructor(t,e,n=0,i=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new sl}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},Ps=class extends Rr{constructor(t=-1,e=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-t,o=n+t,a=i+e,c=i-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},rl=class extends Cr{constructor(){super(new Ps(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Pr=class extends Is{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ue.DEFAULT_UP),this.updateMatrix(),this.target=new Ue,this.shadow=new rl}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var _s=-90,vs=1,aa=class extends Ue{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new ze(_s,vs,t,e);i.layers=this.layers,this.add(i);let r=new ze(_s,vs,t,e);r.layers=this.layers,this.add(r);let o=new ze(_s,vs,t,e);o.layers=this.layers,this.add(o);let a=new ze(_s,vs,t,e);a.layers=this.layers,this.add(a);let c=new ze(_s,vs,t,e);c.layers=this.layers,this.add(c);let l=new ze(_s,vs,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,i,r,o,a,c]=e;for(let l of e)this.remove(l);if(t===xn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Ms)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,u]=this.children,d=t.getRenderTarget(),h=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let g=!1;t.isWebGLRenderer===!0?g=t.state.buffers.depth.getReversed():g=t.reversedDepthBuffer,t.setRenderTarget(n,0,i),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,i),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,i),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,i),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(n,4,i),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,i),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(d,h,f),t.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},ca=class extends ze{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Ll="\\[\\]\\.:\\/",np=new RegExp("["+Ll+"]","g"),Nl="[^"+Ll+"]",ip="[^"+Ll.replace("\\.","")+"]",sp=/((?:WC+[\/:])*)/.source.replace("WC",Nl),rp=/(WCOD+)?/.source.replace("WCOD",ip),op=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Nl),ap=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Nl),cp=new RegExp("^"+sp+rp+op+ap+"$"),lp=["material","materials","bones","map"],ol=class{constructor(t,e,n){let i=n||me.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},me=class s{constructor(t,e,n){this.path=e,this.parsedPath=n||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,n):new s(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(np,"")}static parseTrackName(t){let e=cp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);lp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let c=n(a.children);if(c)return c}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,i=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Ot("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){Ut("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Ut("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Ut("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===l){l=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Ut("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Ut("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Ut("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){Ut("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let o=t[i];if(o===void 0){let l=e.nodeName;Ut("PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){Ut("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Ut("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};me.Composite=ol;me.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};me.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};me.prototype.GetterByBindingType=[me.prototype._getValue_direct,me.prototype._getValue_array,me.prototype._getValue_arrayElement,me.prototype._getValue_toArray];me.prototype.SetterByBindingTypeAndVersioning=[[me.prototype._setValue_direct,me.prototype._setValue_direct_setNeedsUpdate,me.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[me.prototype._setValue_array,me.prototype._setValue_array_setNeedsUpdate,me.prototype._setValue_array_setMatrixWorldNeedsUpdate],[me.prototype._setValue_arrayElement,me.prototype._setValue_arrayElement_setNeedsUpdate,me.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[me.prototype._setValue_fromArray,me.prototype._setValue_fromArray_setNeedsUpdate,me.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var xS=new Float32Array(1);var ou=new fe,ki=class{constructor(t,e,n=0,i=1/0){this.ray=new As(t,e),this.near=n,this.far=i,this.camera=null,this.layers=new Es,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Ut("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return ou.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ou),this}intersectObject(t,e=!0,n=[]){return al(t,this,n,e),n.sort(au),n}intersectObjects(t,e=!0,n=[]){for(let i=0,r=t.length;i<r;i++)al(t[i],this,n,e);return n.sort(au),n}};function au(s,t){return s.distance-t.distance}function al(s,t,e,n){let i=!0;if(s.layers.test(t.layers)&&s.raycast(t,e)===!1&&(i=!1),i===!0&&n===!0){let r=s.children;for(let o=0,a=r.length;o<a;o++)al(r[o],t,e,!0)}}var zl=class zl{constructor(t,e,n,i){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,i){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=i,this}};zl.prototype.isMatrix2=!0;var cl=zl;function Fl(s,t,e,n){let i=hp(n);switch(e){case Tl:return s*t;case Cl:return s*t/i.components*i.byteLength;case _a:return s*t/i.components*i.byteLength;case Ti:return s*t*2/i.components*i.byteLength;case va:return s*t*2/i.components*i.byteLength;case Al:return s*t*3/i.components*i.byteLength;case un:return s*t*4/i.components*i.byteLength;case ya:return s*t*4/i.components*i.byteLength;case Dr:case Br:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Ur:case Or:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ma:case wa:return Math.max(s,16)*Math.max(t,8)/4;case Sa:case ba:return Math.max(s,8)*Math.max(t,8)/2;case Ea:case Ta:case Ca:case Ra:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Aa:case zr:case Ia:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Pa:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case La:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case Na:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case Fa:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case Da:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case Ba:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Ua:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case Oa:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case za:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case Va:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case ka:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case Ha:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case Ga:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case Wa:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case qa:case Xa:case Ya:return Math.ceil(s/4)*Math.ceil(t/4)*16;case Za:case $a:return Math.ceil(s/4)*Math.ceil(t/4)*8;case Vr:case Ja:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function hp(s){switch(s){case je:case Ml:return{byteLength:1,components:1};case Fs:case bl:case bn:return{byteLength:2,components:1};case ga:case xa:return{byteLength:2,components:4};case Sn:case ma:case Mn:return{byteLength:4,components:1};case wl:case El:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Ot("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function gd(){let s=null,t=!1,e=null,n=null;function i(r,o){n=s.requestAnimationFrame(i),e(r,o)}return{start:function(){t!==!0&&e!==null&&s!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function dp(s){let t=new WeakMap;function e(a,c){let l=a.array,u=a.usage,d=l.byteLength,h=s.createBuffer();s.bindBuffer(c,h),s.bufferData(c,l,u),a.onUploadCallback();let f;if(l instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=s.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=s.SHORT;else if(l instanceof Uint32Array)f=s.UNSIGNED_INT;else if(l instanceof Int32Array)f=s.INT;else if(l instanceof Int8Array)f=s.BYTE;else if(l instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:h,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,c,l){let u=c.array,d=c.updateRanges;if(s.bindBuffer(l,a),d.length===0)s.bufferSubData(l,0,u);else{d.sort((f,p)=>f.start-p.start);let h=0;for(let f=1;f<d.length;f++){let p=d[h],x=d[f];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++h,d[h]=x)}d.length=h+1;for(let f=0,p=d.length;f<p;f++){let x=d[f];s.bufferSubData(l,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=t.get(a);c&&(s.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=t.get(a);(!u||u.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:i,remove:r,update:o}}var fp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,pp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,mp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,gp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,xp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,_p=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,vp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,yp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Sp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Mp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,bp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,wp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ep=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Tp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ap=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Cp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Rp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ip=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Pp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Lp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Np=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Fp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Dp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Bp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Up=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Op=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,zp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Vp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,kp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Hp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Gp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Wp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,qp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Xp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Yp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Zp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,$p=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Jp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Kp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,jp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Qp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,tm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,em=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,nm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,im=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,sm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,rm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,om=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,am=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,cm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,hm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,um=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,dm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,fm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,pm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,mm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,gm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,xm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_m=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ym=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Sm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Mm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,bm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Em=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Tm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Am=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Cm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Rm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Im=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Pm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Lm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Nm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Bm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Um=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Om=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Vm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,km=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Hm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Gm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Wm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,qm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Xm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ym=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Zm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$m=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Jm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Km=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,jm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Qm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,t0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,e0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,n0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,i0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,s0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,r0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,o0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,a0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,c0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,l0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,h0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,u0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,d0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,f0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,p0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,m0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,g0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,x0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,v0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,y0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,S0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,M0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,b0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,w0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,E0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,T0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,A0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,C0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,R0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,I0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,P0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,L0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,N0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,F0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,D0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,B0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,U0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,O0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,z0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,V0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,k0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,H0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,G0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,W0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,q0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,X0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qt={alphahash_fragment:fp,alphahash_pars_fragment:pp,alphamap_fragment:mp,alphamap_pars_fragment:gp,alphatest_fragment:xp,alphatest_pars_fragment:_p,aomap_fragment:vp,aomap_pars_fragment:yp,batching_pars_vertex:Sp,batching_vertex:Mp,begin_vertex:bp,beginnormal_vertex:wp,bsdfs:Ep,iridescence_fragment:Tp,bumpmap_pars_fragment:Ap,clipping_planes_fragment:Cp,clipping_planes_pars_fragment:Rp,clipping_planes_pars_vertex:Ip,clipping_planes_vertex:Pp,color_fragment:Lp,color_pars_fragment:Np,color_pars_vertex:Fp,color_vertex:Dp,common:Bp,cube_uv_reflection_fragment:Up,defaultnormal_vertex:Op,displacementmap_pars_vertex:zp,displacementmap_vertex:Vp,emissivemap_fragment:kp,emissivemap_pars_fragment:Hp,colorspace_fragment:Gp,colorspace_pars_fragment:Wp,envmap_fragment:qp,envmap_common_pars_fragment:Xp,envmap_pars_fragment:Yp,envmap_pars_vertex:Zp,envmap_physical_pars_fragment:rm,envmap_vertex:$p,fog_vertex:Jp,fog_pars_vertex:Kp,fog_fragment:jp,fog_pars_fragment:Qp,gradientmap_pars_fragment:tm,lightmap_pars_fragment:em,lights_lambert_fragment:nm,lights_lambert_pars_fragment:im,lights_pars_begin:sm,lights_toon_fragment:om,lights_toon_pars_fragment:am,lights_phong_fragment:cm,lights_phong_pars_fragment:lm,lights_physical_fragment:hm,lights_physical_pars_fragment:um,lights_fragment_begin:dm,lights_fragment_maps:fm,lights_fragment_end:pm,lightprobes_pars_fragment:mm,logdepthbuf_fragment:gm,logdepthbuf_pars_fragment:xm,logdepthbuf_pars_vertex:_m,logdepthbuf_vertex:vm,map_fragment:ym,map_pars_fragment:Sm,map_particle_fragment:Mm,map_particle_pars_fragment:bm,metalnessmap_fragment:wm,metalnessmap_pars_fragment:Em,morphinstance_vertex:Tm,morphcolor_vertex:Am,morphnormal_vertex:Cm,morphtarget_pars_vertex:Rm,morphtarget_vertex:Im,normal_fragment_begin:Pm,normal_fragment_maps:Lm,normal_pars_fragment:Nm,normal_pars_vertex:Fm,normal_vertex:Dm,normalmap_pars_fragment:Bm,clearcoat_normal_fragment_begin:Um,clearcoat_normal_fragment_maps:Om,clearcoat_pars_fragment:zm,iridescence_pars_fragment:Vm,opaque_fragment:km,packing:Hm,premultiplied_alpha_fragment:Gm,project_vertex:Wm,dithering_fragment:qm,dithering_pars_fragment:Xm,roughnessmap_fragment:Ym,roughnessmap_pars_fragment:Zm,shadowmap_pars_fragment:$m,shadowmap_pars_vertex:Jm,shadowmap_vertex:Km,shadowmask_pars_fragment:jm,skinbase_vertex:Qm,skinning_pars_vertex:t0,skinning_vertex:e0,skinnormal_vertex:n0,specularmap_fragment:i0,specularmap_pars_fragment:s0,tonemapping_fragment:r0,tonemapping_pars_fragment:o0,transmission_fragment:a0,transmission_pars_fragment:c0,uv_pars_fragment:l0,uv_pars_vertex:h0,uv_vertex:u0,worldpos_vertex:d0,background_vert:f0,background_frag:p0,backgroundCube_vert:m0,backgroundCube_frag:g0,cube_vert:x0,cube_frag:_0,depth_vert:v0,depth_frag:y0,distance_vert:S0,distance_frag:M0,equirect_vert:b0,equirect_frag:w0,linedashed_vert:E0,linedashed_frag:T0,meshbasic_vert:A0,meshbasic_frag:C0,meshlambert_vert:R0,meshlambert_frag:I0,meshmatcap_vert:P0,meshmatcap_frag:L0,meshnormal_vert:N0,meshnormal_frag:F0,meshphong_vert:D0,meshphong_frag:B0,meshphysical_vert:U0,meshphysical_frag:O0,meshtoon_vert:z0,meshtoon_frag:V0,points_vert:k0,points_frag:H0,shadow_vert:G0,shadow_frag:W0,sprite_vert:q0,sprite_frag:X0},_t={common:{diffuse:{value:new Ht(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new kt}},envmap:{envMap:{value:null},envMapRotation:{value:new kt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new kt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new kt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new kt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new kt},normalScale:{value:new Vt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new kt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new kt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new kt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new kt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ht(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new V},probesMax:{value:new V},probesResolution:{value:new V}},points:{diffuse:{value:new Ht(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0},uvTransform:{value:new kt}},sprite:{diffuse:{value:new Ht(16777215)},opacity:{value:1},center:{value:new Vt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}}},kn={basic:{uniforms:Xe([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:Xe([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new Ht(0)},envMapIntensity:{value:1}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:Xe([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new Ht(0)},specular:{value:new Ht(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:Xe([_t.common,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.roughnessmap,_t.metalnessmap,_t.fog,_t.lights,{emissive:{value:new Ht(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:Xe([_t.common,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.gradientmap,_t.fog,_t.lights,{emissive:{value:new Ht(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:Xe([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:Xe([_t.points,_t.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:Xe([_t.common,_t.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:Xe([_t.common,_t.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:Xe([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:Xe([_t.sprite,_t.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new kt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new kt}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distance:{uniforms:Xe([_t.common,_t.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distance_vert,fragmentShader:qt.distance_frag},shadow:{uniforms:Xe([_t.lights,_t.fog,{color:{value:new Ht(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};kn.physical={uniforms:Xe([kn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new kt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new kt},clearcoatNormalScale:{value:new Vt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new kt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new kt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new kt},sheen:{value:0},sheenColor:{value:new Ht(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new kt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new kt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new kt},transmissionSamplerSize:{value:new Vt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new kt},attenuationDistance:{value:0},attenuationColor:{value:new Ht(0)},specularColor:{value:new Ht(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new kt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new kt},anisotropyVector:{value:new Vt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new kt}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};var Qa={r:0,b:0,g:0},Y0=new fe,xd=new kt;xd.set(-1,0,0,0,1,0,0,0,1);function Z0(s,t,e,n,i,r){let o=new Ht(0),a=i===!0?0:1,c,l,u=null,d=0,h=null;function f(v){let N=v.isScene===!0?v.background:null;if(N&&N.isTexture){let S=v.backgroundBlurriness>0;N=t.get(N,S)}return N}function p(v){let N=!1,S=f(v);S===null?g(o,a):S&&S.isColor&&(g(S,1),N=!0);let E=s.xr.getEnvironmentBlendMode();E==="additive"?e.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||N)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function x(v,N){let S=f(N);S&&(S.isCubeTexture||S.mapping===Nr)?(l===void 0&&(l=new $t(new Ce(1,1,1),new sn({name:"BackgroundCubeMaterial",uniforms:qi(kn.backgroundCube.uniforms),vertexShader:kn.backgroundCube.vertexShader,fragmentShader:kn.backgroundCube.fragmentShader,side:Re,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(E,w,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=S,l.material.uniforms.backgroundBlurriness.value=N.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=N.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Y0.makeRotationFromEuler(N.backgroundRotation)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(xd),l.material.toneMapped=Jt.getTransfer(S.colorSpace)!==se,(u!==S||d!==S.version||h!==s.toneMapping)&&(l.material.needsUpdate=!0,u=S,d=S.version,h=s.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new $t(new Vi(2,2),new sn({name:"BackgroundMaterial",uniforms:qi(kn.background.uniforms),vertexShader:kn.background.vertexShader,fragmentShader:kn.background.fragmentShader,side:Mi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=N.backgroundIntensity,c.material.toneMapped=Jt.getTransfer(S.colorSpace)!==se,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||d!==S.version||h!==s.toneMapping)&&(c.material.needsUpdate=!0,u=S,d=S.version,h=s.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null))}function g(v,N){v.getRGB(Qa,Pl(s)),e.buffers.color.setClear(Qa.r,Qa.g,Qa.b,N,r)}function m(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(v,N=1){o.set(v),a=N,g(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(v){a=v,g(o,a)},render:p,addToRenderList:x,dispose:m}}function $0(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=h(null),r=i,o=!1;function a(R,F,I,C,L){let D=!1,z=d(R,C,I,F);r!==z&&(r=z,l(r.object)),D=f(R,C,I,L),D&&p(R,C,I,L),L!==null&&t.update(L,s.ELEMENT_ARRAY_BUFFER),(D||o)&&(o=!1,S(R,F,I,C),L!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(L).buffer))}function c(){return s.createVertexArray()}function l(R){return s.bindVertexArray(R)}function u(R){return s.deleteVertexArray(R)}function d(R,F,I,C){let L=C.wireframe===!0,D=n[F.id];D===void 0&&(D={},n[F.id]=D);let z=R.isInstancedMesh===!0?R.id:0,q=D[z];q===void 0&&(q={},D[z]=q);let G=q[I.id];G===void 0&&(G={},q[I.id]=G);let Z=G[L];return Z===void 0&&(Z=h(c()),G[L]=Z),Z}function h(R){let F=[],I=[],C=[];for(let L=0;L<e;L++)F[L]=0,I[L]=0,C[L]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:I,attributeDivisors:C,object:R,attributes:{},index:null}}function f(R,F,I,C){let L=r.attributes,D=F.attributes,z=0,q=I.getAttributes();for(let G in q)if(q[G].location>=0){let W=L[G],et=D[G];if(et===void 0&&(G==="instanceMatrix"&&R.instanceMatrix&&(et=R.instanceMatrix),G==="instanceColor"&&R.instanceColor&&(et=R.instanceColor)),W===void 0||W.attribute!==et||et&&W.data!==et.data)return!0;z++}return r.attributesNum!==z||r.index!==C}function p(R,F,I,C){let L={},D=F.attributes,z=0,q=I.getAttributes();for(let G in q)if(q[G].location>=0){let W=D[G];W===void 0&&(G==="instanceMatrix"&&R.instanceMatrix&&(W=R.instanceMatrix),G==="instanceColor"&&R.instanceColor&&(W=R.instanceColor));let et={};et.attribute=W,W&&W.data&&(et.data=W.data),L[G]=et,z++}r.attributes=L,r.attributesNum=z,r.index=C}function x(){let R=r.newAttributes;for(let F=0,I=R.length;F<I;F++)R[F]=0}function g(R){m(R,0)}function m(R,F){let I=r.newAttributes,C=r.enabledAttributes,L=r.attributeDivisors;I[R]=1,C[R]===0&&(s.enableVertexAttribArray(R),C[R]=1),L[R]!==F&&(s.vertexAttribDivisor(R,F),L[R]=F)}function v(){let R=r.newAttributes,F=r.enabledAttributes;for(let I=0,C=F.length;I<C;I++)F[I]!==R[I]&&(s.disableVertexAttribArray(I),F[I]=0)}function N(R,F,I,C,L,D,z){z===!0?s.vertexAttribIPointer(R,F,I,L,D):s.vertexAttribPointer(R,F,I,C,L,D)}function S(R,F,I,C){x();let L=C.attributes,D=I.getAttributes(),z=F.defaultAttributeValues;for(let q in D){let G=D[q];if(G.location>=0){let Z=L[q];if(Z===void 0&&(q==="instanceMatrix"&&R.instanceMatrix&&(Z=R.instanceMatrix),q==="instanceColor"&&R.instanceColor&&(Z=R.instanceColor)),Z!==void 0){let W=Z.normalized,et=Z.itemSize,ut=t.get(Z);if(ut===void 0)continue;let Ft=ut.buffer,At=ut.type,Bt=ut.bytesPerElement,K=At===s.INT||At===s.UNSIGNED_INT||Z.gpuType===ma;if(Z.isInterleavedBufferAttribute){let ot=Z.data,vt=ot.stride,Dt=Z.offset;if(ot.isInstancedInterleavedBuffer){for(let xt=0;xt<G.locationSize;xt++)m(G.location+xt,ot.meshPerAttribute);R.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let xt=0;xt<G.locationSize;xt++)g(G.location+xt);s.bindBuffer(s.ARRAY_BUFFER,Ft);for(let xt=0;xt<G.locationSize;xt++)N(G.location+xt,et/G.locationSize,At,W,vt*Bt,(Dt+et/G.locationSize*xt)*Bt,K)}else{if(Z.isInstancedBufferAttribute){for(let ot=0;ot<G.locationSize;ot++)m(G.location+ot,Z.meshPerAttribute);R.isInstancedMesh!==!0&&C._maxInstanceCount===void 0&&(C._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let ot=0;ot<G.locationSize;ot++)g(G.location+ot);s.bindBuffer(s.ARRAY_BUFFER,Ft);for(let ot=0;ot<G.locationSize;ot++)N(G.location+ot,et/G.locationSize,At,W,et*Bt,et/G.locationSize*ot*Bt,K)}}else if(z!==void 0){let W=z[q];if(W!==void 0)switch(W.length){case 2:s.vertexAttrib2fv(G.location,W);break;case 3:s.vertexAttrib3fv(G.location,W);break;case 4:s.vertexAttrib4fv(G.location,W);break;default:s.vertexAttrib1fv(G.location,W)}}}}v()}function E(){b();for(let R in n){let F=n[R];for(let I in F){let C=F[I];for(let L in C){let D=C[L];for(let z in D)u(D[z].object),delete D[z];delete C[L]}}delete n[R]}}function w(R){if(n[R.id]===void 0)return;let F=n[R.id];for(let I in F){let C=F[I];for(let L in C){let D=C[L];for(let z in D)u(D[z].object),delete D[z];delete C[L]}}delete n[R.id]}function P(R){for(let F in n){let I=n[F];for(let C in I){let L=I[C];if(L[R.id]===void 0)continue;let D=L[R.id];for(let z in D)u(D[z].object),delete D[z];delete L[R.id]}}}function _(R){for(let F in n){let I=n[F],C=R.isInstancedMesh===!0?R.id:0,L=I[C];if(L!==void 0){for(let D in L){let z=L[D];for(let q in z)u(z[q].object),delete z[q];delete L[D]}delete I[C],Object.keys(I).length===0&&delete n[F]}}}function b(){M(),o=!0,r!==i&&(r=i,l(r.object))}function M(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:b,resetDefaultState:M,dispose:E,releaseStatesOfGeometry:w,releaseStatesOfObject:_,releaseStatesOfProgram:P,initAttributes:x,enableAttribute:g,disableUnusedAttributes:v}}function J0(s,t,e){let n;function i(c){n=c}function r(c,l){s.drawArrays(n,c,l),e.update(l,n,1)}function o(c,l,u){u!==0&&(s.drawArraysInstanced(n,c,l,u),e.update(l,n,u))}function a(c,l,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,u);let h=0;for(let f=0;f<u;f++)h+=l[f];e.update(h,n,1)}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function K0(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){let P=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(P){return!(P!==un&&n.convert(P)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(P){let _=P===bn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(P!==je&&P!==Mn&&!_&&n.convert(P)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function c(P){if(P==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp",u=c(l);u!==l&&(Ot("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let d=e.logarithmicDepthBuffer===!0,h=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&h===!1&&Ot("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),p=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),v=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),N=s.getParameter(s.MAX_VARYING_VECTORS),S=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),E=s.getParameter(s.MAX_SAMPLES),w=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:v,maxVaryings:N,maxFragmentUniforms:S,maxSamples:E,samples:w}}function j0(s){let t=this,e=null,n=0,i=!1,r=!1,o=new gn,a=new kt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let f=d.length!==0||h||n!==0||i;return i=h,n=d.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){e=u(d,h,0)},this.setState=function(d,h,f){let p=d.clippingPlanes,x=d.clipIntersection,g=d.clipShadows,m=s.get(d);if(!i||p===null||p.length===0||r&&!g)r?u(null):l();else{let v=r?0:n,N=v*4,S=m.clippingState||null;c.value=S,S=u(p,h,N,f);for(let E=0;E!==N;++E)S[E]=e[E];m.clippingState=S,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=v}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(d,h,f,p){let x=d!==null?d.length:0,g=null;if(x!==0){if(g=c.value,p!==!0||g===null){let m=f+x*4,v=h.matrixWorldInverse;a.getNormalMatrix(v),(g===null||g.length<m)&&(g=new Float32Array(m));for(let N=0,S=f;N!==x;++N,S+=4)o.copy(d[N]).applyMatrix4(v,a),o.normal.toArray(g,S),g[S+3]=o.constant}c.value=g,c.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,g}}var Us=4,Q0=6,tg=20,eg=256,Hr=new Ps,$u=new Ht,Vl=null,kl=0,Hl=0,Gl=!1,ng=new V,Xi=new V,ec=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,i=100,r={}){let{size:o=256,position:a=ng}=r;Vl=this._renderer.getRenderTarget(),kl=this._renderer.getActiveCubeFace(),Hl=this._renderer.getActiveMipmapLevel(),Gl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,n,i,c,a),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ju(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ku(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Vl,kl,Hl),this._renderer.xr.enabled=Gl,t.scissorTest=!1,Bs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===bi||t.mapping===Wi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Vl=this._renderer.getRenderTarget(),kl=this._renderer.getActiveCubeFace(),Hl=this._renderer.getActiveMipmapLevel(),Gl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Ve,minFilter:Ve,generateMipmaps:!1,type:bn,format:un,colorSpace:lr,depthBuffer:!1},i=Ju(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ju(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=ig(r)),this._blurMaterial=rg(r,t,e),this._ggxMaterial=sg(r,t,e)}return i}_compileMaterial(t){let e=new $t(new Oe,t);this._renderer.compile(e,Hr)}_sceneToCubeUV(t,e,n,i,r){let c=new ze(90,1,e,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,f=d.toneMapping;d.getClearColor($u),d.toneMapping=yn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(i),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new $t(new Ce,new Un({name:"PMREM.Background",side:Re,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,g=x.material,m=!1,v=t.background;v?v.isColor&&(g.color.copy(v),t.background=null,m=!0):(g.color.copy($u),m=!0);for(let N=0;N<6;N++){let S=N%3;S===0?(c.up.set(0,l[N],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[N],r.y,r.z)):S===1?(c.up.set(0,0,l[N]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[N],r.z)):(c.up.set(0,l[N],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[N]));let E=this._cubeSize;Bs(i,S*E,N>2?E:0,E,E),d.setRenderTarget(i),m&&d.render(x,c),d.render(t,c)}d.toneMapping=f,d.autoClear=h,t.background=v}_textureToCubeUV(t,e){let n=this._renderer,i=t.mapping===bi||t.mapping===Wi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=ju()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ku());let r=i?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let c=this._cubeSize;Bs(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(o,Hr)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let i=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let c=o.uniforms,l=n/(this._lodMeshes.length-1),u=e/(this._lodMeshes.length-1),d=Math.sqrt(l*l-u*u),h=l*1.25,f=d*h,{_lodMax:p}=this,x=this._sizeLods[n],g=3*x*(n>p-Us?n-p+Us:0),m=4*(this._cubeSize-x);c.envMap.value=t.texture,c.roughness.value=f,c.mipInt.value=p-e,Bs(r,g,m,3*x,2*x),i.setRenderTarget(r),i.render(a,Hr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=p-n,Bs(t,g,m,3*x,2*x),i.setRenderTarget(t),i.render(a,Hr)}_blur(t,e,n,i){let r=this._pingPongRenderTarget,o=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,o),this._blurPass(r,t,n,n,o)}_blurPass(t,e,n,i,r){let o=this._renderer,a=this._blurMaterial,c=this._lodMeshes[i];c.material=a;let l=a.uniforms;l.envMap.value=t.texture,l.sigma.value=r,l.mipInt.value=this._lodMax-n;let u=this._sizeLods[i],d=3*u*(i>this._lodMax-Us?i-this._lodMax+Us:0),h=4*(this._cubeSize-u);Bs(e,d,h,3*u,2*u),o.setRenderTarget(e),o.render(c,Hr)}};function ig(s){let t=[],e=[],n=s,i=s-Us+1+Q0;for(let r=0;r<i;r++){let o=Math.pow(2,n);t.push(o);let a=1/(o-2),c=-a,l=1+a,u=[c,c,l,c,l,l,c,c,l,l,c,l],d=6,h=6,f=3,p=new Float32Array(f*h*d),x=new Float32Array(f*h*d);for(let m=0;m<d;m++){let v=m%3*2/3-1,N=m>2?0:-1,S=[v,N,0,v+2/3,N,0,v+2/3,N+1,0,v,N,0,v+2/3,N+1,0,v,N+1,0];p.set(S,f*h*m);for(let E=0;E<h;E++){let w=u[E*2]*2-1,P=u[E*2+1]*2-1;m===0?Xi.set(1,P,w):m===1?Xi.set(-w,1,-P):m===2?Xi.set(-w,P,1):m===3?Xi.set(-1,P,-w):m===4?Xi.set(-w,-1,P):Xi.set(w,P,-1),Xi.toArray(x,(m*h+E)*f)}}let g=new Oe;g.setAttribute("position",new $e(p,f)),g.setAttribute("outputDirection",new $e(x,f)),e.push(new $t(g,null)),n>Us&&n--}return{lodMeshes:e,sizeLods:t}}function Ju(s,t,e){let n=new Ke(s,t,e);return n.texture.mapping=Nr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Bs(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function sg(s,t,e){return new sn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:eg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:sc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:zn,depthTest:!1,depthWrite:!1})}function rg(s,t,e){return new sn({name:"SphericalGaussianBlur",defines:{SAMPLES:tg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:sc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:zn,depthTest:!1,depthWrite:!1})}function Ku(){return new sn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:zn,depthTest:!1,depthWrite:!1})}function ju(){return new sn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:zn,depthTest:!1,depthWrite:!1})}function sc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var nc=class extends Ke{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new yr(i),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Ce(5,5,5),r=new sn({name:"CubemapFromEquirect",uniforms:qi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Re,blending:zn});r.uniforms.tEquirect.value=e;let o=new $t(i,r),a=e.minFilter;return e.minFilter===wi&&(e.minFilter=Ve),new aa(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,i=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(r)}};function og(s){let t=new WeakMap,e=new WeakMap,n=null;function i(h,f=!1){return h==null?null:f?o(h):r(h)}function r(h){if(h&&h.isTexture){let f=h.mapping;if(f===da||f===fa)if(t.has(h)){let p=t.get(h).texture;return a(p,h.mapping)}else{let p=h.image;if(p&&p.height>0){let x=new nc(p.height);return x.fromEquirectangularTexture(s,h),t.set(h,x),h.addEventListener("dispose",l),a(x.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture){let f=h.mapping,p=f===da||f===fa,x=f===bi||f===Wi;if(p||x){let g=e.get(h),m=g!==void 0?g.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==m)return n===null&&(n=new ec(s)),g=p?n.fromEquirectangular(h,g):n.fromCubemap(h,g),g.texture.pmremVersion=h.pmremVersion,e.set(h,g),g.texture;if(g!==void 0)return g.texture;{let v=h.image;return p&&v&&v.height>0||x&&v&&c(v)?(n===null&&(n=new ec(s)),g=p?n.fromEquirectangular(h):n.fromCubemap(h),g.texture.pmremVersion=h.pmremVersion,e.set(h,g),h.addEventListener("dispose",u),g.texture):null}}}return h}function a(h,f){return f===da?h.mapping=bi:f===fa&&(h.mapping=Wi),h}function c(h){let f=0,p=6;for(let x=0;x<p;x++)h[x]!==void 0&&f++;return f===p}function l(h){let f=h.target;f.removeEventListener("dispose",l);let p=t.get(f);p!==void 0&&(t.delete(f),p.dispose())}function u(h){let f=h.target;f.removeEventListener("dispose",u);let p=e.get(f);p!==void 0&&(e.delete(f),p.dispose())}function d(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:d}}function ag(s){let t={};function e(n){if(t[n]!==void 0)return t[n];let i=s.getExtension(n);return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let i=e(n);return i===null&&Oi("WebGLRenderer: "+n+" extension not supported."),i}}}function cg(s,t,e,n){let i={},r=new WeakMap;function o(d){let h=d.target;h.index!==null&&t.remove(h.index);for(let p in h.attributes)t.remove(h.attributes[p]);h.removeEventListener("dispose",o),delete i[h.id];let f=r.get(h);f&&(t.remove(f),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,e.memory.geometries--}function a(d,h){return i[h.id]===!0||(h.addEventListener("dispose",o),i[h.id]=!0,e.memory.geometries++),h}function c(d){let h=d.attributes;for(let f in h)t.update(h[f],s.ARRAY_BUFFER)}function l(d){let h=[],f=d.index,p=d.attributes.position,x=0;if(p===void 0)return;if(f!==null){let v=f.array;x=f.version;for(let N=0,S=v.length;N<S;N+=3){let E=v[N+0],w=v[N+1],P=v[N+2];h.push(E,w,w,P,P,E)}}else{let v=p.array;x=p.version;for(let N=0,S=v.length/3-1;N<S;N+=3){let E=N+0,w=N+1,P=N+2;h.push(E,w,w,P,P,E)}}let g=new(p.count>=65535?xr:gr)(h,1);g.version=x;let m=r.get(d);m&&t.remove(m),r.set(d,g)}function u(d){let h=r.get(d);if(h){let f=d.index;f!==null&&h.version<f.version&&l(d)}else l(d);return r.get(d)}return{get:a,update:c,getWireframeAttribute:u}}function lg(s,t,e){let n;function i(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,h){s.drawElements(n,h,r,d*o),e.update(h,n,1)}function l(d,h,f){f!==0&&(s.drawElementsInstanced(n,h,r,d*o,f),e.update(h,n,f))}function u(d,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,d,0,f);let x=0;for(let g=0;g<f;g++)x+=h[g];e.update(x,n,1)}this.setMode=i,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function hg(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:Ut("WebGLInfo: Unknown draw mode:",o);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function ug(s,t,e){let n=new WeakMap,i=new ve;function r(o,a,c){let l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0,h=n.get(a);if(h===void 0||h.count!==d){let b=function(){P.dispose(),n.delete(a),a.removeEventListener("dispose",b)};h!==void 0&&h.texture.dispose();let f=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],v=a.morphAttributes.color||[],N=0;f===!0&&(N=1),p===!0&&(N=2),x===!0&&(N=3);let S=a.attributes.position.count*N,E=1;S>t.maxTextureSize&&(E=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);let w=new Float32Array(S*E*4*d),P=new fr(w,S,E,d);P.type=Mn,P.needsUpdate=!0;let _=N*4;for(let M=0;M<d;M++){let R=g[M],F=m[M],I=v[M],C=S*E*4*M;for(let L=0;L<R.count;L++){let D=L*_;f===!0&&(i.fromBufferAttribute(R,L),w[C+D+0]=i.x,w[C+D+1]=i.y,w[C+D+2]=i.z,w[C+D+3]=0),p===!0&&(i.fromBufferAttribute(F,L),w[C+D+4]=i.x,w[C+D+5]=i.y,w[C+D+6]=i.z,w[C+D+7]=0),x===!0&&(i.fromBufferAttribute(I,L),w[C+D+8]=i.x,w[C+D+9]=i.y,w[C+D+10]=i.z,w[C+D+11]=I.itemSize===4?i.w:1)}}h={count:d,texture:P,size:new Vt(S,E)},n.set(a,h),a.addEventListener("dispose",b)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let f=0;for(let x=0;x<l.length;x++)f+=l[x];let p=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(s,"morphTargetBaseInfluence",p),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",h.texture,e),c.getUniforms().setValue(s,"morphTargetsTextureSize",h.size)}return{update:r}}function dg(s,t,e,n,i){let r=new WeakMap;function o(l){let u=i.render.frame,d=l.geometry,h=t.get(l,d);if(r.get(h)!==u&&(t.update(h),r.set(h,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return h}function a(){r=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),n.releaseStatesOfObject(u),e.remove(u.instanceMatrix),u.instanceColor!==null&&e.remove(u.instanceColor)}return{update:o,dispose:a}}var fg={[pl]:"LINEAR_TONE_MAPPING",[ml]:"REINHARD_TONE_MAPPING",[gl]:"CINEON_TONE_MAPPING",[xl]:"ACES_FILMIC_TONE_MAPPING",[vl]:"AGX_TONE_MAPPING",[yl]:"NEUTRAL_TONE_MAPPING",[_l]:"CUSTOM_TONE_MAPPING"};function pg(s,t,e,n,i,r){let o=new Ke(t,e,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,c=null,l=new Oe;l.setAttribute("position",new ge([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new ge([0,2,0,0,2,0],2));let u=new Zo({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new $t(l,u),h=new Ps(-1,1,1,-1,0,1),f=null,p=null,x=!1,g,m=null,v=[],N=!1;this.setSize=function(S,E){o.setSize(S,E),a!==null&&a.setSize(S,E),c!==null&&c.setSize(S,E);for(let w=0;w<v.length;w++){let P=v[w];P.setSize&&P.setSize(S,E)}},this.setEffects=function(S){v=S,N=v.length>0&&v[0].isRenderPass===!0;let E=o.width,w=o.height;v.length>0&&a===null&&(a=new Ke(E,w,{type:bn,depthBuffer:!1,stencilBuffer:!1}),c=new Ke(E,w,{type:bn,depthBuffer:!1,stencilBuffer:!1}));for(let P=0;P<v.length;P++){let _=v[P];_.setSize&&_.setSize(E,w)}},this.begin=function(S,E){if(x||S.toneMapping===yn&&v.length===0)return!1;if(m=E,E!==null){let w=E.width,P=E.height;(o.width!==w||o.height!==P)&&this.setSize(w,P)}return N===!1&&S.setRenderTarget(o),g=S.toneMapping,S.toneMapping=yn,!0},this.hasRenderPass=function(){return N},this.end=function(S,E){S.toneMapping=g,x=!0;let w=o,P=a;for(let _=0;_<v.length;_++){let b=v[_];b.enabled!==!1&&(b.render(S,P,w,E),b.needsSwap!==!1&&(w=P,P=P===a?c:a))}if(f!==S.outputColorSpace||p!==S.toneMapping){f=S.outputColorSpace,p=S.toneMapping,u.defines={},Jt.getTransfer(f)===se&&(u.defines.SRGB_TRANSFER="");let _=fg[p];_&&(u.defines[_]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=w.texture,S.setRenderTarget(m),S.render(d,h),m=null,x=!1},this.isCompositing=function(){return x},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var _d=new Je,Xl=new _i(1,1),vd=new fr,yd=new Ho,Sd=new yr,Qu=[],td=[],ed=new Float32Array(16),nd=new Float32Array(9),id=new Float32Array(4);function zs(s,t,e){let n=s[0];if(n<=0||n>0)return s;let i=t*e,r=Qu[i];if(r===void 0&&(r=new Float32Array(i),Qu[i]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function Ie(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function Pe(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function rc(s,t){let e=td[t];e===void 0&&(e=new Int32Array(t),td[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function mg(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function gg(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ie(e,t))return;s.uniform2fv(this.addr,t),Pe(e,t)}}function xg(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ie(e,t))return;s.uniform3fv(this.addr,t),Pe(e,t)}}function _g(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ie(e,t))return;s.uniform4fv(this.addr,t),Pe(e,t)}}function vg(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ie(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Pe(e,t)}else{if(Ie(e,n))return;id.set(n),s.uniformMatrix2fv(this.addr,!1,id),Pe(e,n)}}function yg(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ie(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Pe(e,t)}else{if(Ie(e,n))return;nd.set(n),s.uniformMatrix3fv(this.addr,!1,nd),Pe(e,n)}}function Sg(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ie(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Pe(e,t)}else{if(Ie(e,n))return;ed.set(n),s.uniformMatrix4fv(this.addr,!1,ed),Pe(e,n)}}function Mg(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function bg(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ie(e,t))return;s.uniform2iv(this.addr,t),Pe(e,t)}}function wg(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ie(e,t))return;s.uniform3iv(this.addr,t),Pe(e,t)}}function Eg(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ie(e,t))return;s.uniform4iv(this.addr,t),Pe(e,t)}}function Tg(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function Ag(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ie(e,t))return;s.uniform2uiv(this.addr,t),Pe(e,t)}}function Cg(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ie(e,t))return;s.uniform3uiv(this.addr,t),Pe(e,t)}}function Rg(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ie(e,t))return;s.uniform4uiv(this.addr,t),Pe(e,t)}}function Ig(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Xl.compareFunction=e.isReversedDepthBuffer()?ja:Ka,r=Xl):r=_d,e.setTexture2D(t||r,i)}function Pg(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||yd,i)}function Lg(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||Sd,i)}function Ng(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||vd,i)}function Fg(s){switch(s){case 5126:return mg;case 35664:return gg;case 35665:return xg;case 35666:return _g;case 35674:return vg;case 35675:return yg;case 35676:return Sg;case 5124:case 35670:return Mg;case 35667:case 35671:return bg;case 35668:case 35672:return wg;case 35669:case 35673:return Eg;case 5125:return Tg;case 36294:return Ag;case 36295:return Cg;case 36296:return Rg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ig;case 35679:case 36299:case 36307:return Pg;case 35680:case 36300:case 36308:case 36293:return Lg;case 36289:case 36303:case 36311:case 36292:return Ng}}function Dg(s,t){s.uniform1fv(this.addr,t)}function Bg(s,t){let e=zs(t,this.size,2);s.uniform2fv(this.addr,e)}function Ug(s,t){let e=zs(t,this.size,3);s.uniform3fv(this.addr,e)}function Og(s,t){let e=zs(t,this.size,4);s.uniform4fv(this.addr,e)}function zg(s,t){let e=zs(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function Vg(s,t){let e=zs(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function kg(s,t){let e=zs(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function Hg(s,t){s.uniform1iv(this.addr,t)}function Gg(s,t){s.uniform2iv(this.addr,t)}function Wg(s,t){s.uniform3iv(this.addr,t)}function qg(s,t){s.uniform4iv(this.addr,t)}function Xg(s,t){s.uniform1uiv(this.addr,t)}function Yg(s,t){s.uniform2uiv(this.addr,t)}function Zg(s,t){s.uniform3uiv(this.addr,t)}function $g(s,t){s.uniform4uiv(this.addr,t)}function Jg(s,t,e){let n=this.cache,i=t.length,r=rc(e,i);Ie(n,r)||(s.uniform1iv(this.addr,r),Pe(n,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=Xl:o=_d;for(let a=0;a!==i;++a)e.setTexture2D(t[a]||o,r[a])}function Kg(s,t,e){let n=this.cache,i=t.length,r=rc(e,i);Ie(n,r)||(s.uniform1iv(this.addr,r),Pe(n,r));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||yd,r[o])}function jg(s,t,e){let n=this.cache,i=t.length,r=rc(e,i);Ie(n,r)||(s.uniform1iv(this.addr,r),Pe(n,r));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||Sd,r[o])}function Qg(s,t,e){let n=this.cache,i=t.length,r=rc(e,i);Ie(n,r)||(s.uniform1iv(this.addr,r),Pe(n,r));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||vd,r[o])}function tx(s){switch(s){case 5126:return Dg;case 35664:return Bg;case 35665:return Ug;case 35666:return Og;case 35674:return zg;case 35675:return Vg;case 35676:return kg;case 5124:case 35670:return Hg;case 35667:case 35671:return Gg;case 35668:case 35672:return Wg;case 35669:case 35673:return qg;case 5125:return Xg;case 36294:return Yg;case 36295:return Zg;case 36296:return $g;case 35678:case 36198:case 36298:case 36306:case 35682:return Jg;case 35679:case 36299:case 36307:return Kg;case 35680:case 36300:case 36308:case 36293:return jg;case 36289:case 36303:case 36311:case 36292:return Qg}}var Yl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Fg(e.type)}},Zl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=tx(e.type)}},$l=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let i=this.seq;for(let r=0,o=i.length;r!==o;++r){let a=i[r];a.setValue(t,e[a.id],n)}}},Wl=/(\w+)(\])?(\[|\.)?/g;function sd(s,t){s.seq.push(t),s.map[t.id]=t}function ex(s,t,e){let n=s.name,i=n.length;for(Wl.lastIndex=0;;){let r=Wl.exec(n),o=Wl.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===i){sd(e,l===void 0?new Yl(a,s,t):new Zl(a,s,t));break}else{let d=e.map[a];d===void 0&&(d=new $l(a),sd(e,d)),e=d}}}var Os=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),c=t.getUniformLocation(e,a.name);ex(a,c,this)}let i=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?i.push(o):r.push(o);i.length>0&&(this.seq=i.concat(r))}setValue(t,e,n,i){let r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){let i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,o=e.length;r!==o;++r){let a=e[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,i)}}static seqWithValue(t,e){let n=[];for(let i=0,r=t.length;i!==r;++i){let o=t[i];o.id in e&&n.push(o)}return n}};function rd(s,t,e){let n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}var nx=37297,ix=0;function sx(s,t){let e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=i;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var od=new kt;function rx(s){Jt._getMatrix(od,Jt.workingColorSpace,s);let t=`mat3( ${od.elements.map(e=>e.toFixed(4))} )`;switch(Jt.getTransfer(s)){case hr:return[t,"LinearTransferOETF"];case se:return[t,"sRGBTransferOETF"];default:return Ot("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function ad(s,t,e){let n=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+sx(s.getShaderSource(t),a)}else return r}function ox(s,t){let e=rx(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var ax={[pl]:"Linear",[ml]:"Reinhard",[gl]:"Cineon",[xl]:"ACESFilmic",[vl]:"AgX",[yl]:"Neutral",[_l]:"Custom"};function cx(s,t){let e=ax[t];return e===void 0?(Ot("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var tc=new V;function lx(){Jt.getLuminanceCoefficients(tc);let s=tc.x.toFixed(4),t=tc.y.toFixed(4),e=tc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function hx(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Wr).join(`
`)}function ux(s){let t=[];for(let e in s){let n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function dx(s,t){let e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(t,i),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function Wr(s){return s!==""}function cd(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ld(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var fx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Jl(s){return s.replace(fx,mx)}var px=new Map;function mx(s,t){let e=qt[t];if(e===void 0){let n=px.get(t);if(n!==void 0)e=qt[n],Ot('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Jl(e)}var gx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hd(s){return s.replace(gx,xx)}function xx(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function ud(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var _x={[Lr]:"SHADOWMAP_TYPE_PCF",[Ls]:"SHADOWMAP_TYPE_VSM"};function vx(s){return _x[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var yx={[bi]:"ENVMAP_TYPE_CUBE",[Wi]:"ENVMAP_TYPE_CUBE",[Nr]:"ENVMAP_TYPE_CUBE_UV"};function Sx(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":yx[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var Mx={[Wi]:"ENVMAP_MODE_REFRACTION"};function bx(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":Mx[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var wx={[ua]:"ENVMAP_BLENDING_MULTIPLY",[Cu]:"ENVMAP_BLENDING_MIX",[Ru]:"ENVMAP_BLENDING_ADD"};function Ex(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":wx[s.combine]||"ENVMAP_BLENDING_NONE"}function Tx(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Ax(s,t,e,n){let i=s.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,c=vx(e),l=Sx(e),u=bx(e),d=Ex(e),h=Tx(e),f=hx(e),p=ux(r),x=i.createProgram(),g,m,v=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(Wr).join(`
`),g.length>0&&(g+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(Wr).join(`
`),m.length>0&&(m+=`
`)):(g=[ud(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Wr).join(`
`),m=[ud(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+u:"",e.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==yn?"#define TONE_MAPPING":"",e.toneMapping!==yn?qt.tonemapping_pars_fragment:"",e.toneMapping!==yn?cx("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,ox("linearToOutputTexel",e.outputColorSpace),lx(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Wr).join(`
`)),o=Jl(o),o=cd(o,e),o=ld(o,e),a=Jl(a),a=cd(a,e),a=ld(a,e),o=hd(o),a=hd(a),e.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,m=["#define varying in",e.glslVersion===Il?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Il?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let N=v+g+o,S=v+m+a,E=rd(i,i.VERTEX_SHADER,N),w=rd(i,i.FRAGMENT_SHADER,S);i.attachShader(x,E),i.attachShader(x,w),e.index0AttributeName!==void 0?i.bindAttribLocation(x,0,e.index0AttributeName):e.hasPositionAttribute===!0&&i.bindAttribLocation(x,0,"position"),i.linkProgram(x);function P(R){if(s.debug.checkShaderErrors){let F=i.getProgramInfoLog(x)||"",I=i.getShaderInfoLog(E)||"",C=i.getShaderInfoLog(w)||"",L=F.trim(),D=I.trim(),z=C.trim(),q=!0,G=!0;if(i.getProgramParameter(x,i.LINK_STATUS)===!1)if(q=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,x,E,w);else{let Z=ad(i,E,"vertex"),W=ad(i,w,"fragment");Ut("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(x,i.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+L+`
`+Z+`
`+W)}else L!==""?Ot("WebGLProgram: Program Info Log:",L):(D===""||z==="")&&(G=!1);G&&(R.diagnostics={runnable:q,programLog:L,vertexShader:{log:D,prefix:g},fragmentShader:{log:z,prefix:m}})}i.deleteShader(E),i.deleteShader(w),_=new Os(i,x),b=dx(i,x)}let _;this.getUniforms=function(){return _===void 0&&P(this),_};let b;this.getAttributes=function(){return b===void 0&&P(this),b};let M=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=i.getProgramParameter(x,nx)),M},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=ix++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=E,this.fragmentShader=w,this}var Cx=0,Kl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let i=this._getShaderCacheForMaterial(t);return i.has(e)===!1&&(i.add(e),e.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new jl(t),e.set(t,n)),n}},jl=class{constructor(t){this.id=Cx++,this.code=t,this.usedTimes=0}};function Rx(s){return s===Ti||s===zr||s===Vr}function Ix(s,t,e,n,i,r){let o=new Es,a=new Kl,c=new Set,l=[],u=new Map,d=n.logarithmicDepthBuffer,h=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(_){return c.add(_),_===0?"uv":`uv${_}`}function x(_,b,M,R,F,I){let C=R.fog,L=F.geometry,D=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?R.environment:null,z=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,q=t.get(_.envMap||D,z),G=q&&q.mapping===Nr?q.image.height:null,Z=f[_.type];_.precision!==null&&(h=n.getMaxPrecision(_.precision),h!==_.precision&&Ot("WebGLProgram.getParameters:",_.precision,"not supported, using",h,"instead."));let W=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,et=W!==void 0?W.length:0,ut=0;L.morphAttributes.position!==void 0&&(ut=1),L.morphAttributes.normal!==void 0&&(ut=2),L.morphAttributes.color!==void 0&&(ut=3);let Ft,At,Bt,K;if(Z){let Qt=kn[Z];Ft=Qt.vertexShader,At=Qt.fragmentShader}else{Ft=_.vertexShader,At=_.fragmentShader;let Qt=a.getVertexShaderStage(_),Rt=a.getFragmentShaderStage(_);a.update(_,Qt,Rt),Bt=Qt.id,K=Rt.id}let ot=s.getRenderTarget(),vt=s.state.buffers.depth.getReversed(),Dt=F.isInstancedMesh===!0,xt=F.isBatchedMesh===!0,zt=!!_.map,ye=!!_.matcap,Gt=!!q,Kt=!!_.aoMap,ne=!!_.lightMap,Yt=!!_.bumpMap&&_.wireframe===!1,he=!!_.normalMap,we=!!_.displacementMap,Ne=!!_.emissiveMap,ue=!!_.metalnessMap,Me=!!_.roughnessMap,H=_.anisotropy>0,Fe=_.clearcoat>0,ee=_.dispersion>0,U=_.retroreflectivity>0,y=_.iridescence>0,X=_.sheen>0,j=_.transmission>0,it=H&&!!_.anisotropyMap,dt=Fe&&!!_.clearcoatMap,ft=Fe&&!!_.clearcoatNormalMap,st=Fe&&!!_.clearcoatRoughnessMap,ct=y&&!!_.iridescenceMap,pt=y&&!!_.iridescenceThicknessMap,Lt=X&&!!_.sheenColorMap,gt=X&&!!_.sheenRoughnessMap,mt=!!_.specularMap,B=!!_.specularColorMap,Y=!!_.specularIntensityMap,rt=j&&!!_.transmissionMap,O=j&&!!_.thicknessMap,nt=!!_.gradientMap,Q=!!_.alphaMap,lt=_.alphaTest>0,ht=!!_.alphaHash,at=!!_.extensions,Ct=yn;_.toneMapped&&(ot===null||ot.isXRRenderTarget===!0)&&(Ct=s.toneMapping);let bt={shaderID:Z,shaderType:_.type,shaderName:_.name,vertexShader:Ft,fragmentShader:At,defines:_.defines,customVertexShaderID:Bt,customFragmentShaderID:K,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:h,batching:xt,batchingColor:xt&&F._colorsTexture!==null,instancing:Dt,instancingColor:Dt&&F.instanceColor!==null,instancingMorph:Dt&&F.morphTexture!==null,outputColorSpace:ot===null?s.outputColorSpace:ot.isXRRenderTarget===!0?ot.texture.colorSpace:Jt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:zt,matcap:ye,envMap:Gt,envMapMode:Gt&&q.mapping,envMapCubeUVHeight:G,aoMap:Kt,lightMap:ne,bumpMap:Yt,normalMap:he,displacementMap:we,emissiveMap:Ne,normalMapObjectSpace:he&&_.normalMapType===Lu,normalMapTangentSpace:he&&_.normalMapType===kr,packedNormalMap:he&&_.normalMapType===kr&&Rx(_.normalMap.format),metalnessMap:ue,roughnessMap:Me,anisotropy:H,anisotropyMap:it,clearcoat:Fe,clearcoatMap:dt,clearcoatNormalMap:ft,clearcoatRoughnessMap:st,dispersion:ee,retroreflection:U,iridescence:y,iridescenceMap:ct,iridescenceThicknessMap:pt,sheen:X,sheenColorMap:Lt,sheenRoughnessMap:gt,specularMap:mt,specularColorMap:B,specularIntensityMap:Y,transmission:j,transmissionMap:rt,thicknessMap:O,gradientMap:nt,opaque:_.transparent===!1&&_.blending===Ns&&_.alphaToCoverage===!1,alphaMap:Q,alphaTest:lt,alphaHash:ht,combine:_.combine,mapUv:zt&&p(_.map.channel),aoMapUv:Kt&&p(_.aoMap.channel),lightMapUv:ne&&p(_.lightMap.channel),bumpMapUv:Yt&&p(_.bumpMap.channel),normalMapUv:he&&p(_.normalMap.channel),displacementMapUv:we&&p(_.displacementMap.channel),emissiveMapUv:Ne&&p(_.emissiveMap.channel),metalnessMapUv:ue&&p(_.metalnessMap.channel),roughnessMapUv:Me&&p(_.roughnessMap.channel),anisotropyMapUv:it&&p(_.anisotropyMap.channel),clearcoatMapUv:dt&&p(_.clearcoatMap.channel),clearcoatNormalMapUv:ft&&p(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:st&&p(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ct&&p(_.iridescenceMap.channel),iridescenceThicknessMapUv:pt&&p(_.iridescenceThicknessMap.channel),sheenColorMapUv:Lt&&p(_.sheenColorMap.channel),sheenRoughnessMapUv:gt&&p(_.sheenRoughnessMap.channel),specularMapUv:mt&&p(_.specularMap.channel),specularColorMapUv:B&&p(_.specularColorMap.channel),specularIntensityMapUv:Y&&p(_.specularIntensityMap.channel),transmissionMapUv:rt&&p(_.transmissionMap.channel),thicknessMapUv:O&&p(_.thicknessMap.channel),alphaMapUv:Q&&p(_.alphaMap.channel),vertexTangents:!!L.attributes.tangent&&(he||H),vertexNormals:!!L.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!L.attributes.uv&&(zt||Q),fog:!!C,useFog:_.fog===!0,fogExp2:!!C&&C.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||L.attributes.normal===void 0&&he===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:vt,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:L.attributes.position!==void 0,morphTargets:L.morphAttributes.position!==void 0,morphNormals:L.morphAttributes.normal!==void 0,morphColors:L.morphAttributes.color!==void 0,morphTargetsCount:et,morphTextureStride:ut,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:I.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:s.shadowMap.enabled&&M.length>0,shadowMapType:s.shadowMap.type,toneMapping:Ct,decodeVideoTexture:zt&&_.map.isVideoTexture===!0&&Jt.getTransfer(_.map.colorSpace)===se,decodeVideoTextureEmissive:Ne&&_.emissiveMap.isVideoTexture===!0&&Jt.getTransfer(_.emissiveMap.colorSpace)===se,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===On,flipSided:_.side===Re,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:at&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(at&&_.extensions.multiDraw===!0||xt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return bt.vertexUv1s=c.has(1),bt.vertexUv2s=c.has(2),bt.vertexUv3s=c.has(3),c.clear(),bt}function g(_){let b=[];if(_.shaderID?b.push(_.shaderID):(b.push(_.customVertexShaderID),b.push(_.customFragmentShaderID)),_.defines!==void 0)for(let M in _.defines)b.push(M),b.push(_.defines[M]);return _.isRawShaderMaterial===!1&&(m(b,_),v(b,_),b.push(s.outputColorSpace)),b.push(_.customProgramCacheKey),b.join()}function m(_,b){_.push(b.precision),_.push(b.outputColorSpace),_.push(b.envMapMode),_.push(b.envMapCubeUVHeight),_.push(b.mapUv),_.push(b.alphaMapUv),_.push(b.lightMapUv),_.push(b.aoMapUv),_.push(b.bumpMapUv),_.push(b.normalMapUv),_.push(b.displacementMapUv),_.push(b.emissiveMapUv),_.push(b.metalnessMapUv),_.push(b.roughnessMapUv),_.push(b.anisotropyMapUv),_.push(b.clearcoatMapUv),_.push(b.clearcoatNormalMapUv),_.push(b.clearcoatRoughnessMapUv),_.push(b.iridescenceMapUv),_.push(b.iridescenceThicknessMapUv),_.push(b.sheenColorMapUv),_.push(b.sheenRoughnessMapUv),_.push(b.specularMapUv),_.push(b.specularColorMapUv),_.push(b.specularIntensityMapUv),_.push(b.transmissionMapUv),_.push(b.thicknessMapUv),_.push(b.combine),_.push(b.fogExp2),_.push(b.sizeAttenuation),_.push(b.morphTargetsCount),_.push(b.morphAttributeCount),_.push(b.numSunLights),_.push(b.numDirLights),_.push(b.numPointLights),_.push(b.numSpotLights),_.push(b.numSpotLightMaps),_.push(b.numHemiLights),_.push(b.numRectAreaLights),_.push(b.numSunLightShadows),_.push(b.numDirLightShadows),_.push(b.numPointLightShadows),_.push(b.numSpotLightShadows),_.push(b.numSpotLightShadowsWithMaps),_.push(b.numLightProbes),_.push(b.shadowMapType),_.push(b.toneMapping),_.push(b.numClippingPlanes),_.push(b.numClipIntersection),_.push(b.depthPacking)}function v(_,b){o.disableAll(),b.instancing&&o.enable(0),b.instancingColor&&o.enable(1),b.instancingMorph&&o.enable(2),b.matcap&&o.enable(3),b.envMap&&o.enable(4),b.normalMapObjectSpace&&o.enable(5),b.normalMapTangentSpace&&o.enable(6),b.clearcoat&&o.enable(7),b.iridescence&&o.enable(8),b.alphaTest&&o.enable(9),b.vertexColors&&o.enable(10),b.vertexAlphas&&o.enable(11),b.vertexUv1s&&o.enable(12),b.vertexUv2s&&o.enable(13),b.vertexUv3s&&o.enable(14),b.vertexTangents&&o.enable(15),b.anisotropy&&o.enable(16),b.alphaHash&&o.enable(17),b.batching&&o.enable(18),b.dispersion&&o.enable(19),b.retroreflection&&o.enable(24),b.batchingColor&&o.enable(20),b.gradientMap&&o.enable(21),b.packedNormalMap&&o.enable(22),b.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),b.numLightProbeGrids>0&&o.enable(22),b.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function N(_){let b=f[_.type],M;if(b){let R=kn[b];M=Xu.clone(R.uniforms)}else M=_.uniforms;return M}function S(_,b){let M=u.get(b);return M!==void 0?++M.usedTimes:(M=new Ax(s,b,_,i),l.push(M),u.set(b,M)),M}function E(_){if(--_.usedTimes===0){let b=l.indexOf(_);l[b]=l[l.length-1],l.pop(),u.delete(_.cacheKey),_.destroy()}}function w(_){a.remove(_)}function P(){a.dispose()}return{getParameters:x,getProgramCacheKey:g,getUniforms:N,acquireProgram:S,releaseProgram:E,releaseShaderCache:w,programs:l,dispose:P}}function Px(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,c){s.get(o)[a]=c}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function Lx(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function dd(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function fd(){let s=[],t=0,e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function o(h){let f=0;return h.isInstancedMesh&&(f+=2),h.isSkinnedMesh&&(f+=1),f}function a(h,f,p,x,g,m){let v=s[t];return v===void 0?(v={id:h.id,object:h,geometry:f,material:p,materialVariant:o(h),groupOrder:x,renderOrder:h.renderOrder,z:g,group:m},s[t]=v):(v.id=h.id,v.object=h,v.geometry=f,v.material=p,v.materialVariant=o(h),v.groupOrder=x,v.renderOrder=h.renderOrder,v.z=g,v.group=m),t++,v}function c(h,f,p,x,g,m,v){v.reversedDepth===!0&&(g=-g);let N=a(h,f,p,x,g,m);p.transmission>0?n.push(N):p.transparent===!0?i.push(N):e.push(N)}function l(h,f,p,x,g,m){let v=a(h,f,p,x,g,m);p.transmission>0?n.unshift(v):p.transparent===!0?i.unshift(v):e.unshift(v)}function u(h,f){e.length>1&&e.sort(h||Lx),n.length>1&&n.sort(f||dd),i.length>1&&i.sort(f||dd)}function d(){for(let h=t,f=s.length;h<f;h++){let p=s[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:c,unshift:l,finish:d,sort:u}}function Nx(){let s=new WeakMap;function t(n,i){let r=s.get(n),o;return r===void 0?(o=new fd,s.set(n,[o])):i>=r.length?(o=new fd,r.push(o)):o=r[i],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function Fx(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new V,color:new Ht};break;case"SpotLight":e={position:new V,direction:new V,color:new Ht,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new V,color:new Ht,distance:0,decay:0};break;case"HemisphereLight":e={direction:new V,skyColor:new Ht,groundColor:new Ht};break;case"RectAreaLight":e={color:new Ht,position:new V,halfWidth:new V,halfHeight:new V};break}return s[t.id]=e,e}}}function Dx(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Vt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Vt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Vt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var Bx=0;function Ux(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function Ox(s){let t=new Fx,e=Dx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new V);let i=new V,r=new fe,o=new fe;function a(l){let u=0,d=0,h=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let f=0,p=0,x=0,g=0,m=0,v=0,N=0,S=0,E=0,w=0,P=0,_=0,b=0,M=0;l.sort(Ux);for(let F=0,I=l.length;F<I;F++){let C=l[F],L=C.color,D=C.intensity,z=C.distance,q=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===Ti?q=C.shadow.map.texture:q=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)u+=L.r*D,d+=L.g*D,h+=L.b*D;else if(C.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(C.sh.coefficients[G],D);M++}else if(C.isSunLight){let G=t.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let Z=C.shadow,W=e.get(C);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize.copy(Z.mapSize).multiply(Z.getFrameExtents()),n.sunShadow[p]=W,n.sunShadowMap[p]=q;let et=Z.getViewportCount();for(let ut=0;ut<et;ut++)n.sunShadowMatrix[x+ut]=Z.getMatrix(ut),n.sunShadowCascade[x+ut]=Z._cascadeData[ut];x+=et,p++}n.sun[f]=G,f++}else if(C.isDirectionalLight){let G=t.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let Z=C.shadow,W=e.get(C);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,n.directionalShadow[g]=W,n.directionalShadowMap[g]=q,n.directionalShadowMatrix[g]=C.shadow.matrix,E++}n.directional[g]=G,g++}else if(C.isSpotLight){let G=t.get(C);G.position.setFromMatrixPosition(C.matrixWorld),G.color.copy(L).multiplyScalar(D),G.distance=z,G.coneCos=Math.cos(C.angle),G.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),G.decay=C.decay,n.spot[v]=G;let Z=C.shadow;if(C.map&&(n.spotLightMap[_]=C.map,_++,Z.updateMatrices(C),C.castShadow&&b++),n.spotLightMatrix[v]=Z.matrix,C.castShadow){let W=e.get(C);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,n.spotShadow[v]=W,n.spotShadowMap[v]=q,P++}v++}else if(C.isRectAreaLight){let G=t.get(C);G.color.copy(L).multiplyScalar(D),G.halfWidth.set(C.width*.5,0,0),G.halfHeight.set(0,C.height*.5,0),n.rectArea[N]=G,N++}else if(C.isPointLight){let G=t.get(C);if(G.color.copy(C.color).multiplyScalar(C.intensity),G.distance=C.distance,G.decay=C.decay,C.castShadow){let Z=C.shadow,W=e.get(C);W.shadowIntensity=Z.intensity,W.shadowBias=Z.bias,W.shadowNormalBias=Z.normalBias,W.shadowRadius=Z.radius,W.shadowMapSize=Z.mapSize,W.shadowCameraNear=Z.camera.near,W.shadowCameraFar=Z.camera.far,n.pointShadow[m]=W,n.pointShadowMap[m]=q,n.pointShadowMatrix[m]=C.shadow.matrix,w++}n.point[m]=G,m++}else if(C.isHemisphereLight){let G=t.get(C);G.skyColor.copy(C.color).multiplyScalar(D),G.groundColor.copy(C.groundColor).multiplyScalar(D),n.hemi[S]=G,S++}}N>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=_t.LTC_FLOAT_1,n.rectAreaLTC2=_t.LTC_FLOAT_2):(n.rectAreaLTC1=_t.LTC_HALF_1,n.rectAreaLTC2=_t.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;let R=n.hash;(R.sunLength!==f||R.directionalLength!==g||R.pointLength!==m||R.spotLength!==v||R.rectAreaLength!==N||R.hemiLength!==S||R.numSunShadows!==p||R.numDirectionalShadows!==E||R.numPointShadows!==w||R.numSpotShadows!==P||R.numSpotMaps!==_||R.numLightProbes!==M)&&(n.sun.length=f,n.directional.length=g,n.spot.length=v,n.rectArea.length=N,n.point.length=m,n.hemi.length=S,n.sunShadow.length=p,n.sunShadowMap.length=p,n.sunShadowMatrix.length=x,n.sunShadowCascade.length=x,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=w,n.pointShadowMap.length=w,n.pointShadowMatrix.length=w,n.spotShadow.length=P,n.spotShadowMap.length=P,n.spotLightMatrix.length=P+_-b,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=b,n.numLightProbes=M,R.sunLength=f,R.directionalLength=g,R.pointLength=m,R.spotLength=v,R.rectAreaLength=N,R.hemiLength=S,R.numSunShadows=p,R.numDirectionalShadows=E,R.numPointShadows=w,R.numSpotShadows=P,R.numSpotMaps=_,R.numLightProbes=M,n.version=Bx++)}function c(l,u){let d=0,h=0,f=0,p=0,x=0,g=0,m=u.matrixWorldInverse;for(let v=0,N=l.length;v<N;v++){let S=l[v];if(S.isSunLight){let E=n.sun[d];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(m),d++}else if(S.isDirectionalLight){let E=n.directional[h];E.direction.setFromMatrixPosition(S.matrixWorld),i.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(i),E.direction.transformDirection(m),h++}else if(S.isSpotLight){let E=n.spot[p];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(m),E.direction.setFromMatrixPosition(S.matrixWorld),i.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(i),E.direction.transformDirection(m),p++}else if(S.isRectAreaLight){let E=n.rectArea[x];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(m),o.identity(),r.copy(S.matrixWorld),r.premultiply(m),o.extractRotation(r),E.halfWidth.set(S.width*.5,0,0),E.halfHeight.set(0,S.height*.5,0),E.halfWidth.applyMatrix4(o),E.halfHeight.applyMatrix4(o),x++}else if(S.isPointLight){let E=n.point[f];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(m),f++}else if(S.isHemisphereLight){let E=n.hemi[g];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(m),g++}}}return{setup:a,setupView:c,state:n}}function pd(s){let t=new Ox(s),e=[],n=[],i=[];function r(h){d.camera=h,e.length=0,n.length=0,i.length=0}function o(h){e.push(h)}function a(h){n.push(h)}function c(h){i.push(h)}function l(){t.setup(e)}function u(h){t.setupView(e,h)}let d={lightsArray:e,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function zx(s){let t=new WeakMap;function e(i,r=0){let o=t.get(i),a;return o===void 0?(a=new pd(s),t.set(i,[a])):r>=o.length?(a=new pd(s),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var Vx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,kx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Hx=[new V(1,0,0),new V(-1,0,0),new V(0,1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1)],Gx=[new V(0,-1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1),new V(0,-1,0),new V(0,-1,0)],md=new fe,Gr=new V,ql=new V;function Wx(s,t,e){let n=new Cs,i=new Vt,r=new Vt,o=new ve,a=new $o,c=new Jo,l={},u=e.maxTextureSize,d={[Mi]:Re,[Re]:Mi,[On]:On},h=new sn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Vt},radius:{value:4}},vertexShader:Vx,fragmentShader:kx}),f=h.clone();f.defines.HORIZONTAL_PASS=1;let p=new Oe;p.setAttribute("position",new $e(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new $t(p,h),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Lr;let m=this.type;this.render=function(w,P,_){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||w.length===0)return;this.type===ha&&(Ot("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Lr);let b=s.getRenderTarget(),M=s.getActiveCubeFace(),R=s.getActiveMipmapLevel(),F=s.state;F.setBlending(zn),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let I=m!==this.type;I&&P.traverse(function(C){C.material&&(Array.isArray(C.material)?C.material.forEach(L=>L.needsUpdate=!0):C.material.needsUpdate=!0)});for(let C=0,L=w.length;C<L;C++){let D=w[C],z=D.shadow;if(z===void 0){Ot("WebGLShadowMap:",D,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;i.copy(z.mapSize);let q=z.getFrameExtents();i.multiply(q),r.copy(z.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(r.x=Math.floor(u/q.x),i.x=r.x*q.x,z.mapSize.x=r.x),i.y>u&&(r.y=Math.floor(u/q.y),i.y=r.y*q.y,z.mapSize.y=r.y));let G=s.state.buffers.depth.getReversed();if(z.camera._reversedDepth=G,z.map===null||I===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===Ls){if(D.isPointLight){Ot("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new Ke(i.x,i.y,{format:Ti,type:bn,minFilter:Ve,magFilter:Ve,generateMipmaps:!1}),z.map.texture.name=D.name+".shadowMap",z.map.depthTexture=new _i(i.x,i.y,Mn),z.map.depthTexture.name=D.name+".shadowMapDepth",z.map.depthTexture.format=Nn,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Be,z.map.depthTexture.magFilter=Be}else D.isPointLight?(z.map=new nc(i.x),z.map.depthTexture=new Yo(i.x,Sn)):(z.map=new Ke(i.x,i.y),z.map.depthTexture=new _i(i.x,i.y,Sn)),z.map.depthTexture.name=D.name+".shadowMap",z.map.depthTexture.format=Nn,this.type===Lr?(z.map.depthTexture.compareFunction=G?ja:Ka,z.map.depthTexture.minFilter=Ve,z.map.depthTexture.magFilter=Ve):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Be,z.map.depthTexture.magFilter=Be);z.camera.updateProjectionMatrix()}z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==i.x||z.map.height!==i.y)&&z.map.setSize(i.x,i.y);let Z=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();D.isPointLight!==!0&&z.updateMatrices(D,_);for(let W=0;W<Z;W++){let et=z.getCamera(W);if(D.isPointLight){let ut=z.camera,Ft=z.matrix,At=D.distance||ut.far;At!==ut.far&&(ut.far=At,ut.updateProjectionMatrix()),Gr.setFromMatrixPosition(D.matrixWorld),ut.position.copy(Gr),ql.copy(ut.position),ql.add(Hx[W]),ut.up.copy(Gx[W]),ut.lookAt(ql),ut.updateMatrixWorld(),Ft.makeTranslation(-Gr.x,-Gr.y,-Gr.z),md.multiplyMatrices(ut.projectionMatrix,ut.matrixWorldInverse),z._frustum.setFromProjectionMatrix(md,ut.coordinateSystem,ut.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)s.setRenderTarget(z.map,W),s.clear();else{W===0&&(s.setRenderTarget(z.map),s.clear());let ut=z.getViewport(W);o.set(r.x*ut.x,r.y*ut.y,r.x*ut.z,r.y*ut.w),F.viewport(o)}n=z.getFrustum(W),S(P,_,et,D,this.type)}z.isPointLightShadow!==!0&&this.type===Ls&&v(z,_),z.needsUpdate=!1}m=this.type,g.needsUpdate=!1,s.setRenderTarget(b,M,R)};function v(w,P){let _=t.update(x);h.defines.VSM_SAMPLES!==w.blurSamples&&(h.defines.VSM_SAMPLES=w.blurSamples,f.defines.VSM_SAMPLES=w.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),w.mapPass===null?w.mapPass=new Ke(i.x,i.y,{format:Ti,type:bn}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),h.uniforms.shadow_pass.value=w.map.depthTexture,h.uniforms.resolution.value.set(w.map.width,w.map.height),h.uniforms.radius.value=w.radius,s.setRenderTarget(w.mapPass),s.clear(),s.renderBufferDirect(P,null,_,h,x,null),f.uniforms.shadow_pass.value=w.mapPass.texture,f.uniforms.resolution.value.set(w.map.width,w.map.height),f.uniforms.radius.value=w.radius,s.setRenderTarget(w.map),s.clear(),s.renderBufferDirect(P,null,_,f,x,null)}function N(w,P,_,b){let M=null,R=_.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(R!==void 0)M=R;else if(M=_.isPointLight===!0?c:a,s.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let F=M.uuid,I=P.uuid,C=l[F];C===void 0&&(C={},l[F]=C);let L=C[I];L===void 0&&(L=M.clone(),C[I]=L,P.addEventListener("dispose",E)),M=L}if(M.visible=P.visible,M.wireframe=P.wireframe,b===Ls?M.side=P.shadowSide!==null?P.shadowSide:P.side:M.side=P.shadowSide!==null?P.shadowSide:d[P.side],M.alphaMap=P.alphaMap,M.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,M.map=P.map,M.clipShadows=P.clipShadows,M.clippingPlanes=P.clippingPlanes,M.clipIntersection=P.clipIntersection,M.displacementMap=P.displacementMap,M.displacementScale=P.displacementScale,M.displacementBias=P.displacementBias,M.wireframeLinewidth=P.wireframeLinewidth,M.linewidth=P.linewidth,_.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let F=s.properties.get(M);F.light=_}return M}function S(w,P,_,b,M){if(w.visible===!1)return;if(w.layers.test(P.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&M===Ls)&&(!w.frustumCulled||w.intersectsFrustum(n))){w.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,w.matrixWorld);let I=t.update(w),C=w.material;if(Array.isArray(C)){let L=I.groups;for(let D=0,z=L.length;D<z;D++){let q=L[D],G=C[q.materialIndex];if(G&&G.visible){let Z=N(w,G,b,M);w.onBeforeShadow(s,w,P,_,I,Z,q),s.renderBufferDirect(_,null,I,Z,w,q),w.onAfterShadow(s,w,P,_,I,Z,q)}}}else if(C.visible){let L=N(w,C,b,M);w.onBeforeShadow(s,w,P,_,I,L,null),s.renderBufferDirect(_,null,I,L,w,null),w.onAfterShadow(s,w,P,_,I,L,null)}}let F=w.children;for(let I=0,C=F.length;I<C;I++)S(F[I],P,_,b,M)}function E(w){w.target.removeEventListener("dispose",E);for(let _ in l){let b=l[_],M=w.target.uuid;M in b&&(b[M].dispose(),delete b[M])}}}function qx(s,t){function e(){let O=!1,nt=new ve,Q=null,lt=new ve(0,0,0,0);return{setMask:function(ht){Q!==ht&&!O&&(s.colorMask(ht,ht,ht,ht),Q=ht)},setLocked:function(ht){O=ht},setClear:function(ht,at,Ct,bt,Qt){Qt===!0&&(ht*=bt,at*=bt,Ct*=bt),nt.set(ht,at,Ct,bt),lt.equals(nt)===!1&&(s.clearColor(ht,at,Ct,bt),lt.copy(nt))},reset:function(){O=!1,Q=null,lt.set(-1,0,0,0)}}}function n(){let O=!1,nt=!1,Q=null,lt=null,ht=null;return{setReversed:function(at){if(nt!==at){let Ct=t.get("EXT_clip_control");at?Ct.clipControlEXT(Ct.LOWER_LEFT_EXT,Ct.ZERO_TO_ONE_EXT):Ct.clipControlEXT(Ct.LOWER_LEFT_EXT,Ct.NEGATIVE_ONE_TO_ONE_EXT),nt=at;let bt=ht;ht=null,this.setClear(bt)}},getReversed:function(){return nt},setTest:function(at){at?ot(s.DEPTH_TEST):vt(s.DEPTH_TEST)},setMask:function(at){Q!==at&&!O&&(s.depthMask(at),Q=at)},setFunc:function(at){if(nt&&(at=Gu[at]),lt!==at){switch(at){case Io:s.depthFunc(s.NEVER);break;case Po:s.depthFunc(s.ALWAYS);break;case Lo:s.depthFunc(s.LESS);break;case Ss:s.depthFunc(s.LEQUAL);break;case No:s.depthFunc(s.EQUAL);break;case Fo:s.depthFunc(s.GEQUAL);break;case Do:s.depthFunc(s.GREATER);break;case Bo:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}lt=at}},setLocked:function(at){O=at},setClear:function(at){ht!==at&&(ht=at,nt&&(at=1-at),s.clearDepth(at))},reset:function(){O=!1,Q=null,lt=null,ht=null,nt=!1}}}function i(){let O=!1,nt=null,Q=null,lt=null,ht=null,at=null,Ct=null,bt=null,Qt=null;return{setTest:function(Rt){O||(Rt?ot(s.STENCIL_TEST):vt(s.STENCIL_TEST))},setMask:function(Rt){nt!==Rt&&!O&&(s.stencilMask(Rt),nt=Rt)},setFunc:function(Rt,Mt,oe){(Q!==Rt||lt!==Mt||ht!==oe)&&(s.stencilFunc(Rt,Mt,oe),Q=Rt,lt=Mt,ht=oe)},setOp:function(Rt,Mt,oe){(at!==Rt||Ct!==Mt||bt!==oe)&&(s.stencilOp(Rt,Mt,oe),at=Rt,Ct=Mt,bt=oe)},setLocked:function(Rt){O=Rt},setClear:function(Rt){Qt!==Rt&&(s.clearStencil(Rt),Qt=Rt)},reset:function(){O=!1,nt=null,Q=null,lt=null,ht=null,at=null,Ct=null,bt=null,Qt=null}}}let r=new e,o=new n,a=new i,c=new WeakMap,l=new WeakMap,u={},d={},h={},f=new WeakMap,p=[],x=null,g=!1,m=null,v=null,N=null,S=null,E=null,w=null,P=null,_=new Ht(0,0,0),b=0,M=!1,R=null,F=null,I=null,C=null,L=null,D=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,q=0,G=s.getParameter(s.VERSION);G.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(G)[1]),z=q>=1):G.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),z=q>=2);let Z=null,W={},et=s.getParameter(s.SCISSOR_BOX),ut=s.getParameter(s.VIEWPORT),Ft=new ve().fromArray(et),At=new ve().fromArray(ut);function Bt(O,nt,Q,lt){let ht=new Uint8Array(4),at=s.createTexture();s.bindTexture(O,at),s.texParameteri(O,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(O,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ct=0;Ct<Q;Ct++)O===s.TEXTURE_3D||O===s.TEXTURE_2D_ARRAY?s.texImage3D(nt,0,s.RGBA,1,1,lt,0,s.RGBA,s.UNSIGNED_BYTE,ht):s.texImage2D(nt+Ct,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ht);return at}let K={};K[s.TEXTURE_2D]=Bt(s.TEXTURE_2D,s.TEXTURE_2D,1),K[s.TEXTURE_CUBE_MAP]=Bt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[s.TEXTURE_2D_ARRAY]=Bt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),K[s.TEXTURE_3D]=Bt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ot(s.DEPTH_TEST),o.setFunc(Ss),Yt(!1),he(ll),ot(s.CULL_FACE),Kt(zn);function ot(O){u[O]!==!0&&(s.enable(O),u[O]=!0)}function vt(O){u[O]!==!1&&(s.disable(O),u[O]=!1)}function Dt(O,nt){return h[O]!==nt?(s.bindFramebuffer(O,nt),h[O]=nt,O===s.DRAW_FRAMEBUFFER&&(h[s.FRAMEBUFFER]=nt),O===s.FRAMEBUFFER&&(h[s.DRAW_FRAMEBUFFER]=nt),!0):!1}function xt(O,nt){let Q=p,lt=!1;if(O){Q=f.get(nt),Q===void 0&&(Q=[],f.set(nt,Q));let ht=O.textures;if(Q.length!==ht.length||Q[0]!==s.COLOR_ATTACHMENT0){for(let at=0,Ct=ht.length;at<Ct;at++)Q[at]=s.COLOR_ATTACHMENT0+at;Q.length=ht.length,lt=!0}}else Q[0]!==s.BACK&&(Q[0]=s.BACK,lt=!0);lt&&s.drawBuffers(Q)}function zt(O){return x!==O?(s.useProgram(O),x=O,!0):!1}let ye={[Gi]:s.FUNC_ADD,[uu]:s.FUNC_SUBTRACT,[du]:s.FUNC_REVERSE_SUBTRACT};ye[fu]=s.MIN,ye[pu]=s.MAX;let Gt={[mu]:s.ZERO,[gu]:s.ONE,[xu]:s.SRC_COLOR,[dl]:s.SRC_ALPHA,[bu]:s.SRC_ALPHA_SATURATE,[Su]:s.DST_COLOR,[vu]:s.DST_ALPHA,[_u]:s.ONE_MINUS_SRC_COLOR,[fl]:s.ONE_MINUS_SRC_ALPHA,[Mu]:s.ONE_MINUS_DST_COLOR,[yu]:s.ONE_MINUS_DST_ALPHA,[wu]:s.CONSTANT_COLOR,[Eu]:s.ONE_MINUS_CONSTANT_COLOR,[Tu]:s.CONSTANT_ALPHA,[Au]:s.ONE_MINUS_CONSTANT_ALPHA};function Kt(O,nt,Q,lt,ht,at,Ct,bt,Qt,Rt){if(O===zn){g===!0&&(vt(s.BLEND),g=!1);return}if(g===!1&&(ot(s.BLEND),g=!0),O!==hu){if(O!==m||Rt!==M){if((v!==Gi||E!==Gi)&&(s.blendEquation(s.FUNC_ADD),v=Gi,E=Gi),Rt)switch(O){case Ns:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Hi:s.blendFunc(s.ONE,s.ONE);break;case hl:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case ul:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Ut("WebGLState: Invalid blending: ",O);break}else switch(O){case Ns:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Hi:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case hl:Ut("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ul:Ut("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ut("WebGLState: Invalid blending: ",O);break}N=null,S=null,w=null,P=null,_.set(0,0,0),b=0,m=O,M=Rt}return}ht=ht||nt,at=at||Q,Ct=Ct||lt,(nt!==v||ht!==E)&&(s.blendEquationSeparate(ye[nt],ye[ht]),v=nt,E=ht),(Q!==N||lt!==S||at!==w||Ct!==P)&&(s.blendFuncSeparate(Gt[Q],Gt[lt],Gt[at],Gt[Ct]),N=Q,S=lt,w=at,P=Ct),(bt.equals(_)===!1||Qt!==b)&&(s.blendColor(bt.r,bt.g,bt.b,Qt),_.copy(bt),b=Qt),m=O,M=!1}function ne(O,nt){O.side===On?vt(s.CULL_FACE):ot(s.CULL_FACE);let Q=O.side===Re;nt&&(Q=!Q),Yt(Q),O.blending===Ns&&O.transparent===!1?Kt(zn):Kt(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),o.setFunc(O.depthFunc),o.setTest(O.depthTest),o.setMask(O.depthWrite),r.setMask(O.colorWrite);let lt=O.stencilWrite;a.setTest(lt),lt&&(a.setMask(O.stencilWriteMask),a.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),a.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),Ne(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?ot(s.SAMPLE_ALPHA_TO_COVERAGE):vt(s.SAMPLE_ALPHA_TO_COVERAGE)}function Yt(O){R!==O&&(O?s.frontFace(s.CW):s.frontFace(s.CCW),R=O)}function he(O){O!==cu?(ot(s.CULL_FACE),O!==F&&(O===ll?s.cullFace(s.BACK):O===lu?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):vt(s.CULL_FACE),F=O}function we(O){O!==I&&(z&&s.lineWidth(O),I=O)}function Ne(O,nt,Q){O?(ot(s.POLYGON_OFFSET_FILL),(C!==nt||L!==Q)&&(C=nt,L=Q,o.getReversed()&&(nt=-nt),s.polygonOffset(nt,Q))):vt(s.POLYGON_OFFSET_FILL)}function ue(O){O?ot(s.SCISSOR_TEST):vt(s.SCISSOR_TEST)}function Me(O){O===void 0&&(O=s.TEXTURE0+D-1),Z!==O&&(s.activeTexture(O),Z=O)}function H(O,nt,Q){Q===void 0&&(Z===null?Q=s.TEXTURE0+D-1:Q=Z);let lt=W[Q];lt===void 0&&(lt={type:void 0,texture:void 0},W[Q]=lt),(lt.type!==O||lt.texture!==nt)&&(Z!==Q&&(s.activeTexture(Q),Z=Q),s.bindTexture(O,nt||K[O]),lt.type=O,lt.texture=nt)}function Fe(){let O=W[Z];O!==void 0&&O.type!==void 0&&(s.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function ee(){try{s.compressedTexImage2D(...arguments)}catch(O){Ut("WebGLState:",O)}}function U(){try{s.compressedTexImage3D(...arguments)}catch(O){Ut("WebGLState:",O)}}function y(){try{s.texSubImage2D(...arguments)}catch(O){Ut("WebGLState:",O)}}function X(){try{s.texSubImage3D(...arguments)}catch(O){Ut("WebGLState:",O)}}function j(){try{s.compressedTexSubImage2D(...arguments)}catch(O){Ut("WebGLState:",O)}}function it(){try{s.compressedTexSubImage3D(...arguments)}catch(O){Ut("WebGLState:",O)}}function dt(){try{s.texStorage2D(...arguments)}catch(O){Ut("WebGLState:",O)}}function ft(){try{s.texStorage3D(...arguments)}catch(O){Ut("WebGLState:",O)}}function st(){try{s.texImage2D(...arguments)}catch(O){Ut("WebGLState:",O)}}function ct(){try{s.texImage3D(...arguments)}catch(O){Ut("WebGLState:",O)}}function pt(O){return d[O]!==void 0?d[O]:s.getParameter(O)}function Lt(O,nt){d[O]!==nt&&(s.pixelStorei(O,nt),d[O]=nt)}function gt(O){Ft.equals(O)===!1&&(s.scissor(O.x,O.y,O.z,O.w),Ft.copy(O))}function mt(O){At.equals(O)===!1&&(s.viewport(O.x,O.y,O.z,O.w),At.copy(O))}function B(O,nt){let Q=l.get(nt);Q===void 0&&(Q=new WeakMap,l.set(nt,Q));let lt=Q.get(O);lt===void 0&&(lt=s.getUniformBlockIndex(nt,O.name),Q.set(O,lt))}function Y(O,nt){let lt=l.get(nt).get(O);c.get(nt)!==lt&&(s.uniformBlockBinding(nt,lt,O.__bindingPointIndex),c.set(nt,lt))}function rt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),u={},d={},Z=null,W={},h={},f=new WeakMap,p=[],x=null,g=!1,m=null,v=null,N=null,S=null,E=null,w=null,P=null,_=new Ht(0,0,0),b=0,M=!1,R=null,F=null,I=null,C=null,L=null,Ft.set(0,0,s.canvas.width,s.canvas.height),At.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ot,disable:vt,bindFramebuffer:Dt,drawBuffers:xt,useProgram:zt,setBlending:Kt,setMaterial:ne,setFlipSided:Yt,setCullFace:he,setLineWidth:we,setPolygonOffset:Ne,setScissorTest:ue,activeTexture:Me,bindTexture:H,unbindTexture:Fe,compressedTexImage2D:ee,compressedTexImage3D:U,texImage2D:st,texImage3D:ct,pixelStorei:Lt,getParameter:pt,updateUBOMapping:B,uniformBlockBinding:Y,texStorage2D:dt,texStorage3D:ft,texSubImage2D:y,texSubImage3D:X,compressedTexSubImage2D:j,compressedTexSubImage3D:it,scissor:gt,viewport:mt,reset:rt}}function Xx(s,t,e,n,i,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Vt,u=new WeakMap,d=new Set,h,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(U,y){return p?new OffscreenCanvas(U,y):ur("canvas")}function g(U,y,X){let j=1,it=ee(U);if((it.width>X||it.height>X)&&(j=X/Math.max(it.width,it.height)),j<1)if(typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&U instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&U instanceof ImageBitmap||typeof VideoFrame<"u"&&U instanceof VideoFrame){let dt=Math.floor(j*it.width),ft=Math.floor(j*it.height);h===void 0&&(h=x(dt,ft));let st=y?x(dt,ft):h;return st.width=dt,st.height=ft,st.getContext("2d").drawImage(U,0,0,dt,ft),Ot("WebGLRenderer: Texture has been resized from ("+it.width+"x"+it.height+") to ("+dt+"x"+ft+")."),st}else return"data"in U&&Ot("WebGLRenderer: Image in DataTexture is too big ("+it.width+"x"+it.height+")."),U;return U}function m(U){return U.generateMipmaps}function v(U){s.generateMipmap(U)}function N(U){return U.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:U.isWebGL3DRenderTarget?s.TEXTURE_3D:U.isWebGLArrayRenderTarget||U.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function S(U,y,X,j,it,dt=!1){if(U!==null){if(s[U]!==void 0)return s[U];Ot("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+U+"'")}let ft;j&&(ft=t.get("EXT_texture_norm16"),ft||Ot("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let st=y;if(y===s.RED&&(X===s.FLOAT&&(st=s.R32F),X===s.HALF_FLOAT&&(st=s.R16F),X===s.UNSIGNED_BYTE&&(st=s.R8),X===s.UNSIGNED_SHORT&&ft&&(st=ft.R16_EXT),X===s.SHORT&&ft&&(st=ft.R16_SNORM_EXT)),y===s.RED_INTEGER&&(X===s.UNSIGNED_BYTE&&(st=s.R8UI),X===s.UNSIGNED_SHORT&&(st=s.R16UI),X===s.UNSIGNED_INT&&(st=s.R32UI),X===s.BYTE&&(st=s.R8I),X===s.SHORT&&(st=s.R16I),X===s.INT&&(st=s.R32I)),y===s.RG&&(X===s.FLOAT&&(st=s.RG32F),X===s.HALF_FLOAT&&(st=s.RG16F),X===s.UNSIGNED_BYTE&&(st=s.RG8),X===s.UNSIGNED_SHORT&&ft&&(st=ft.RG16_EXT),X===s.SHORT&&ft&&(st=ft.RG16_SNORM_EXT)),y===s.RG_INTEGER&&(X===s.UNSIGNED_BYTE&&(st=s.RG8UI),X===s.UNSIGNED_SHORT&&(st=s.RG16UI),X===s.UNSIGNED_INT&&(st=s.RG32UI),X===s.BYTE&&(st=s.RG8I),X===s.SHORT&&(st=s.RG16I),X===s.INT&&(st=s.RG32I)),y===s.RGB_INTEGER&&(X===s.UNSIGNED_BYTE&&(st=s.RGB8UI),X===s.UNSIGNED_SHORT&&(st=s.RGB16UI),X===s.UNSIGNED_INT&&(st=s.RGB32UI),X===s.BYTE&&(st=s.RGB8I),X===s.SHORT&&(st=s.RGB16I),X===s.INT&&(st=s.RGB32I)),y===s.RGBA_INTEGER&&(X===s.UNSIGNED_BYTE&&(st=s.RGBA8UI),X===s.UNSIGNED_SHORT&&(st=s.RGBA16UI),X===s.UNSIGNED_INT&&(st=s.RGBA32UI),X===s.BYTE&&(st=s.RGBA8I),X===s.SHORT&&(st=s.RGBA16I),X===s.INT&&(st=s.RGBA32I)),y===s.RGB&&(X===s.UNSIGNED_SHORT&&ft&&(st=ft.RGB16_EXT),X===s.SHORT&&ft&&(st=ft.RGB16_SNORM_EXT),X===s.UNSIGNED_INT_5_9_9_9_REV&&(st=s.RGB9_E5),X===s.UNSIGNED_INT_10F_11F_11F_REV&&(st=s.R11F_G11F_B10F)),y===s.RGBA){let ct=dt?hr:Jt.getTransfer(it);X===s.FLOAT&&(st=s.RGBA32F),X===s.HALF_FLOAT&&(st=s.RGBA16F),X===s.UNSIGNED_BYTE&&(st=ct===se?s.SRGB8_ALPHA8:s.RGBA8),X===s.UNSIGNED_SHORT&&ft&&(st=ft.RGBA16_EXT),X===s.SHORT&&ft&&(st=ft.RGBA16_SNORM_EXT),X===s.UNSIGNED_SHORT_4_4_4_4&&(st=s.RGBA4),X===s.UNSIGNED_SHORT_5_5_5_1&&(st=s.RGB5_A1)}return(st===s.R16F||st===s.R32F||st===s.RG16F||st===s.RG32F||st===s.RGBA16F||st===s.RGBA32F)&&t.get("EXT_color_buffer_float"),st}function E(U,y){let X;return U?y===null||y===Sn||y===Ds?X=s.DEPTH24_STENCIL8:y===Mn?X=s.DEPTH32F_STENCIL8:y===Fs&&(X=s.DEPTH24_STENCIL8,Ot("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===Sn||y===Ds?X=s.DEPTH_COMPONENT24:y===Mn?X=s.DEPTH_COMPONENT32F:y===Fs&&(X=s.DEPTH_COMPONENT16),X}function w(U,y){return m(U)===!0||U.isFramebufferTexture&&U.minFilter!==Be&&U.minFilter!==Ve?Math.log2(Math.max(y.width,y.height))+1:U.mipmaps!==void 0&&U.mipmaps.length>0?U.mipmaps.length:U.isCompressedTexture&&Array.isArray(U.image)?y.mipmaps.length:1}function P(U){let y=U.target;y.removeEventListener("dispose",P),b(y),y.isVideoTexture&&u.delete(y),y.isHTMLTexture&&d.delete(y)}function _(U){let y=U.target;y.removeEventListener("dispose",_),R(y)}function b(U){let y=n.get(U);if(y.__webglInit===void 0)return;let X=U.source,j=f.get(X);if(j){let it=j[y.__cacheKey];it.usedTimes--,it.usedTimes===0&&M(U),Object.keys(j).length===0&&f.delete(X)}n.remove(U)}function M(U){let y=n.get(U);s.deleteTexture(y.__webglTexture);let X=U.source,j=f.get(X);delete j[y.__cacheKey],o.memory.textures--}function R(U){let y=n.get(U);if(U.depthTexture&&(U.depthTexture.dispose(),n.remove(U.depthTexture)),U.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(y.__webglFramebuffer[j]))for(let it=0;it<y.__webglFramebuffer[j].length;it++)s.deleteFramebuffer(y.__webglFramebuffer[j][it]);else s.deleteFramebuffer(y.__webglFramebuffer[j]);y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer[j])}else{if(Array.isArray(y.__webglFramebuffer))for(let j=0;j<y.__webglFramebuffer.length;j++)s.deleteFramebuffer(y.__webglFramebuffer[j]);else s.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&s.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let j=0;j<y.__webglColorRenderbuffer.length;j++)y.__webglColorRenderbuffer[j]&&s.deleteRenderbuffer(y.__webglColorRenderbuffer[j]);y.__webglDepthRenderbuffer&&s.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let X=U.textures;for(let j=0,it=X.length;j<it;j++){let dt=n.get(X[j]);dt.__webglTexture&&(s.deleteTexture(dt.__webglTexture),o.memory.textures--),n.remove(X[j])}n.remove(U)}let F=0;function I(){F=0}function C(){return F}function L(U){F=U}function D(){let U=F;return U>=i.maxTextures&&Ot("WebGLTextures: Trying to use "+(U+1)+" texture units while this GPU supports only "+i.maxTextures),F+=1,U}function z(U){let y=[];return y.push(U.wrapS),y.push(U.wrapT),y.push(U.wrapR||0),y.push(U.magFilter),y.push(U.minFilter),y.push(U.anisotropy),y.push(U.internalFormat),y.push(U.format),y.push(U.type),y.push(U.generateMipmaps),y.push(U.premultiplyAlpha),y.push(U.flipY),y.push(U.unpackAlignment),y.push(U.colorSpace),y.join()}function q(U,y){let X=n.get(U);if(U.isVideoTexture&&H(U),U.isRenderTargetTexture===!1&&U.isExternalTexture!==!0&&U.version>0&&X.__version!==U.version){let j=U.image;if(j===null)Ot("WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)Ot("WebGLRenderer: Texture marked for update but image is incomplete");else{vt(X,U,y);return}}else U.isExternalTexture&&(X.__webglTexture=U.sourceTexture?U.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,X.__webglTexture,s.TEXTURE0+y)}function G(U,y){let X=n.get(U);if(U.isRenderTargetTexture===!1&&U.version>0&&X.__version!==U.version){vt(X,U,y);return}else U.isExternalTexture&&(X.__webglTexture=U.sourceTexture?U.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,X.__webglTexture,s.TEXTURE0+y)}function Z(U,y){let X=n.get(U);if(U.isRenderTargetTexture===!1&&U.version>0&&X.__version!==U.version){vt(X,U,y);return}e.bindTexture(s.TEXTURE_3D,X.__webglTexture,s.TEXTURE0+y)}function W(U,y){let X=n.get(U);if(U.isCubeDepthTexture!==!0&&U.version>0&&X.__version!==U.version){Dt(X,U,y);return}e.bindTexture(s.TEXTURE_CUBE_MAP,X.__webglTexture,s.TEXTURE0+y)}let et={[Ln]:s.REPEAT,[Pn]:s.CLAMP_TO_EDGE,[Uo]:s.MIRRORED_REPEAT},ut={[Be]:s.NEAREST,[Iu]:s.NEAREST_MIPMAP_NEAREST,[Fr]:s.NEAREST_MIPMAP_LINEAR,[Ve]:s.LINEAR,[pa]:s.LINEAR_MIPMAP_NEAREST,[wi]:s.LINEAR_MIPMAP_LINEAR},Ft={[Fu]:s.NEVER,[zu]:s.ALWAYS,[Du]:s.LESS,[Ka]:s.LEQUAL,[Bu]:s.EQUAL,[ja]:s.GEQUAL,[Uu]:s.GREATER,[Ou]:s.NOTEQUAL};function At(U,y){if(y.type===Mn&&t.has("OES_texture_float_linear")===!1&&(y.magFilter===Ve||y.magFilter===pa||y.magFilter===Fr||y.magFilter===wi||y.minFilter===Ve||y.minFilter===pa||y.minFilter===Fr||y.minFilter===wi)&&Ot("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(U,s.TEXTURE_WRAP_S,et[y.wrapS]),s.texParameteri(U,s.TEXTURE_WRAP_T,et[y.wrapT]),(U===s.TEXTURE_3D||U===s.TEXTURE_2D_ARRAY)&&s.texParameteri(U,s.TEXTURE_WRAP_R,et[y.wrapR]),s.texParameteri(U,s.TEXTURE_MAG_FILTER,ut[y.magFilter]),s.texParameteri(U,s.TEXTURE_MIN_FILTER,ut[y.minFilter]),y.compareFunction&&(s.texParameteri(U,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(U,s.TEXTURE_COMPARE_FUNC,Ft[y.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Be||y.minFilter!==Fr&&y.minFilter!==wi||y.type===Mn&&t.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let X=t.get("EXT_texture_filter_anisotropic");s.texParameterf(U,X.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,i.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Bt(U,y){let X=!1;U.__webglInit===void 0&&(U.__webglInit=!0,y.addEventListener("dispose",P));let j=y.source,it=f.get(j);it===void 0&&(it={},f.set(j,it));let dt=z(y);if(dt!==U.__cacheKey){it[dt]===void 0&&(it[dt]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,X=!0),it[dt].usedTimes++;let ft=it[U.__cacheKey];ft!==void 0&&(it[U.__cacheKey].usedTimes--,ft.usedTimes===0&&M(y)),U.__cacheKey=dt,U.__webglTexture=it[dt].texture}return X}function K(U,y,X){return Math.floor(Math.floor(U/X)/y)}function ot(U,y,X,j){let dt=U.updateRanges;if(dt.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,y.width,y.height,X,j,y.data);else{dt.sort((Lt,gt)=>Lt.start-gt.start);let ft=0;for(let Lt=1;Lt<dt.length;Lt++){let gt=dt[ft],mt=dt[Lt],B=gt.start+gt.count,Y=K(mt.start,y.width,4),rt=K(gt.start,y.width,4);mt.start<=B+1&&Y===rt&&K(mt.start+mt.count-1,y.width,4)===Y?gt.count=Math.max(gt.count,mt.start+mt.count-gt.start):(++ft,dt[ft]=mt)}dt.length=ft+1;let st=e.getParameter(s.UNPACK_ROW_LENGTH),ct=e.getParameter(s.UNPACK_SKIP_PIXELS),pt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,y.width);for(let Lt=0,gt=dt.length;Lt<gt;Lt++){let mt=dt[Lt],B=Math.floor(mt.start/4),Y=Math.ceil(mt.count/4),rt=B%y.width,O=Math.floor(B/y.width),nt=Y,Q=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,rt),e.pixelStorei(s.UNPACK_SKIP_ROWS,O),e.texSubImage2D(s.TEXTURE_2D,0,rt,O,nt,Q,X,j,y.data)}U.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,st),e.pixelStorei(s.UNPACK_SKIP_PIXELS,ct),e.pixelStorei(s.UNPACK_SKIP_ROWS,pt)}}function vt(U,y,X){let j=s.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(j=s.TEXTURE_2D_ARRAY),y.isData3DTexture&&(j=s.TEXTURE_3D);let it=Bt(U,y),dt=y.source;e.bindTexture(j,U.__webglTexture,s.TEXTURE0+X);let ft=n.get(dt);if(dt.version!==ft.__version||it===!0){if(e.activeTexture(s.TEXTURE0+X),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let Q=Jt.getPrimaries(Jt.workingColorSpace),lt=y.colorSpace===ni?null:Jt.getPrimaries(y.colorSpace),ht=y.colorSpace===ni||Q===lt?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ht)}e.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment);let ct=g(y.image,!1,i.maxTextureSize);ct=Fe(y,ct);let pt=r.convert(y.format,y.colorSpace),Lt=r.convert(y.type),gt=S(y.internalFormat,pt,Lt,y.normalized,y.colorSpace,y.isVideoTexture);At(j,y);let mt,B=y.mipmaps,Y=y.isVideoTexture!==!0,rt=ft.__version===void 0||it===!0,O=dt.dataReady,nt=w(y,ct);if(y.isDepthTexture)gt=E(y.format===Ei,y.type),rt&&(Y?e.texStorage2D(s.TEXTURE_2D,1,gt,ct.width,ct.height):e.texImage2D(s.TEXTURE_2D,0,gt,ct.width,ct.height,0,pt,Lt,null));else if(y.isDataTexture)if(B.length>0){Y&&rt&&e.texStorage2D(s.TEXTURE_2D,nt,gt,B[0].width,B[0].height);for(let Q=0,lt=B.length;Q<lt;Q++)mt=B[Q],Y?O&&e.texSubImage2D(s.TEXTURE_2D,Q,0,0,mt.width,mt.height,pt,Lt,mt.data):e.texImage2D(s.TEXTURE_2D,Q,gt,mt.width,mt.height,0,pt,Lt,mt.data);y.generateMipmaps=!1}else Y?(rt&&e.texStorage2D(s.TEXTURE_2D,nt,gt,ct.width,ct.height),O&&ot(y,ct,pt,Lt)):e.texImage2D(s.TEXTURE_2D,0,gt,ct.width,ct.height,0,pt,Lt,ct.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Y&&rt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,nt,gt,B[0].width,B[0].height,ct.depth);for(let Q=0,lt=B.length;Q<lt;Q++)if(mt=B[Q],y.format!==un)if(pt!==null)if(Y){if(O)if(y.layerUpdates.size>0){let ht=Fl(mt.width,mt.height,y.format,y.type);for(let at of y.layerUpdates){let Ct=mt.data.subarray(at*ht/mt.data.BYTES_PER_ELEMENT,(at+1)*ht/mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Q,0,0,at,mt.width,mt.height,1,pt,Ct)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Q,0,0,0,mt.width,mt.height,ct.depth,pt,mt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,Q,gt,mt.width,mt.height,ct.depth,0,mt.data,0,0);else Ot("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Y?O&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,Q,0,0,0,mt.width,mt.height,ct.depth,pt,Lt,mt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,Q,gt,mt.width,mt.height,ct.depth,0,pt,Lt,mt.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{Y&&rt&&e.texStorage2D(s.TEXTURE_2D,nt,gt,B[0].width,B[0].height);for(let Q=0,lt=B.length;Q<lt;Q++)mt=B[Q],y.format!==un?pt!==null?Y?O&&e.compressedTexSubImage2D(s.TEXTURE_2D,Q,0,0,mt.width,mt.height,pt,mt.data):e.compressedTexImage2D(s.TEXTURE_2D,Q,gt,mt.width,mt.height,0,mt.data):Ot("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Y?O&&e.texSubImage2D(s.TEXTURE_2D,Q,0,0,mt.width,mt.height,pt,Lt,mt.data):e.texImage2D(s.TEXTURE_2D,Q,gt,mt.width,mt.height,0,pt,Lt,mt.data)}else if(y.isDataArrayTexture)if(Y){if(rt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,nt,gt,ct.width,ct.height,ct.depth),O)if(y.layerUpdates.size>0){let Q=Fl(ct.width,ct.height,y.format,y.type);for(let lt of y.layerUpdates){let ht=ct.data.subarray(lt*Q/ct.data.BYTES_PER_ELEMENT,(lt+1)*Q/ct.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,lt,ct.width,ct.height,1,pt,Lt,ht)}y.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ct.width,ct.height,ct.depth,pt,Lt,ct.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,gt,ct.width,ct.height,ct.depth,0,pt,Lt,ct.data);else if(y.isData3DTexture)Y?(rt&&e.texStorage3D(s.TEXTURE_3D,nt,gt,ct.width,ct.height,ct.depth),O&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ct.width,ct.height,ct.depth,pt,Lt,ct.data)):e.texImage3D(s.TEXTURE_3D,0,gt,ct.width,ct.height,ct.depth,0,pt,Lt,ct.data);else if(y.isFramebufferTexture){if(rt)if(Y)e.texStorage2D(s.TEXTURE_2D,nt,gt,ct.width,ct.height);else{let Q=ct.width,lt=ct.height;for(let ht=0;ht<nt;ht++)e.texImage2D(s.TEXTURE_2D,ht,gt,Q,lt,0,pt,Lt,null),Q>>=1,lt>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in s){let Q=s.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),ct.parentNode!==Q){Q.appendChild(ct),d.add(y),Q.onpaint=lt=>{let ht=lt.changedElements;for(let at of d)ht.includes(at.image)&&(at.needsUpdate=!0)},Q.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,ct);else{let ht=s.RGBA,at=s.RGBA,Ct=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,ht,at,Ct,ct)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(B.length>0){if(Y&&rt){let Q=ee(B[0]);e.texStorage2D(s.TEXTURE_2D,nt,gt,Q.width,Q.height)}for(let Q=0,lt=B.length;Q<lt;Q++)mt=B[Q],Y?O&&e.texSubImage2D(s.TEXTURE_2D,Q,0,0,pt,Lt,mt):e.texImage2D(s.TEXTURE_2D,Q,gt,pt,Lt,mt);y.generateMipmaps=!1}else if(Y){if(rt){let Q=ee(ct);e.texStorage2D(s.TEXTURE_2D,nt,gt,Q.width,Q.height)}O&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,pt,Lt,ct)}else e.texImage2D(s.TEXTURE_2D,0,gt,pt,Lt,ct);m(y)&&v(j),ft.__version=dt.version,y.onUpdate&&y.onUpdate(y)}U.__version=y.version}function Dt(U,y,X){if(y.image.length!==6)return;let j=Bt(U,y),it=y.source;e.bindTexture(s.TEXTURE_CUBE_MAP,U.__webglTexture,s.TEXTURE0+X);let dt=n.get(it);if(it.version!==dt.__version||j===!0){e.activeTexture(s.TEXTURE0+X);let ft=Jt.getPrimaries(Jt.workingColorSpace),st=y.colorSpace===ni?null:Jt.getPrimaries(y.colorSpace),ct=y.colorSpace===ni||ft===st?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ct);let pt=y.isCompressedTexture||y.image[0].isCompressedTexture,Lt=y.image[0]&&y.image[0].isDataTexture,gt=[];for(let at=0;at<6;at++)!pt&&!Lt?gt[at]=g(y.image[at],!0,i.maxCubemapSize):gt[at]=Lt?y.image[at].image:y.image[at],gt[at]=Fe(y,gt[at]);let mt=gt[0],B=r.convert(y.format,y.colorSpace),Y=r.convert(y.type),rt=S(y.internalFormat,B,Y,y.normalized,y.colorSpace),O=y.isVideoTexture!==!0,nt=dt.__version===void 0||j===!0,Q=it.dataReady,lt=w(y,mt);At(s.TEXTURE_CUBE_MAP,y);let ht;if(pt){O&&nt&&e.texStorage2D(s.TEXTURE_CUBE_MAP,lt,rt,mt.width,mt.height);for(let at=0;at<6;at++){ht=gt[at].mipmaps;for(let Ct=0;Ct<ht.length;Ct++){let bt=ht[Ct];y.format!==un?B!==null?O?Q&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Ct,0,0,bt.width,bt.height,B,bt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Ct,rt,bt.width,bt.height,0,bt.data):Ot("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?Q&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Ct,0,0,bt.width,bt.height,B,Y,bt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Ct,rt,bt.width,bt.height,0,B,Y,bt.data)}}}else{if(ht=y.mipmaps,O&&nt){ht.length>0&&lt++;let at=ee(gt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,lt,rt,at.width,at.height)}for(let at=0;at<6;at++)if(Lt){O?Q&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,gt[at].width,gt[at].height,B,Y,gt[at].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,rt,gt[at].width,gt[at].height,0,B,Y,gt[at].data);for(let Ct=0;Ct<ht.length;Ct++){let Qt=ht[Ct].image[at].image;O?Q&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Ct+1,0,0,Qt.width,Qt.height,B,Y,Qt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Ct+1,rt,Qt.width,Qt.height,0,B,Y,Qt.data)}}else{O?Q&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,B,Y,gt[at]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,rt,B,Y,gt[at]);for(let Ct=0;Ct<ht.length;Ct++){let bt=ht[Ct];O?Q&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Ct+1,0,0,B,Y,bt.image[at]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Ct+1,rt,B,Y,bt.image[at])}}}m(y)&&v(s.TEXTURE_CUBE_MAP),dt.__version=it.version,y.onUpdate&&y.onUpdate(y)}U.__version=y.version}function xt(U,y,X,j,it,dt){let ft=r.convert(X.format,X.colorSpace),st=r.convert(X.type),ct=S(X.internalFormat,ft,st,X.normalized,X.colorSpace),pt=n.get(y),Lt=n.get(X);if(Lt.__renderTarget=y,!pt.__hasExternalTextures){let gt=Math.max(1,y.width>>dt),mt=Math.max(1,y.height>>dt);it===s.TEXTURE_3D||it===s.TEXTURE_2D_ARRAY?e.texImage3D(it,dt,ct,gt,mt,y.depth,0,ft,st,null):e.texImage2D(it,dt,ct,gt,mt,0,ft,st,null)}e.bindFramebuffer(s.FRAMEBUFFER,U),Me(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,j,it,Lt.__webglTexture,0,ue(y)):(it===s.TEXTURE_2D||it>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&it<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,j,it,Lt.__webglTexture,dt),e.bindFramebuffer(s.FRAMEBUFFER,null)}function zt(U,y,X){if(s.bindRenderbuffer(s.RENDERBUFFER,U),y.depthBuffer){let j=y.depthTexture,it=j&&j.isDepthTexture?j.type:null,dt=E(y.stencilBuffer,it),ft=y.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;Me(y)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ue(y),dt,y.width,y.height):X?s.renderbufferStorageMultisample(s.RENDERBUFFER,ue(y),dt,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,dt,y.width,y.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ft,s.RENDERBUFFER,U)}else{let j=y.textures;for(let it=0;it<j.length;it++){let dt=j[it],ft=r.convert(dt.format,dt.colorSpace),st=r.convert(dt.type),ct=S(dt.internalFormat,ft,st,dt.normalized,dt.colorSpace);Me(y)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ue(y),ct,y.width,y.height):X?s.renderbufferStorageMultisample(s.RENDERBUFFER,ue(y),ct,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,ct,y.width,y.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ye(U,y,X){let j=y.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,U),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let it=n.get(y.depthTexture);if(it.__renderTarget=y,(!it.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),j){if(it.__webglInit===void 0&&(it.__webglInit=!0,y.depthTexture.addEventListener("dispose",P)),it.__webglTexture===void 0){it.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,it.__webglTexture),At(s.TEXTURE_CUBE_MAP,y.depthTexture);let pt=r.convert(y.depthTexture.format),Lt=r.convert(y.depthTexture.type),gt;y.depthTexture.format===Nn?gt=s.DEPTH_COMPONENT24:y.depthTexture.format===Ei&&(gt=s.DEPTH24_STENCIL8);for(let mt=0;mt<6;mt++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,gt,y.width,y.height,0,pt,Lt,null)}}else q(y.depthTexture,0);let dt=it.__webglTexture,ft=ue(y),st=j?s.TEXTURE_CUBE_MAP_POSITIVE_X+X:s.TEXTURE_2D,ct=y.depthTexture.format===Ei?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(y.depthTexture.format===Nn)Me(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ct,st,dt,0,ft):s.framebufferTexture2D(s.FRAMEBUFFER,ct,st,dt,0);else if(y.depthTexture.format===Ei)Me(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ct,st,dt,0,ft):s.framebufferTexture2D(s.FRAMEBUFFER,ct,st,dt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Gt(U){let y=n.get(U),X=U.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==U.depthTexture){let j=U.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),j){let it=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,j.removeEventListener("dispose",it)};j.addEventListener("dispose",it),y.__depthDisposeCallback=it}y.__boundDepthTexture=j}if(U.depthTexture&&!y.__autoAllocateDepthBuffer)if(X)for(let j=0;j<6;j++)ye(y.__webglFramebuffer[j],U,j);else{let j=U.texture.mipmaps;j&&j.length>0?ye(y.__webglFramebuffer[0],U,0):ye(y.__webglFramebuffer,U,0)}else if(X){y.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(e.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[j]),y.__webglDepthbuffer[j]===void 0)y.__webglDepthbuffer[j]=s.createRenderbuffer(),zt(y.__webglDepthbuffer[j],U,!1);else{let it=U.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,dt=y.__webglDepthbuffer[j];s.bindRenderbuffer(s.RENDERBUFFER,dt),s.framebufferRenderbuffer(s.FRAMEBUFFER,it,s.RENDERBUFFER,dt)}}else{let j=U.texture.mipmaps;if(j&&j.length>0?e.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=s.createRenderbuffer(),zt(y.__webglDepthbuffer,U,!1);else{let it=U.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,dt=y.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,dt),s.framebufferRenderbuffer(s.FRAMEBUFFER,it,s.RENDERBUFFER,dt)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function Kt(U,y,X){let j=n.get(U);y!==void 0&&xt(j.__webglFramebuffer,U,U.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),X!==void 0&&Gt(U)}function ne(U){let y=U.texture,X=n.get(U),j=n.get(y);U.addEventListener("dispose",_);let it=U.textures,dt=U.isWebGLCubeRenderTarget===!0,ft=it.length>1;if(ft||(j.__webglTexture===void 0&&(j.__webglTexture=s.createTexture()),j.__version=y.version,o.memory.textures++),dt){X.__webglFramebuffer=[];for(let st=0;st<6;st++)if(y.mipmaps&&y.mipmaps.length>0){X.__webglFramebuffer[st]=[];for(let ct=0;ct<y.mipmaps.length;ct++)X.__webglFramebuffer[st][ct]=s.createFramebuffer()}else X.__webglFramebuffer[st]=s.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){X.__webglFramebuffer=[];for(let st=0;st<y.mipmaps.length;st++)X.__webglFramebuffer[st]=s.createFramebuffer()}else X.__webglFramebuffer=s.createFramebuffer();if(ft)for(let st=0,ct=it.length;st<ct;st++){let pt=n.get(it[st]);pt.__webglTexture===void 0&&(pt.__webglTexture=s.createTexture(),o.memory.textures++)}if(U.samples>0&&Me(U)===!1){X.__webglMultisampledFramebuffer=s.createFramebuffer(),X.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,X.__webglMultisampledFramebuffer);for(let st=0;st<it.length;st++){let ct=it[st];X.__webglColorRenderbuffer[st]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,X.__webglColorRenderbuffer[st]);let pt=r.convert(ct.format,ct.colorSpace),Lt=r.convert(ct.type),gt=S(ct.internalFormat,pt,Lt,ct.normalized,ct.colorSpace,U.isXRRenderTarget===!0),mt=ue(U);s.renderbufferStorageMultisample(s.RENDERBUFFER,mt,gt,U.width,U.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+st,s.RENDERBUFFER,X.__webglColorRenderbuffer[st])}s.bindRenderbuffer(s.RENDERBUFFER,null),U.depthBuffer&&(X.__webglDepthRenderbuffer=s.createRenderbuffer(),zt(X.__webglDepthRenderbuffer,U,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(dt){e.bindTexture(s.TEXTURE_CUBE_MAP,j.__webglTexture),At(s.TEXTURE_CUBE_MAP,y);for(let st=0;st<6;st++)if(y.mipmaps&&y.mipmaps.length>0)for(let ct=0;ct<y.mipmaps.length;ct++)xt(X.__webglFramebuffer[st][ct],U,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+st,ct);else xt(X.__webglFramebuffer[st],U,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+st,0);m(y)&&v(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ft){for(let st=0,ct=it.length;st<ct;st++){let pt=it[st],Lt=n.get(pt),gt=s.TEXTURE_2D;(U.isWebGL3DRenderTarget||U.isWebGLArrayRenderTarget)&&(gt=U.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(gt,Lt.__webglTexture),At(gt,pt),xt(X.__webglFramebuffer,U,pt,s.COLOR_ATTACHMENT0+st,gt,0),m(pt)&&v(gt)}e.unbindTexture()}else{let st=s.TEXTURE_2D;if((U.isWebGL3DRenderTarget||U.isWebGLArrayRenderTarget)&&(st=U.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(st,j.__webglTexture),At(st,y),y.mipmaps&&y.mipmaps.length>0)for(let ct=0;ct<y.mipmaps.length;ct++)xt(X.__webglFramebuffer[ct],U,y,s.COLOR_ATTACHMENT0,st,ct);else xt(X.__webglFramebuffer,U,y,s.COLOR_ATTACHMENT0,st,0);m(y)&&v(st),e.unbindTexture()}U.depthBuffer&&Gt(U)}function Yt(U){let y=U.textures;for(let X=0,j=y.length;X<j;X++){let it=y[X];if(m(it)){let dt=N(U),ft=n.get(it).__webglTexture;e.bindTexture(dt,ft),v(dt),e.unbindTexture()}}}let he=[],we=[];function Ne(U){if(U.samples>0){if(Me(U)===!1){let y=U.textures,X=U.width,j=U.height,it=s.COLOR_BUFFER_BIT,dt=U.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ft=n.get(U),st=y.length>1;if(st)for(let pt=0;pt<y.length;pt++)e.bindFramebuffer(s.FRAMEBUFFER,ft.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,ft.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,ft.__webglMultisampledFramebuffer);let ct=U.texture.mipmaps;ct&&ct.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ft.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ft.__webglFramebuffer);for(let pt=0;pt<y.length;pt++){if(U.resolveDepthBuffer&&(U.depthBuffer&&(it|=s.DEPTH_BUFFER_BIT),U.stencilBuffer&&U.resolveStencilBuffer&&(it|=s.STENCIL_BUFFER_BIT)),st){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ft.__webglColorRenderbuffer[pt]);let Lt=n.get(y[pt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Lt,0)}s.blitFramebuffer(0,0,X,j,0,0,X,j,it,s.NEAREST),c===!0&&(he.length=0,we.length=0,he.push(s.COLOR_ATTACHMENT0+pt),U.depthBuffer&&U.storeMultisampledDepthBuffer===!1&&(he.push(dt),we.push(dt),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,we)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,he))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),st)for(let pt=0;pt<y.length;pt++){e.bindFramebuffer(s.FRAMEBUFFER,ft.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.RENDERBUFFER,ft.__webglColorRenderbuffer[pt]);let Lt=n.get(y[pt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,ft.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.TEXTURE_2D,Lt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ft.__webglMultisampledFramebuffer)}else if(U.depthBuffer&&U.storeMultisampledDepthBuffer===!1&&c){let y=U.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[y])}}}function ue(U){return Math.min(i.maxSamples,U.samples)}function Me(U){let y=n.get(U);return U.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function H(U){let y=o.render.frame;u.get(U)!==y&&(u.set(U,y),U.update())}function Fe(U,y){let X=U.colorSpace,j=U.format,it=U.type;return U.isCompressedTexture===!0||U.isVideoTexture===!0||X!==lr&&X!==ni&&(Jt.getTransfer(X)===se?(j!==un||it!==je)&&Ot("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ut("WebGLTextures: Unsupported texture color space:",X)),y}function ee(U){return typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement?(l.width=U.naturalWidth||U.width,l.height=U.naturalHeight||U.height):typeof VideoFrame<"u"&&U instanceof VideoFrame?(l.width=U.displayWidth,l.height=U.displayHeight):(l.width=U.width,l.height=U.height),l}this.allocateTextureUnit=D,this.resetTextureUnits=I,this.getTextureUnits=C,this.setTextureUnits=L,this.setTexture2D=q,this.setTexture2DArray=G,this.setTexture3D=Z,this.setTextureCube=W,this.rebindTextures=Kt,this.setupRenderTarget=ne,this.updateRenderTargetMipmap=Yt,this.updateMultisampleRenderTarget=Ne,this.setupDepthRenderbuffer=Gt,this.setupFrameBufferTexture=xt,this.useMultisampledRTT=Me,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Yx(s,t){function e(n,i=ni){let r,o=Jt.getTransfer(i);if(n===je)return s.UNSIGNED_BYTE;if(n===ga)return s.UNSIGNED_SHORT_4_4_4_4;if(n===xa)return s.UNSIGNED_SHORT_5_5_5_1;if(n===wl)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===El)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===Ml)return s.BYTE;if(n===bl)return s.SHORT;if(n===Fs)return s.UNSIGNED_SHORT;if(n===ma)return s.INT;if(n===Sn)return s.UNSIGNED_INT;if(n===Mn)return s.FLOAT;if(n===bn)return s.HALF_FLOAT;if(n===Tl)return s.ALPHA;if(n===Al)return s.RGB;if(n===un)return s.RGBA;if(n===Nn)return s.DEPTH_COMPONENT;if(n===Ei)return s.DEPTH_STENCIL;if(n===Cl)return s.RED;if(n===_a)return s.RED_INTEGER;if(n===Ti)return s.RG;if(n===va)return s.RG_INTEGER;if(n===ya)return s.RGBA_INTEGER;if(n===Dr||n===Br||n===Ur||n===Or)if(o===se)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Dr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ur)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Or)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Dr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ur)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Or)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Sa||n===Ma||n===ba||n===wa)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Sa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ma)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ba)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===wa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ea||n===Ta||n===Aa||n===Ca||n===Ra||n===zr||n===Ia)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ea||n===Ta)return o===se?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Aa)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Ca)return r.COMPRESSED_R11_EAC;if(n===Ra)return r.COMPRESSED_SIGNED_R11_EAC;if(n===zr)return r.COMPRESSED_RG11_EAC;if(n===Ia)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Pa||n===La||n===Na||n===Fa||n===Da||n===Ba||n===Ua||n===Oa||n===za||n===Va||n===ka||n===Ha||n===Ga||n===Wa)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Pa)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===La)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Na)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Fa)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Da)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ba)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ua)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Oa)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===za)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Va)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ka)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ha)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ga)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Wa)return o===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===qa||n===Xa||n===Ya)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===qa)return o===se?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Xa)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ya)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Za||n===$a||n===Vr||n===Ja)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Za)return r.COMPRESSED_RED_RGTC1_EXT;if(n===$a)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Vr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ja)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ds?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}var Zx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$x=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Ql=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Sr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new sn({vertexShader:Zx,fragmentShader:$x,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new $t(new Vi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},th=class extends Fn{constructor(t,e){super();let n=this,i=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,d=null,h=null,f=null,p=null,x=typeof XRWebGLBinding<"u",g=new Ql,m={},v=e.getContextAttributes(),N=null,S=null,E=[],w=[],P=new Vt,_=null,b=null,M=new ze;M.viewport=new ve;let R=new ze;R.viewport=new ve;let F=[M,R],I=new ca,C=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let ot=E[K];return ot===void 0&&(ot=new Ts,E[K]=ot),ot.getTargetRaySpace()},this.getControllerGrip=function(K){let ot=E[K];return ot===void 0&&(ot=new Ts,E[K]=ot),ot.getGripSpace()},this.getHand=function(K){let ot=E[K];return ot===void 0&&(ot=new Ts,E[K]=ot),ot.getHandSpace()};function D(K){let ot=w.indexOf(K.inputSource);if(ot===-1)return;let vt=E[ot];vt!==void 0&&(vt.update(K.inputSource,K.frame,l||o),vt.dispatchEvent({type:K.type,data:K.inputSource}))}function z(){i.removeEventListener("select",D),i.removeEventListener("selectstart",D),i.removeEventListener("selectend",D),i.removeEventListener("squeeze",D),i.removeEventListener("squeezestart",D),i.removeEventListener("squeezeend",D),i.removeEventListener("end",z),i.removeEventListener("inputsourceschange",q);for(let K=0;K<E.length;K++){let ot=w[K];ot!==null&&(w[K]=null,E[K].disconnect(ot))}C=null,L=null,g.reset();for(let K in m)delete m[K];if(t.setRenderTarget(N),f=null,h=null,d=null,i=null,S=null,Bt.stop(),n.isPresenting=!1,t.setPixelRatio(_),t.setSize(P.width,P.height,!1),b!==null){let K=b.camera;K.fov=b.fov,K.zoom=b.zoom,K.updateProjectionMatrix(),b=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&Ot("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){a=K,n.isPresenting===!0&&Ot("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(K){l=K},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d===null&&x&&(d=new XRWebGLBinding(i,e)),d},this.getFrame=function(){return p},this.getSession=function(){return i},this.setSession=async function(K){if(i=K,i!==null){if(N=t.getRenderTarget(),i.addEventListener("select",D),i.addEventListener("selectstart",D),i.addEventListener("selectend",D),i.addEventListener("squeeze",D),i.addEventListener("squeezestart",D),i.addEventListener("squeezeend",D),i.addEventListener("end",z),i.addEventListener("inputsourceschange",q),v.xrCompatible!==!0&&await e.makeXRCompatible(),_=t.getPixelRatio(),t.getSize(P),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let vt=null,Dt=null,xt=null;v.depth&&(xt=v.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,vt=v.stencil?Ei:Nn,Dt=v.stencil?Ds:Sn);let zt={colorFormat:e.RGBA8,depthFormat:xt,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(zt),i.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),S=new Ke(h.textureWidth,h.textureHeight,{format:un,type:je,depthTexture:new _i(h.textureWidth,h.textureHeight,Dt,void 0,void 0,void 0,void 0,void 0,void 0,vt),stencilBuffer:v.stencil,colorSpace:t.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let vt={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,e,vt),i.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),S=new Ke(f.framebufferWidth,f.framebufferHeight,{format:un,type:je,colorSpace:t.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await i.requestReferenceSpace(a),Bt.setContext(i),Bt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function q(K){for(let ot=0;ot<K.removed.length;ot++){let vt=K.removed[ot],Dt=w.indexOf(vt);Dt>=0&&(w[Dt]=null,E[Dt].disconnect(vt))}for(let ot=0;ot<K.added.length;ot++){let vt=K.added[ot],Dt=w.indexOf(vt);if(Dt===-1){for(let zt=0;zt<E.length;zt++)if(zt>=w.length){w.push(vt),Dt=zt;break}else if(w[zt]===null){w[zt]=vt,Dt=zt;break}if(Dt===-1)break}let xt=E[Dt];xt&&xt.connect(vt)}}let G=new V,Z=new V;function W(K,ot,vt){G.setFromMatrixPosition(ot.matrixWorld),Z.setFromMatrixPosition(vt.matrixWorld);let Dt=G.distanceTo(Z),xt=ot.projectionMatrix.elements,zt=vt.projectionMatrix.elements,ye=xt[14]/(xt[10]-1),Gt=xt[14]/(xt[10]+1),Kt=(xt[9]+1)/xt[5],ne=(xt[9]-1)/xt[5],Yt=(xt[8]-1)/xt[0],he=(zt[8]+1)/zt[0],we=ye*Yt,Ne=ye*he,ue=Dt/(-Yt+he),Me=ue*-Yt;if(ot.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(Me),K.translateZ(ue),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),xt[10]===-1)K.projectionMatrix.copy(ot.projectionMatrix),K.projectionMatrixInverse.copy(ot.projectionMatrixInverse);else{let H=ye+ue,Fe=Gt+ue,ee=we-Me,U=Ne+(Dt-Me),y=Kt*Gt/Fe*H,X=ne*Gt/Fe*H;K.projectionMatrix.makePerspective(ee,U,y,X,H,Fe),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function et(K,ot){ot===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(ot.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(i===null)return;let ot=K.near,vt=K.far;g.texture!==null&&(g.depthNear>0&&(ot=g.depthNear),g.depthFar>0&&(vt=g.depthFar)),I.near=R.near=M.near=ot,I.far=R.far=M.far=vt,(C!==I.near||L!==I.far)&&(i.updateRenderState({depthNear:I.near,depthFar:I.far}),C=I.near,L=I.far),I.layers.mask=K.layers.mask|6,M.layers.mask=I.layers.mask&-5,R.layers.mask=I.layers.mask&-3;let Dt=K.parent,xt=I.cameras;et(I,Dt);for(let zt=0;zt<xt.length;zt++)et(xt[zt],Dt);xt.length===2?W(I,M,R):I.projectionMatrix.copy(M.projectionMatrix),b===null&&K.isPerspectiveCamera&&(b={camera:K,fov:K.fov,zoom:K.zoom}),ut(K,I,Dt)};function ut(K,ot,vt){vt===null?K.matrix.copy(ot.matrixWorld):(K.matrix.copy(vt.matrixWorld),K.matrix.invert(),K.matrix.multiply(ot.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(ot.projectionMatrix),K.projectionMatrixInverse.copy(ot.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=zo*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return I},this.getFoveation=function(){if(!(h===null&&f===null))return c},this.setFoveation=function(K){c=K,h!==null&&(h.fixedFoveation=K),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=K)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(I)},this.getCameraTexture=function(K){return m[K]};let Ft=null;function At(K,ot){if(u=ot.getViewerPose(l||o),p=ot,u!==null){let vt=u.views;f!==null&&(t.setRenderTargetFramebuffer(S,f.framebuffer),t.setRenderTarget(S));let Dt=!1;vt.length!==I.cameras.length&&(I.cameras.length=0,Dt=!0);for(let Gt=0;Gt<vt.length;Gt++){let Kt=vt[Gt],ne=null;if(f!==null)ne=f.getViewport(Kt);else{let he=d.getViewSubImage(h,Kt);ne=he.viewport,Gt===0&&(t.setRenderTargetTextures(S,he.colorTexture,he.depthStencilTexture),t.setRenderTarget(S))}let Yt=F[Gt];Yt===void 0&&(Yt=new ze,Yt.layers.enable(Gt),Yt.viewport=new ve,F[Gt]=Yt),Yt.matrix.fromArray(Kt.transform.matrix),Yt.matrix.decompose(Yt.position,Yt.quaternion,Yt.scale),Yt.projectionMatrix.fromArray(Kt.projectionMatrix),Yt.projectionMatrixInverse.copy(Yt.projectionMatrix).invert(),Yt.viewport.set(ne.x,ne.y,ne.width,ne.height),Gt===0&&(I.matrix.copy(Yt.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale)),Dt===!0&&I.cameras.push(Yt)}let xt=i.enabledFeatures;if(xt&&xt.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&x){d=n.getBinding();let Gt=d.getDepthInformation(vt[0]);Gt&&Gt.isValid&&Gt.texture&&g.init(Gt,i.renderState)}if(xt&&xt.includes("camera-access")&&x){t.state.unbindTexture(),d=n.getBinding();for(let Gt=0;Gt<vt.length;Gt++){let Kt=vt[Gt].camera;if(Kt){let ne=m[Kt];ne||(ne=new Sr,m[Kt]=ne);let Yt=d.getCameraImage(Kt);ne.sourceTexture=Yt}}}}for(let vt=0;vt<E.length;vt++){let Dt=w[vt],xt=E[vt];Dt!==null&&xt!==void 0&&xt.update(Dt,ot,l||o)}Ft&&Ft(K,ot),ot.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ot}),p=null}let Bt=new gd;Bt.setAnimationLoop(At),this.setAnimationLoop=function(K){Ft=K},this.dispose=function(){}}},Jx=new fe,Md=new kt;Md.set(-1,0,0,0,1,0,0,0,1);function Kx(s,t){function e(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function n(g,m){m.color.getRGB(g.fogColor.value,Pl(s)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function i(g,m,v,N,S){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(g,m):m.isMeshLambertMaterial?(r(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(g,m),d(g,m)):m.isMeshPhongMaterial?(r(g,m),u(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(g,m),h(g,m),m.isMeshPhysicalMaterial&&f(g,m,S)):m.isMeshMatcapMaterial?(r(g,m),p(g,m)):m.isMeshDepthMaterial?r(g,m):m.isMeshDistanceMaterial?(r(g,m),x(g,m)):m.isMeshNormalMaterial?r(g,m):m.isLineBasicMaterial?(o(g,m),m.isLineDashedMaterial&&a(g,m)):m.isPointsMaterial?c(g,m,v,N):m.isSpriteMaterial?l(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,e(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===Re&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,e(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===Re&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,e(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,e(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);let v=t.get(m),N=v.envMap,S=v.envMapRotation;N&&(g.envMap.value=N,g.envMapRotation.value.setFromMatrix4(Jx.makeRotationFromEuler(S)).transpose(),N.isCubeTexture&&N.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Md),g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,g.aoMapTransform))}function o(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform))}function a(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function c(g,m,v,N){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*v,g.scale.value=N*.5,m.map&&(g.map.value=m.map,e(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function l(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function u(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function d(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function h(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function f(g,m,v){g.ior.value=m.ior,m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Re&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.retroreflectivity>0&&(g.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=v.texture,g.transmissionSamplerSize.value.set(v.width,v.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,g.specularIntensityMapTransform))}function p(g,m){m.matcap&&(g.matcap.value=m.matcap)}function x(g,m){let v=t.get(m).light;g.referencePosition.value.setFromMatrixPosition(v.matrixWorld),g.nearDistance.value=v.shadow.camera.near,g.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function jx(s,t,e,n){let i={},r={},o=[],a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(S,E){let w=E.program;n.uniformBlockBinding(S,w)}function l(S,E){let w=i[S.id];w===void 0&&(g(S),w=u(S),i[S.id]=w,S.addEventListener("dispose",v));let P=E.program;n.updateUBOMapping(S,P);let _=t.render.frame;r[S.id]!==_&&(h(S),r[S.id]=_)}function u(S){let E=d();S.__bindingPointIndex=E;let w=s.createBuffer(),P=S.__size,_=S.usage;return s.bindBuffer(s.UNIFORM_BUFFER,w),s.bufferData(s.UNIFORM_BUFFER,P,_),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,E,w),w}function d(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return Ut("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(S){let E=i[S.id],w=S.uniforms,P=S.__cache;s.bindBuffer(s.UNIFORM_BUFFER,E);for(let _=0,b=w.length;_<b;_++){let M=w[_];if(Array.isArray(M))for(let R=0,F=M.length;R<F;R++)f(M[R],_,R,P);else f(M,_,0,P)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(S,E,w,P){if(x(S,E,w,P)===!0){let _=S.__offset,b=S.value;if(Array.isArray(b)){let M=0;for(let R=0;R<b.length;R++){let F=b[R],I=m(F);p(F,S.__data,M),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(M+=I.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(b,S.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,_,S.__data)}}function p(S,E,w){typeof S=="number"||typeof S=="boolean"?E[0]=S:S.isMatrix3?(E[0]=S.elements[0],E[1]=S.elements[1],E[2]=S.elements[2],E[3]=0,E[4]=S.elements[3],E[5]=S.elements[4],E[6]=S.elements[5],E[7]=0,E[8]=S.elements[6],E[9]=S.elements[7],E[10]=S.elements[8],E[11]=0):ArrayBuffer.isView(S)?E.set(new S.constructor(S.buffer,S.byteOffset,E.length)):S.toArray(E,w)}function x(S,E,w,P){let _=S.value,b=E+"_"+w;if(P[b]===void 0)return typeof _=="number"||typeof _=="boolean"?P[b]=_:ArrayBuffer.isView(_)?P[b]=_.slice():P[b]=_.clone(),!0;{let M=P[b];if(typeof _=="number"||typeof _=="boolean"){if(M!==_)return P[b]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(M.equals(_)===!1)return M.copy(_),!0}}return!1}function g(S){let E=S.uniforms,w=0,P=16;for(let b=0,M=E.length;b<M;b++){let R=Array.isArray(E[b])?E[b]:[E[b]];for(let F=0,I=R.length;F<I;F++){let C=R[F],L=Array.isArray(C.value)?C.value:[C.value];for(let D=0,z=L.length;D<z;D++){let q=L[D],G=m(q),Z=w%P,W=Z%G.boundary,et=Z+W;w+=W,et!==0&&P-et<G.storage&&(w+=P-et),C.__data=new Float32Array(G.storage/Float32Array.BYTES_PER_ELEMENT),C.__offset=w,w+=G.storage}}}let _=w%P;return _>0&&(w+=P-_),S.__size=w,S.__cache={},this}function m(S){let E={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(E.boundary=4,E.storage=4):S.isVector2?(E.boundary=8,E.storage=8):S.isVector3||S.isColor?(E.boundary=16,E.storage=12):S.isVector4?(E.boundary=16,E.storage=16):S.isMatrix3?(E.boundary=48,E.storage=48):S.isMatrix4?(E.boundary=64,E.storage=64):S.isTexture?Ot("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(E.boundary=16,E.storage=S.byteLength):Ot("WebGLRenderer: Unsupported uniform value type.",S),E}function v(S){let E=S.target;E.removeEventListener("dispose",v);let w=o.indexOf(E.__bindingPointIndex);o.splice(w,1),s.deleteBuffer(i[E.id]),delete i[E.id],delete r[E.id]}function N(){for(let S in i)s.deleteBuffer(i[S]);o=[],i={},r={}}return{bind:c,update:l,dispose:N}}var Qx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Vn=null;function t_(){return Vn===null&&(Vn=new Wo(Qx,16,16,Ti,bn),Vn.name="DFG_LUT",Vn.minFilter=Ve,Vn.magFilter=Ve,Vn.wrapS=Pn,Vn.wrapT=Pn,Vn.generateMipmaps=!1,Vn.needsUpdate=!0),Vn}var ic=class{constructor(t={}){let{canvas:e=Vu(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:f=je}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let x=f,g=new Set([ya,va,_a]),m=new Set([je,Sn,Fs,Ds,ga,xa]),v=new Uint32Array(4),N=new Int32Array(4),S=new V,E=null,w=null,P=[],_=[],b=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=yn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,R=!1,F=null,I=null,C=null,L=null;this._outputColorSpace=_e;let D=0,z=0,q=null,G=-1,Z=null,W=new ve,et=new ve,ut=null,Ft=new Ht(0),At=0,Bt=e.width,K=e.height,ot=1,vt=null,Dt=null,xt=new ve(0,0,Bt,K),zt=new ve(0,0,Bt,K),ye=!1,Gt=new Cs,Kt=!1,ne=!1,Yt=new fe,he=new V,we=new ve,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ue=!1;function Me(){return q===null?ot:1}let H=n;function Fe(A,k){return e.getContext(A,k)}let ee,U,y,X,j,it,dt,ft,st,ct,pt,Lt,gt,mt,B,Y,rt,O,nt,Q,lt,ht,at;try{let A={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Qt,!1),e.addEventListener("webglcontextrestored",Rt,!1),e.addEventListener("webglcontextcreationerror",Mt,!1),H===null){let k="webgl2";if(H=Fe(k,A),H===null)throw Fe(k)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ct()}catch(A){throw e.removeEventListener("webglcontextlost",Qt,!1),e.removeEventListener("webglcontextrestored",Rt,!1),e.removeEventListener("webglcontextcreationerror",Mt,!1),Ut("WebGLRenderer: "+A.message),A}function Ct(){ee=new ag(H),ee.init(),lt=new Yx(H,ee),U=new K0(H,ee,t,lt),y=new qx(H,ee),U.reversedDepthBuffer&&h&&y.buffers.depth.setReversed(!0),I=H.createFramebuffer(),C=H.createFramebuffer(),L=H.createFramebuffer(),X=new hg(H),j=new Px,it=new Xx(H,ee,y,j,U,lt,X),dt=new og(M),ft=new dp(H),ht=new $0(H,ft),st=new cg(H,ft,X,ht),ct=new dg(H,st,ft,ht,X),O=new ug(H,U,it),B=new j0(j),pt=new Ix(M,dt,ee,U,ht,B),Lt=new Kx(M,j),gt=new Nx,mt=new zx(ee),rt=new Z0(M,dt,y,ct,p,c),Y=new Wx(M,ct,U),at=new jx(H,X,U,y),nt=new J0(H,ee,X),Q=new lg(H,ee,X),X.programs=pt.programs,M.capabilities=U,M.extensions=ee,M.properties=j,M.renderLists=gt,M.shadowMap=Y,M.state=y,M.info=X}x!==je&&(b=new pg(x,e.width,e.height,a,i,r));let bt=new th(M,H);this.xr=bt,this.getContext=function(){return H},this.getContextAttributes=function(){return H.getContextAttributes()},this.forceContextLoss=function(){let A=ee.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=ee.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return ot},this.setPixelRatio=function(A){A!==void 0&&(ot=A,this.setSize(Bt,K,!1))},this.getSize=function(A){return A.set(Bt,K)},this.setSize=function(A,k,tt=!0){if(bt.isPresenting){Ot("WebGLRenderer: Can't change size while VR device is presenting.");return}Bt=A,K=k,e.width=Math.floor(A*ot),e.height=Math.floor(k*ot),tt===!0&&(e.style.width=A+"px",e.style.height=k+"px"),b!==null&&b.setSize(e.width,e.height),this.setViewport(0,0,A,k)},this.getDrawingBufferSize=function(A){return A.set(Bt*ot,K*ot).floor()},this.setDrawingBufferSize=function(A,k,tt){Bt=A,K=k,ot=tt,e.width=Math.floor(A*tt),e.height=Math.floor(k*tt),this.setViewport(0,0,A,k)},this.setEffects=function(A){if(x===je){Ut("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let k=0;k<A.length;k++)if(A[k].isOutputPass===!0){Ot("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}b.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(W)},this.getViewport=function(A){return A.copy(xt)},this.setViewport=function(A,k,tt,$){A.isVector4?xt.set(A.x,A.y,A.z,A.w):xt.set(A,k,tt,$),y.viewport(W.copy(xt).multiplyScalar(ot).round())},this.getScissor=function(A){return A.copy(zt)},this.setScissor=function(A,k,tt,$){A.isVector4?zt.set(A.x,A.y,A.z,A.w):zt.set(A,k,tt,$),y.scissor(et.copy(zt).multiplyScalar(ot).round())},this.getScissorTest=function(){return ye},this.setScissorTest=function(A){y.setScissorTest(ye=A)},this.setOpaqueSort=function(A){vt=A},this.setTransparentSort=function(A){Dt=A},this.getClearColor=function(A){return A.copy(rt.getClearColor())},this.setClearColor=function(){rt.setClearColor(...arguments)},this.getClearAlpha=function(){return rt.getClearAlpha()},this.setClearAlpha=function(){rt.setClearAlpha(...arguments)},this.clear=function(A=!0,k=!0,tt=!0){let $=0;if(A){let J=!1;if(q!==null){let St=q.texture.format;J=g.has(St)}if(J){let St=q.texture.type,Et=m.has(St),yt=rt.getClearColor(),It=rt.getClearAlpha(),Nt=yt.r,Wt=yt.g,Zt=yt.b;Et?(v[0]=Nt,v[1]=Wt,v[2]=Zt,v[3]=It,H.clearBufferuiv(H.COLOR,0,v)):(N[0]=Nt,N[1]=Wt,N[2]=Zt,N[3]=It,H.clearBufferiv(H.COLOR,0,N))}else $|=H.COLOR_BUFFER_BIT}k&&($|=H.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),tt&&($|=H.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),$!==0&&H.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),F=A},this.dispose=function(){e.removeEventListener("webglcontextlost",Qt,!1),e.removeEventListener("webglcontextrestored",Rt,!1),e.removeEventListener("webglcontextcreationerror",Mt,!1),rt.dispose(),gt.dispose(),mt.dispose(),j.dispose(),dt.dispose(),ct.dispose(),ht.dispose(),at.dispose(),pt.dispose(),bt.dispose(),bt.removeEventListener("sessionstart",Th),bt.removeEventListener("sessionend",Ah),Ni.stop()};function Qt(A){A.preventDefault(),dr("WebGLRenderer: Context Lost."),R=!0}function Rt(){dr("WebGLRenderer: Context Restored."),R=!1;let A=X.autoReset,k=Y.enabled,tt=Y.autoUpdate,$=Y.needsUpdate,J=Y.type;Ct(),X.autoReset=A,Y.enabled=k,Y.autoUpdate=tt,Y.needsUpdate=$,Y.type=J}function Mt(A){Ut("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function oe(A){let k=A.target;k.removeEventListener("dispose",oe),An(k)}function An(A){ts(A),j.remove(A)}function ts(A){let k=j.get(A).programs;k!==void 0&&(k.forEach(function(tt){pt.releaseProgram(tt)}),A.isShaderMaterial&&pt.releaseShaderCache(A))}this.renderBufferDirect=function(A,k,tt,$,J,St){k===null&&(k=Ne);let Et=J.isMesh&&J.matrixWorld.determinantAffine()<0,yt=Af(A,k,tt,$,J);y.setMaterial($,Et);let It=tt.index,Nt=1;if($.wireframe===!0){if(It=st.getWireframeAttribute(tt),It===void 0)return;Nt=2}let Wt=tt.drawRange,Zt=tt.attributes.position,Pt=Wt.start*Nt,ie=(Wt.start+Wt.count)*Nt;St!==null&&(Pt=Math.max(Pt,St.start*Nt),ie=Math.min(ie,(St.start+St.count)*Nt)),It!==null?(Pt=Math.max(Pt,0),ie=Math.min(ie,It.count)):Zt!=null&&(Pt=Math.max(Pt,0),ie=Math.min(ie,Zt.count));let Te=ie-Pt;if(Te<0||Te===1/0)return;ht.setup(J,$,yt,tt,It);let pe,le=nt;if(It!==null&&(pe=ft.get(It),le=Q,le.setIndex(pe)),J.isMesh)$.wireframe===!0?(y.setLineWidth($.wireframeLinewidth*Me()),le.setMode(H.LINES)):le.setMode(H.TRIANGLES);else if(J.isLine){let He=$.linewidth;He===void 0&&(He=1),y.setLineWidth(He*Me()),J.isLineSegments?le.setMode(H.LINES):J.isLineLoop?le.setMode(H.LINE_LOOP):le.setMode(H.LINE_STRIP)}else J.isPoints?le.setMode(H.POINTS):J.isSprite&&le.setMode(H.TRIANGLES);if(J.isBatchedMesh)if(ee.get("WEBGL_multi_draw"))le.renderMultiDraw(J._multiDrawStarts,J._multiDrawCounts,J._multiDrawCount);else{let He=J._multiDrawStarts,wt=J._multiDrawCounts,Ye=J._multiDrawCount,te=It?ft.get(It).bytesPerElement:1,cn=j.get($).currentProgram.getUniforms();for(let Cn=0;Cn<Ye;Cn++)cn.setValue(H,"_gl_DrawID",Cn),le.render(He[Cn]/te,wt[Cn])}else if(J.isInstancedMesh)le.renderInstances(Pt,Te,J.count);else if(tt.isInstancedBufferGeometry){let He=tt._maxInstanceCount!==void 0?tt._maxInstanceCount:1/0,wt=Math.min(tt.instanceCount,He);le.renderInstances(Pt,Te,wt)}else le.render(Pt,Te)};function Qs(A,k,tt,$){F!==null&&A.isNodeMaterial&&F.setObject($,A),Kt===!0&&B.setState(A,tt,!1),A.transparent===!0&&A.side===On&&A.forceSinglePass===!1?(A.side=Re,A.needsUpdate=!0,no(A,k,$),A.side=Mi,A.needsUpdate=!0,no(A,k,$),A.side=On):no(A,k,$)}this.compile=function(A,k,tt=null){tt===null&&(tt=A),F!==null&&F.renderStart(A,k,tt),w=mt.get(tt),w.init(k),_.push(w),tt.traverseVisible(function(J){J.isLight&&J.layers.test(k.layers)&&(w.pushLight(J),J.castShadow&&w.pushShadow(J))}),A!==tt&&A.traverseVisible(function(J){J.isLight&&J.layers.test(k.layers)&&(w.pushLight(J),J.castShadow&&w.pushShadow(J))}),w.setupLights(),F!==null&&F.updateLights(w.state.lightsArray),ne=this.localClippingEnabled,Kt=B.init(this.clippingPlanes,ne),Kt===!0&&B.setGlobalState(this.clippingPlanes,k),F!==null&&Y.render(w.state.shadowsArray,tt,k);let $=new Set;return A.traverse(function(J){if(!(J.isMesh||J.isPoints||J.isLine||J.isSprite))return;let St=J.material;if(St)if(Array.isArray(St))for(let Et=0;Et<St.length;Et++){let yt=St[Et];Qs(yt,tt,k,J),$.add(yt)}else Qs(St,tt,k,J),$.add(St)}),w=_.pop(),F!==null&&F.renderEnd(),$},this.compileAsync=function(A,k,tt=null){let $=this.compile(A,k,tt);return new Promise(J=>{function St(){if($.forEach(function(Et){let It=j.get(Et).currentProgram;(It===void 0||It.isReady())&&$.delete(Et)}),$.size===0){J(A);return}setTimeout(St,10)}ee.get("KHR_parallel_shader_compile")!==null?St():setTimeout(St,10)})};let Yn=null;function Ef(A){Yn&&Yn(A)}function Th(){Ni.stop()}function Ah(){Ni.start()}let Ni=new gd;Ni.setAnimationLoop(Ef),typeof self<"u"&&Ni.setContext(self),this.setAnimationLoop=function(A){Yn=A,bt.setAnimationLoop(A),A===null?Ni.stop():Ni.start()},bt.addEventListener("sessionstart",Th),bt.addEventListener("sessionend",Ah),this.render=function(A,k){if(k!==void 0&&k.isCamera!==!0){Ut("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;F!==null&&F.renderStart(A,k);let tt=bt.enabled===!0&&bt.isPresenting===!0,$=b!==null&&(q===null||tt)&&b.begin(M,q);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),bt.enabled===!0&&bt.isPresenting===!0&&(b===null||b.isCompositing()===!1)&&(bt.cameraAutoUpdate===!0&&bt.updateCamera(k),k=bt.getCamera()),A.isScene===!0&&A.onBeforeRender(M,A,k,q),w=mt.get(A,_.length),w.init(k),w.state.textureUnits=it.getTextureUnits(),_.push(w),Yt.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Gt.setFromProjectionMatrix(Yt,xn,k.reversedDepth),ne=this.localClippingEnabled,Kt=B.init(this.clippingPlanes,ne),E=gt.get(A,P.length),E.init(),P.push(E),bt.enabled===!0&&bt.isPresenting===!0){let Et=M.xr.getDepthSensingMesh();Et!==null&&Cc(Et,k,-1/0,M.sortObjects)}Cc(A,k,0,M.sortObjects),E.finish(),F!==null&&F.updateLights(w.state.lightsArray),M.sortObjects===!0&&E.sort(vt,Dt),ue=bt.enabled===!1||bt.isPresenting===!1||bt.hasDepthSensing()===!1,ue&&rt.addToRenderList(E,A),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Kt===!0&&B.beginShadows();let J=w.state.shadowsArray;if(Y.render(J,A,k),Kt===!0&&B.endShadows(),($&&b.hasRenderPass())===!1){let Et=E.opaque,yt=E.transmissive;if(w.setupLights(),k.isArrayCamera){let It=k.cameras;if(yt.length>0)for(let Nt=0,Wt=It.length;Nt<Wt;Nt++){let Zt=It[Nt];Rh(Et,yt,A,Zt)}ue&&rt.render(A);for(let Nt=0,Wt=It.length;Nt<Wt;Nt++){let Zt=It[Nt];Ch(E,A,Zt,Zt.viewport)}}else yt.length>0&&Rh(Et,yt,A,k),ue&&rt.render(A),Ch(E,A,k)}q!==null&&z===0&&(it.updateMultisampleRenderTarget(q),it.updateRenderTargetMipmap(q)),$&&b.end(M),A.isScene===!0&&A.onAfterRender(M,A,k),ht.resetDefaultState(),G=-1,Z=null,_.pop(),_.length>0?(w=_[_.length-1],it.setTextureUnits(w.state.textureUnits),Kt===!0&&B.setGlobalState(M.clippingPlanes,w.state.camera)):w=null,P.pop(),P.length>0?E=P[P.length-1]:E=null,F!==null&&F.renderEnd()};function Cc(A,k,tt,$){if(A.visible===!1)return;if(A.layers.test(k.layers)){if(A.isGroup)tt=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(k);else if(A.isLightProbeGrid)w.pushLightProbeGrid(A);else if(A.isLight)w.pushLight(A),A.castShadow&&w.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||A.intersectsFrustum(Gt)){$&&we.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Yt);let Et=ct.update(A),yt=A.material;yt.visible&&E.push(A,Et,yt,tt,we.z,null,k)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||A.intersectsFrustum(Gt))){let Et=ct.update(A),yt=A.material;if($&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),we.copy(A.boundingSphere.center)):(Et.boundingSphere===null&&Et.computeBoundingSphere(),we.copy(Et.boundingSphere.center)),we.applyMatrix4(A.matrixWorld).applyMatrix4(Yt)),Array.isArray(yt)){let It=Et.groups;for(let Nt=0,Wt=It.length;Nt<Wt;Nt++){let Zt=It[Nt],Pt=yt[Zt.materialIndex];Pt&&Pt.visible&&E.push(A,Et,Pt,tt,we.z,Zt,k)}}else yt.visible&&E.push(A,Et,yt,tt,we.z,null,k)}}let St=A.children;for(let Et=0,yt=St.length;Et<yt;Et++)Cc(St[Et],k,tt,$)}function Ch(A,k,tt,$){let{opaque:J,transmissive:St,transparent:Et}=A;w.setupLightsView(tt),Kt===!0&&B.setGlobalState(M.clippingPlanes,tt),$&&y.viewport(W.copy($)),J.length>0&&eo(J,k,tt),St.length>0&&eo(St,k,tt),Et.length>0&&eo(Et,k,tt),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function Rh(A,k,tt,$){if((tt.isScene===!0?tt.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[$.id]===void 0){let Pt=ee.has("EXT_color_buffer_half_float")||ee.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[$.id]=new Ke(1,1,{generateMipmaps:!0,type:Pt?bn:je,minFilter:wi,samples:Math.max(4,U.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Jt.workingColorSpace})}let St=w.state.transmissionRenderTarget[$.id],Et=$.viewport||W;St.setSize(Et.z*M.transmissionResolutionScale,Et.w*M.transmissionResolutionScale);let yt=M.getRenderTarget(),It=M.getActiveCubeFace(),Nt=M.getActiveMipmapLevel();M.setRenderTarget(St),M.getClearColor(Ft),At=M.getClearAlpha(),At<1&&M.setClearColor(16777215,.5),M.clear(),ue&&rt.render(tt);let Wt=M.toneMapping;M.toneMapping=yn;let Zt=$.viewport;if($.viewport!==void 0&&($.viewport=void 0),w.setupLightsView($),Kt===!0&&B.setGlobalState(M.clippingPlanes,$),eo(A,tt,$),it.updateMultisampleRenderTarget(St),it.updateRenderTargetMipmap(St),ee.has("WEBGL_multisampled_render_to_texture")===!1){let Pt=!1;for(let ie=0,Te=k.length;ie<Te;ie++){let pe=k[ie],{object:le,geometry:He,material:wt,group:Ye}=pe;if(wt.side===On&&le.layers.test($.layers)){let te=wt.side;wt.side=Re,wt.needsUpdate=!0,Ih(le,tt,$,He,wt,Ye),wt.side=te,wt.needsUpdate=!0,Pt=!0}}Pt===!0&&(it.updateMultisampleRenderTarget(St),it.updateRenderTargetMipmap(St))}M.setRenderTarget(yt,It,Nt),M.setClearColor(Ft,At),Zt!==void 0&&($.viewport=Zt),M.toneMapping=Wt}function eo(A,k,tt){let $=k.isScene===!0?k.overrideMaterial:null;for(let J=0,St=A.length;J<St;J++){let Et=A[J],{object:yt,geometry:It,group:Nt}=Et,Wt=Et.material;Wt.allowOverride===!0&&$!==null&&(Wt=$),yt.layers.test(tt.layers)&&Ih(yt,k,tt,It,Wt,Nt)}}function Ih(A,k,tt,$,J,St){F!==null&&J.isNodeMaterial&&F.setObject(A,J),A.onBeforeRender(M,k,tt,$,J,St),A.modelViewMatrix.multiplyMatrices(tt.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),J.onBeforeRender(M,k,tt,$,A,St),J.transparent===!0&&J.side===On&&J.forceSinglePass===!1?(J.side=Re,J.needsUpdate=!0,M.renderBufferDirect(tt,k,$,J,A,St),J.side=Mi,J.needsUpdate=!0,M.renderBufferDirect(tt,k,$,J,A,St),J.side=On):M.renderBufferDirect(tt,k,$,J,A,St),A.onAfterRender(M,k,tt,$,J,St)}function no(A,k,tt){k.isScene!==!0&&(k=Ne);let $=j.get(A),J=w.state.lights,St=w.state.shadowsArray,Et=J.state.version,yt=pt.getParameters(A,J.state,St,k,tt,w.state.lightProbeGridArray),It=pt.getProgramCacheKey(yt),Nt=$.programs;$.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?k.environment:null,$.fog=k.fog;let Wt=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;$.envMap=dt.get(A.envMap||$.environment,Wt),$.envMapRotation=$.environment!==null&&A.envMap===null?k.environmentRotation:A.envMapRotation,Nt===void 0&&(A.addEventListener("dispose",oe),Nt=new Map,$.programs=Nt);let Zt=Nt.get(It);if(Zt!==void 0){if($.currentProgram===Zt&&$.lightsStateVersion===Et)return Lh(A,yt),Zt}else yt.uniforms=pt.getUniforms(A),F!==null&&A.isNodeMaterial&&F.build(A,tt,yt),A.onBeforeCompile(yt,M),Zt=pt.acquireProgram(yt,It),Nt.set(It,Zt),$.uniforms=yt.uniforms;let Pt=$.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Pt.clippingPlanes=B.uniform),Lh(A,yt),$.needsLights=Rf(A),$.lightsStateVersion=Et,$.needsLights&&(Pt.ambientLightColor.value=J.state.ambient,Pt.lightProbe.value=J.state.probe,Pt.sunLights.value=J.state.sun,Pt.sunLightShadows.value=J.state.sunShadow,Pt.directionalLights.value=J.state.directional,Pt.directionalLightShadows.value=J.state.directionalShadow,Pt.spotLights.value=J.state.spot,Pt.spotLightShadows.value=J.state.spotShadow,Pt.rectAreaLights.value=J.state.rectArea,Pt.ltc_1.value=J.state.rectAreaLTC1,Pt.ltc_2.value=J.state.rectAreaLTC2,Pt.pointLights.value=J.state.point,Pt.pointLightShadows.value=J.state.pointShadow,Pt.hemisphereLights.value=J.state.hemi,Pt.sunShadowMatrix.value=J.state.sunShadowMatrix,Pt.sunShadowCascade.value=J.state.sunShadowCascade,Pt.directionalShadowMatrix.value=J.state.directionalShadowMatrix,Pt.spotLightMatrix.value=J.state.spotLightMatrix,Pt.spotLightMap.value=J.state.spotLightMap,Pt.pointShadowMatrix.value=J.state.pointShadowMatrix),$.lightProbeGrid=w.state.lightProbeGridArray.length>0,$.currentProgram=Zt,$.uniformsList=null,Zt}function Ph(A){if(A.uniformsList===null){let k=A.currentProgram.getUniforms();A.uniformsList=Os.seqWithValue(k.seq,A.uniforms)}return A.uniformsList}function Lh(A,k){let tt=j.get(A);tt.outputColorSpace=k.outputColorSpace,tt.batching=k.batching,tt.batchingColor=k.batchingColor,tt.instancing=k.instancing,tt.instancingColor=k.instancingColor,tt.instancingMorph=k.instancingMorph,tt.skinning=k.skinning,tt.morphTargets=k.morphTargets,tt.morphNormals=k.morphNormals,tt.morphColors=k.morphColors,tt.morphTargetsCount=k.morphTargetsCount,tt.numClippingPlanes=k.numClippingPlanes,tt.numIntersection=k.numClipIntersection,tt.vertexAlphas=k.vertexAlphas,tt.vertexTangents=k.vertexTangents,tt.toneMapping=k.toneMapping}function Tf(A,k){if(A.length===0)return null;if(A.length===1)return A[0].texture!==null?A[0]:null;S.setFromMatrixPosition(k.matrixWorld);for(let tt=0,$=A.length;tt<$;tt++){let J=A[tt];if(J.texture!==null&&J.boundingBox.containsPoint(S))return J}return null}function Af(A,k,tt,$,J){k.isScene!==!0&&(k=Ne),it.resetTextureUnits();let St=k.fog,Et=$.isMeshStandardMaterial||$.isMeshLambertMaterial||$.isMeshPhongMaterial?k.environment:null,yt=q===null?M.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:Jt.workingColorSpace,It=$.isMeshStandardMaterial||$.isMeshLambertMaterial&&!$.envMap||$.isMeshPhongMaterial&&!$.envMap,Nt=dt.get($.envMap||Et,It),Wt=$.vertexColors===!0&&!!tt.attributes.color&&tt.attributes.color.itemSize===4,Zt=!!tt.attributes.tangent&&(!!$.normalMap||$.anisotropy>0),Pt=!!tt.morphAttributes.position,ie=!!tt.morphAttributes.normal,Te=!!tt.morphAttributes.color,pe=yn;$.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(pe=M.toneMapping);let le=tt.morphAttributes.position||tt.morphAttributes.normal||tt.morphAttributes.color,He=le!==void 0?le.length:0,wt=j.get($),Ye=w.state.lights;if(Kt===!0&&(ne===!0||A!==Z)){let de=A===Z&&$.id===G;B.setState($,A,de)}let te=!1;$.version===wt.__version?(wt.needsLights&&wt.lightsStateVersion!==Ye.state.version||wt.outputColorSpace!==yt||J.isBatchedMesh&&wt.batching===!1||!J.isBatchedMesh&&wt.batching===!0||J.isBatchedMesh&&wt.batchingColor===!0&&J._colorsTexture===null||J.isBatchedMesh&&wt.batchingColor===!1&&J._colorsTexture!==null||J.isInstancedMesh&&wt.instancing===!1||!J.isInstancedMesh&&wt.instancing===!0||J.isSkinnedMesh&&wt.skinning===!1||!J.isSkinnedMesh&&wt.skinning===!0||J.isInstancedMesh&&wt.instancingColor===!0&&J.instanceColor===null||J.isInstancedMesh&&wt.instancingColor===!1&&J.instanceColor!==null||J.isInstancedMesh&&wt.instancingMorph===!0&&J.morphTexture===null||J.isInstancedMesh&&wt.instancingMorph===!1&&J.morphTexture!==null||wt.envMap!==Nt||$.fog===!0&&wt.fog!==St||wt.numClippingPlanes!==void 0&&(wt.numClippingPlanes!==B.numPlanes||wt.numIntersection!==B.numIntersection)||wt.vertexAlphas!==Wt||wt.vertexTangents!==Zt||wt.morphTargets!==Pt||wt.morphNormals!==ie||wt.morphColors!==Te||wt.toneMapping!==pe||wt.morphTargetsCount!==He||!!wt.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(te=!0):(te=!0,wt.__version=$.version);let cn=wt.currentProgram;te===!0&&(cn=no($,k,J),F&&$.isNodeMaterial&&F.onUpdateProgram($,cn,wt));let Cn=!1,ci=!1,es=!1,ae=cn.getUniforms(),Ee=wt.uniforms;if(y.useProgram(cn.program)&&(Cn=!0,ci=!0,es=!0),$.id!==G&&(G=$.id,ci=!0),wt.needsLights){let de=Tf(w.state.lightProbeGridArray,J);wt.lightProbeGrid!==de&&(wt.lightProbeGrid=de,ci=!0)}if(Cn||Z!==A){y.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),ae.setValue(H,"projectionMatrix",A.projectionMatrix),ae.setValue(H,"viewMatrix",A.matrixWorldInverse);let hi=ae.map.cameraPosition;hi!==void 0&&hi.setValue(H,he.setFromMatrixPosition(A.matrixWorld)),U.logarithmicDepthBuffer&&ae.setValue(H,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),($.isMeshPhongMaterial||$.isMeshToonMaterial||$.isMeshLambertMaterial||$.isMeshBasicMaterial||$.isMeshStandardMaterial||$.isShaderMaterial)&&ae.setValue(H,"isOrthographic",A.isOrthographicCamera===!0),Z!==A&&(Z=A,ci=!0,es=!0)}if(wt.needsLights&&(Ye.state.sunShadowMap.length>0&&ae.setValue(H,"sunShadowMap",Ye.state.sunShadowMap,it),Ye.state.directionalShadowMap.length>0&&ae.setValue(H,"directionalShadowMap",Ye.state.directionalShadowMap,it),Ye.state.spotShadowMap.length>0&&ae.setValue(H,"spotShadowMap",Ye.state.spotShadowMap,it),Ye.state.pointShadowMap.length>0&&ae.setValue(H,"pointShadowMap",Ye.state.pointShadowMap,it)),J.isSkinnedMesh){ae.setOptional(H,J,"bindMatrix"),ae.setOptional(H,J,"bindMatrixInverse");let de=J.skeleton;de&&(de.boneTexture===null&&de.computeBoneTexture(),ae.setValue(H,"boneTexture",de.boneTexture,it))}J.isBatchedMesh&&(ae.setOptional(H,J,"batchingTexture"),ae.setValue(H,"batchingTexture",J._matricesTexture,it),ae.setOptional(H,J,"batchingIdTexture"),ae.setValue(H,"batchingIdTexture",J._indirectTexture,it),ae.setOptional(H,J,"batchingColorTexture"),J._colorsTexture!==null&&ae.setValue(H,"batchingColorTexture",J._colorsTexture,it));let li=tt.morphAttributes;if((li.position!==void 0||li.normal!==void 0||li.color!==void 0)&&O.update(J,tt,cn),(ci||wt.receiveShadow!==J.receiveShadow)&&(wt.receiveShadow=J.receiveShadow,ae.setValue(H,"receiveShadow",J.receiveShadow)),($.isMeshStandardMaterial||$.isMeshLambertMaterial||$.isMeshPhongMaterial)&&$.envMap===null&&k.environment!==null&&(Ee.envMapIntensity.value=k.environmentIntensity),Ee.dfgLUT!==void 0&&(Ee.dfgLUT.value=t_()),ci){if(ae.setValue(H,"toneMappingExposure",M.toneMappingExposure),wt.needsLights&&Cf(Ee,es),St&&$.fog===!0&&Lt.refreshFogUniforms(Ee,St),Lt.refreshMaterialUniforms(Ee,$,ot,K,w.state.transmissionRenderTarget[A.id]),wt.needsLights&&wt.lightProbeGrid){let de=wt.lightProbeGrid;Ee.probesSH.value=de.texture,Ee.probesMin.value.copy(de.boundingBox.min),Ee.probesMax.value.copy(de.boundingBox.max),Ee.probesResolution.value.copy(de.resolution)}Os.upload(H,Ph(wt),Ee,it)}if($.isShaderMaterial&&$.uniformsNeedUpdate===!0&&(Os.upload(H,Ph(wt),Ee,it),$.uniformsNeedUpdate=!1),$.isSpriteMaterial&&ae.setValue(H,"center",J.center),ae.setValue(H,"modelViewMatrix",J.modelViewMatrix),ae.setValue(H,"normalMatrix",J.normalMatrix),ae.setValue(H,"modelMatrix",J.matrixWorld),$.uniformsGroups!==void 0){let de=$.uniformsGroups;for(let hi=0,ns=de.length;hi<ns;hi++){let Fh=de[hi];at.update(Fh,cn),at.bind(Fh,cn)}}return cn}function Cf(A,k){A.ambientLightColor.needsUpdate=k,A.lightProbe.needsUpdate=k,A.sunLights.needsUpdate=k,A.sunLightShadows.needsUpdate=k,A.directionalLights.needsUpdate=k,A.directionalLightShadows.needsUpdate=k,A.pointLights.needsUpdate=k,A.pointLightShadows.needsUpdate=k,A.spotLights.needsUpdate=k,A.spotLightShadows.needsUpdate=k,A.rectAreaLights.needsUpdate=k,A.hemisphereLights.needsUpdate=k}function Rf(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return D},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return q},this.setRenderTargetTextures=function(A,k,tt){let $=j.get(A);$.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,$.__autoAllocateDepthBuffer===!1&&($.__useRenderToTexture=!1),j.get(A.texture).__webglTexture=k,j.get(A.depthTexture).__webglTexture=$.__autoAllocateDepthBuffer?void 0:tt,$.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,k){let tt=j.get(A);tt.__webglFramebuffer=k,tt.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(A,k=0,tt=0){q=A,D=k,z=tt;let $=null,J=!1,St=!1;if(A){let yt=j.get(A);if(yt.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(H.FRAMEBUFFER,yt.__webglFramebuffer),W.copy(A.viewport),et.copy(A.scissor),ut=A.scissorTest,y.viewport(W),y.scissor(et),y.setScissorTest(ut),G=-1;return}else if(yt.__webglFramebuffer===void 0)it.setupRenderTarget(A);else if(yt.__hasExternalTextures)it.rebindTextures(A,j.get(A.texture).__webglTexture,j.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let Wt=A.depthTexture;if(yt.__boundDepthTexture!==Wt){if(Wt!==null&&j.has(Wt)&&(A.width!==Wt.image.width||A.height!==Wt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");it.setupDepthRenderbuffer(A)}}let It=A.texture;(It.isData3DTexture||It.isDataArrayTexture||It.isCompressedArrayTexture)&&(St=!0);let Nt=j.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Nt[k])?$=Nt[k][tt]:$=Nt[k],J=!0):A.samples>0&&it.useMultisampledRTT(A)===!1?$=j.get(A).__webglMultisampledFramebuffer:Array.isArray(Nt)?$=Nt[tt]:$=Nt,W.copy(A.viewport),et.copy(A.scissor),ut=A.scissorTest}else W.copy(xt).multiplyScalar(ot).floor(),et.copy(zt).multiplyScalar(ot).floor(),ut=ye;if(tt!==0&&($=I),y.bindFramebuffer(H.FRAMEBUFFER,$)&&y.drawBuffers(A,$),y.viewport(W),y.scissor(et),y.setScissorTest(ut),J){let yt=j.get(A.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_CUBE_MAP_POSITIVE_X+k,yt.__webglTexture,tt)}else if(St){let yt=k;for(let It=0;It<A.textures.length;It++){let Nt=j.get(A.textures[It]);H.framebufferTextureLayer(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0+It,Nt.__webglTexture,tt,yt)}}else if(A!==null&&tt!==0){let yt=j.get(A.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,yt.__webglTexture,tt)}G=-1};function Nh(A){let k=j.get(A);return(k.__readFormat!==A.format||k.__readType!==A.type)&&(k.__readFormat=A.format,k.__readType=A.type,k.__formatReadable=U.textureFormatReadable(A.format),k.__typeReadable=U.textureTypeReadable(A.type)),k}this.readRenderTargetPixels=function(A,k,tt,$,J,St,Et,yt=0){if(!(A&&A.isWebGLRenderTarget)){Ut("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let It=j.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Et!==void 0&&(It=It[Et]),It){y.bindFramebuffer(H.FRAMEBUFFER,It);try{let Nt=A.textures[yt],Wt=Nt.format,Zt=Nt.type;A.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+yt);let Pt=Nh(Nt);if(Pt.__formatReadable===!1){Ut("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pt.__typeReadable===!1){Ut("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=A.width-$&&tt>=0&&tt<=A.height-J&&H.readPixels(k,tt,$,J,lt.convert(Wt),lt.convert(Zt),St)}finally{let Nt=q!==null?j.get(q).__webglFramebuffer:null;y.bindFramebuffer(H.FRAMEBUFFER,Nt)}}},this.readRenderTargetPixelsAsync=async function(A,k,tt,$,J,St,Et,yt=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let It=j.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Et!==void 0&&(It=It[Et]),It)if(k>=0&&k<=A.width-$&&tt>=0&&tt<=A.height-J){y.bindFramebuffer(H.FRAMEBUFFER,It);let Nt=A.textures[yt],Wt=Nt.format,Zt=Nt.type;A.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+yt);let Pt=Nh(Nt);if(Pt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ie=H.createBuffer();H.bindBuffer(H.PIXEL_PACK_BUFFER,ie),H.bufferData(H.PIXEL_PACK_BUFFER,St.byteLength,H.STREAM_READ),H.readPixels(k,tt,$,J,lt.convert(Wt),lt.convert(Zt),0),H.bindBuffer(H.PIXEL_PACK_BUFFER,null);let Te=q!==null?j.get(q).__webglFramebuffer:null;y.bindFramebuffer(H.FRAMEBUFFER,Te);let pe=H.fenceSync(H.SYNC_GPU_COMMANDS_COMPLETE,0);return H.flush(),await Hu(H,pe,4),H.bindBuffer(H.PIXEL_PACK_BUFFER,ie),H.getBufferSubData(H.PIXEL_PACK_BUFFER,0,St),H.bindBuffer(H.PIXEL_PACK_BUFFER,null),H.deleteBuffer(ie),H.deleteSync(pe),St}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,k=null,tt=0){let $=Math.pow(2,-tt),J=Math.floor(A.image.width*$),St=Math.floor(A.image.height*$),Et=k!==null?k.x:0,yt=k!==null?k.y:0;it.setTexture2D(A,0),H.copyTexSubImage2D(H.TEXTURE_2D,tt,0,0,Et,yt,J,St),y.unbindTexture()},this.copyTextureToTexture=function(A,k,tt=null,$=null,J=0,St=0){let Et,yt,It,Nt,Wt,Zt,Pt,ie,Te,pe=A.isCompressedTexture?A.mipmaps[St]:A.image;if(tt!==null)Et=tt.max.x-tt.min.x,yt=tt.max.y-tt.min.y,It=tt.isBox3?tt.max.z-tt.min.z:1,Nt=tt.min.x,Wt=tt.min.y,Zt=tt.isBox3?tt.min.z:0;else{let Ee=Math.pow(2,-J);Et=Math.floor(pe.width*Ee),yt=Math.floor(pe.height*Ee),A.isDataArrayTexture?It=pe.depth:A.isData3DTexture?It=Math.floor(pe.depth*Ee):It=1,Nt=0,Wt=0,Zt=0}$!==null?(Pt=$.x,ie=$.y,Te=$.z):(Pt=0,ie=0,Te=0);let le=lt.convert(k.format),He=lt.convert(k.type),wt;k.isData3DTexture?(it.setTexture3D(k,0),wt=H.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(it.setTexture2DArray(k,0),wt=H.TEXTURE_2D_ARRAY):(it.setTexture2D(k,0),wt=H.TEXTURE_2D),y.activeTexture(H.TEXTURE0),y.pixelStorei(H.UNPACK_FLIP_Y_WEBGL,k.flipY),y.pixelStorei(H.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),y.pixelStorei(H.UNPACK_ALIGNMENT,k.unpackAlignment);let Ye=y.getParameter(H.UNPACK_ROW_LENGTH),te=y.getParameter(H.UNPACK_IMAGE_HEIGHT),cn=y.getParameter(H.UNPACK_SKIP_PIXELS),Cn=y.getParameter(H.UNPACK_SKIP_ROWS),ci=y.getParameter(H.UNPACK_SKIP_IMAGES);y.pixelStorei(H.UNPACK_ROW_LENGTH,pe.width),y.pixelStorei(H.UNPACK_IMAGE_HEIGHT,pe.height),y.pixelStorei(H.UNPACK_SKIP_PIXELS,Nt),y.pixelStorei(H.UNPACK_SKIP_ROWS,Wt),y.pixelStorei(H.UNPACK_SKIP_IMAGES,Zt);let es=A.isDataArrayTexture||A.isData3DTexture,ae=k.isDataArrayTexture||k.isData3DTexture;if(A.isDepthTexture){let Ee=j.get(A),li=j.get(k),de=j.get(Ee.__renderTarget),hi=j.get(li.__renderTarget);y.bindFramebuffer(H.READ_FRAMEBUFFER,de.__webglFramebuffer),y.bindFramebuffer(H.DRAW_FRAMEBUFFER,hi.__webglFramebuffer);for(let ns=0;ns<It;ns++)es&&(H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,j.get(A).__webglTexture,J,Zt+ns),H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,j.get(k).__webglTexture,St,Te+ns)),H.blitFramebuffer(Nt,Wt,Et,yt,Pt,ie,Et,yt,H.DEPTH_BUFFER_BIT,H.NEAREST);y.bindFramebuffer(H.READ_FRAMEBUFFER,null),y.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else if(J!==0||A.isRenderTargetTexture||j.has(A)){let Ee=j.get(A),li=j.get(k);y.bindFramebuffer(H.READ_FRAMEBUFFER,C),y.bindFramebuffer(H.DRAW_FRAMEBUFFER,L);for(let de=0;de<It;de++)es?H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,Ee.__webglTexture,J,Zt+de):H.framebufferTexture2D(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,Ee.__webglTexture,J),ae?H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,li.__webglTexture,St,Te+de):H.framebufferTexture2D(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,li.__webglTexture,St),J!==0?H.blitFramebuffer(Nt,Wt,Et,yt,Pt,ie,Et,yt,H.COLOR_BUFFER_BIT,H.NEAREST):ae?H.copyTexSubImage3D(wt,St,Pt,ie,Te+de,Nt,Wt,Et,yt):H.copyTexSubImage2D(wt,St,Pt,ie,Nt,Wt,Et,yt);y.bindFramebuffer(H.READ_FRAMEBUFFER,null),y.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else ae?A.isDataTexture||A.isData3DTexture?H.texSubImage3D(wt,St,Pt,ie,Te,Et,yt,It,le,He,pe.data):k.isCompressedArrayTexture?H.compressedTexSubImage3D(wt,St,Pt,ie,Te,Et,yt,It,le,pe.data):H.texSubImage3D(wt,St,Pt,ie,Te,Et,yt,It,le,He,pe):A.isDataTexture?H.texSubImage2D(H.TEXTURE_2D,St,Pt,ie,Et,yt,le,He,pe.data):A.isCompressedTexture?H.compressedTexSubImage2D(H.TEXTURE_2D,St,Pt,ie,pe.width,pe.height,le,pe.data):H.texSubImage2D(H.TEXTURE_2D,St,Pt,ie,Et,yt,le,He,pe);y.pixelStorei(H.UNPACK_ROW_LENGTH,Ye),y.pixelStorei(H.UNPACK_IMAGE_HEIGHT,te),y.pixelStorei(H.UNPACK_SKIP_PIXELS,cn),y.pixelStorei(H.UNPACK_SKIP_ROWS,Cn),y.pixelStorei(H.UNPACK_SKIP_IMAGES,ci),St===0&&k.generateMipmaps&&H.generateMipmap(wt),y.unbindTexture()},this.initRenderTarget=function(A){j.get(A).__webglFramebuffer===void 0&&it.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?it.setTextureCube(A,0):A.isData3DTexture?it.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?it.setTexture2DArray(A,0):it.setTexture2D(A,0),y.unbindTexture()},this.resetState=function(){D=0,z=0,q=null,y.reset(),ht.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return xn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Jt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Jt._getUnpackColorSpace()}};var on=60,bd=5;function wd(s){return s>>>=0,function(){s|=0,s=s+1831565813|0;let e=Math.imul(s^s>>>15,1|s);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function e_(){let s=document.createElement("canvas");s.width=256,s.height=256;let t=s.getContext("2d");t.fillStyle="#c9a36a",t.fillRect(0,0,256,256);let e=wd(20903),n=t.getImageData(0,0,256,256),i=n.data;for(let o=0;o<i.length;o+=4){let a=(e()-.5)*36;i[o]=Math.max(0,Math.min(255,i[o]+a)),i[o+1]=Math.max(0,Math.min(255,i[o+1]+a*.85)),i[o+2]=Math.max(0,Math.min(255,i[o+2]+a*.55))}t.putImageData(n,0,0),t.strokeStyle="rgba(90, 60, 30, 0.18)",t.lineWidth=2;for(let o=32;o<256;o+=32)t.beginPath(),t.moveTo(0,o+e()*2),t.lineTo(256,o+e()*2),t.stroke();let r=new nn(s);return r.wrapS=r.wrapT=Ln,r.colorSpace=_e,r.anisotropy=4,r}var n_=new Ce(1,1,1),i_=new wr(.32,.36,.9,8);function Ed(s,t){let e=e_();e.repeat.set(1,1);let n=new be({map:e,roughness:.92,metalness:0}),i=new be({color:1709070,roughness:1}),r=new be({color:9272164,roughness:1}),o=new be({color:14139274,roughness:1}),a=new be({color:11883066,roughness:.85}),c=new be({color:14206880,roughness:.85}),l=new be({color:7029795,roughness:.8}),u=new be({color:12096874,roughness:.95}),d=[11745835,14209732,2898500,12886362,4016690].map(_=>new be({color:_,roughness:.55,metalness:.15})),h=new be({color:10405076,roughness:.25,metalness:.1});s.background=new Ht(9357546),s.fog=new pr(13812898,.016);let f=new $t(new Vi(800,800),new Er({color:13153418}));f.rotation.x=-Math.PI/2,f.position.y=-.1,f.receiveShadow=!1,s.add(f);let p=new Ar(12049909,12886122,.85);s.add(p);let x=new Pr(16774100,2.5);x.position.set(28,48,16),x.castShadow=!0,x.shadow.mapSize.set(2048,2048),x.shadow.camera.near=1,x.shadow.camera.far=160,x.shadow.camera.left=-36,x.shadow.camera.right=36,x.shadow.camera.top=36,x.shadow.camera.bottom=-36,x.shadow.bias=-4e-4,s.add(x),s.add(x.target);let g=[],m=[];function v(_,b,M,R,F,I,C,L,D={}){let z=new $t(n_,b);return z.scale.set(I,C,L),z.position.set(M,R,F),z.castShadow=D.cast!==!1,z.receiveShadow=!0,z.userData.segId=_.id,_.group.add(z),D.collide!==!1&&(m.push(z),_.owned.push(z)),z}function N(_){let b=new Set(_.owned);for(let C=m.length-1;C>=0;C--)b.has(m[C])&&m.splice(C,1);for(_.owned.length=0,_.coverPoints.length=0;_.group.children.length;)_.group.remove(_.group.children[0]);let M=wd((t^Math.imul(_.gen+1,2654435761)^Math.imul(_.id+1,2246822507))>>>0),R=_.originZ;v(_,r,0,-.05,R-on/2,10,.1,on,{cast:!1}),v(_,o,-10.5,-.02,R-on/2,12,.08,on,{cast:!1}),v(_,o,10.5,-.02,R-on/2,12,.08,on,{cast:!1}),S(_,M,-1,R),S(_,M,1,R);let F=1+M()*3|0;for(let C=0;C<F;C++){let L=M()<.5?-1:1,D=R-6-M()*(on-12);E(_,M,L*(3.2+M()*.6),D)}let I=2+M()*4|0;for(let C=0;C<I;C++){let L=M()<.5?-1:1,D=R-4-M()*(on-8),z=L*(5.4+M()*1.2),q=new $t(i_,l);q.position.set(z,.45,D),q.castShadow=!0,q.receiveShadow=!0,q.userData.segId=_.id,_.group.add(q),m.push(q),_.owned.push(q),_.coverPoints.push({pos:new V(z,.7,D),type:"barrel"})}}function S(_,b,M,R){let F=R-3,I=R-on+2;for(;F-6>I;){let C=8+b()*8;if(F-C<I)break;if(b()<.2){let et=4+b()*3;_.coverPoints.push({pos:new V(M*7.2,1.2,F-et*.5),type:"alley"}),b()<.6&&(v(_,u,M*6.2,.45,F-et*.5,.35,.9,Math.min(et-.5,3.5)),_.coverPoints.push({pos:new V(M*6.2,1,F-et*.5),type:"wall"})),F-=et;continue}let L=6+b()*3,D=b()<.4?2:3,z=D*3.15,q=M*(6.2+L*.5),G=F-C*.5;v(_,n,q,z*.5,G,L,z,C-.35),v(_,n,q,z+.28,G,L+.35,.55,C,{collide:!1});let Z=q-M*(L*.5);_.coverPoints.push({pos:new V(Z+M*.45,z+.7,G),type:"roof"});let W=G+(b()-.5)*C*.3;if(v(_,i,Z-M*.12,1.15,W,.28,2.3,1.15),_.coverPoints.push({pos:new V(Z-M*.4,1.2,W),type:"door"}),b()<.65){let et=b()<.5?a:c;v(_,et,Z-M*1.15,2.55,W,2.1,.08,2.4,{collide:!1})}for(let et=0;et<D;et++){let ut=1.7+et*3.15,Ft=Math.max(2,Math.round(C/4));for(let At=0;At<Ft;At++){let Bt=G-C*.38+(At+.5)/Ft*C*.76;Math.abs(Bt-W)<.9&&et===0||(v(_,i,Z-M*.1,ut,Bt,.22,1.15,.85),_.coverPoints.push({pos:new V(Z-M*.45,ut,Bt),type:"window"}))}}if(b()<.45){let et=G+(b()-.5)*C*.5;v(_,u,M*5.5,.4,et,.4,.8,2.2+b()*2),_.coverPoints.push({pos:new V(M*5.5,.9,et),type:"wall"})}F-=C}}function E(_,b,M,R){let F=d[b()*d.length|0],I=b()<.5?0:Math.PI;v(_,F,M,.48,R,1.75,.62,4.15);let C=v(_,h,M,1.05,R+.15,1.5,.52,2);C.rotation.y=I,_.coverPoints.push({pos:new V(M,1.15,R),type:"car"})}for(let _=0;_<bd;_++){let b=new qe;s.add(b);let M={id:_,gen:0,originZ:-_*on,group:b,coverPoints:[],owned:[]};g.push(M),N(M)}function w(_){f.position.z=_,x.position.set(26,46,_+18),x.target.position.set(0,0,_-30),x.target.updateMatrixWorld();for(let b=0;b<g.length;b++){let M=g[b];_<M.originZ-on-8&&(M.originZ-=bd*on,M.gen+=1,N(M))}}function P(_){for(let b=0;b<g.length;b++){let M=g[b];M.gen=0,M.originZ=-b*on,N(M)}w(_??0)}return{update:w,reset:P,segments:g,colliders:m}}var Td=60*Math.PI/180,Ad=35*Math.PI/180,s_=.0023,r_=9e-4;function Cd(s,t,e){return Math.max(t,Math.min(e,s))}function Rd(s){let t={yaw:0,pitch:0,fire:!1,scope:!1,cover:!1,reloadPressed:!1,endFrame(){t.reloadPressed=!1}};t.state=t;let e=new Map,n=!1,i=!1,r=!1,o=document.createElement("div");o.id="controls";let a={};for(let p of["reload","scope","fire"]){let x=document.createElement("button");x.type="button",x.dataset.ctl=p,x.textContent=p.toUpperCase(),o.appendChild(x),a[p]=x}document.body.appendChild(o);let c=0;function l(){t.fire=n||i||r,a.scope.classList.toggle("on",t.scope)}function u(p){let x=p&&p.closest?p.closest("[data-ctl]"):null;return x?x.dataset.ctl:null}s.style.touchAction="none",s.addEventListener("pointerdown",p=>{if(!u(p.target)&&!(!window.SS||!window.SS.running||performance.now()-(window.SS.startedAt||0)<400)&&!(p.pointerType==="mouse"&&p.button!==0)){if(p.preventDefault(),t.touch=p.pointerType!=="mouse",e.set(p.pointerId,{x:p.clientX,y:p.clientY,sx:p.clientX,sy:p.clientY,mouse:p.pointerType==="mouse",shots0:window.SS.weapon?window.SS.weapon.shotsFired:0}),p.pointerType==="mouse"){let x=p.pointerId;c=setTimeout(()=>{let g=e.get(x);g&&!g.moved&&(r=!0,g.held=!0,l())},100)}l();try{s.setPointerCapture(p.pointerId)}catch{}}}),window.addEventListener("pointermove",p=>{let x=e.get(p.pointerId);if(!x)return;p.preventDefault();let g=p.clientX-x.x,m=p.clientY-x.y;x.x=p.clientX,x.y=p.clientY,x.mouse&&Math.hypot(x.x-x.sx,x.y-x.sy)>4&&(x.moved=!0,clearTimeout(c),r&&(r=!1,l()));let v=t.scope?r_:s_;t.yaw=Cd(t.yaw+g*v,-Td,Td),t.pitch=Cd(t.pitch+m*v,-Ad,Ad)},{passive:!1});function d(p){let x=e.get(p.pointerId);x&&(e.delete(p.pointerId),x.mouse&&(clearTimeout(c),!x.moved&&Math.hypot(p.clientX-x.sx,p.clientY-x.sy)<=4&&(!x.held||window.SS.weapon&&window.SS.weapon.shotsFired===x.shots0)&&(t.clickShot=!0),r=!1),l())}window.addEventListener("pointerup",d),window.addEventListener("pointercancel",d),o.addEventListener("pointerdown",p=>{let x=u(p.target);if(x){if(p.preventDefault(),p.stopPropagation(),x==="fire")n=!0;else if(x==="scope"){t.scope=!0;try{a.scope.setPointerCapture(p.pointerId)}catch{}}else x==="reload"&&(t.reloadPressed=!0);l()}}),a.fire.addEventListener("pointerdown",p=>{try{a.fire.setPointerCapture(p.pointerId)}catch{}});let h=()=>{t.scope=!1,l()};a.scope.addEventListener("pointerup",h),a.scope.addEventListener("pointercancel",h),a.scope.addEventListener("lostpointercapture",h);let f=()=>{n=!1,l()};return a.fire.addEventListener("pointerup",f),a.fire.addEventListener("pointercancel",f),a.fire.addEventListener("lostpointercapture",f),window.addEventListener("keydown",p=>{if(!p.repeat){if(p.code==="Space")i=!0,p.preventDefault();else if(p.code==="KeyQ")t.scope=!0;else if(p.code==="KeyR")t.reloadPressed=!0;else return;l()}}),window.addEventListener("keyup",p=>{p.code==="Space"?(i=!1,l()):p.code==="KeyQ"&&(t.scope=!1,l())}),s.addEventListener("contextmenu",p=>p.preventDefault()),l(),t}var qr=30,o_=6,Id=0,a_=2,c_=60/600,eh=35*Math.PI/180,l_=.6*Math.PI/180,h_=.08*Math.PI/180,u_=3.5*Math.PI/180,wn=new V,ks=new V,d_=new V,Pd=new V,Hs=new V,oc=new V,Ld=new V(.34,-.32,-.48),f_=new V(0,-.2,-.4),p_=new V(.28,-.78,-.32),ac=new V,Ai=new V,Nd=3*Math.PI/180,Fd=1.2*Math.PI/180,m_=.6,g_=5*Math.PI/180,x_=.8;function Dd(s,t,e,n){let i=document.createElement("canvas");i.width=i.height=64;let r=i.getContext("2d"),o=r.createRadialGradient(32,32,2,32,32,30);o.addColorStop(0,`rgba(${s},${t},${e},${n})`),o.addColorStop(1,`rgba(${s},${t},${e},0)`),r.fillStyle=o,r.fillRect(0,0,64,64);let a=new nn(i);return a.colorSpace=_e,a}function Gs(s,t,e,n,i,r,o,a,c){let l=new $t(new Ce(r,o,a),new be({color:t,roughness:.62,metalness:c??.4}));return l.position.set(e,n,i),l.castShadow=!1,l.receiveShadow=!1,s.add(l),l}function Bd(s,t,e){let n=[],i={ammo:qr,magSize:qr,reloading:!1,shotsFired:0,shotsHit:0,targets:n,onHit:null,onShot:null,onReload:null},r=new qe;r.position.copy(Ld),s.add(r),Gs(r,4863012,0,-.02,.16,.055,.09,.22,.05),Gs(r,2763816,0,.02,-.06,.05,.075,.28,.55),Gs(r,1711130,0,.03,-.42,.02,.02,.46,.7),Gs(r,2369060,0,-.09,-.04,.03,.14,.07,.3),Gs(r,3811868,0,-.07,.08,.038,.1,.05,.1),Gs(r,1118481,0,.075,-.1,.012,.028,.08,.8);let o=new Ir(16756832,0,3.2,2);o.position.set(0,.03,-.66),r.add(o);let a=new Bn(new vn({map:Dd(255,200,120,1),transparent:!0,depthWrite:!1,blending:Hi}));a.position.copy(o.position),a.scale.setScalar(.16),a.visible=!1,r.add(a);let c=new vn({map:Dd(196,168,120,.85),transparent:!0,depthWrite:!1}),l=[],u=new qe;e.add(u);for(let S=0;S<16;S++){let E=new Bn(c.clone());E.visible=!1,E.scale.setScalar(.2),u.add(E),l.push({sprite:E,life:0,max:.28})}let d=new ki;d.far=180;let h=0,f=0,p=0,x=0;function g(S,E){let w=l[0];for(let P=0;P<l.length;P++){if(l[P].life<=0){w=l[P];break}l[P].life<w.life&&(w=l[P])}w.life=w.max,w.sprite.visible=!0,w.sprite.position.copy(S),E&&w.sprite.position.addScaledVector(E,.06),w.sprite.material.opacity=.75,w.sprite.scale.setScalar(.12)}let m=0;function v(){i.reloading||i.ammo>=qr||(i.reloading=!0,f=0,Id=performance.now()+a_*1e3,i.onReload&&i.onReload("start"))}function N(S){i.ammo-=1,i.shotsFired+=1,h=c_,p=.05,o.intensity=5,a.visible=!0;let E=S.scope?.005:.02;S.pitch=Math.max(-eh,Math.min(eh,S.pitch-E)),m+=E,x=S.scope?.03:.07,i.onShot&&i.onShot(),s.getWorldDirection(wn),ks.crossVectors(wn,d_.set(0,1,0)),ks.lengthSq()<1e-6&&ks.set(1,0,0),ks.normalize(),Pd.crossVectors(ks,wn).normalize(),s.getWorldPosition(Hs);{let L=S.scope?Fd:S.touch?g_:Nd,D=null,z=L;for(let q=0;q<n.length;q++){let G=n[q];if(!G.userData||G.userData.part==="head"||!G.visible)continue;G.getWorldPosition(Ai),Ai.sub(Hs);let Z=Ai.angleTo(wn);Z<z&&(z=Z,D=Ai.clone().normalize())}D&&wn.lerp(D,S.touch&&!S.scope?x_:m_).normalize()}S.cover&&(Hs.y+=.5);let w=S.cover?u_:S.scope?h_:l_,P=Math.random()*Math.PI*2,_=Math.tan(w)*Math.sqrt(Math.random());wn.addScaledVector(ks,Math.cos(P)*_),wn.addScaledVector(Pd,Math.sin(P)*_),wn.normalize(),d.set(Hs,wn);let b=d.intersectObjects(t.colliders,!1),M=n.length?d.intersectObjects(n,!1):[],R=b[0],F=M[0],I=F?R?F.distance<R.distance?F:R:F:R;if(!I){i.ammo<=0&&v();return}let C=I.object.userData||{};C.enemy?(i.shotsHit+=1,i.onHit&&i.onHit({enemy:C.enemy,part:C.part,point:I.point.clone()})):(oc.set(0,1,0),I.face&&(oc.copy(I.face.normal),oc.transformDirection(I.object.matrixWorld)),g(I.point,oc)),i.ammo<=0&&v()}return i.update=function(E,w){let P=1-Math.exp(-10*E);w.cover?ac.copy(p_):w.scope?ac.copy(f_):ac.copy(Ld),r.position.lerp(ac,P),x+=(0-x)*(1-Math.exp(-8*E)),r.rotation.x=x,r.rotation.y=w.scope||w.cover?0:.05,p>0&&(p-=E,p<=0&&(o.intensity=0,a.visible=!1));for(let b=0;b<l.length;b++){let M=l[b];if(M.life<=0)continue;M.life-=E;let R=Math.max(0,M.life/M.max);M.sprite.material.opacity=.75*R,M.sprite.scale.setScalar(.12+(1-R)*.28),M.life<=0&&(M.sprite.visible=!1)}if(i.reloading?(f+=E,performance.now()>=Id&&(i.reloading=!1,i.ammo=qr,i.onReload&&i.onReload("end"))):(w.reloadPressed||i.ammo<=0)&&v(),m>0){let b=Math.min(m,m*(1-Math.exp(-o_*E))+.002*E*60);m-=b,w.pitch=Math.min(eh,w.pitch+b)}{s.getWorldDirection(wn),s.getWorldPosition(Hs);let b=w.scope?Fd:Nd,M=!1;for(let R=0;R<n.length&&!M;R++){let F=n[R];F.visible&&(F.getWorldPosition(Ai),Ai.sub(Hs),Ai.length()<180&&Ai.angleTo(wn)<b&&(M=!0))}i.onTarget=M}h-=E,w.clickShot&&!i.reloading&&i.ammo>0&&h<=0?(w.clickShot=!1,N(w)):w.clickShot&&i.ammo<=0&&(w.clickShot=!1),w.fire&&!i.reloading&&i.ammo>0&&h<=0&&N(w)},i.reset=function(){i.ammo=qr,i.reloading=!1,i.shotsFired=0,i.shotsHit=0,h=0,f=0,m=0,x=0,p=0,o.intensity=0,a.visible=!1},i}function Ud(){let s=document.getElementById("hud"),t=document.createElement("div");t.id="distance",t.textContent="0 m";let e=document.createElement("div");e.id="score",e.textContent="0";let n=document.createElement("div");n.id="health";let i=document.createElement("div");n.appendChild(i);let r=document.createElement("div");r.id="ammo",r.textContent="30 / \u221E";let o=document.createElement("div");o.id="reloading",o.textContent="RELOADING",o.style.display="none";let a=document.createElement("div");a.id="crosshair";for(let W=0;W<4;W++){let et=document.createElement("span");et.className="arm a"+W,a.appendChild(et)}let c=document.createElement("div");c.id="red-dot";let l=document.createElement("div");l.id="hit-marker";for(let W=0;W<4;W++){let et=document.createElement("span");l.appendChild(et)}let u=document.createElement("div");u.id="dmg-vignette";let d=document.createElement("div");d.id="dmg-dir";let h=document.createElement("div");h.className="arrow",d.appendChild(h);let f=document.createElement("div");f.id="hs-icon",f.textContent="HS";let p=document.createElement("div");p.id="radio-callouts";let x=[],g=0;s.append(t,e,n,r,o,a,c,l,u,d,f,p);let m=100,v=0,N=0,S=0,E=0;function w(){let W=Math.max(0,Math.min(100,m));i.style.width=W+"%"}function P(){l.classList.add("show"),clearTimeout(N),N=setTimeout(()=>l.classList.remove("show"),220)}function _(W){let et=Math.max(.6,Math.min(1,W??1));u.style.transition="none",u.style.opacity=String(et),requestAnimationFrame(()=>{u.style.transition="opacity 0.55s linear",u.style.opacity="0"})}function b(W){d.style.transform="rotate("+W+"rad)",d.style.opacity="1",clearTimeout(S),S=setTimeout(()=>{d.style.opacity="0"},900)}function M(W){m=W,window.SS&&(window.SS.health=W),w()}function R(){f.classList.add("show"),clearTimeout(E),E=setTimeout(()=>f.classList.remove("show"),420)}let F="",I=document.createElement("div");I.id="enemies-left",s.appendChild(I);function C(W){let et=W>0?"ENEMIES "+W:"";I.textContent!==et&&(I.textContent=et),I.style.display=W>0?"block":"none"}let L=document.createElement("div");L.id="wave-banner",s.appendChild(L);let D=0;function z(W){L.textContent=W,L.classList.remove("show"),L.offsetWidth,L.classList.add("show"),clearTimeout(D),D=setTimeout(()=>L.classList.remove("show"),1300)}function q(W){a.classList.toggle("on-target",!!W)}function G(W){let et=performance.now();if(et<g||W===F)return;g=et+4e3,F=W;let ut=document.createElement("div");for(ut.className="radio-line",ut.textContent="[RADIO] "+W,p.appendChild(ut),x.push(ut);x.length>2;)x.shift().remove();setTimeout(()=>{ut.remove();let Ft=x.indexOf(ut);Ft>=0&&x.splice(Ft,1)},2e3)}function Z(W){v=W|0,e.textContent=String(v),window.SS&&(window.SS.score=v)}return w(),{update(W){W&&(W.distance!=null&&(t.textContent=Math.floor(W.distance)+" m"),W.ammo!=null&&(r.textContent=W.ammo+" / \u221E"),W.reloading!=null&&(o.style.display=W.reloading?"block":"none"),W.scoped!=null&&(a.style.display=W.scoped?"none":"block",c.style.display=W.scoped?"block":"none"),W.health!=null&&(m=W.health,w()),W.score!=null&&(v=W.score|0,e.textContent=String(v)))},hitMarker:P,damageVignette:_,damageDirection:b,setHealth:M,setScore:Z,headshotFlash:R,callout:G,banner:z,setRemaining:C,onTarget:q}}function Od(s,t,e){let n={health:100,alive:!0},i=0;return n.damage=function(o,a){if(!n.alive)return;let c=Math.max(0,o||0);if(n.health=Math.max(0,n.health-c),window.SS&&(window.SS.health=n.health),e&&(e.setHealth(n.health),e.damageVignette(Math.min(1,.6+c/28)),a&&s)){let l=a.x-s.position.x,u=a.z-s.position.z,d=t?t.yaw:0,h=l*Math.sin(d)+u*-Math.cos(d),f=l*Math.cos(d)+u*Math.sin(d);e.damageDirection(Math.atan2(f,h))}i=5,n.health<=0&&(n.alive=!1,window.SS&&(window.SS.running=!1,window.SS.walking=!1,typeof window.SS.onDeath=="function"&&window.SS.onDeath()))},n.update=function(o){if(!n.alive||n.health>=100)return;if(i>0){i-=o;return}let c=!!(t&&(t.cover||window.SS&&window.SS.cover&&window.SS.cover.state==="in"))?16:4;n.health=Math.min(100,n.health+c*o),window.SS&&(window.SS.health=n.health),e&&e.setHealth(n.health)},n.reset=function(){n.health=100,n.alive=!0,i=0,window.SS&&(window.SS.health=100),e&&e.setHealth(100)},n}var Ri=class s{constructor(t){t===void 0&&(t=[0,0,0,0,0,0,0,0,0]),this.elements=t}identity(){let t=this.elements;t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1}setZero(){let t=this.elements;t[0]=0,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=0,t[6]=0,t[7]=0,t[8]=0}setTrace(t){let e=this.elements;e[0]=t.x,e[4]=t.y,e[8]=t.z}getTrace(t){t===void 0&&(t=new T);let e=this.elements;return t.x=e[0],t.y=e[4],t.z=e[8],t}vmult(t,e){e===void 0&&(e=new T);let n=this.elements,i=t.x,r=t.y,o=t.z;return e.x=n[0]*i+n[1]*r+n[2]*o,e.y=n[3]*i+n[4]*r+n[5]*o,e.z=n[6]*i+n[7]*r+n[8]*o,e}smult(t){for(let e=0;e<this.elements.length;e++)this.elements[e]*=t}mmult(t,e){e===void 0&&(e=new s);let n=this.elements,i=t.elements,r=e.elements,o=n[0],a=n[1],c=n[2],l=n[3],u=n[4],d=n[5],h=n[6],f=n[7],p=n[8],x=i[0],g=i[1],m=i[2],v=i[3],N=i[4],S=i[5],E=i[6],w=i[7],P=i[8];return r[0]=o*x+a*v+c*E,r[1]=o*g+a*N+c*w,r[2]=o*m+a*S+c*P,r[3]=l*x+u*v+d*E,r[4]=l*g+u*N+d*w,r[5]=l*m+u*S+d*P,r[6]=h*x+f*v+p*E,r[7]=h*g+f*N+p*w,r[8]=h*m+f*S+p*P,e}scale(t,e){e===void 0&&(e=new s);let n=this.elements,i=e.elements;for(let r=0;r!==3;r++)i[3*r+0]=t.x*n[3*r+0],i[3*r+1]=t.y*n[3*r+1],i[3*r+2]=t.z*n[3*r+2];return e}solve(t,e){e===void 0&&(e=new T);let n=3,i=4,r=[],o,a;for(o=0;o<n*i;o++)r.push(0);for(o=0;o<3;o++)for(a=0;a<3;a++)r[o+i*a]=this.elements[o+3*a];r[3]=t.x,r[7]=t.y,r[11]=t.z;let c=3,l=c,u,d=4,h;do{if(o=l-c,r[o+i*o]===0){for(a=o+1;a<l;a++)if(r[o+i*a]!==0){u=d;do h=d-u,r[h+i*o]+=r[h+i*a];while(--u);break}}if(r[o+i*o]!==0)for(a=o+1;a<l;a++){let f=r[o+i*a]/r[o+i*o];u=d;do h=d-u,r[h+i*a]=h<=o?0:r[h+i*a]-r[h+i*o]*f;while(--u)}}while(--c);if(e.z=r[2*i+3]/r[2*i+2],e.y=(r[1*i+3]-r[1*i+2]*e.z)/r[1*i+1],e.x=(r[0*i+3]-r[0*i+2]*e.z-r[0*i+1]*e.y)/r[0*i+0],isNaN(e.x)||isNaN(e.y)||isNaN(e.z)||e.x===1/0||e.y===1/0||e.z===1/0)throw`Could not solve equation! Got x=[${e.toString()}], b=[${t.toString()}], A=[${this.toString()}]`;return e}e(t,e,n){if(n===void 0)return this.elements[e+3*t];this.elements[e+3*t]=n}copy(t){for(let e=0;e<t.elements.length;e++)this.elements[e]=t.elements[e];return this}toString(){let t="";for(let n=0;n<9;n++)t+=this.elements[n]+",";return t}reverse(t){t===void 0&&(t=new s);let e=3,n=6,i=__,r,o;for(r=0;r<3;r++)for(o=0;o<3;o++)i[r+n*o]=this.elements[r+3*o];i[3]=1,i[9]=0,i[15]=0,i[4]=0,i[10]=1,i[16]=0,i[5]=0,i[11]=0,i[17]=1;let a=3,c=a,l,u=n,d;do{if(r=c-a,i[r+n*r]===0){for(o=r+1;o<c;o++)if(i[r+n*o]!==0){l=u;do d=u-l,i[d+n*r]+=i[d+n*o];while(--l);break}}if(i[r+n*r]!==0)for(o=r+1;o<c;o++){let h=i[r+n*o]/i[r+n*r];l=u;do d=u-l,i[d+n*o]=d<=r?0:i[d+n*o]-i[d+n*r]*h;while(--l)}}while(--a);r=2;do{o=r-1;do{let h=i[r+n*o]/i[r+n*r];l=n;do d=n-l,i[d+n*o]=i[d+n*o]-i[d+n*r]*h;while(--l)}while(o--)}while(--r);r=2;do{let h=1/i[r+n*r];l=n;do d=n-l,i[d+n*r]=i[d+n*r]*h;while(--l)}while(r--);r=2;do{o=2;do{if(d=i[e+o+n*r],isNaN(d)||d===1/0)throw`Could not reverse! A=[${this.toString()}]`;t.e(r,o,d)}while(o--)}while(r--);return t}setRotationFromQuaternion(t){let e=t.x,n=t.y,i=t.z,r=t.w,o=e+e,a=n+n,c=i+i,l=e*o,u=e*a,d=e*c,h=n*a,f=n*c,p=i*c,x=r*o,g=r*a,m=r*c,v=this.elements;return v[0]=1-(h+p),v[1]=u-m,v[2]=d+g,v[3]=u+m,v[4]=1-(l+p),v[5]=f-x,v[6]=d-g,v[7]=f+x,v[8]=1-(l+h),this}transpose(t){t===void 0&&(t=new s);let e=this.elements,n=t.elements,i;return n[0]=e[0],n[4]=e[4],n[8]=e[8],i=e[1],n[1]=e[3],n[3]=i,i=e[2],n[2]=e[6],n[6]=i,i=e[5],n[5]=e[7],n[7]=i,t}},__=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],T=class s{constructor(t,e,n){t===void 0&&(t=0),e===void 0&&(e=0),n===void 0&&(n=0),this.x=t,this.y=e,this.z=n}cross(t,e){e===void 0&&(e=new s);let n=t.x,i=t.y,r=t.z,o=this.x,a=this.y,c=this.z;return e.x=a*r-c*i,e.y=c*n-o*r,e.z=o*i-a*n,e}set(t,e,n){return this.x=t,this.y=e,this.z=n,this}setZero(){this.x=this.y=this.z=0}vadd(t,e){if(e)e.x=t.x+this.x,e.y=t.y+this.y,e.z=t.z+this.z;else return new s(this.x+t.x,this.y+t.y,this.z+t.z)}vsub(t,e){if(e)e.x=this.x-t.x,e.y=this.y-t.y,e.z=this.z-t.z;else return new s(this.x-t.x,this.y-t.y,this.z-t.z)}crossmat(){return new Ri([0,-this.z,this.y,this.z,0,-this.x,-this.y,this.x,0])}normalize(){let t=this.x,e=this.y,n=this.z,i=Math.sqrt(t*t+e*e+n*n);if(i>0){let r=1/i;this.x*=r,this.y*=r,this.z*=r}else this.x=0,this.y=0,this.z=0;return i}unit(t){t===void 0&&(t=new s);let e=this.x,n=this.y,i=this.z,r=Math.sqrt(e*e+n*n+i*i);return r>0?(r=1/r,t.x=e*r,t.y=n*r,t.z=i*r):(t.x=1,t.y=0,t.z=0),t}length(){let t=this.x,e=this.y,n=this.z;return Math.sqrt(t*t+e*e+n*n)}lengthSquared(){return this.dot(this)}distanceTo(t){let e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z;return Math.sqrt((r-e)*(r-e)+(o-n)*(o-n)+(a-i)*(a-i))}distanceSquared(t){let e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z;return(r-e)*(r-e)+(o-n)*(o-n)+(a-i)*(a-i)}scale(t,e){e===void 0&&(e=new s);let n=this.x,i=this.y,r=this.z;return e.x=t*n,e.y=t*i,e.z=t*r,e}vmul(t,e){return e===void 0&&(e=new s),e.x=t.x*this.x,e.y=t.y*this.y,e.z=t.z*this.z,e}addScaledVector(t,e,n){return n===void 0&&(n=new s),n.x=this.x+t*e.x,n.y=this.y+t*e.y,n.z=this.z+t*e.z,n}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}isZero(){return this.x===0&&this.y===0&&this.z===0}negate(t){return t===void 0&&(t=new s),t.x=-this.x,t.y=-this.y,t.z=-this.z,t}tangents(t,e){let n=this.length();if(n>0){let i=v_,r=1/n;i.set(this.x*r,this.y*r,this.z*r);let o=y_;Math.abs(i.x)<.9?(o.set(1,0,0),i.cross(o,t)):(o.set(0,1,0),i.cross(o,t)),i.cross(t,e)}else t.set(1,0,0),e.set(0,1,0)}toString(){return`${this.x},${this.y},${this.z}`}toArray(){return[this.x,this.y,this.z]}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}lerp(t,e,n){let i=this.x,r=this.y,o=this.z;n.x=i+(t.x-i)*e,n.y=r+(t.y-r)*e,n.z=o+(t.z-o)*e}almostEquals(t,e){return e===void 0&&(e=1e-6),!(Math.abs(this.x-t.x)>e||Math.abs(this.y-t.y)>e||Math.abs(this.z-t.z)>e)}almostZero(t){return t===void 0&&(t=1e-6),!(Math.abs(this.x)>t||Math.abs(this.y)>t||Math.abs(this.z)>t)}isAntiparallelTo(t,e){return this.negate(zd),zd.almostEquals(t,e)}clone(){return new s(this.x,this.y,this.z)}};T.ZERO=new T(0,0,0);T.UNIT_X=new T(1,0,0);T.UNIT_Y=new T(0,1,0);T.UNIT_Z=new T(0,0,1);var v_=new T,y_=new T,zd=new T,an=class s{constructor(t){t===void 0&&(t={}),this.lowerBound=new T,this.upperBound=new T,t.lowerBound&&this.lowerBound.copy(t.lowerBound),t.upperBound&&this.upperBound.copy(t.upperBound)}setFromPoints(t,e,n,i){let r=this.lowerBound,o=this.upperBound,a=n;r.copy(t[0]),a&&a.vmult(r,r),o.copy(r);for(let c=1;c<t.length;c++){let l=t[c];a&&(a.vmult(l,Vd),l=Vd),l.x>o.x&&(o.x=l.x),l.x<r.x&&(r.x=l.x),l.y>o.y&&(o.y=l.y),l.y<r.y&&(r.y=l.y),l.z>o.z&&(o.z=l.z),l.z<r.z&&(r.z=l.z)}return e&&(e.vadd(r,r),e.vadd(o,o)),i&&(r.x-=i,r.y-=i,r.z-=i,o.x+=i,o.y+=i,o.z+=i),this}copy(t){return this.lowerBound.copy(t.lowerBound),this.upperBound.copy(t.upperBound),this}clone(){return new s().copy(this)}extend(t){this.lowerBound.x=Math.min(this.lowerBound.x,t.lowerBound.x),this.upperBound.x=Math.max(this.upperBound.x,t.upperBound.x),this.lowerBound.y=Math.min(this.lowerBound.y,t.lowerBound.y),this.upperBound.y=Math.max(this.upperBound.y,t.upperBound.y),this.lowerBound.z=Math.min(this.lowerBound.z,t.lowerBound.z),this.upperBound.z=Math.max(this.upperBound.z,t.upperBound.z)}overlaps(t){let e=this.lowerBound,n=this.upperBound,i=t.lowerBound,r=t.upperBound,o=i.x<=n.x&&n.x<=r.x||e.x<=r.x&&r.x<=n.x,a=i.y<=n.y&&n.y<=r.y||e.y<=r.y&&r.y<=n.y,c=i.z<=n.z&&n.z<=r.z||e.z<=r.z&&r.z<=n.z;return o&&a&&c}volume(){let t=this.lowerBound,e=this.upperBound;return(e.x-t.x)*(e.y-t.y)*(e.z-t.z)}contains(t){let e=this.lowerBound,n=this.upperBound,i=t.lowerBound,r=t.upperBound;return e.x<=i.x&&n.x>=r.x&&e.y<=i.y&&n.y>=r.y&&e.z<=i.z&&n.z>=r.z}getCorners(t,e,n,i,r,o,a,c){let l=this.lowerBound,u=this.upperBound;t.copy(l),e.set(u.x,l.y,l.z),n.set(u.x,u.y,l.z),i.set(l.x,u.y,u.z),r.set(u.x,l.y,u.z),o.set(l.x,u.y,l.z),a.set(l.x,l.y,u.z),c.copy(u)}toLocalFrame(t,e){let n=kd,i=n[0],r=n[1],o=n[2],a=n[3],c=n[4],l=n[5],u=n[6],d=n[7];this.getCorners(i,r,o,a,c,l,u,d);for(let h=0;h!==8;h++){let f=n[h];t.pointToLocal(f,f)}return e.setFromPoints(n)}toWorldFrame(t,e){let n=kd,i=n[0],r=n[1],o=n[2],a=n[3],c=n[4],l=n[5],u=n[6],d=n[7];this.getCorners(i,r,o,a,c,l,u,d);for(let h=0;h!==8;h++){let f=n[h];t.pointToWorld(f,f)}return e.setFromPoints(n)}overlapsRay(t){let{direction:e,from:n}=t,i=1/e.x,r=1/e.y,o=1/e.z,a=(this.lowerBound.x-n.x)*i,c=(this.upperBound.x-n.x)*i,l=(this.lowerBound.y-n.y)*r,u=(this.upperBound.y-n.y)*r,d=(this.lowerBound.z-n.z)*o,h=(this.upperBound.z-n.z)*o,f=Math.max(Math.max(Math.min(a,c),Math.min(l,u)),Math.min(d,h)),p=Math.min(Math.min(Math.max(a,c),Math.max(l,u)),Math.max(d,h));return!(p<0||f>p)}},Vd=new T,kd=[new T,new T,new T,new T,new T,new T,new T,new T],fc=class{constructor(){this.matrix=[]}get(t,e){let{index:n}=t,{index:i}=e;if(i>n){let r=i;i=n,n=r}return this.matrix[(n*(n+1)>>1)+i-1]}set(t,e,n){let{index:i}=t,{index:r}=e;if(r>i){let o=r;r=i,i=o}this.matrix[(i*(i+1)>>1)+r-1]=n?1:0}reset(){for(let t=0,e=this.matrix.length;t!==e;t++)this.matrix[t]=0}setNumObjects(t){this.matrix.length=t*(t-1)>>1}},pc=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;return n[t]===void 0&&(n[t]=[]),n[t].includes(e)||n[t].push(e),this}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return!!(n[t]!==void 0&&n[t].includes(e))}hasAnyEventListener(t){return this._listeners===void 0?!1:this._listeners[t]!==void 0}removeEventListener(t,e){if(this._listeners===void 0)return this;let n=this._listeners;if(n[t]===void 0)return this;let i=n[t].indexOf(e);return i!==-1&&n[t].splice(i,1),this}dispatchEvent(t){if(this._listeners===void 0)return this;let n=this._listeners[t.type];if(n!==void 0){t.target=this;for(let i=0,r=n.length;i<r;i++)n[i].call(this,t)}return this}},ke=class s{constructor(t,e,n,i){t===void 0&&(t=0),e===void 0&&(e=0),n===void 0&&(n=0),i===void 0&&(i=1),this.x=t,this.y=e,this.z=n,this.w=i}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}toString(){return`${this.x},${this.y},${this.z},${this.w}`}toArray(){return[this.x,this.y,this.z,this.w]}setFromAxisAngle(t,e){let n=Math.sin(e*.5);return this.x=t.x*n,this.y=t.y*n,this.z=t.z*n,this.w=Math.cos(e*.5),this}toAxisAngle(t){t===void 0&&(t=new T),this.normalize();let e=2*Math.acos(this.w),n=Math.sqrt(1-this.w*this.w);return n<.001?(t.x=this.x,t.y=this.y,t.z=this.z):(t.x=this.x/n,t.y=this.y/n,t.z=this.z/n),[t,e]}setFromVectors(t,e){if(t.isAntiparallelTo(e)){let n=S_,i=M_;t.tangents(n,i),this.setFromAxisAngle(n,Math.PI)}else{let n=t.cross(e);this.x=n.x,this.y=n.y,this.z=n.z,this.w=Math.sqrt(t.length()**2*e.length()**2)+t.dot(e),this.normalize()}return this}mult(t,e){e===void 0&&(e=new s);let n=this.x,i=this.y,r=this.z,o=this.w,a=t.x,c=t.y,l=t.z,u=t.w;return e.x=n*u+o*a+i*l-r*c,e.y=i*u+o*c+r*a-n*l,e.z=r*u+o*l+n*c-i*a,e.w=o*u-n*a-i*c-r*l,e}inverse(t){t===void 0&&(t=new s);let e=this.x,n=this.y,i=this.z,r=this.w;this.conjugate(t);let o=1/(e*e+n*n+i*i+r*r);return t.x*=o,t.y*=o,t.z*=o,t.w*=o,t}conjugate(t){return t===void 0&&(t=new s),t.x=-this.x,t.y=-this.y,t.z=-this.z,t.w=this.w,t}normalize(){let t=Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);return t===0?(this.x=0,this.y=0,this.z=0,this.w=0):(t=1/t,this.x*=t,this.y*=t,this.z*=t,this.w*=t),this}normalizeFast(){let t=(3-(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w))/2;return t===0?(this.x=0,this.y=0,this.z=0,this.w=0):(this.x*=t,this.y*=t,this.z*=t,this.w*=t),this}vmult(t,e){e===void 0&&(e=new T);let n=t.x,i=t.y,r=t.z,o=this.x,a=this.y,c=this.z,l=this.w,u=l*n+a*r-c*i,d=l*i+c*n-o*r,h=l*r+o*i-a*n,f=-o*n-a*i-c*r;return e.x=u*l+f*-o+d*-c-h*-a,e.y=d*l+f*-a+h*-o-u*-c,e.z=h*l+f*-c+u*-a-d*-o,e}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w,this}toEuler(t,e){e===void 0&&(e="YZX");let n,i,r,o=this.x,a=this.y,c=this.z,l=this.w;switch(e){case"YZX":let u=o*a+c*l;if(u>.499&&(n=2*Math.atan2(o,l),i=Math.PI/2,r=0),u<-.499&&(n=-2*Math.atan2(o,l),i=-Math.PI/2,r=0),n===void 0){let d=o*o,h=a*a,f=c*c;n=Math.atan2(2*a*l-2*o*c,1-2*h-2*f),i=Math.asin(2*u),r=Math.atan2(2*o*l-2*a*c,1-2*d-2*f)}break;default:throw new Error(`Euler order ${e} not supported yet.`)}t.y=n,t.z=i,t.x=r}setFromEuler(t,e,n,i){i===void 0&&(i="XYZ");let r=Math.cos(t/2),o=Math.cos(e/2),a=Math.cos(n/2),c=Math.sin(t/2),l=Math.sin(e/2),u=Math.sin(n/2);return i==="XYZ"?(this.x=c*o*a+r*l*u,this.y=r*l*a-c*o*u,this.z=r*o*u+c*l*a,this.w=r*o*a-c*l*u):i==="YXZ"?(this.x=c*o*a+r*l*u,this.y=r*l*a-c*o*u,this.z=r*o*u-c*l*a,this.w=r*o*a+c*l*u):i==="ZXY"?(this.x=c*o*a-r*l*u,this.y=r*l*a+c*o*u,this.z=r*o*u+c*l*a,this.w=r*o*a-c*l*u):i==="ZYX"?(this.x=c*o*a-r*l*u,this.y=r*l*a+c*o*u,this.z=r*o*u-c*l*a,this.w=r*o*a+c*l*u):i==="YZX"?(this.x=c*o*a+r*l*u,this.y=r*l*a+c*o*u,this.z=r*o*u-c*l*a,this.w=r*o*a-c*l*u):i==="XZY"&&(this.x=c*o*a-r*l*u,this.y=r*l*a-c*o*u,this.z=r*o*u+c*l*a,this.w=r*o*a+c*l*u),this}clone(){return new s(this.x,this.y,this.z,this.w)}slerp(t,e,n){n===void 0&&(n=new s);let i=this.x,r=this.y,o=this.z,a=this.w,c=t.x,l=t.y,u=t.z,d=t.w,h,f,p,x,g;return f=i*c+r*l+o*u+a*d,f<0&&(f=-f,c=-c,l=-l,u=-u,d=-d),1-f>1e-6?(h=Math.acos(f),p=Math.sin(h),x=Math.sin((1-e)*h)/p,g=Math.sin(e*h)/p):(x=1-e,g=e),n.x=x*i+g*c,n.y=x*r+g*l,n.z=x*o+g*u,n.w=x*a+g*d,n}integrate(t,e,n,i){i===void 0&&(i=new s);let r=t.x*n.x,o=t.y*n.y,a=t.z*n.z,c=this.x,l=this.y,u=this.z,d=this.w,h=e*.5;return i.x+=h*(r*d+o*u-a*l),i.y+=h*(o*d+a*c-r*u),i.z+=h*(a*d+r*l-o*c),i.w+=h*(-r*c-o*l-a*u),i}},S_=new T,M_=new T,b_={SPHERE:1,PLANE:2,BOX:4,COMPOUND:8,CONVEXPOLYHEDRON:16,HEIGHTFIELD:32,PARTICLE:64,CYLINDER:128,TRIMESH:256},Tt=class s{constructor(t){t===void 0&&(t={}),this.id=s.idCounter++,this.type=t.type||0,this.boundingSphereRadius=0,this.collisionResponse=t.collisionResponse?t.collisionResponse:!0,this.collisionFilterGroup=t.collisionFilterGroup!==void 0?t.collisionFilterGroup:1,this.collisionFilterMask=t.collisionFilterMask!==void 0?t.collisionFilterMask:-1,this.material=t.material?t.material:null,this.body=null}updateBoundingSphereRadius(){throw`computeBoundingSphereRadius() not implemented for shape type ${this.type}`}volume(){throw`volume() not implemented for shape type ${this.type}`}calculateLocalInertia(t,e){throw`calculateLocalInertia() not implemented for shape type ${this.type}`}calculateWorldAABB(t,e,n,i){throw`calculateWorldAABB() not implemented for shape type ${this.type}`}};Tt.idCounter=0;Tt.types=b_;var re=class s{constructor(t){t===void 0&&(t={}),this.position=new T,this.quaternion=new ke,t.position&&this.position.copy(t.position),t.quaternion&&this.quaternion.copy(t.quaternion)}pointToLocal(t,e){return s.pointToLocalFrame(this.position,this.quaternion,t,e)}pointToWorld(t,e){return s.pointToWorldFrame(this.position,this.quaternion,t,e)}vectorToWorldFrame(t,e){return e===void 0&&(e=new T),this.quaternion.vmult(t,e),e}static pointToLocalFrame(t,e,n,i){return i===void 0&&(i=new T),n.vsub(t,i),e.conjugate(Hd),Hd.vmult(i,i),i}static pointToWorldFrame(t,e,n,i){return i===void 0&&(i=new T),e.vmult(n,i),i.vadd(t,i),i}static vectorToWorldFrame(t,e,n){return n===void 0&&(n=new T),t.vmult(e,n),n}static vectorToLocalFrame(t,e,n,i){return i===void 0&&(i=new T),e.w*=-1,e.vmult(n,i),e.w*=-1,i}},Hd=new ke,ch=class s extends Tt{constructor(t){t===void 0&&(t={});let{vertices:e=[],faces:n=[],normals:i=[],axes:r,boundingSphereRadius:o}=t;super({type:Tt.types.CONVEXPOLYHEDRON}),this.vertices=e,this.faces=n,this.faceNormals=i,this.faceNormals.length===0&&this.computeNormals(),o?this.boundingSphereRadius=o:this.updateBoundingSphereRadius(),this.worldVertices=[],this.worldVerticesNeedsUpdate=!0,this.worldFaceNormals=[],this.worldFaceNormalsNeedsUpdate=!0,this.uniqueAxes=r?r.slice():null,this.uniqueEdges=[],this.computeEdges()}computeEdges(){let t=this.faces,e=this.vertices,n=this.uniqueEdges;n.length=0;let i=new T;for(let r=0;r!==t.length;r++){let o=t[r],a=o.length;for(let c=0;c!==a;c++){let l=(c+1)%a;e[o[c]].vsub(e[o[l]],i),i.normalize();let u=!1;for(let d=0;d!==n.length;d++)if(n[d].almostEquals(i)||n[d].almostEquals(i)){u=!0;break}u||n.push(i.clone())}}}computeNormals(){this.faceNormals.length=this.faces.length;for(let t=0;t<this.faces.length;t++){for(let i=0;i<this.faces[t].length;i++)if(!this.vertices[this.faces[t][i]])throw new Error(`Vertex ${this.faces[t][i]} not found!`);let e=this.faceNormals[t]||new T;this.getFaceNormal(t,e),e.negate(e),this.faceNormals[t]=e;let n=this.vertices[this.faces[t][0]];if(e.dot(n)<0){console.error(`.faceNormals[${t}] = Vec3(${e.toString()}) looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.`);for(let i=0;i<this.faces[t].length;i++)console.warn(`.vertices[${this.faces[t][i]}] = Vec3(${this.vertices[this.faces[t][i]].toString()})`)}}}getFaceNormal(t,e){let n=this.faces[t],i=this.vertices[n[0]],r=this.vertices[n[1]],o=this.vertices[n[2]];s.computeNormal(i,r,o,e)}static computeNormal(t,e,n,i){let r=new T,o=new T;e.vsub(t,o),n.vsub(e,r),r.cross(o,i),i.isZero()||i.normalize()}clipAgainstHull(t,e,n,i,r,o,a,c,l){let u=new T,d=-1,h=-Number.MAX_VALUE;for(let p=0;p<n.faces.length;p++){u.copy(n.faceNormals[p]),r.vmult(u,u);let x=u.dot(o);x>h&&(h=x,d=p)}let f=[];for(let p=0;p<n.faces[d].length;p++){let x=n.vertices[n.faces[d][p]],g=new T;g.copy(x),r.vmult(g,g),i.vadd(g,g),f.push(g)}d>=0&&this.clipFaceAgainstHull(o,t,e,f,a,c,l)}findSeparatingAxis(t,e,n,i,r,o,a,c){let l=new T,u=new T,d=new T,h=new T,f=new T,p=new T,x=Number.MAX_VALUE,g=this;if(g.uniqueAxes)for(let m=0;m!==g.uniqueAxes.length;m++){n.vmult(g.uniqueAxes[m],l);let v=g.testSepAxis(l,t,e,n,i,r);if(v===!1)return!1;v<x&&(x=v,o.copy(l))}else{let m=a?a.length:g.faces.length;for(let v=0;v<m;v++){let N=a?a[v]:v;l.copy(g.faceNormals[N]),n.vmult(l,l);let S=g.testSepAxis(l,t,e,n,i,r);if(S===!1)return!1;S<x&&(x=S,o.copy(l))}}if(t.uniqueAxes)for(let m=0;m!==t.uniqueAxes.length;m++){r.vmult(t.uniqueAxes[m],u);let v=g.testSepAxis(u,t,e,n,i,r);if(v===!1)return!1;v<x&&(x=v,o.copy(u))}else{let m=c?c.length:t.faces.length;for(let v=0;v<m;v++){let N=c?c[v]:v;u.copy(t.faceNormals[N]),r.vmult(u,u);let S=g.testSepAxis(u,t,e,n,i,r);if(S===!1)return!1;S<x&&(x=S,o.copy(u))}}for(let m=0;m!==g.uniqueEdges.length;m++){n.vmult(g.uniqueEdges[m],h);for(let v=0;v!==t.uniqueEdges.length;v++)if(r.vmult(t.uniqueEdges[v],f),h.cross(f,p),!p.almostZero()){p.normalize();let N=g.testSepAxis(p,t,e,n,i,r);if(N===!1)return!1;N<x&&(x=N,o.copy(p))}}return i.vsub(e,d),d.dot(o)>0&&o.negate(o),!0}testSepAxis(t,e,n,i,r,o){let a=this;s.project(a,t,n,i,nh),s.project(e,t,r,o,ih);let c=nh[0],l=nh[1],u=ih[0],d=ih[1];if(c<d||u<l)return!1;let h=c-d,f=u-l;return h<f?h:f}calculateLocalInertia(t,e){let n=new T,i=new T;this.computeLocalAABB(i,n);let r=n.x-i.x,o=n.y-i.y,a=n.z-i.z;e.x=1/12*t*(2*o*2*o+2*a*2*a),e.y=1/12*t*(2*r*2*r+2*a*2*a),e.z=1/12*t*(2*o*2*o+2*r*2*r)}getPlaneConstantOfFace(t){let e=this.faces[t],n=this.faceNormals[t],i=this.vertices[e[0]];return-n.dot(i)}clipFaceAgainstHull(t,e,n,i,r,o,a){let c=new T,l=new T,u=new T,d=new T,h=new T,f=new T,p=new T,x=new T,g=this,m=[],v=i,N=m,S=-1,E=Number.MAX_VALUE;for(let M=0;M<g.faces.length;M++){c.copy(g.faceNormals[M]),n.vmult(c,c);let R=c.dot(t);R<E&&(E=R,S=M)}if(S<0)return;let w=g.faces[S];w.connectedFaces=[];for(let M=0;M<g.faces.length;M++)for(let R=0;R<g.faces[M].length;R++)w.indexOf(g.faces[M][R])!==-1&&M!==S&&w.connectedFaces.indexOf(M)===-1&&w.connectedFaces.push(M);let P=w.length;for(let M=0;M<P;M++){let R=g.vertices[w[M]],F=g.vertices[w[(M+1)%P]];R.vsub(F,l),u.copy(l),n.vmult(u,u),e.vadd(u,u),d.copy(this.faceNormals[S]),n.vmult(d,d),e.vadd(d,d),u.cross(d,h),h.negate(h),f.copy(R),n.vmult(f,f),e.vadd(f,f);let I=w.connectedFaces[M];p.copy(this.faceNormals[I]);let C=this.getPlaneConstantOfFace(I);x.copy(p),n.vmult(x,x);let L=C-x.dot(e);for(this.clipFaceAgainstPlane(v,N,x,L);v.length;)v.shift();for(;N.length;)v.push(N.shift())}p.copy(this.faceNormals[S]);let _=this.getPlaneConstantOfFace(S);x.copy(p),n.vmult(x,x);let b=_-x.dot(e);for(let M=0;M<v.length;M++){let R=x.dot(v[M])+b;if(R<=r&&(console.log(`clamped: depth=${R} to minDist=${r}`),R=r),R<=o){let F=v[M];if(R<=1e-6){let I={point:F,normal:x,depth:R};a.push(I)}}}}clipFaceAgainstPlane(t,e,n,i){let r,o,a=t.length;if(a<2)return e;let c=t[t.length-1],l=t[0];r=n.dot(c)+i;for(let u=0;u<a;u++){if(l=t[u],o=n.dot(l)+i,r<0)if(o<0){let d=new T;d.copy(l),e.push(d)}else{let d=new T;c.lerp(l,r/(r-o),d),e.push(d)}else if(o<0){let d=new T;c.lerp(l,r/(r-o),d),e.push(d),e.push(l)}c=l,r=o}return e}computeWorldVertices(t,e){for(;this.worldVertices.length<this.vertices.length;)this.worldVertices.push(new T);let n=this.vertices,i=this.worldVertices;for(let r=0;r!==this.vertices.length;r++)e.vmult(n[r],i[r]),t.vadd(i[r],i[r]);this.worldVerticesNeedsUpdate=!1}computeLocalAABB(t,e){let n=this.vertices;t.set(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE),e.set(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);for(let i=0;i<this.vertices.length;i++){let r=n[i];r.x<t.x?t.x=r.x:r.x>e.x&&(e.x=r.x),r.y<t.y?t.y=r.y:r.y>e.y&&(e.y=r.y),r.z<t.z?t.z=r.z:r.z>e.z&&(e.z=r.z)}}computeWorldFaceNormals(t){let e=this.faceNormals.length;for(;this.worldFaceNormals.length<e;)this.worldFaceNormals.push(new T);let n=this.faceNormals,i=this.worldFaceNormals;for(let r=0;r!==e;r++)t.vmult(n[r],i[r]);this.worldFaceNormalsNeedsUpdate=!1}updateBoundingSphereRadius(){let t=0,e=this.vertices;for(let n=0;n!==e.length;n++){let i=e[n].lengthSquared();i>t&&(t=i)}this.boundingSphereRadius=Math.sqrt(t)}calculateWorldAABB(t,e,n,i){let r=this.vertices,o,a,c,l,u,d,h=new T;for(let f=0;f<r.length;f++){h.copy(r[f]),e.vmult(h,h),t.vadd(h,h);let p=h;(o===void 0||p.x<o)&&(o=p.x),(l===void 0||p.x>l)&&(l=p.x),(a===void 0||p.y<a)&&(a=p.y),(u===void 0||p.y>u)&&(u=p.y),(c===void 0||p.z<c)&&(c=p.z),(d===void 0||p.z>d)&&(d=p.z)}n.set(o,a,c),i.set(l,u,d)}volume(){return 4*Math.PI*this.boundingSphereRadius/3}getAveragePointLocal(t){t===void 0&&(t=new T);let e=this.vertices;for(let n=0;n<e.length;n++)t.vadd(e[n],t);return t.scale(1/e.length,t),t}transformAllPoints(t,e){let n=this.vertices.length,i=this.vertices;if(e){for(let r=0;r<n;r++){let o=i[r];e.vmult(o,o)}for(let r=0;r<this.faceNormals.length;r++){let o=this.faceNormals[r];e.vmult(o,o)}}if(t)for(let r=0;r<n;r++){let o=i[r];o.vadd(t,o)}}pointIsInside(t){let e=this.vertices,n=this.faces,i=this.faceNormals,r=null,o=new T;this.getAveragePointLocal(o);for(let a=0;a<this.faces.length;a++){let c=i[a],l=e[n[a][0]],u=new T;t.vsub(l,u);let d=c.dot(u),h=new T;o.vsub(l,h);let f=c.dot(h);if(d<0&&f>0||d>0&&f<0)return!1}return r?1:-1}static project(t,e,n,i,r){let o=t.vertices.length,a=E_,c=0,l=0,u=T_,d=t.vertices;u.setZero(),re.vectorToLocalFrame(n,i,e,a),re.pointToLocalFrame(n,i,u,u);let h=u.dot(a);l=c=d[0].dot(a);for(let f=1;f<o;f++){let p=d[f].dot(a);p>c&&(c=p),p<l&&(l=p)}if(l-=h,c-=h,l>c){let f=l;l=c,c=f}r[0]=c,r[1]=l}},nh=[],ih=[],w_=new T,E_=new T,T_=new T,Ii=class s extends Tt{constructor(t){super({type:Tt.types.BOX}),this.halfExtents=t,this.convexPolyhedronRepresentation=null,this.updateConvexPolyhedronRepresentation(),this.updateBoundingSphereRadius()}updateConvexPolyhedronRepresentation(){let t=this.halfExtents.x,e=this.halfExtents.y,n=this.halfExtents.z,i=T,r=[new i(-t,-e,-n),new i(t,-e,-n),new i(t,e,-n),new i(-t,e,-n),new i(-t,-e,n),new i(t,-e,n),new i(t,e,n),new i(-t,e,n)],o=[[3,2,1,0],[4,5,6,7],[5,4,0,1],[2,3,7,6],[0,4,7,3],[1,2,6,5]],a=[new i(0,0,1),new i(0,1,0),new i(1,0,0)],c=new ch({vertices:r,faces:o,axes:a});this.convexPolyhedronRepresentation=c,c.material=this.material}calculateLocalInertia(t,e){return e===void 0&&(e=new T),s.calculateInertia(this.halfExtents,t,e),e}static calculateInertia(t,e,n){let i=t;n.x=1/12*e*(2*i.y*2*i.y+2*i.z*2*i.z),n.y=1/12*e*(2*i.x*2*i.x+2*i.z*2*i.z),n.z=1/12*e*(2*i.y*2*i.y+2*i.x*2*i.x)}getSideNormals(t,e){let n=t,i=this.halfExtents;if(n[0].set(i.x,0,0),n[1].set(0,i.y,0),n[2].set(0,0,i.z),n[3].set(-i.x,0,0),n[4].set(0,-i.y,0),n[5].set(0,0,-i.z),e!==void 0)for(let r=0;r!==n.length;r++)e.vmult(n[r],n[r]);return n}volume(){return 8*this.halfExtents.x*this.halfExtents.y*this.halfExtents.z}updateBoundingSphereRadius(){this.boundingSphereRadius=this.halfExtents.length()}forEachWorldCorner(t,e,n){let i=this.halfExtents,r=[[i.x,i.y,i.z],[-i.x,i.y,i.z],[-i.x,-i.y,i.z],[-i.x,-i.y,-i.z],[i.x,-i.y,-i.z],[i.x,i.y,-i.z],[-i.x,i.y,-i.z],[i.x,-i.y,i.z]];for(let o=0;o<r.length;o++)Ci.set(r[o][0],r[o][1],r[o][2]),e.vmult(Ci,Ci),t.vadd(Ci,Ci),n(Ci.x,Ci.y,Ci.z)}calculateWorldAABB(t,e,n,i){let r=this.halfExtents;Hn[0].set(r.x,r.y,r.z),Hn[1].set(-r.x,r.y,r.z),Hn[2].set(-r.x,-r.y,r.z),Hn[3].set(-r.x,-r.y,-r.z),Hn[4].set(r.x,-r.y,-r.z),Hn[5].set(r.x,r.y,-r.z),Hn[6].set(-r.x,r.y,-r.z),Hn[7].set(r.x,-r.y,r.z);let o=Hn[0];e.vmult(o,o),t.vadd(o,o),i.copy(o),n.copy(o);for(let a=1;a<8;a++){let c=Hn[a];e.vmult(c,c),t.vadd(c,c);let l=c.x,u=c.y,d=c.z;l>i.x&&(i.x=l),u>i.y&&(i.y=u),d>i.z&&(i.z=d),l<n.x&&(n.x=l),u<n.y&&(n.y=u),d<n.z&&(n.z=d)}}},Ci=new T,Hn=[new T,new T,new T,new T,new T,new T,new T,new T],_h={DYNAMIC:1,STATIC:2,KINEMATIC:4},vh={AWAKE:0,SLEEPY:1,SLEEPING:2},Xt=class s extends pc{constructor(t){t===void 0&&(t={}),super(),this.id=s.idCounter++,this.index=-1,this.world=null,this.vlambda=new T,this.collisionFilterGroup=typeof t.collisionFilterGroup=="number"?t.collisionFilterGroup:1,this.collisionFilterMask=typeof t.collisionFilterMask=="number"?t.collisionFilterMask:-1,this.collisionResponse=typeof t.collisionResponse=="boolean"?t.collisionResponse:!0,this.position=new T,this.previousPosition=new T,this.interpolatedPosition=new T,this.initPosition=new T,t.position&&(this.position.copy(t.position),this.previousPosition.copy(t.position),this.interpolatedPosition.copy(t.position),this.initPosition.copy(t.position)),this.velocity=new T,t.velocity&&this.velocity.copy(t.velocity),this.initVelocity=new T,this.force=new T;let e=typeof t.mass=="number"?t.mass:0;this.mass=e,this.invMass=e>0?1/e:0,this.material=t.material||null,this.linearDamping=typeof t.linearDamping=="number"?t.linearDamping:.01,this.type=e<=0?s.STATIC:s.DYNAMIC,typeof t.type==typeof s.STATIC&&(this.type=t.type),this.allowSleep=typeof t.allowSleep<"u"?t.allowSleep:!0,this.sleepState=s.AWAKE,this.sleepSpeedLimit=typeof t.sleepSpeedLimit<"u"?t.sleepSpeedLimit:.1,this.sleepTimeLimit=typeof t.sleepTimeLimit<"u"?t.sleepTimeLimit:1,this.timeLastSleepy=0,this.wakeUpAfterNarrowphase=!1,this.torque=new T,this.quaternion=new ke,this.initQuaternion=new ke,this.previousQuaternion=new ke,this.interpolatedQuaternion=new ke,t.quaternion&&(this.quaternion.copy(t.quaternion),this.initQuaternion.copy(t.quaternion),this.previousQuaternion.copy(t.quaternion),this.interpolatedQuaternion.copy(t.quaternion)),this.angularVelocity=new T,t.angularVelocity&&this.angularVelocity.copy(t.angularVelocity),this.initAngularVelocity=new T,this.shapes=[],this.shapeOffsets=[],this.shapeOrientations=[],this.inertia=new T,this.invInertia=new T,this.invInertiaWorld=new Ri,this.invMassSolve=0,this.invInertiaSolve=new T,this.invInertiaWorldSolve=new Ri,this.fixedRotation=typeof t.fixedRotation<"u"?t.fixedRotation:!1,this.angularDamping=typeof t.angularDamping<"u"?t.angularDamping:.01,this.linearFactor=new T(1,1,1),t.linearFactor&&this.linearFactor.copy(t.linearFactor),this.angularFactor=new T(1,1,1),t.angularFactor&&this.angularFactor.copy(t.angularFactor),this.aabb=new an,this.aabbNeedsUpdate=!0,this.boundingRadius=0,this.wlambda=new T,this.isTrigger=!!t.isTrigger,t.shape&&this.addShape(t.shape),this.updateMassProperties()}wakeUp(){let t=this.sleepState;this.sleepState=s.AWAKE,this.wakeUpAfterNarrowphase=!1,t===s.SLEEPING&&this.dispatchEvent(s.wakeupEvent)}sleep(){this.sleepState=s.SLEEPING,this.velocity.set(0,0,0),this.angularVelocity.set(0,0,0),this.wakeUpAfterNarrowphase=!1}sleepTick(t){if(this.allowSleep){let e=this.sleepState,n=this.velocity.lengthSquared()+this.angularVelocity.lengthSquared(),i=this.sleepSpeedLimit**2;e===s.AWAKE&&n<i?(this.sleepState=s.SLEEPY,this.timeLastSleepy=t,this.dispatchEvent(s.sleepyEvent)):e===s.SLEEPY&&n>i?this.wakeUp():e===s.SLEEPY&&t-this.timeLastSleepy>this.sleepTimeLimit&&(this.sleep(),this.dispatchEvent(s.sleepEvent))}}updateSolveMassProperties(){this.sleepState===s.SLEEPING||this.type===s.KINEMATIC?(this.invMassSolve=0,this.invInertiaSolve.setZero(),this.invInertiaWorldSolve.setZero()):(this.invMassSolve=this.invMass,this.invInertiaSolve.copy(this.invInertia),this.invInertiaWorldSolve.copy(this.invInertiaWorld))}pointToLocalFrame(t,e){return e===void 0&&(e=new T),t.vsub(this.position,e),this.quaternion.conjugate().vmult(e,e),e}vectorToLocalFrame(t,e){return e===void 0&&(e=new T),this.quaternion.conjugate().vmult(t,e),e}pointToWorldFrame(t,e){return e===void 0&&(e=new T),this.quaternion.vmult(t,e),e.vadd(this.position,e),e}vectorToWorldFrame(t,e){return e===void 0&&(e=new T),this.quaternion.vmult(t,e),e}addShape(t,e,n){let i=new T,r=new ke;return e&&i.copy(e),n&&r.copy(n),this.shapes.push(t),this.shapeOffsets.push(i),this.shapeOrientations.push(r),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,t.body=this,this}removeShape(t){let e=this.shapes.indexOf(t);return e===-1?(console.warn("Shape does not belong to the body"),this):(this.shapes.splice(e,1),this.shapeOffsets.splice(e,1),this.shapeOrientations.splice(e,1),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,t.body=null,this)}updateBoundingRadius(){let t=this.shapes,e=this.shapeOffsets,n=t.length,i=0;for(let r=0;r!==n;r++){let o=t[r];o.updateBoundingSphereRadius();let a=e[r].length(),c=o.boundingSphereRadius;a+c>i&&(i=a+c)}this.boundingRadius=i}updateAABB(){let t=this.shapes,e=this.shapeOffsets,n=this.shapeOrientations,i=t.length,r=A_,o=C_,a=this.quaternion,c=this.aabb,l=R_;for(let u=0;u!==i;u++){let d=t[u];a.vmult(e[u],r),r.vadd(this.position,r),a.mult(n[u],o),d.calculateWorldAABB(r,o,l.lowerBound,l.upperBound),u===0?c.copy(l):c.extend(l)}this.aabbNeedsUpdate=!1}updateInertiaWorld(t){let e=this.invInertia;if(!(e.x===e.y&&e.y===e.z&&!t)){let n=I_,i=P_;n.setRotationFromQuaternion(this.quaternion),n.transpose(i),n.scale(e,n),n.mmult(i,this.invInertiaWorld)}}applyForce(t,e){if(e===void 0&&(e=new T),this.type!==s.DYNAMIC)return;this.sleepState===s.SLEEPING&&this.wakeUp();let n=N_;e.cross(t,n),this.force.vadd(t,this.force),this.torque.vadd(n,this.torque)}applyLocalForce(t,e){if(e===void 0&&(e=new T),this.type!==s.DYNAMIC)return;let n=F_,i=D_;this.vectorToWorldFrame(t,n),this.vectorToWorldFrame(e,i),this.applyForce(n,i)}applyTorque(t){this.type===s.DYNAMIC&&(this.sleepState===s.SLEEPING&&this.wakeUp(),this.torque.vadd(t,this.torque))}applyImpulse(t,e){if(e===void 0&&(e=new T),this.type!==s.DYNAMIC)return;this.sleepState===s.SLEEPING&&this.wakeUp();let n=e,i=B_;i.copy(t),i.scale(this.invMass,i),this.velocity.vadd(i,this.velocity);let r=U_;n.cross(t,r),this.invInertiaWorld.vmult(r,r),this.angularVelocity.vadd(r,this.angularVelocity)}applyLocalImpulse(t,e){if(e===void 0&&(e=new T),this.type!==s.DYNAMIC)return;let n=O_,i=z_;this.vectorToWorldFrame(t,n),this.vectorToWorldFrame(e,i),this.applyImpulse(n,i)}updateMassProperties(){let t=V_;this.invMass=this.mass>0?1/this.mass:0;let e=this.inertia,n=this.fixedRotation;this.updateAABB(),t.set((this.aabb.upperBound.x-this.aabb.lowerBound.x)/2,(this.aabb.upperBound.y-this.aabb.lowerBound.y)/2,(this.aabb.upperBound.z-this.aabb.lowerBound.z)/2),Ii.calculateInertia(t,this.mass,e),this.invInertia.set(e.x>0&&!n?1/e.x:0,e.y>0&&!n?1/e.y:0,e.z>0&&!n?1/e.z:0),this.updateInertiaWorld(!0)}getVelocityAtWorldPoint(t,e){let n=new T;return t.vsub(this.position,n),this.angularVelocity.cross(n,e),this.velocity.vadd(e,e),e}integrate(t,e,n){if(this.previousPosition.copy(this.position),this.previousQuaternion.copy(this.quaternion),!(this.type===s.DYNAMIC||this.type===s.KINEMATIC)||this.sleepState===s.SLEEPING)return;let i=this.velocity,r=this.angularVelocity,o=this.position,a=this.force,c=this.torque,l=this.quaternion,u=this.invMass,d=this.invInertiaWorld,h=this.linearFactor,f=u*t;i.x+=a.x*f*h.x,i.y+=a.y*f*h.y,i.z+=a.z*f*h.z;let p=d.elements,x=this.angularFactor,g=c.x*x.x,m=c.y*x.y,v=c.z*x.z;r.x+=t*(p[0]*g+p[1]*m+p[2]*v),r.y+=t*(p[3]*g+p[4]*m+p[5]*v),r.z+=t*(p[6]*g+p[7]*m+p[8]*v),o.x+=i.x*t,o.y+=i.y*t,o.z+=i.z*t,l.integrate(this.angularVelocity,t,this.angularFactor,l),e&&(n?l.normalizeFast():l.normalize()),this.aabbNeedsUpdate=!0,this.updateInertiaWorld()}};Xt.idCounter=0;Xt.COLLIDE_EVENT_NAME="collide";Xt.DYNAMIC=_h.DYNAMIC;Xt.STATIC=_h.STATIC;Xt.KINEMATIC=_h.KINEMATIC;Xt.AWAKE=vh.AWAKE;Xt.SLEEPY=vh.SLEEPY;Xt.SLEEPING=vh.SLEEPING;Xt.wakeupEvent={type:"wakeup"};Xt.sleepyEvent={type:"sleepy"};Xt.sleepEvent={type:"sleep"};var A_=new T,C_=new ke,R_=new an,I_=new Ri,P_=new Ri,L_=new Ri,N_=new T,F_=new T,D_=new T,B_=new T,U_=new T,O_=new T,z_=new T,V_=new T,mc=class{constructor(){this.world=null,this.useBoundingBoxes=!1,this.dirty=!0}collisionPairs(t,e,n){throw new Error("collisionPairs not implemented for this BroadPhase class!")}needBroadphaseCollision(t,e){return!((t.collisionFilterGroup&e.collisionFilterMask)===0||(e.collisionFilterGroup&t.collisionFilterMask)===0||((t.type&Xt.STATIC)!==0||t.sleepState===Xt.SLEEPING)&&((e.type&Xt.STATIC)!==0||e.sleepState===Xt.SLEEPING))}intersectionTest(t,e,n,i){this.useBoundingBoxes?this.doBoundingBoxBroadphase(t,e,n,i):this.doBoundingSphereBroadphase(t,e,n,i)}doBoundingSphereBroadphase(t,e,n,i){let r=k_;e.position.vsub(t.position,r);let o=(t.boundingRadius+e.boundingRadius)**2;r.lengthSquared()<o&&(n.push(t),i.push(e))}doBoundingBoxBroadphase(t,e,n,i){t.aabbNeedsUpdate&&t.updateAABB(),e.aabbNeedsUpdate&&e.updateAABB(),t.aabb.overlaps(e.aabb)&&(n.push(t),i.push(e))}makePairsUnique(t,e){let n=H_,i=G_,r=W_,o=t.length;for(let a=0;a!==o;a++)i[a]=t[a],r[a]=e[a];t.length=0,e.length=0;for(let a=0;a!==o;a++){let c=i[a].id,l=r[a].id,u=c<l?`${c},${l}`:`${l},${c}`;n[u]=a,n.keys.push(u)}for(let a=0;a!==n.keys.length;a++){let c=n.keys.pop(),l=n[c];t.push(i[l]),e.push(r[l]),delete n[c]}}setWorld(t){}static boundingSphereCheck(t,e){let n=new T;t.position.vsub(e.position,n);let i=t.shapes[0],r=e.shapes[0];return Math.pow(i.boundingSphereRadius+r.boundingSphereRadius,2)>n.lengthSquared()}aabbQuery(t,e,n){return console.warn(".aabbQuery is not implemented in this Broadphase subclass."),[]}},k_=new T;new T;new ke;new T;var H_={keys:[]},G_=[],W_=[];new T;var Yw=new T;new T;var lh=class extends mc{constructor(){super()}collisionPairs(t,e,n){let i=t.bodies,r=i.length,o,a;for(let c=0;c!==r;c++)for(let l=0;l!==c;l++)o=i[c],a=i[l],this.needBroadphaseCollision(o,a)&&this.intersectionTest(o,a,e,n)}aabbQuery(t,e,n){n===void 0&&(n=[]);for(let i=0;i<t.bodies.length;i++){let r=t.bodies[i];r.aabbNeedsUpdate&&r.updateAABB(),r.aabb.overlaps(e)&&n.push(r)}return n}},Ys=class{constructor(){this.rayFromWorld=new T,this.rayToWorld=new T,this.hitNormalWorld=new T,this.hitPointWorld=new T,this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}reset(){this.rayFromWorld.setZero(),this.rayToWorld.setZero(),this.hitNormalWorld.setZero(),this.hitPointWorld.setZero(),this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}abort(){this.shouldStop=!0}set(t,e,n,i,r,o,a){this.rayFromWorld.copy(t),this.rayToWorld.copy(e),this.hitNormalWorld.copy(n),this.hitPointWorld.copy(i),this.shape=r,this.body=o,this.distance=a}},tf,ef,nf,sf,rf,of,af,yh={CLOSEST:1,ANY:2,ALL:4};tf=Tt.types.SPHERE;ef=Tt.types.PLANE;nf=Tt.types.BOX;sf=Tt.types.CYLINDER;rf=Tt.types.CONVEXPOLYHEDRON;of=Tt.types.HEIGHTFIELD;af=Tt.types.TRIMESH;var dn=class s{get[tf](){return this._intersectSphere}get[ef](){return this._intersectPlane}get[nf](){return this._intersectBox}get[sf](){return this._intersectConvex}get[rf](){return this._intersectConvex}get[of](){return this._intersectHeightfield}get[af](){return this._intersectTrimesh}constructor(t,e){t===void 0&&(t=new T),e===void 0&&(e=new T),this.from=t.clone(),this.to=e.clone(),this.direction=new T,this.precision=1e-4,this.checkCollisionResponse=!0,this.skipBackfaces=!1,this.collisionFilterMask=-1,this.collisionFilterGroup=-1,this.mode=s.ANY,this.result=new Ys,this.hasHit=!1,this.callback=n=>{}}intersectWorld(t,e){return this.mode=e.mode||s.ANY,this.result=e.result||new Ys,this.skipBackfaces=!!e.skipBackfaces,this.collisionFilterMask=typeof e.collisionFilterMask<"u"?e.collisionFilterMask:-1,this.collisionFilterGroup=typeof e.collisionFilterGroup<"u"?e.collisionFilterGroup:-1,this.checkCollisionResponse=typeof e.checkCollisionResponse<"u"?e.checkCollisionResponse:!0,e.from&&this.from.copy(e.from),e.to&&this.to.copy(e.to),this.callback=e.callback||(()=>{}),this.hasHit=!1,this.result.reset(),this.updateDirection(),this.getAABB(Gd),sh.length=0,t.broadphase.aabbQuery(t,Gd,sh),this.intersectBodies(sh),this.hasHit}intersectBody(t,e){e&&(this.result=e,this.updateDirection());let n=this.checkCollisionResponse;if(n&&!t.collisionResponse||(this.collisionFilterGroup&t.collisionFilterMask)===0||(t.collisionFilterGroup&this.collisionFilterMask)===0)return;let i=q_,r=X_;for(let o=0,a=t.shapes.length;o<a;o++){let c=t.shapes[o];if(!(n&&!c.collisionResponse)&&(t.quaternion.mult(t.shapeOrientations[o],r),t.quaternion.vmult(t.shapeOffsets[o],i),i.vadd(t.position,i),this.intersectShape(c,r,i,t),this.result.shouldStop))break}}intersectBodies(t,e){e&&(this.result=e,this.updateDirection());for(let n=0,i=t.length;!this.result.shouldStop&&n<i;n++)this.intersectBody(t[n])}updateDirection(){this.to.vsub(this.from,this.direction),this.direction.normalize()}intersectShape(t,e,n,i){let r=this.from;if(cv(r,this.direction,n)>t.boundingSphereRadius)return;let a=this[t.type];a&&a.call(this,t,e,n,i,t)}_intersectBox(t,e,n,i,r){return this._intersectConvex(t.convexPolyhedronRepresentation,e,n,i,r)}_intersectPlane(t,e,n,i,r){let o=this.from,a=this.to,c=this.direction,l=new T(0,0,1);e.vmult(l,l);let u=new T;o.vsub(n,u);let d=u.dot(l);a.vsub(n,u);let h=u.dot(l);if(d*h>0||o.distanceTo(a)<d)return;let f=l.dot(c);if(Math.abs(f)<this.precision)return;let p=new T,x=new T,g=new T;o.vsub(n,p);let m=-l.dot(p)/f;c.scale(m,x),o.vadd(x,g),this.reportIntersection(l,g,r,i,-1)}getAABB(t){let{lowerBound:e,upperBound:n}=t,i=this.to,r=this.from;e.x=Math.min(i.x,r.x),e.y=Math.min(i.y,r.y),e.z=Math.min(i.z,r.z),n.x=Math.max(i.x,r.x),n.y=Math.max(i.y,r.y),n.z=Math.max(i.z,r.z)}_intersectHeightfield(t,e,n,i,r){t.data,t.elementSize;let o=Y_;o.from.copy(this.from),o.to.copy(this.to),re.pointToLocalFrame(n,e,o.from,o.from),re.pointToLocalFrame(n,e,o.to,o.to),o.updateDirection();let a=Z_,c,l,u,d;c=l=0,u=d=t.data.length-1;let h=new an;o.getAABB(h),t.getIndexOfPosition(h.lowerBound.x,h.lowerBound.y,a,!0),c=Math.max(c,a[0]),l=Math.max(l,a[1]),t.getIndexOfPosition(h.upperBound.x,h.upperBound.y,a,!0),u=Math.min(u,a[0]+1),d=Math.min(d,a[1]+1);for(let f=c;f<u;f++)for(let p=l;p<d;p++){if(this.result.shouldStop)return;if(t.getAabbAtIndex(f,p,h),!!h.overlapsRay(o)){if(t.getConvexTrianglePillar(f,p,!1),re.pointToWorldFrame(n,e,t.pillarOffset,cc),this._intersectConvex(t.pillarConvex,e,cc,i,r,Wd),this.result.shouldStop)return;t.getConvexTrianglePillar(f,p,!0),re.pointToWorldFrame(n,e,t.pillarOffset,cc),this._intersectConvex(t.pillarConvex,e,cc,i,r,Wd)}}}_intersectSphere(t,e,n,i,r){let o=this.from,a=this.to,c=t.radius,l=(a.x-o.x)**2+(a.y-o.y)**2+(a.z-o.z)**2,u=2*((a.x-o.x)*(o.x-n.x)+(a.y-o.y)*(o.y-n.y)+(a.z-o.z)*(o.z-n.z)),d=(o.x-n.x)**2+(o.y-n.y)**2+(o.z-n.z)**2-c**2,h=u**2-4*l*d,f=$_,p=J_;if(!(h<0))if(h===0)o.lerp(a,h,f),f.vsub(n,p),p.normalize(),this.reportIntersection(p,f,r,i,-1);else{let x=(-u-Math.sqrt(h))/(2*l),g=(-u+Math.sqrt(h))/(2*l);if(x>=0&&x<=1&&(o.lerp(a,x,f),f.vsub(n,p),p.normalize(),this.reportIntersection(p,f,r,i,-1)),this.result.shouldStop)return;g>=0&&g<=1&&(o.lerp(a,g,f),f.vsub(n,p),p.normalize(),this.reportIntersection(p,f,r,i,-1))}}_intersectConvex(t,e,n,i,r,o){let a=K_,c=qd,l=o&&o.faceList||null,u=t.faces,d=t.vertices,h=t.faceNormals,f=this.direction,p=this.from,x=this.to,g=p.distanceTo(x),m=l?l.length:u.length,v=this.result;for(let N=0;!v.shouldStop&&N<m;N++){let S=l?l[N]:N,E=u[S],w=h[S],P=e,_=n;c.copy(d[E[0]]),P.vmult(c,c),c.vadd(_,c),c.vsub(p,c),P.vmult(w,a);let b=f.dot(a);if(Math.abs(b)<this.precision)continue;let M=a.dot(c)/b;if(!(M<0)){f.scale(M,Qe),Qe.vadd(p,Qe),En.copy(d[E[0]]),P.vmult(En,En),_.vadd(En,En);for(let R=1;!v.shouldStop&&R<E.length-1;R++){Gn.copy(d[E[R]]),Wn.copy(d[E[R+1]]),P.vmult(Gn,Gn),P.vmult(Wn,Wn),_.vadd(Gn,Gn),_.vadd(Wn,Wn);let F=Qe.distanceTo(p);!(s.pointInTriangle(Qe,En,Gn,Wn)||s.pointInTriangle(Qe,Gn,En,Wn))||F>g||this.reportIntersection(a,Qe,r,i,S)}}}}_intersectTrimesh(t,e,n,i,r,o){let a=tv,c=ov,l=av,u=qd,d=ev,h=nv,f=iv,p=rv,x=sv,g=t.indices;t.vertices;let m=this.from,v=this.to,N=this.direction;l.position.copy(n),l.quaternion.copy(e),re.vectorToLocalFrame(n,e,N,d),re.pointToLocalFrame(n,e,m,h),re.pointToLocalFrame(n,e,v,f),f.x*=t.scale.x,f.y*=t.scale.y,f.z*=t.scale.z,h.x*=t.scale.x,h.y*=t.scale.y,h.z*=t.scale.z,f.vsub(h,d),d.normalize();let S=h.distanceSquared(f);t.tree.rayQuery(this,l,c);for(let E=0,w=c.length;!this.result.shouldStop&&E!==w;E++){let P=c[E];t.getNormal(P,a),t.getVertex(g[P*3],En),En.vsub(h,u);let _=d.dot(a),b=a.dot(u)/_;if(b<0)continue;d.scale(b,Qe),Qe.vadd(h,Qe),t.getVertex(g[P*3+1],Gn),t.getVertex(g[P*3+2],Wn);let M=Qe.distanceSquared(h);!(s.pointInTriangle(Qe,Gn,En,Wn)||s.pointInTriangle(Qe,En,Gn,Wn))||M>S||(re.vectorToWorldFrame(e,a,x),re.pointToWorldFrame(n,e,Qe,p),this.reportIntersection(x,p,r,i,P))}c.length=0}reportIntersection(t,e,n,i,r){let o=this.from,a=this.to,c=o.distanceTo(e),l=this.result;if(!(this.skipBackfaces&&t.dot(this.direction)>0))switch(l.hitFaceIndex=typeof r<"u"?r:-1,this.mode){case s.ALL:this.hasHit=!0,l.set(o,a,t,e,n,i,c),l.hasHit=!0,this.callback(l);break;case s.CLOSEST:(c<l.distance||!l.hasHit)&&(this.hasHit=!0,l.hasHit=!0,l.set(o,a,t,e,n,i,c));break;case s.ANY:this.hasHit=!0,l.hasHit=!0,l.set(o,a,t,e,n,i,c),l.shouldStop=!0;break}}static pointInTriangle(t,e,n,i){i.vsub(e,Zi),n.vsub(e,Xr),t.vsub(e,rh);let r=Zi.dot(Zi),o=Zi.dot(Xr),a=Zi.dot(rh),c=Xr.dot(Xr),l=Xr.dot(rh),u,d;return(u=c*a-o*l)>=0&&(d=r*l-o*a)>=0&&u+d<r*c-o*o}};dn.CLOSEST=yh.CLOSEST;dn.ANY=yh.ANY;dn.ALL=yh.ALL;var Gd=new an,sh=[],Xr=new T,rh=new T,q_=new T,X_=new ke,Qe=new T,En=new T,Gn=new T,Wn=new T;new T;new Ys;var Wd={faceList:[0]},cc=new T,Y_=new dn,Z_=[],$_=new T,J_=new T,K_=new T,j_=new T,Q_=new T,qd=new T,tv=new T,ev=new T,nv=new T,iv=new T,sv=new T,rv=new T;new an;var ov=[],av=new re,Zi=new T,lc=new T;function cv(s,t,e){e.vsub(s,Zi);let n=Zi.dot(t);return t.scale(n,lc),lc.vadd(s,lc),e.distanceTo(lc)}var gc=class s extends mc{static checkBounds(t,e,n){let i,r;n===0?(i=t.position.x,r=e.position.x):n===1?(i=t.position.y,r=e.position.y):n===2&&(i=t.position.z,r=e.position.z);let o=t.boundingRadius,a=e.boundingRadius,c=i+o;return r-a<c}static insertionSortX(t){for(let e=1,n=t.length;e<n;e++){let i=t[e],r;for(r=e-1;r>=0&&!(t[r].aabb.lowerBound.x<=i.aabb.lowerBound.x);r--)t[r+1]=t[r];t[r+1]=i}return t}static insertionSortY(t){for(let e=1,n=t.length;e<n;e++){let i=t[e],r;for(r=e-1;r>=0&&!(t[r].aabb.lowerBound.y<=i.aabb.lowerBound.y);r--)t[r+1]=t[r];t[r+1]=i}return t}static insertionSortZ(t){for(let e=1,n=t.length;e<n;e++){let i=t[e],r;for(r=e-1;r>=0&&!(t[r].aabb.lowerBound.z<=i.aabb.lowerBound.z);r--)t[r+1]=t[r];t[r+1]=i}return t}constructor(t){super(),this.axisList=[],this.world=null,this.axisIndex=0;let e=this.axisList;this._addBodyHandler=n=>{e.push(n.body)},this._removeBodyHandler=n=>{let i=e.indexOf(n.body);i!==-1&&e.splice(i,1)},t&&this.setWorld(t)}setWorld(t){this.axisList.length=0;for(let e=0;e<t.bodies.length;e++)this.axisList.push(t.bodies[e]);t.removeEventListener("addBody",this._addBodyHandler),t.removeEventListener("removeBody",this._removeBodyHandler),t.addEventListener("addBody",this._addBodyHandler),t.addEventListener("removeBody",this._removeBodyHandler),this.world=t,this.dirty=!0}collisionPairs(t,e,n){let i=this.axisList,r=i.length,o=this.axisIndex,a,c;for(this.dirty&&(this.sortList(),this.dirty=!1),a=0;a!==r;a++){let l=i[a];for(c=a+1;c<r;c++){let u=i[c];if(this.needBroadphaseCollision(l,u)){if(!s.checkBounds(l,u,o))break;this.intersectionTest(l,u,e,n)}}}}sortList(){let t=this.axisList,e=this.axisIndex,n=t.length;for(let i=0;i!==n;i++){let r=t[i];r.aabbNeedsUpdate&&r.updateAABB()}e===0?s.insertionSortX(t):e===1?s.insertionSortY(t):e===2&&s.insertionSortZ(t)}autoDetectAxis(){let t=0,e=0,n=0,i=0,r=0,o=0,a=this.axisList,c=a.length,l=1/c;for(let f=0;f!==c;f++){let p=a[f],x=p.position.x;t+=x,e+=x*x;let g=p.position.y;n+=g,i+=g*g;let m=p.position.z;r+=m,o+=m*m}let u=e-t*t*l,d=i-n*n*l,h=o-r*r*l;u>d?u>h?this.axisIndex=0:this.axisIndex=2:d>h?this.axisIndex=1:this.axisIndex=2}aabbQuery(t,e,n){n===void 0&&(n=[]),this.dirty&&(this.sortList(),this.dirty=!1);let i=this.axisIndex,r="x";i===1&&(r="y"),i===2&&(r="z");let o=this.axisList;e.lowerBound[r],e.upperBound[r];for(let a=0;a<o.length;a++){let c=o[a];c.aabbNeedsUpdate&&c.updateAABB(),c.aabb.overlaps(e)&&n.push(c)}return n}},xc=class{static defaults(t,e){t===void 0&&(t={});for(let n in e)n in t||(t[n]=e[n]);return t}},_c=class s{constructor(t,e,n){n===void 0&&(n={}),n=xc.defaults(n,{collideConnected:!0,wakeUpBodies:!0}),this.equations=[],this.bodyA=t,this.bodyB=e,this.id=s.idCounter++,this.collideConnected=n.collideConnected,n.wakeUpBodies&&(t&&t.wakeUp(),e&&e.wakeUp())}update(){throw new Error("method update() not implmemented in this Constraint subclass!")}enable(){let t=this.equations;for(let e=0;e<t.length;e++)t[e].enabled=!0}disable(){let t=this.equations;for(let e=0;e<t.length;e++)t[e].enabled=!1}};_c.idCounter=0;var vc=class{constructor(){this.spatial=new T,this.rotational=new T}multiplyElement(t){return t.spatial.dot(this.spatial)+t.rotational.dot(this.rotational)}multiplyVectors(t,e){return t.dot(this.spatial)+e.dot(this.rotational)}},$i=class s{constructor(t,e,n,i){n===void 0&&(n=-1e6),i===void 0&&(i=1e6),this.id=s.idCounter++,this.minForce=n,this.maxForce=i,this.bi=t,this.bj=e,this.a=0,this.b=0,this.eps=0,this.jacobianElementA=new vc,this.jacobianElementB=new vc,this.enabled=!0,this.multiplier=0,this.setSpookParams(1e7,4,1/60)}setSpookParams(t,e,n){let i=e,r=t,o=n;this.a=4/(o*(1+4*i)),this.b=4*i/(1+4*i),this.eps=4/(o*o*r*(1+4*i))}computeB(t,e,n){let i=this.computeGW(),r=this.computeGq(),o=this.computeGiMf();return-r*t-i*e-o*n}computeGq(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.position,o=i.position;return t.spatial.dot(r)+e.spatial.dot(o)}computeGW(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.velocity,o=i.velocity,a=n.angularVelocity,c=i.angularVelocity;return t.multiplyVectors(r,a)+e.multiplyVectors(o,c)}computeGWlambda(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.vlambda,o=i.vlambda,a=n.wlambda,c=i.wlambda;return t.multiplyVectors(r,a)+e.multiplyVectors(o,c)}computeGiMf(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.force,o=n.torque,a=i.force,c=i.torque,l=n.invMassSolve,u=i.invMassSolve;return r.scale(l,Xd),a.scale(u,Yd),n.invInertiaWorldSolve.vmult(o,Zd),i.invInertiaWorldSolve.vmult(c,$d),t.multiplyVectors(Xd,Zd)+e.multiplyVectors(Yd,$d)}computeGiMGt(){let t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.invMassSolve,o=i.invMassSolve,a=n.invInertiaWorldSolve,c=i.invInertiaWorldSolve,l=r+o;return a.vmult(t.rotational,hc),l+=hc.dot(t.rotational),c.vmult(e.rotational,hc),l+=hc.dot(e.rotational),l}addToWlambda(t){let e=this.jacobianElementA,n=this.jacobianElementB,i=this.bi,r=this.bj,o=lv;i.vlambda.addScaledVector(i.invMassSolve*t,e.spatial,i.vlambda),r.vlambda.addScaledVector(r.invMassSolve*t,n.spatial,r.vlambda),i.invInertiaWorldSolve.vmult(e.rotational,o),i.wlambda.addScaledVector(t,o,i.wlambda),r.invInertiaWorldSolve.vmult(n.rotational,o),r.wlambda.addScaledVector(t,o,r.wlambda)}computeC(){return this.computeGiMGt()+this.eps}};$i.idCounter=0;var Xd=new T,Yd=new T,Zd=new T,$d=new T,hc=new T,lv=new T,Xs=class extends $i{constructor(t,e,n){n===void 0&&(n=1e6),super(t,e,0,n),this.restitution=0,this.ri=new T,this.rj=new T,this.ni=new T}computeB(t){let e=this.a,n=this.b,i=this.bi,r=this.bj,o=this.ri,a=this.rj,c=hv,l=uv,u=i.velocity,d=i.angularVelocity;i.force,i.torque;let h=r.velocity,f=r.angularVelocity;r.force,r.torque;let p=dv,x=this.jacobianElementA,g=this.jacobianElementB,m=this.ni;o.cross(m,c),a.cross(m,l),m.negate(x.spatial),c.negate(x.rotational),g.spatial.copy(m),g.rotational.copy(l),p.copy(r.position),p.vadd(a,p),p.vsub(i.position,p),p.vsub(o,p);let v=m.dot(p),N=this.restitution+1,S=N*h.dot(m)-N*u.dot(m)+f.dot(l)-d.dot(c),E=this.computeGiMf();return-v*e-S*n-t*E}getImpactVelocityAlongNormal(){let t=fv,e=pv,n=mv,i=gv,r=xv;return this.bi.position.vadd(this.ri,n),this.bj.position.vadd(this.rj,i),this.bi.getVelocityAtWorldPoint(n,t),this.bj.getVelocityAtWorldPoint(i,e),t.vsub(e,r),this.ni.dot(r)}},hv=new T,uv=new T,dv=new T,fv=new T,pv=new T,mv=new T,gv=new T,xv=new T,Jr=class extends _c{constructor(t,e,n,i,r){e===void 0&&(e=new T),i===void 0&&(i=new T),r===void 0&&(r=1e6),super(t,n),this.pivotA=e.clone(),this.pivotB=i.clone();let o=this.equationX=new Xs(t,n),a=this.equationY=new Xs(t,n),c=this.equationZ=new Xs(t,n);this.equations.push(o,a,c),o.minForce=a.minForce=c.minForce=-r,o.maxForce=a.maxForce=c.maxForce=r,o.ni.set(1,0,0),a.ni.set(0,1,0),c.ni.set(0,0,1)}update(){let t=this.bodyA,e=this.bodyB,n=this.equationX,i=this.equationY,r=this.equationZ;t.quaternion.vmult(this.pivotA,n.ri),e.quaternion.vmult(this.pivotB,n.rj),i.ri.copy(n.ri),i.rj.copy(n.rj),r.ri.copy(n.ri),r.rj.copy(n.rj)}},hh=class extends $i{constructor(t,e,n){n===void 0&&(n={});let i=typeof n.maxForce<"u"?n.maxForce:1e6;super(t,e,-i,i),this.axisA=n.axisA?n.axisA.clone():new T(1,0,0),this.axisB=n.axisB?n.axisB.clone():new T(0,1,0),this.angle=typeof n.angle<"u"?n.angle:0}computeB(t){let e=this.a,n=this.b,i=this.axisA,r=this.axisB,o=_v,a=vv,c=this.jacobianElementA,l=this.jacobianElementB;i.cross(r,o),r.cross(i,a),c.rotational.copy(a),l.rotational.copy(o);let u=Math.cos(this.angle)-i.dot(r),d=this.computeGW(),h=this.computeGiMf();return-u*e-d*n-t*h}},_v=new T,vv=new T,uh=class extends $i{constructor(t,e,n){n===void 0&&(n={});let i=typeof n.maxForce<"u"?n.maxForce:1e6;super(t,e,-i,i),this.axisA=n.axisA?n.axisA.clone():new T(1,0,0),this.axisB=n.axisB?n.axisB.clone():new T(0,1,0),this.maxAngle=Math.PI/2}computeB(t){let e=this.a,n=this.b,i=this.axisA,r=this.axisB,o=yv,a=Sv,c=this.jacobianElementA,l=this.jacobianElementB;i.cross(r,o),r.cross(i,a),c.rotational.copy(a),l.rotational.copy(o);let u=Math.cos(this.maxAngle)-i.dot(r),d=this.computeGW(),h=this.computeGiMf();return-u*e-d*n-t*h}},yv=new T,Sv=new T,yc=class extends Jr{constructor(t,e,n){n===void 0&&(n={});let i=typeof n.maxForce<"u"?n.maxForce:1e6,r=n.pivotA?n.pivotA.clone():new T,o=n.pivotB?n.pivotB.clone():new T;super(t,r,e,o,i),this.axisA=n.axisA?n.axisA.clone():new T,this.axisB=n.axisB?n.axisB.clone():new T,this.collideConnected=!!n.collideConnected,this.angle=typeof n.angle<"u"?n.angle:0;let a=this.coneEquation=new hh(t,e,n),c=this.twistEquation=new uh(t,e,n);this.twistAngle=typeof n.twistAngle<"u"?n.twistAngle:0,a.maxForce=0,a.minForce=-i,c.maxForce=0,c.minForce=-i,this.equations.push(a,c)}update(){let t=this.bodyA,e=this.bodyB,n=this.coneEquation,i=this.twistEquation;super.update(),t.vectorToWorldFrame(this.axisA,n.axisA),e.vectorToWorldFrame(this.axisB,n.axisB),this.axisA.tangents(i.axisA,i.axisA),t.vectorToWorldFrame(i.axisA,i.axisA),this.axisB.tangents(i.axisB,i.axisB),e.vectorToWorldFrame(i.axisB,i.axisB),n.angle=this.angle,i.maxAngle=this.twistAngle}};new T;new T;var Zw=new T,$w=new T;var Jw=new T,Kw=new T,Sc=class extends $i{constructor(t,e,n){super(t,e,-n,n),this.ri=new T,this.rj=new T,this.t=new T}computeB(t){this.a;let e=this.b;this.bi,this.bj;let n=this.ri,i=this.rj,r=Mv,o=bv,a=this.t;n.cross(a,r),i.cross(a,o);let c=this.jacobianElementA,l=this.jacobianElementB;a.negate(c.spatial),r.negate(c.rotational),l.spatial.copy(a),l.rotational.copy(o);let u=this.computeGW(),d=this.computeGiMf();return-u*e-t*d}},Mv=new T,bv=new T,Zs=class s{constructor(t,e,n){n=xc.defaults(n,{friction:.3,restitution:.3,contactEquationStiffness:1e7,contactEquationRelaxation:3,frictionEquationStiffness:1e7,frictionEquationRelaxation:3}),this.id=s.idCounter++,this.materials=[t,e],this.friction=n.friction,this.restitution=n.restitution,this.contactEquationStiffness=n.contactEquationStiffness,this.contactEquationRelaxation=n.contactEquationRelaxation,this.frictionEquationStiffness=n.frictionEquationStiffness,this.frictionEquationRelaxation=n.frictionEquationRelaxation}};Zs.idCounter=0;var Ji=class s{constructor(t){t===void 0&&(t={});let e="";typeof t=="string"&&(e=t,t={}),this.name=e,this.id=s.idCounter++,this.friction=typeof t.friction<"u"?t.friction:-1,this.restitution=typeof t.restitution<"u"?t.restitution:-1}};Ji.idCounter=0;var jw=new T,Qw=new T,tE=new T,eE=new T,nE=new T,iE=new T,sE=new T,rE=new T,oE=new T,aE=new T,cE=new T;var lE=new T,hE=new T;new T;new T;new T;var uE=new T,dE=new T,fE=new T;new dn;new T;var pE=new T,mE=new T,gE=[new T(1,0,0),new T(0,1,0),new T(0,0,1)],xE=new T;var _E=new T,vE=new T,yE=new T;var SE=new T,ME=new T,bE=new T,wE=new T;var EE=new T,TE=new T,AE=new T;var Mc=class extends Tt{constructor(t){if(super({type:Tt.types.SPHERE}),this.radius=t!==void 0?t:1,this.radius<0)throw new Error("The sphere radius cannot be negative.");this.updateBoundingSphereRadius()}calculateLocalInertia(t,e){e===void 0&&(e=new T);let n=2*t*this.radius*this.radius/5;return e.x=n,e.y=n,e.z=n,e}volume(){return 4*Math.PI*Math.pow(this.radius,3)/3}updateBoundingSphereRadius(){this.boundingSphereRadius=this.radius}calculateWorldAABB(t,e,n,i){let r=this.radius,o=["x","y","z"];for(let a=0;a<o.length;a++){let c=o[a];n[c]=t[c]-r,i[c]=t[c]+r}}};var CE=new T,RE=new T;var IE=new T,PE=new T,LE=new T,NE=new T,FE=new T,DE=new T,BE=new T;var bc=class extends Tt{constructor(){super({type:Tt.types.PLANE}),this.worldNormal=new T,this.worldNormalNeedsUpdate=!0,this.boundingSphereRadius=Number.MAX_VALUE}computeWorldNormal(t){let e=this.worldNormal;e.set(0,0,1),t.vmult(e,e),this.worldNormalNeedsUpdate=!1}calculateLocalInertia(t,e){return e===void 0&&(e=new T),e}volume(){return Number.MAX_VALUE}calculateWorldAABB(t,e,n,i){ii.set(0,0,1),e.vmult(ii,ii);let r=Number.MAX_VALUE;n.set(-r,-r,-r),i.set(r,r,r),ii.x===1?i.x=t.x:ii.x===-1&&(n.x=t.x),ii.y===1?i.y=t.y:ii.y===-1&&(n.y=t.y),ii.z===1?i.z=t.z:ii.z===-1&&(n.z=t.z)}updateBoundingSphereRadius(){this.boundingSphereRadius=Number.MAX_VALUE}},ii=new T;var UE=new T,OE=new T,zE=new T,VE=new T,kE=new T,HE=new T,GE=new T,WE=new T,qE=new T;var XE=new T,YE=new an;var ZE=new T,$E=new an,JE=new T,KE=new T,jE=new T,QE=new T,t1=new T,e1=new T,n1=new T,i1=new an,s1=new T,r1=new re,o1=new an,dh=class{constructor(){this.equations=[]}solve(t,e){return 0}addEquation(t){t.enabled&&!t.bi.isTrigger&&!t.bj.isTrigger&&this.equations.push(t)}removeEquation(t){let e=this.equations,n=e.indexOf(t);n!==-1&&e.splice(n,1)}removeAllEquations(){this.equations.length=0}},fh=class extends dh{constructor(){super(),this.iterations=10,this.tolerance=1e-7}solve(t,e){let n=0,i=this.iterations,r=this.tolerance*this.tolerance,o=this.equations,a=o.length,c=e.bodies,l=c.length,u=t,d,h,f,p,x,g;if(a!==0)for(let S=0;S!==l;S++)c[S].updateSolveMassProperties();let m=Ev,v=Tv,N=wv;m.length=a,v.length=a,N.length=a;for(let S=0;S!==a;S++){let E=o[S];N[S]=0,v[S]=E.computeB(u),m[S]=1/E.computeC()}if(a!==0){for(let w=0;w!==l;w++){let P=c[w],_=P.vlambda,b=P.wlambda;_.set(0,0,0),b.set(0,0,0)}for(n=0;n!==i;n++){p=0;for(let w=0;w!==a;w++){let P=o[w];d=v[w],h=m[w],g=N[w],x=P.computeGWlambda(),f=h*(d-x-P.eps*g),g+f<P.minForce?f=P.minForce-g:g+f>P.maxForce&&(f=P.maxForce-g),N[w]+=f,p+=f>0?f:-f,P.addToWlambda(f)}if(p*p<r)break}for(let w=0;w!==l;w++){let P=c[w],_=P.velocity,b=P.angularVelocity;P.vlambda.vmul(P.linearFactor,P.vlambda),_.vadd(P.vlambda,_),P.wlambda.vmul(P.angularFactor,P.wlambda),b.vadd(P.wlambda,b)}let S=o.length,E=1/u;for(;S--;)o[S].multiplier=N[S]*E}return n}},wv=[],Ev=[],Tv=[];var a1=Xt.STATIC;var ph=class{constructor(){this.objects=[],this.type=Object}release(){let t=arguments.length;for(let e=0;e!==t;e++)this.objects.push(e<0||arguments.length<=e?void 0:arguments[e]);return this}get(){return this.objects.length===0?this.constructObject():this.objects.pop()}constructObject(){throw new Error("constructObject() not implemented in this Pool subclass yet!")}resize(t){let e=this.objects;for(;e.length>t;)e.pop();for(;e.length<t;)e.push(this.constructObject());return this}},mh=class extends ph{constructor(){super(...arguments),this.type=T}constructObject(){return new T}},xe={sphereSphere:Tt.types.SPHERE,spherePlane:Tt.types.SPHERE|Tt.types.PLANE,boxBox:Tt.types.BOX|Tt.types.BOX,sphereBox:Tt.types.SPHERE|Tt.types.BOX,planeBox:Tt.types.PLANE|Tt.types.BOX,convexConvex:Tt.types.CONVEXPOLYHEDRON,sphereConvex:Tt.types.SPHERE|Tt.types.CONVEXPOLYHEDRON,planeConvex:Tt.types.PLANE|Tt.types.CONVEXPOLYHEDRON,boxConvex:Tt.types.BOX|Tt.types.CONVEXPOLYHEDRON,sphereHeightfield:Tt.types.SPHERE|Tt.types.HEIGHTFIELD,boxHeightfield:Tt.types.BOX|Tt.types.HEIGHTFIELD,convexHeightfield:Tt.types.CONVEXPOLYHEDRON|Tt.types.HEIGHTFIELD,sphereParticle:Tt.types.PARTICLE|Tt.types.SPHERE,planeParticle:Tt.types.PLANE|Tt.types.PARTICLE,boxParticle:Tt.types.BOX|Tt.types.PARTICLE,convexParticle:Tt.types.PARTICLE|Tt.types.CONVEXPOLYHEDRON,cylinderCylinder:Tt.types.CYLINDER,sphereCylinder:Tt.types.SPHERE|Tt.types.CYLINDER,planeCylinder:Tt.types.PLANE|Tt.types.CYLINDER,boxCylinder:Tt.types.BOX|Tt.types.CYLINDER,convexCylinder:Tt.types.CONVEXPOLYHEDRON|Tt.types.CYLINDER,heightfieldCylinder:Tt.types.HEIGHTFIELD|Tt.types.CYLINDER,particleCylinder:Tt.types.PARTICLE|Tt.types.CYLINDER,sphereTrimesh:Tt.types.SPHERE|Tt.types.TRIMESH,planeTrimesh:Tt.types.PLANE|Tt.types.TRIMESH},gh=class{get[xe.sphereSphere](){return this.sphereSphere}get[xe.spherePlane](){return this.spherePlane}get[xe.boxBox](){return this.boxBox}get[xe.sphereBox](){return this.sphereBox}get[xe.planeBox](){return this.planeBox}get[xe.convexConvex](){return this.convexConvex}get[xe.sphereConvex](){return this.sphereConvex}get[xe.planeConvex](){return this.planeConvex}get[xe.boxConvex](){return this.boxConvex}get[xe.sphereHeightfield](){return this.sphereHeightfield}get[xe.boxHeightfield](){return this.boxHeightfield}get[xe.convexHeightfield](){return this.convexHeightfield}get[xe.sphereParticle](){return this.sphereParticle}get[xe.planeParticle](){return this.planeParticle}get[xe.boxParticle](){return this.boxParticle}get[xe.convexParticle](){return this.convexParticle}get[xe.cylinderCylinder](){return this.convexConvex}get[xe.sphereCylinder](){return this.sphereConvex}get[xe.planeCylinder](){return this.planeConvex}get[xe.boxCylinder](){return this.boxConvex}get[xe.convexCylinder](){return this.convexConvex}get[xe.heightfieldCylinder](){return this.heightfieldCylinder}get[xe.particleCylinder](){return this.particleCylinder}get[xe.sphereTrimesh](){return this.sphereTrimesh}get[xe.planeTrimesh](){return this.planeTrimesh}constructor(t){this.contactPointPool=[],this.frictionEquationPool=[],this.result=[],this.frictionResult=[],this.v3pool=new mh,this.world=t,this.currentContactMaterial=t.defaultContactMaterial,this.enableFrictionReduction=!1}createContactEquation(t,e,n,i,r,o){let a;this.contactPointPool.length?(a=this.contactPointPool.pop(),a.bi=t,a.bj=e):a=new Xs(t,e),a.enabled=t.collisionResponse&&e.collisionResponse&&n.collisionResponse&&i.collisionResponse;let c=this.currentContactMaterial;a.restitution=c.restitution,a.setSpookParams(c.contactEquationStiffness,c.contactEquationRelaxation,this.world.dt);let l=n.material||t.material,u=i.material||e.material;return l&&u&&l.restitution>=0&&u.restitution>=0&&(a.restitution=l.restitution*u.restitution),a.si=r||n,a.sj=o||i,a}createFrictionEquationsFromContact(t,e){let n=t.bi,i=t.bj,r=t.si,o=t.sj,a=this.world,c=this.currentContactMaterial,l=c.friction,u=r.material||n.material,d=o.material||i.material;if(u&&d&&u.friction>=0&&d.friction>=0&&(l=u.friction*d.friction),l>0){let h=l*(a.frictionGravity||a.gravity).length(),f=n.invMass+i.invMass;f>0&&(f=1/f);let p=this.frictionEquationPool,x=p.length?p.pop():new Sc(n,i,h*f),g=p.length?p.pop():new Sc(n,i,h*f);return x.bi=g.bi=n,x.bj=g.bj=i,x.minForce=g.minForce=-h*f,x.maxForce=g.maxForce=h*f,x.ri.copy(t.ri),x.rj.copy(t.rj),g.ri.copy(t.ri),g.rj.copy(t.rj),t.ni.tangents(x.t,g.t),x.setSpookParams(c.frictionEquationStiffness,c.frictionEquationRelaxation,a.dt),g.setSpookParams(c.frictionEquationStiffness,c.frictionEquationRelaxation,a.dt),x.enabled=g.enabled=t.enabled,e.push(x,g),!0}return!1}createFrictionFromAverage(t){let e=this.result[this.result.length-1];if(!this.createFrictionEquationsFromContact(e,this.frictionResult)||t===1)return;let n=this.frictionResult[this.frictionResult.length-2],i=this.frictionResult[this.frictionResult.length-1];Yi.setZero(),Ws.setZero(),qs.setZero();let r=e.bi;e.bj;for(let a=0;a!==t;a++)e=this.result[this.result.length-1-a],e.bi!==r?(Yi.vadd(e.ni,Yi),Ws.vadd(e.ri,Ws),qs.vadd(e.rj,qs)):(Yi.vsub(e.ni,Yi),Ws.vadd(e.rj,Ws),qs.vadd(e.ri,qs));let o=1/t;Ws.scale(o,n.ri),qs.scale(o,n.rj),i.ri.copy(n.ri),i.rj.copy(n.rj),Yi.normalize(),Yi.tangents(n.t,i.t)}getContacts(t,e,n,i,r,o,a){this.contactPointPool=r,this.frictionEquationPool=a,this.result=i,this.frictionResult=o;let c=Rv,l=Iv,u=Av,d=Cv;for(let h=0,f=t.length;h!==f;h++){let p=t[h],x=e[h],g=null;p.material&&x.material&&(g=n.getContactMaterial(p.material,x.material)||null);let m=p.type&Xt.KINEMATIC&&x.type&Xt.STATIC||p.type&Xt.STATIC&&x.type&Xt.KINEMATIC||p.type&Xt.KINEMATIC&&x.type&Xt.KINEMATIC;for(let v=0;v<p.shapes.length;v++){p.quaternion.mult(p.shapeOrientations[v],c),p.quaternion.vmult(p.shapeOffsets[v],u),u.vadd(p.position,u);let N=p.shapes[v];for(let S=0;S<x.shapes.length;S++){x.quaternion.mult(x.shapeOrientations[S],l),x.quaternion.vmult(x.shapeOffsets[S],d),d.vadd(x.position,d);let E=x.shapes[S];if(!(N.collisionFilterMask&E.collisionFilterGroup&&E.collisionFilterMask&N.collisionFilterGroup)||u.distanceTo(d)>N.boundingSphereRadius+E.boundingSphereRadius)continue;let w=null;N.material&&E.material&&(w=n.getContactMaterial(N.material,E.material)||null),this.currentContactMaterial=w||g||n.defaultContactMaterial;let P=N.type|E.type,_=this[P];if(_){let b=!1;N.type<E.type?b=_.call(this,N,E,u,d,c,l,p,x,N,E,m):b=_.call(this,E,N,d,u,l,c,x,p,N,E,m),b&&m&&(n.shapeOverlapKeeper.set(N.id,E.id),n.bodyOverlapKeeper.set(p.id,x.id))}}}}}sphereSphere(t,e,n,i,r,o,a,c,l,u,d){if(d)return n.distanceSquared(i)<(t.radius+e.radius)**2;let h=this.createContactEquation(a,c,t,e,l,u);i.vsub(n,h.ni),h.ni.normalize(),h.ri.copy(h.ni),h.rj.copy(h.ni),h.ri.scale(t.radius,h.ri),h.rj.scale(-e.radius,h.rj),h.ri.vadd(n,h.ri),h.ri.vsub(a.position,h.ri),h.rj.vadd(i,h.rj),h.rj.vsub(c.position,h.rj),this.result.push(h),this.createFrictionEquationsFromContact(h,this.frictionResult)}spherePlane(t,e,n,i,r,o,a,c,l,u,d){let h=this.createContactEquation(a,c,t,e,l,u);if(h.ni.set(0,0,1),o.vmult(h.ni,h.ni),h.ni.negate(h.ni),h.ni.normalize(),h.ni.scale(t.radius,h.ri),n.vsub(i,uc),h.ni.scale(h.ni.dot(uc),Jd),uc.vsub(Jd,h.rj),-uc.dot(h.ni)<=t.radius){if(d)return!0;let f=h.ri,p=h.rj;f.vadd(n,f),f.vsub(a.position,f),p.vadd(i,p),p.vsub(c.position,p),this.result.push(h),this.createFrictionEquationsFromContact(h,this.frictionResult)}}boxBox(t,e,n,i,r,o,a,c,l,u,d){return t.convexPolyhedronRepresentation.material=t.material,e.convexPolyhedronRepresentation.material=e.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexConvex(t.convexPolyhedronRepresentation,e.convexPolyhedronRepresentation,n,i,r,o,a,c,t,e,d)}sphereBox(t,e,n,i,r,o,a,c,l,u,d){let h=this.v3pool,f=ny;n.vsub(i,dc),e.getSideNormals(f,o);let p=t.radius,x=!1,g=sy,m=ry,v=oy,N=null,S=0,E=0,w=0,P=null;for(let D=0,z=f.length;D!==z&&x===!1;D++){let q=Qv;q.copy(f[D]);let G=q.length();q.normalize();let Z=dc.dot(q);if(Z<G+p&&Z>0){let W=ty,et=ey;W.copy(f[(D+1)%3]),et.copy(f[(D+2)%3]);let ut=W.length(),Ft=et.length();W.normalize(),et.normalize();let At=dc.dot(W),Bt=dc.dot(et);if(At<ut&&At>-ut&&Bt<Ft&&Bt>-Ft){let K=Math.abs(Z-G-p);if((P===null||K<P)&&(P=K,E=At,w=Bt,N=G,g.copy(q),m.copy(W),v.copy(et),S++,d))return!0}}}if(S){x=!0;let D=this.createContactEquation(a,c,t,e,l,u);g.scale(-p,D.ri),D.ni.copy(g),D.ni.negate(D.ni),g.scale(N,g),m.scale(E,m),g.vadd(m,g),v.scale(w,v),g.vadd(v,D.rj),D.ri.vadd(n,D.ri),D.ri.vsub(a.position,D.ri),D.rj.vadd(i,D.rj),D.rj.vsub(c.position,D.rj),this.result.push(D),this.createFrictionEquationsFromContact(D,this.frictionResult)}let _=h.get(),b=iy;for(let D=0;D!==2&&!x;D++)for(let z=0;z!==2&&!x;z++)for(let q=0;q!==2&&!x;q++)if(_.set(0,0,0),D?_.vadd(f[0],_):_.vsub(f[0],_),z?_.vadd(f[1],_):_.vsub(f[1],_),q?_.vadd(f[2],_):_.vsub(f[2],_),i.vadd(_,b),b.vsub(n,b),b.lengthSquared()<p*p){if(d)return!0;x=!0;let G=this.createContactEquation(a,c,t,e,l,u);G.ri.copy(b),G.ri.normalize(),G.ni.copy(G.ri),G.ri.scale(p,G.ri),G.rj.copy(_),G.ri.vadd(n,G.ri),G.ri.vsub(a.position,G.ri),G.rj.vadd(i,G.rj),G.rj.vsub(c.position,G.rj),this.result.push(G),this.createFrictionEquationsFromContact(G,this.frictionResult)}h.release(_),_=null;let M=h.get(),R=h.get(),F=h.get(),I=h.get(),C=h.get(),L=f.length;for(let D=0;D!==L&&!x;D++)for(let z=0;z!==L&&!x;z++)if(D%3!==z%3){f[z].cross(f[D],M),M.normalize(),f[D].vadd(f[z],R),F.copy(n),F.vsub(R,F),F.vsub(i,F);let q=F.dot(M);M.scale(q,I);let G=0;for(;G===D%3||G===z%3;)G++;C.copy(n),C.vsub(I,C),C.vsub(R,C),C.vsub(i,C);let Z=Math.abs(q),W=C.length();if(Z<f[G].length()&&W<p){if(d)return!0;x=!0;let et=this.createContactEquation(a,c,t,e,l,u);R.vadd(I,et.rj),et.rj.copy(et.rj),C.negate(et.ni),et.ni.normalize(),et.ri.copy(et.rj),et.ri.vadd(i,et.ri),et.ri.vsub(n,et.ri),et.ri.normalize(),et.ri.scale(p,et.ri),et.ri.vadd(n,et.ri),et.ri.vsub(a.position,et.ri),et.rj.vadd(i,et.rj),et.rj.vsub(c.position,et.rj),this.result.push(et),this.createFrictionEquationsFromContact(et,this.frictionResult)}}h.release(M,R,F,I,C)}planeBox(t,e,n,i,r,o,a,c,l,u,d){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,e.convexPolyhedronRepresentation.id=e.id,this.planeConvex(t,e.convexPolyhedronRepresentation,n,i,r,o,a,c,t,e,d)}convexConvex(t,e,n,i,r,o,a,c,l,u,d,h,f){let p=Sy;if(!(n.distanceTo(i)>t.boundingSphereRadius+e.boundingSphereRadius)&&t.findSeparatingAxis(e,n,r,i,o,p,h,f)){let x=[],g=My;t.clipAgainstHull(n,r,e,i,o,p,-100,100,x);let m=0;for(let v=0;v!==x.length;v++){if(d)return!0;let N=this.createContactEquation(a,c,t,e,l,u),S=N.ri,E=N.rj;p.negate(N.ni),x[v].normal.negate(g),g.scale(x[v].depth,g),x[v].point.vadd(g,S),E.copy(x[v].point),S.vsub(n,S),E.vsub(i,E),S.vadd(n,S),S.vsub(a.position,S),E.vadd(i,E),E.vsub(c.position,E),this.result.push(N),m++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(N,this.frictionResult)}this.enableFrictionReduction&&m&&this.createFrictionFromAverage(m)}}sphereConvex(t,e,n,i,r,o,a,c,l,u,d){let h=this.v3pool;n.vsub(i,ay);let f=e.faceNormals,p=e.faces,x=e.vertices,g=t.radius,m=!1;for(let v=0;v!==x.length;v++){let N=x[v],S=uy;o.vmult(N,S),i.vadd(S,S);let E=hy;if(S.vsub(n,E),E.lengthSquared()<g*g){if(d)return!0;m=!0;let w=this.createContactEquation(a,c,t,e,l,u);w.ri.copy(E),w.ri.normalize(),w.ni.copy(w.ri),w.ri.scale(g,w.ri),S.vsub(i,w.rj),w.ri.vadd(n,w.ri),w.ri.vsub(a.position,w.ri),w.rj.vadd(i,w.rj),w.rj.vsub(c.position,w.rj),this.result.push(w),this.createFrictionEquationsFromContact(w,this.frictionResult);return}}for(let v=0,N=p.length;v!==N&&m===!1;v++){let S=f[v],E=p[v],w=dy;o.vmult(S,w);let P=fy;o.vmult(x[E[0]],P),P.vadd(i,P);let _=py;w.scale(-g,_),n.vadd(_,_);let b=my;_.vsub(P,b);let M=b.dot(w),R=gy;if(n.vsub(P,R),M<0&&R.dot(w)>0){let F=[];for(let I=0,C=E.length;I!==C;I++){let L=h.get();o.vmult(x[E[I]],L),i.vadd(L,L),F.push(L)}if(jv(F,w,n)){if(d)return!0;m=!0;let I=this.createContactEquation(a,c,t,e,l,u);w.scale(-g,I.ri),w.negate(I.ni);let C=h.get();w.scale(-M,C);let L=h.get();w.scale(-g,L),n.vsub(i,I.rj),I.rj.vadd(L,I.rj),I.rj.vadd(C,I.rj),I.rj.vadd(i,I.rj),I.rj.vsub(c.position,I.rj),I.ri.vadd(n,I.ri),I.ri.vsub(a.position,I.ri),h.release(C),h.release(L),this.result.push(I),this.createFrictionEquationsFromContact(I,this.frictionResult);for(let D=0,z=F.length;D!==z;D++)h.release(F[D]);return}else for(let I=0;I!==E.length;I++){let C=h.get(),L=h.get();o.vmult(x[E[(I+1)%E.length]],C),o.vmult(x[E[(I+2)%E.length]],L),i.vadd(C,C),i.vadd(L,L);let D=cy;L.vsub(C,D);let z=ly;D.unit(z);let q=h.get(),G=h.get();n.vsub(C,G);let Z=G.dot(z);z.scale(Z,q),q.vadd(C,q);let W=h.get();if(q.vsub(n,W),Z>0&&Z*Z<D.lengthSquared()&&W.lengthSquared()<g*g){if(d)return!0;let et=this.createContactEquation(a,c,t,e,l,u);q.vsub(i,et.rj),q.vsub(n,et.ni),et.ni.normalize(),et.ni.scale(g,et.ri),et.rj.vadd(i,et.rj),et.rj.vsub(c.position,et.rj),et.ri.vadd(n,et.ri),et.ri.vsub(a.position,et.ri),this.result.push(et),this.createFrictionEquationsFromContact(et,this.frictionResult);for(let ut=0,Ft=F.length;ut!==Ft;ut++)h.release(F[ut]);h.release(C),h.release(L),h.release(q),h.release(W),h.release(G);return}h.release(C),h.release(L),h.release(q),h.release(W),h.release(G)}for(let I=0,C=F.length;I!==C;I++)h.release(F[I])}}}planeConvex(t,e,n,i,r,o,a,c,l,u,d){let h=xy,f=_y;f.set(0,0,1),r.vmult(f,f);let p=0,x=vy;for(let g=0;g!==e.vertices.length;g++)if(h.copy(e.vertices[g]),o.vmult(h,h),i.vadd(h,h),h.vsub(n,x),f.dot(x)<=0){if(d)return!0;let v=this.createContactEquation(a,c,t,e,l,u),N=yy;f.scale(f.dot(x),N),h.vsub(N,N),N.vsub(n,v.ri),v.ni.copy(f),h.vsub(i,v.rj),v.ri.vadd(n,v.ri),v.ri.vsub(a.position,v.ri),v.rj.vadd(i,v.rj),v.rj.vsub(c.position,v.rj),this.result.push(v),p++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(v,this.frictionResult)}this.enableFrictionReduction&&p&&this.createFrictionFromAverage(p)}boxConvex(t,e,n,i,r,o,a,c,l,u,d){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexConvex(t.convexPolyhedronRepresentation,e,n,i,r,o,a,c,t,e,d)}sphereHeightfield(t,e,n,i,r,o,a,c,l,u,d){let h=e.data,f=t.radius,p=e.elementSize,x=Fy,g=Ny;re.pointToLocalFrame(i,o,n,g);let m=Math.floor((g.x-f)/p)-1,v=Math.ceil((g.x+f)/p)+1,N=Math.floor((g.y-f)/p)-1,S=Math.ceil((g.y+f)/p)+1;if(v<0||S<0||m>h.length||N>h[0].length)return;m<0&&(m=0),v<0&&(v=0),N<0&&(N=0),S<0&&(S=0),m>=h.length&&(m=h.length-1),v>=h.length&&(v=h.length-1),S>=h[0].length&&(S=h[0].length-1),N>=h[0].length&&(N=h[0].length-1);let E=[];e.getRectMinMax(m,N,v,S,E);let w=E[0],P=E[1];if(g.z-f>P||g.z+f<w)return;let _=this.result;for(let b=m;b<v;b++)for(let M=N;M<S;M++){let R=_.length,F=!1;if(e.getConvexTrianglePillar(b,M,!1),re.pointToWorldFrame(i,o,e.pillarOffset,x),n.distanceTo(x)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(F=this.sphereConvex(t,e.pillarConvex,n,x,r,o,a,c,t,e,d)),d&&F||(e.getConvexTrianglePillar(b,M,!0),re.pointToWorldFrame(i,o,e.pillarOffset,x),n.distanceTo(x)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(F=this.sphereConvex(t,e.pillarConvex,n,x,r,o,a,c,t,e,d)),d&&F))return!0;if(_.length-R>2)return}}boxHeightfield(t,e,n,i,r,o,a,c,l,u,d){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexHeightfield(t.convexPolyhedronRepresentation,e,n,i,r,o,a,c,t,e,d)}convexHeightfield(t,e,n,i,r,o,a,c,l,u,d){let h=e.data,f=e.elementSize,p=t.boundingSphereRadius,x=Py,g=Ly,m=Iy;re.pointToLocalFrame(i,o,n,m);let v=Math.floor((m.x-p)/f)-1,N=Math.ceil((m.x+p)/f)+1,S=Math.floor((m.y-p)/f)-1,E=Math.ceil((m.y+p)/f)+1;if(N<0||E<0||v>h.length||S>h[0].length)return;v<0&&(v=0),N<0&&(N=0),S<0&&(S=0),E<0&&(E=0),v>=h.length&&(v=h.length-1),N>=h.length&&(N=h.length-1),E>=h[0].length&&(E=h[0].length-1),S>=h[0].length&&(S=h[0].length-1);let w=[];e.getRectMinMax(v,S,N,E,w);let P=w[0],_=w[1];if(!(m.z-p>_||m.z+p<P))for(let b=v;b<N;b++)for(let M=S;M<E;M++){let R=!1;if(e.getConvexTrianglePillar(b,M,!1),re.pointToWorldFrame(i,o,e.pillarOffset,x),n.distanceTo(x)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(R=this.convexConvex(t,e.pillarConvex,n,x,r,o,a,c,null,null,d,g,null)),d&&R||(e.getConvexTrianglePillar(b,M,!0),re.pointToWorldFrame(i,o,e.pillarOffset,x),n.distanceTo(x)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(R=this.convexConvex(t,e.pillarConvex,n,x,r,o,a,c,null,null,d,g,null)),d&&R))return!0}}sphereParticle(t,e,n,i,r,o,a,c,l,u,d){let h=Ty;if(h.set(0,0,1),i.vsub(n,h),h.lengthSquared()<=t.radius*t.radius){if(d)return!0;let p=this.createContactEquation(c,a,e,t,l,u);h.normalize(),p.rj.copy(h),p.rj.scale(t.radius,p.rj),p.ni.copy(h),p.ni.negate(p.ni),p.ri.set(0,0,0),this.result.push(p),this.createFrictionEquationsFromContact(p,this.frictionResult)}}planeParticle(t,e,n,i,r,o,a,c,l,u,d){let h=by;h.set(0,0,1),a.quaternion.vmult(h,h);let f=wy;if(i.vsub(a.position,f),h.dot(f)<=0){if(d)return!0;let x=this.createContactEquation(c,a,e,t,l,u);x.ni.copy(h),x.ni.negate(x.ni),x.ri.set(0,0,0);let g=Ey;h.scale(h.dot(i),g),i.vsub(g,g),x.rj.copy(g),this.result.push(x),this.createFrictionEquationsFromContact(x,this.frictionResult)}}boxParticle(t,e,n,i,r,o,a,c,l,u,d){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexParticle(t.convexPolyhedronRepresentation,e,n,i,r,o,a,c,t,e,d)}convexParticle(t,e,n,i,r,o,a,c,l,u,d){let h=-1,f=Cy,p=Ry,x=null,g=Ay;if(g.copy(i),g.vsub(n,g),r.conjugate(Kd),Kd.vmult(g,g),t.pointIsInside(g)){t.worldVerticesNeedsUpdate&&t.computeWorldVertices(n,r),t.worldFaceNormalsNeedsUpdate&&t.computeWorldFaceNormals(r);for(let m=0,v=t.faces.length;m!==v;m++){let N=[t.worldVertices[t.faces[m][0]]],S=t.worldFaceNormals[m];i.vsub(N[0],jd);let E=-S.dot(jd);if(x===null||Math.abs(E)<Math.abs(x)){if(d)return!0;x=E,h=m,f.copy(S)}}if(h!==-1){let m=this.createContactEquation(c,a,e,t,l,u);f.scale(x,p),p.vadd(i,p),p.vsub(n,p),m.rj.copy(p),f.negate(m.ni),m.ri.set(0,0,0);let v=m.ri,N=m.rj;v.vadd(i,v),v.vsub(c.position,v),N.vadd(n,N),N.vsub(a.position,N),this.result.push(m),this.createFrictionEquationsFromContact(m,this.frictionResult)}else console.warn("Point found inside convex, but did not find penetrating face!")}}heightfieldCylinder(t,e,n,i,r,o,a,c,l,u,d){return this.convexHeightfield(e,t,i,n,o,r,c,a,l,u,d)}particleCylinder(t,e,n,i,r,o,a,c,l,u,d){return this.convexParticle(e,t,i,n,o,r,c,a,l,u,d)}sphereTrimesh(t,e,n,i,r,o,a,c,l,u,d){let h=Ov,f=zv,p=Vv,x=kv,g=Hv,m=Gv,v=Yv,N=Uv,S=Dv,E=Zv;re.pointToLocalFrame(i,o,n,g);let w=t.radius;v.lowerBound.set(g.x-w,g.y-w,g.z-w),v.upperBound.set(g.x+w,g.y+w,g.z+w),e.getTrianglesInAABB(v,E);let P=Bv,_=t.radius*t.radius;for(let I=0;I<E.length;I++)for(let C=0;C<3;C++)if(e.getVertex(e.indices[E[I]*3+C],P),P.vsub(g,S),S.lengthSquared()<=_){if(N.copy(P),re.pointToWorldFrame(i,o,N,P),P.vsub(n,S),d)return!0;let L=this.createContactEquation(a,c,t,e,l,u);L.ni.copy(S),L.ni.normalize(),L.ri.copy(L.ni),L.ri.scale(t.radius,L.ri),L.ri.vadd(n,L.ri),L.ri.vsub(a.position,L.ri),L.rj.copy(P),L.rj.vsub(c.position,L.rj),this.result.push(L),this.createFrictionEquationsFromContact(L,this.frictionResult)}for(let I=0;I<E.length;I++)for(let C=0;C<3;C++){e.getVertex(e.indices[E[I]*3+C],h),e.getVertex(e.indices[E[I]*3+(C+1)%3],f),f.vsub(h,p),g.vsub(f,m);let L=m.dot(p);g.vsub(h,m);let D=m.dot(p);if(D>0&&L<0&&(g.vsub(h,m),x.copy(p),x.normalize(),D=m.dot(x),x.scale(D,m),m.vadd(h,m),m.distanceTo(g)<t.radius)){if(d)return!0;let q=this.createContactEquation(a,c,t,e,l,u);m.vsub(g,q.ni),q.ni.normalize(),q.ni.scale(t.radius,q.ri),q.ri.vadd(n,q.ri),q.ri.vsub(a.position,q.ri),re.pointToWorldFrame(i,o,m,m),m.vsub(c.position,q.rj),re.vectorToWorldFrame(o,q.ni,q.ni),re.vectorToWorldFrame(o,q.ri,q.ri),this.result.push(q),this.createFrictionEquationsFromContact(q,this.frictionResult)}}let b=Wv,M=qv,R=Xv,F=Fv;for(let I=0,C=E.length;I!==C;I++){e.getTriangleVertices(E[I],b,M,R),e.getNormal(E[I],F),g.vsub(b,m);let L=m.dot(F);if(F.scale(L,m),g.vsub(m,m),L=m.distanceTo(g),dn.pointInTriangle(m,b,M,R)&&L<t.radius){if(d)return!0;let D=this.createContactEquation(a,c,t,e,l,u);m.vsub(g,D.ni),D.ni.normalize(),D.ni.scale(t.radius,D.ri),D.ri.vadd(n,D.ri),D.ri.vsub(a.position,D.ri),re.pointToWorldFrame(i,o,m,m),m.vsub(c.position,D.rj),re.vectorToWorldFrame(o,D.ni,D.ni),re.vectorToWorldFrame(o,D.ri,D.ri),this.result.push(D),this.createFrictionEquationsFromContact(D,this.frictionResult)}}E.length=0}planeTrimesh(t,e,n,i,r,o,a,c,l,u,d){let h=new T,f=Pv;f.set(0,0,1),r.vmult(f,f);for(let p=0;p<e.vertices.length/3;p++){e.getVertex(p,h);let x=new T;x.copy(h),re.pointToWorldFrame(i,o,x,h);let g=Lv;if(h.vsub(n,g),f.dot(g)<=0){if(d)return!0;let v=this.createContactEquation(a,c,t,e,l,u);v.ni.copy(f);let N=Nv;f.scale(g.dot(f),N),h.vsub(N,N),v.ri.copy(N),v.ri.vsub(a.position,v.ri),v.rj.copy(h),v.rj.vsub(c.position,v.rj),this.result.push(v),this.createFrictionEquationsFromContact(v,this.frictionResult)}}}},Yi=new T,Ws=new T,qs=new T,Av=new T,Cv=new T,Rv=new ke,Iv=new ke,Pv=new T,Lv=new T,Nv=new T,Fv=new T,Dv=new T;new T;var Bv=new T,Uv=new T,Ov=new T,zv=new T,Vv=new T,kv=new T,Hv=new T,Gv=new T,Wv=new T,qv=new T,Xv=new T,Yv=new an,Zv=[],uc=new T,Jd=new T,$v=new T,Jv=new T,Kv=new T;function jv(s,t,e){let n=null,i=s.length;for(let r=0;r!==i;r++){let o=s[r],a=$v;s[(r+1)%i].vsub(o,a);let c=Jv;a.cross(t,c);let l=Kv;e.vsub(o,l);let u=c.dot(l);if(n===null||u>0&&n===!0||u<=0&&n===!1){n===null&&(n=u>0);continue}else return!1}return!0}var dc=new T,Qv=new T,ty=new T,ey=new T,ny=[new T,new T,new T,new T,new T,new T],iy=new T,sy=new T,ry=new T,oy=new T,ay=new T,cy=new T,ly=new T,hy=new T,uy=new T,dy=new T,fy=new T,py=new T,my=new T,gy=new T;new T;new T;var xy=new T,_y=new T,vy=new T,yy=new T,Sy=new T,My=new T,by=new T,wy=new T,Ey=new T,Ty=new T,Kd=new ke,Ay=new T;new T;var Cy=new T,jd=new T,Ry=new T,Iy=new T,Py=new T,Ly=[0],Ny=new T,Fy=new T,wc=class{constructor(){this.current=[],this.previous=[]}getKey(t,e){if(e<t){let n=e;e=t,t=n}return t<<16|e}set(t,e){let n=this.getKey(t,e),i=this.current,r=0;for(;n>i[r];)r++;if(n!==i[r]){for(let o=i.length-1;o>=r;o--)i[o+1]=i[o];i[r]=n}}tick(){let t=this.current;this.current=this.previous,this.previous=t,this.current.length=0}getDiff(t,e){let n=this.current,i=this.previous,r=n.length,o=i.length,a=0;for(let c=0;c<r;c++){let l=!1,u=n[c];for(;u>i[a];)a++;l=u===i[a],l||Qd(t,u)}a=0;for(let c=0;c<o;c++){let l=!1,u=i[c];for(;u>n[a];)a++;l=n[a]===u,l||Qd(e,u)}}};function Qd(s,t){s.push((t&4294901760)>>16,t&65535)}var oh=(s,t)=>s<t?`${s}-${t}`:`${t}-${s}`,xh=class{constructor(){this.data={keys:[]}}get(t,e){let n=oh(t,e);return this.data[n]}set(t,e,n){let i=oh(t,e);this.get(t,e)||this.data.keys.push(i),this.data[i]=n}delete(t,e){let n=oh(t,e),i=this.data.keys.indexOf(n);i!==-1&&this.data.keys.splice(i,1),delete this.data[n]}reset(){let t=this.data,e=t.keys;for(;e.length>0;){let n=e.pop();delete t[n]}}},Ec=class extends pc{constructor(t){t===void 0&&(t={}),super(),this.dt=-1,this.allowSleep=!!t.allowSleep,this.contacts=[],this.frictionEquations=[],this.quatNormalizeSkip=t.quatNormalizeSkip!==void 0?t.quatNormalizeSkip:0,this.quatNormalizeFast=t.quatNormalizeFast!==void 0?t.quatNormalizeFast:!1,this.time=0,this.stepnumber=0,this.default_dt=1/60,this.nextId=0,this.gravity=new T,t.gravity&&this.gravity.copy(t.gravity),t.frictionGravity&&(this.frictionGravity=new T,this.frictionGravity.copy(t.frictionGravity)),this.broadphase=t.broadphase!==void 0?t.broadphase:new lh,this.bodies=[],this.hasActiveBodies=!1,this.solver=t.solver!==void 0?t.solver:new fh,this.constraints=[],this.narrowphase=new gh(this),this.collisionMatrix=new fc,this.collisionMatrixPrevious=new fc,this.bodyOverlapKeeper=new wc,this.shapeOverlapKeeper=new wc,this.contactmaterials=[],this.contactMaterialTable=new xh,this.defaultMaterial=new Ji("default"),this.defaultContactMaterial=new Zs(this.defaultMaterial,this.defaultMaterial,{friction:.3,restitution:0}),this.doProfiling=!1,this.profile={solve:0,makeContactConstraints:0,broadphase:0,integrate:0,narrowphase:0},this.accumulator=0,this.subsystems=[],this.addBodyEvent={type:"addBody",body:null},this.removeBodyEvent={type:"removeBody",body:null},this.idToBodyMap={},this.broadphase.setWorld(this)}getContactMaterial(t,e){return this.contactMaterialTable.get(t.id,e.id)}collisionMatrixTick(){let t=this.collisionMatrixPrevious;this.collisionMatrixPrevious=this.collisionMatrix,this.collisionMatrix=t,this.collisionMatrix.reset(),this.bodyOverlapKeeper.tick(),this.shapeOverlapKeeper.tick()}addConstraint(t){this.constraints.push(t)}removeConstraint(t){let e=this.constraints.indexOf(t);e!==-1&&this.constraints.splice(e,1)}rayTest(t,e,n){n instanceof Ys?this.raycastClosest(t,e,{skipBackfaces:!0},n):this.raycastAll(t,e,{skipBackfaces:!0},n)}raycastAll(t,e,n,i){return n===void 0&&(n={}),n.mode=dn.ALL,n.from=t,n.to=e,n.callback=i,ah.intersectWorld(this,n)}raycastAny(t,e,n,i){return n===void 0&&(n={}),n.mode=dn.ANY,n.from=t,n.to=e,n.result=i,ah.intersectWorld(this,n)}raycastClosest(t,e,n,i){return n===void 0&&(n={}),n.mode=dn.CLOSEST,n.from=t,n.to=e,n.result=i,ah.intersectWorld(this,n)}addBody(t){this.bodies.includes(t)||(t.index=this.bodies.length,this.bodies.push(t),t.world=this,t.initPosition.copy(t.position),t.initVelocity.copy(t.velocity),t.timeLastSleepy=this.time,t instanceof Xt&&(t.initAngularVelocity.copy(t.angularVelocity),t.initQuaternion.copy(t.quaternion)),this.collisionMatrix.setNumObjects(this.bodies.length),this.addBodyEvent.body=t,this.idToBodyMap[t.id]=t,this.dispatchEvent(this.addBodyEvent))}removeBody(t){t.world=null;let e=this.bodies.length-1,n=this.bodies,i=n.indexOf(t);if(i!==-1){n.splice(i,1);for(let r=0;r!==n.length;r++)n[r].index=r;this.collisionMatrix.setNumObjects(e),this.removeBodyEvent.body=t,delete this.idToBodyMap[t.id],this.dispatchEvent(this.removeBodyEvent)}}getBodyById(t){return this.idToBodyMap[t]}getShapeById(t){let e=this.bodies;for(let n=0;n<e.length;n++){let i=e[n].shapes;for(let r=0;r<i.length;r++){let o=i[r];if(o.id===t)return o}}return null}addContactMaterial(t){this.contactmaterials.push(t),this.contactMaterialTable.set(t.materials[0].id,t.materials[1].id,t)}removeContactMaterial(t){let e=this.contactmaterials.indexOf(t);e!==-1&&(this.contactmaterials.splice(e,1),this.contactMaterialTable.delete(t.materials[0].id,t.materials[1].id))}fixedStep(t,e){t===void 0&&(t=1/60),e===void 0&&(e=10);let n=Le.now()/1e3;if(!this.lastCallTime)this.step(t,void 0,e);else{let i=n-this.lastCallTime;this.step(t,i,e)}this.lastCallTime=n}step(t,e,n){if(n===void 0&&(n=10),e===void 0)this.internalStep(t),this.time+=t;else{this.accumulator+=e;let i=Le.now(),r=0;for(;this.accumulator>=t&&r<n&&(this.internalStep(t),this.accumulator-=t,r++,!(Le.now()-i>t*1e3)););this.accumulator=this.accumulator%t;let o=this.accumulator/t;for(let a=0;a!==this.bodies.length;a++){let c=this.bodies[a];c.previousPosition.lerp(c.position,o,c.interpolatedPosition),c.previousQuaternion.slerp(c.quaternion,o,c.interpolatedQuaternion),c.previousQuaternion.normalize()}this.time+=e}}internalStep(t){this.dt=t;let e=this.contacts,n=zy,i=Vy,r=this.bodies.length,o=this.bodies,a=this.solver,c=this.gravity,l=this.doProfiling,u=this.profile,d=Xt.DYNAMIC,h=-1/0,f=this.constraints,p=Oy;c.length();let x=c.x,g=c.y,m=c.z,v=0;for(l&&(h=Le.now()),v=0;v!==r;v++){let I=o[v];if(I.type===d){let C=I.force,L=I.mass;C.x+=L*x,C.y+=L*g,C.z+=L*m}}for(let I=0,C=this.subsystems.length;I!==C;I++)this.subsystems[I].update();l&&(h=Le.now()),n.length=0,i.length=0,this.broadphase.collisionPairs(this,n,i),l&&(u.broadphase=Le.now()-h);let N=f.length;for(v=0;v!==N;v++){let I=f[v];if(!I.collideConnected)for(let C=n.length-1;C>=0;C-=1)(I.bodyA===n[C]&&I.bodyB===i[C]||I.bodyB===n[C]&&I.bodyA===i[C])&&(n.splice(C,1),i.splice(C,1))}this.collisionMatrixTick(),l&&(h=Le.now());let S=Uy,E=e.length;for(v=0;v!==E;v++)S.push(e[v]);e.length=0;let w=this.frictionEquations.length;for(v=0;v!==w;v++)p.push(this.frictionEquations[v]);for(this.frictionEquations.length=0,this.narrowphase.getContacts(n,i,this,e,S,this.frictionEquations,p),l&&(u.narrowphase=Le.now()-h),l&&(h=Le.now()),v=0;v<this.frictionEquations.length;v++)a.addEquation(this.frictionEquations[v]);let P=e.length;for(let I=0;I!==P;I++){let C=e[I],L=C.bi,D=C.bj,z=C.si,q=C.sj,G;if(L.material&&D.material?G=this.getContactMaterial(L.material,D.material)||this.defaultContactMaterial:G=this.defaultContactMaterial,G.friction,L.material&&D.material&&(L.material.friction>=0&&D.material.friction>=0&&L.material.friction*D.material.friction,L.material.restitution>=0&&D.material.restitution>=0&&(C.restitution=L.material.restitution*D.material.restitution)),a.addEquation(C),L.allowSleep&&L.type===Xt.DYNAMIC&&L.sleepState===Xt.SLEEPING&&D.sleepState===Xt.AWAKE&&D.type!==Xt.STATIC){let Z=D.velocity.lengthSquared()+D.angularVelocity.lengthSquared(),W=D.sleepSpeedLimit**2;Z>=W*2&&(L.wakeUpAfterNarrowphase=!0)}if(D.allowSleep&&D.type===Xt.DYNAMIC&&D.sleepState===Xt.SLEEPING&&L.sleepState===Xt.AWAKE&&L.type!==Xt.STATIC){let Z=L.velocity.lengthSquared()+L.angularVelocity.lengthSquared(),W=L.sleepSpeedLimit**2;Z>=W*2&&(D.wakeUpAfterNarrowphase=!0)}this.collisionMatrix.set(L,D,!0),this.collisionMatrixPrevious.get(L,D)||(Yr.body=D,Yr.contact=C,L.dispatchEvent(Yr),Yr.body=L,D.dispatchEvent(Yr)),this.bodyOverlapKeeper.set(L.id,D.id),this.shapeOverlapKeeper.set(z.id,q.id)}for(this.emitContactEvents(),l&&(u.makeContactConstraints=Le.now()-h,h=Le.now()),v=0;v!==r;v++){let I=o[v];I.wakeUpAfterNarrowphase&&(I.wakeUp(),I.wakeUpAfterNarrowphase=!1)}for(N=f.length,v=0;v!==N;v++){let I=f[v];I.update();for(let C=0,L=I.equations.length;C!==L;C++){let D=I.equations[C];a.addEquation(D)}}a.solve(t,this),l&&(u.solve=Le.now()-h),a.removeAllEquations();let _=Math.pow;for(v=0;v!==r;v++){let I=o[v];if(I.type&d){let C=_(1-I.linearDamping,t),L=I.velocity;L.scale(C,L);let D=I.angularVelocity;if(D){let z=_(1-I.angularDamping,t);D.scale(z,D)}}}this.dispatchEvent(By),l&&(h=Le.now());let M=this.stepnumber%(this.quatNormalizeSkip+1)===0,R=this.quatNormalizeFast;for(v=0;v!==r;v++)o[v].integrate(t,M,R);this.clearForces(),this.broadphase.dirty=!0,l&&(u.integrate=Le.now()-h),this.stepnumber+=1,this.dispatchEvent(Dy);let F=!0;if(this.allowSleep)for(F=!1,v=0;v!==r;v++){let I=o[v];I.sleepTick(this.time),I.sleepState!==Xt.SLEEPING&&(F=!0)}this.hasActiveBodies=F}emitContactEvents(){let t=this.hasAnyEventListener("beginContact"),e=this.hasAnyEventListener("endContact");if((t||e)&&this.bodyOverlapKeeper.getDiff(si,ri),t){for(let r=0,o=si.length;r<o;r+=2)Zr.bodyA=this.getBodyById(si[r]),Zr.bodyB=this.getBodyById(si[r+1]),this.dispatchEvent(Zr);Zr.bodyA=Zr.bodyB=null}if(e){for(let r=0,o=ri.length;r<o;r+=2)$r.bodyA=this.getBodyById(ri[r]),$r.bodyB=this.getBodyById(ri[r+1]),this.dispatchEvent($r);$r.bodyA=$r.bodyB=null}si.length=ri.length=0;let n=this.hasAnyEventListener("beginShapeContact"),i=this.hasAnyEventListener("endShapeContact");if((n||i)&&this.shapeOverlapKeeper.getDiff(si,ri),n){for(let r=0,o=si.length;r<o;r+=2){let a=this.getShapeById(si[r]),c=this.getShapeById(si[r+1]);oi.shapeA=a,oi.shapeB=c,a&&(oi.bodyA=a.body),c&&(oi.bodyB=c.body),this.dispatchEvent(oi)}oi.bodyA=oi.bodyB=oi.shapeA=oi.shapeB=null}if(i){for(let r=0,o=ri.length;r<o;r+=2){let a=this.getShapeById(ri[r]),c=this.getShapeById(ri[r+1]);ai.shapeA=a,ai.shapeB=c,a&&(ai.bodyA=a.body),c&&(ai.bodyB=c.body),this.dispatchEvent(ai)}ai.bodyA=ai.bodyB=ai.shapeA=ai.shapeB=null}}clearForces(){let t=this.bodies,e=t.length;for(let n=0;n!==e;n++){let i=t[n];i.force,i.torque,i.force.set(0,0,0),i.torque.set(0,0,0)}}};new an;var ah=new dn,Le=globalThis.performance||{};if(!Le.now){let s=Date.now();Le.timing&&Le.timing.navigationStart&&(s=Le.timing.navigationStart),Le.now=()=>Date.now()-s}new T;var Dy={type:"postStep"},By={type:"preStep"},Yr={type:Xt.COLLIDE_EVENT_NAME,body:null,contact:null},Uy=[],Oy=[],zy=[],Vy=[],si=[],ri=[],Zr={type:"beginContact",bodyA:null,bodyB:null},$r={type:"endContact",bodyA:null,bodyB:null},oi={type:"beginShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null},ai={type:"endShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null};var cf=new hn,Hy=1.2;function Gy(){let s=document.createElement("canvas");s.width=128,s.height=128;let t=s.getContext("2d");t.fillStyle="#4a1410",t.fillRect(0,0,128,128),t.strokeStyle="#1a0c0a",t.lineWidth=10;for(let n=-128;n<256;n+=16)t.beginPath(),t.moveTo(n,0),t.lineTo(n+128,128),t.stroke();t.strokeStyle="#c45c42",t.lineWidth=5;for(let n=-120;n<256;n+=16)t.beginPath(),t.moveTo(n+8,0),t.lineTo(n+136,128),t.stroke();t.strokeStyle="#f2e6d4",t.lineWidth=3;for(let n=0;n<128;n+=16)t.beginPath(),t.moveTo(0,n),t.lineTo(128,n),t.stroke();let e=new nn(s);return e.colorSpace=_e,e.wrapS=e.wrapT=Ln,e}var Wy=Gy();function Kr(s,t={}){return new be({color:s,roughness:t.roughness??.78,metalness:t.metalness??.02,map:t.map||null,emissive:t.emissive!=null?t.emissive:s,emissiveIntensity:t.emissiveIntensity??.06})}function lf(s){let t=new Ec({gravity:new T(0,-14,0)});t.broadphase=new gc(t),t.allowSleep=!0,t.solver.iterations=8;let e=new Ji("ground"),n=new Ji("rag");t.addContactMaterial(new Zs(e,n,{friction:.45,restitution:.02}));let i=new Xt({mass:0,material:e});i.addShape(new bc),i.quaternion.setFromEuler(-Math.PI/2,0,0),t.addBody(i);let r=[],o=Hy,a=Kr(10840904,{roughness:.72,emissive:3809300}),c=Kr(2896424,{roughness:.88,emissive:1185040}),l=Kr(1447956,{roughness:.9,emissive:526599}),u=Kr(789772,{roughness:.86,emissive:328965}),d=Kr(16777215,{map:Wy,roughness:.9,emissive:3807248,emissiveIntensity:.08}),h=new Un({color:658442,side:Re,depthWrite:!1});function f(P,_=1.08){let b=new $t(P.geometry,h);b.scale.setScalar(_),b.castShadow=!1,P.add(b)}function p(P,_,b,M,R,F,I,C){b.castShadow=!0,b.position.set(F,I,C),s.add(b);let L=new Xt({mass:R,material:n,linearDamping:.12,angularDamping:.18,position:new T(F,I,C)});L.addShape(M),t.addBody(L);let D={name:_,mesh:b,body:L};return P.parts.push(D),D}function x(P,_,b,M,R,F){let I=new yc(P.body,_.body,{pivotA:new T(b[0],b[1],b[2]),pivotB:new T(M[0],M[1],M[2]),axisA:new T(0,1,0),axisB:new T(0,1,0),angle:R??.6,twistAngle:F??.3,collideConnected:!1});return t.addConstraint(I),I}function g(P,_,b,M){let R=new Jr(P.body,new T(b[0],b[1],b[2]),_.body,new T(M[0],M[1],M[2]),80);return t.addConstraint(R),R}function m(P,_,b){let M={parts:[],constraints:[],statics:[],age:0,frozen:!1},R=P.x,F=P.y,I=P.z,C=Math.max(0,F),L=p(M,"pelvis",new $t(new Ce(.28*o,.2*o,.18*o),l),new Ii(new T(.14*o,.1*o,.09*o)),8,R,C+.92*o,I);f(L.mesh);let D=p(M,"torso",new $t(new Ce(.36*o,.44*o,.2*o),u),new Ii(new T(.18*o,.22*o,.1*o)),12,R,C+1.28*o,I);f(D.mesh);let z=p(M,"head",new $t(new ei(.13*o,10,8),a),new Mc(.13*o),4,R,C+1.66*o,I);f(z.mesh,1.1);let q=new $t(new ei(.145*o,8,6),d);q.scale.set(1.05,.72,1.05),z.mesh.add(q),f(q,1.06);let G=[["uarmL",-.28*o,1.38*o,.09*o,.28*o,.09*o,2.2],["uarmR",.28*o,1.38*o,.09*o,.28*o,.09*o,2.2],["larmL",-.28*o,1.06*o,.08*o,.26*o,.08*o,1.6],["larmR",.28*o,1.06*o,.08*o,.26*o,.08*o,1.6],["ulegL",-.1*o,.66*o,.12*o,.4*o,.12*o,5],["ulegR",.1*o,.66*o,.12*o,.4*o,.12*o,5],["llegL",-.1*o,.26*o,.1*o,.38*o,.1*o,3.5],["llegR",.1*o,.26*o,.1*o,.38*o,.1*o,3.5]],Z={pelvis:L,torso:D,head:z};for(let Bt=0;Bt<G.length;Bt++){let K=G[Bt],ot=K[3]/2,vt=K[4]/2,Dt=K[5]/2;Z[K[0]]=p(M,K[0],new $t(new Ce(K[3],K[4],K[5]),c),new Ii(new T(ot,vt,Dt)),K[6],R+K[1],C+K[2],I),f(Z[K[0]].mesh,1.1)}if(_){let Bt=new ke;Bt.setFromEuler(0,_,0);for(let K=0;K<M.parts.length;K++){let ot=M.parts[K],vt=ot.body.position.x-R,Dt=ot.body.position.z-I,xt=vt*Math.cos(_)-Dt*Math.sin(_),zt=vt*Math.sin(_)+Dt*Math.cos(_);ot.body.position.x=R+xt,ot.body.position.z=I+zt,ot.body.quaternion.copy(Bt)}}M.constraints.push(x(L,D,[0,.1*o,0],[0,-.22*o,0],.35,.2)),M.constraints.push(x(D,z,[0,.22*o,0],[0,-.14*o,0],.7,.4)),M.constraints.push(x(D,Z.uarmL,[-.2*o,.16*o,0],[0,.14*o,0],1.2,.6)),M.constraints.push(x(D,Z.uarmR,[.2*o,.16*o,0],[0,.14*o,0],1.2,.6)),M.constraints.push(g(Z.uarmL,Z.larmL,[0,-.14*o,0],[0,.13*o,0])),M.constraints.push(g(Z.uarmR,Z.larmR,[0,-.14*o,0],[0,.13*o,0])),M.constraints.push(x(L,Z.ulegL,[-.09*o,-.1*o,0],[0,.2*o,0],.8,.3)),M.constraints.push(x(L,Z.ulegR,[.09*o,-.1*o,0],[0,.2*o,0],.8,.3)),M.constraints.push(g(Z.ulegL,Z.llegL,[0,-.2*o,0],[0,.19*o,0])),M.constraints.push(g(Z.ulegR,Z.llegR,[0,-.2*o,0],[0,.19*o,0]));let W=b?b.x:0,et=b?b.y:.4,ut=b?b.z:-1,Ft=Math.hypot(W,et,ut)||1,At=7.5;return D.body.velocity.set(W/Ft*At,et/Ft*At*.35+.6,ut/Ft*At),z.body.velocity.set(W/Ft*At*1.15,1.1,ut/Ft*At*1.15),L.body.velocity.set(W/Ft*At*.65,.3,ut/Ft*At*.65),r.push(M),M}function v(P){P.traverse(_=>{_.geometry&&_.geometry.dispose()}),s.remove(P)}function N(P){for(let b=0;b<P.constraints.length;b++)t.removeConstraint(P.constraints[b]);for(let b=0;b<P.parts.length;b++)t.removeBody(P.parts[b].body),v(P.parts[b].mesh);for(let b=0;b<P.statics.length;b++)t.removeBody(P.statics[b]);let _=r.indexOf(P);_>=0&&r.splice(_,1)}function S(P,_,b){if(!_)return;let M=0;for(let R=0;R<_.length&&M<5;R++){let F=_[R];if(!F.geometry||F.geometry.type!=="BoxGeometry")continue;let I=F.position;if(Math.abs(I.x-b.x)>4||Math.abs(I.z-b.z)>4||I.y>4)continue;let C=new Xt({mass:0,material:e});C.addShape(new Ii(new T(Math.abs(F.scale.x)*.5,Math.abs(F.scale.y)*.5,Math.abs(F.scale.z)*.5))),C.position.set(I.x,I.y,I.z),t.addBody(C),P.statics.push(C),M+=1}}function E(P,_){let b=Math.min(.05,P||.016);t.step(1/60,b,3);for(let M=r.length-1;M>=0;M--){let R=r[M];R.age+=b;let F=!0;for(let I=0;I<R.parts.length;I++){let C=R.parts[I],L=C.body;C.mesh.position.set(L.position.x,L.position.y,L.position.z),cf.set(L.quaternion.x,L.quaternion.y,L.quaternion.z,L.quaternion.w),C.mesh.quaternion.copy(cf),L.position.z<_+2&&(F=!1)}(R.age>8||F)&&N(R)}}function w(){for(;r.length;)N(r[0])}return{spawn:m,update:E,addNearbyStatics:S,dolls:r,clear:w}}var qy=typeof location<"u"&&/[?&]calm=1/.test(location.search),Xy=55,Yy=100,Zy=100,Ki=new V,$s=new V,Js=new V,$y=1.2;function Jy(){let s=document.createElement("canvas");s.width=128,s.height=128;let t=s.getContext("2d");t.fillStyle="#4a1410",t.fillRect(0,0,128,128),t.strokeStyle="#1a0c0a",t.lineWidth=10;for(let n=-128;n<256;n+=16)t.beginPath(),t.moveTo(n,0),t.lineTo(n+128,128),t.stroke();t.strokeStyle="#c45c42",t.lineWidth=5;for(let n=-120;n<256;n+=16)t.beginPath(),t.moveTo(n+8,0),t.lineTo(n+136,128),t.stroke();t.strokeStyle="#f2e6d4",t.lineWidth=3;for(let n=0;n<128;n+=16)t.beginPath(),t.moveTo(0,n),t.lineTo(128,n),t.stroke();let e=new nn(s);return e.colorSpace=_e,e.wrapS=e.wrapT=Ln,e}function ji(s,t={}){return new be({color:s,roughness:t.roughness??.82,metalness:t.metalness??.02,map:t.map||null,emissive:t.emissive!=null?t.emissive:s,emissiveIntensity:t.emissiveIntensity??.06})}function hf(s,t,e){let n=document.createElement("canvas");n.width=n.height=64;let i=n.getContext("2d"),r=i.createRadialGradient(32,32,2,32,32,30);r.addColorStop(0,`rgba(${s},${t},${e},0.95)`),r.addColorStop(1,`rgba(${s},${t},${e},0)`),i.fillStyle=r,i.fillRect(0,0,64,64);let o=new nn(n);return o.colorSpace=_e,o}var Ky=5,jy=5,uf=5.6,Qy=45,tS=20,eS=6,nS=55,iS=1,sS=.8,rS=300;function Sh(){let s=window.SS&&window.SS.distance?window.SS.distance:0;return Math.max(0,Math.min(1,s/500))}function df(s,t,e,n,i){let r=new qe;s.add(r);let o=lf(s),a=$y,c=Jy(),l=ji(10840904,{roughness:.72,emissive:3809300}),u=ji(2896424,{roughness:.88,emissive:1185040}),d=ji(1447956,{roughness:.9,emissive:526599}),h=ji(789772,{roughness:.86,emissive:328965}),f=ji(16777215,{map:c,roughness:.92,emissive:3807248,emissiveIntensity:.08}),p=ji(658186,{roughness:.5,metalness:.35,emissive:328965}),x=ji(2759698,{roughness:.78,emissive:1182728}),g=new Un({color:0,side:Re,depthWrite:!1}),m=(()=>{let B=document.createElement("canvas");B.width=B.height=32;let Y=B.getContext("2d");Y.fillStyle="#ff3b2f",Y.beginPath(),Y.moveTo(4,8),Y.lineTo(28,8),Y.lineTo(16,26),Y.closePath(),Y.fill();let rt=new nn(B);return new vn({map:rt,depthTest:!1,transparent:!0})})(),v=(B,Y)=>new Mr(B,Y,3,6),N=v(.17*a,.42*a),S=new ei(.125*a,10,8),E=v(.055*a,.28*a),w=v(.07*a,.38*a),P=new ei(.14*a,8,6);function _(B,Y=1.07){let rt=new $t(B.geometry,g);return rt.scale.setScalar(Y),rt.castShadow=!1,rt.receiveShadow=!1,B.add(rt),rt}let b=new vn({map:hf(160,16,12),transparent:!0,depthWrite:!1}),M=[],R=[],F=[],I=[],C=new Oe;C.setAttribute("position",new $e(new Float32Array(6),3));for(let B=0;B<8;B++){let Y=new Bn(new vn({map:hf(255,190,90),transparent:!0,depthWrite:!1,blending:Hi}));Y.visible=!1,Y.scale.setScalar(.35),s.add(Y),M.push({sprite:Y,life:0})}for(let B=0;B<10;B++){let Y=new vr(C.clone(),new Rs({color:16762218,transparent:!0,opacity:.9}));Y.visible=!1,Y.frustumCulled=!1,s.add(Y),R.push({line:Y,life:0})}for(let B=0;B<36;B++){let Y=new Bn(b.clone());Y.visible=!1,s.add(Y),F.push({sprite:Y,life:0,vel:new V})}let L=[],D={list:L,update:pt},z="quiet",q=2.5,G=1,Z=4,W=1.2,et=0,ut=0,Ft=0,At=0,Bt=!1,K=new ki,ot=new V,vt=new V,Dt=0,xt=0,zt=0,ye=0,Gt=0;function Kt(B,Y,rt){B.userData.enemy=Y,B.userData.part=rt,n.targets.push(B)}function ne(B){let Y=n.targets;for(let rt=Y.length-1;rt>=0;rt--)Y[rt].userData&&Y[rt].userData.enemy===B&&Y.splice(rt,1)}function Yt(B,Y){let rt=new qe,O=new Bn(m);O.scale.set(.35,.35,1),O.position.y=2.25*a,O.renderOrder=5,rt.add(O);let nt={marker:O,behavior:B,group:rt,anchor:Y,health:Zy,alive:!0,exposed:B!=="popper",hideT:.4+Math.random()*1.2,showT:0,moveT:0,shootCd:.4+Math.random()*.8,goal:null,home:Y.pos.clone(),flankFrom:Y.pos.clone(),flankTo:Y.pos.clone()},Q=new $t(N,h);Q.position.y=1.15*a,Q.castShadow=!0,rt.add(Q),_(Q,1.12);let lt=new $t(S,l);lt.position.y=1.68*a,lt.castShadow=!0,rt.add(lt),_(lt,1.14);let ht=new $t(P,f);ht.scale.set(1.08,.78,1.12),ht.position.y=1.64*a,rt.add(ht),_(ht,1.06);function at(Mt,oe,An,ts,Qs){let Yn=new $t(Mt,Qs||d);return Yn.position.set(oe*a,An*a,ts*a),Yn.castShadow=!0,rt.add(Yn),_(Yn,1.1),Yn}at(E,-.24,1.2,.02,u),at(E,.24,1.15,.12,u),at(w,-.09,.55,0,d),at(w,.09,.55,0,d);let Ct=new qe,bt=new $t(new Ce(.05*a,.08*a,.22*a),x);bt.position.set(.18*a,1.2*a,.12*a);let Qt=new $t(new Ce(.045*a,.07*a,.36*a),p);Qt.position.set(.18*a,1.24*a,-.08*a);let Rt=new $t(new Ce(.02*a,.02*a,.42*a),p);return Rt.position.set(.18*a,1.27*a,-.4*a),Ct.add(bt,Qt,Rt),rt.add(Ct),nt.muzzleLocal=new V(.18*a,1.27*a,-.62*a),Kt(lt,nt,"head"),Kt(Q,nt,"body"),nt.parts={head:lt,torso:Q},nt.home=he(Y),nt.flankFrom=nt.home.clone(),nt.flankTo=nt.home.clone(),rt.position.copy(nt.home),r.add(rt),nt.takeHit=(Mt,oe)=>Fe(nt,Mt,oe),L.push(nt),nt.behavior==="popper"&&rt.position.copy(we(nt)),nt}function he(B){let Y=B.type==="window"||B.type==="roof",rt=B.type==="roof"?B.pos.y-.15:Y?Math.max(0,B.pos.y-1.2):0,O=Math.sign(B.pos.x)||1,nt=B.pos.x-O*.3;return rt===0&&(nt=O*Math.min(Math.abs(nt),uf)),new V(nt,rt,B.pos.z)}function we(B){let Y=B.home,rt=Math.sign(Y.x)||1,O=B.anchor.type==="roof"?.9:.15;return new V(Y.x+rt*.9,Math.max(0,Y.y-O),Y.z)}function Ne(B){Ki.set(t.position.x,B.group.position.y,t.position.z),B.group.lookAt(Ki)}function ue(B){let Y=0;for(let rt=0;rt<F.length&&Y<8;rt++){let O=F[rt];O.life>0||(O.life=.35+Math.random()*.25,O.sprite.visible=!0,O.sprite.position.copy(B),O.sprite.material.opacity=.9,O.sprite.scale.setScalar(.12+Math.random()*.12),O.vel.set((Math.random()-.5)*2.4,1.2+Math.random()*2.2,(Math.random()-.5)*2.4),Y+=1)}}function Me(B){let Y=null;for(let rt=0;rt<I.length;rt++)if(!I[rt].visible){Y=I[rt];break}Y||(Y=new $t(new br(.55,10),new Un({color:4851720,transparent:!0,opacity:.82,depthWrite:!1})),Y.rotation.x=-Math.PI/2,s.add(Y),I.push(Y)),Y.visible=!0,Y.position.set(B.x,.04,B.z),Y.scale.setScalar(.7+Math.random()*.5)}function H(B,Y,rt){if(!B.alive)return;B.alive=!1,ne(B);let O=B.group.position;ue(Y||O.clone().setY(O.y+1.3)),Me(O);let nt=B.group.rotation.y,Q=o.spawn(O,nt,Js.copy(O).sub(t.position).normalize());o.addNearbyStatics(Q,e.colliders,O),B.group.visible=!1,r.remove(B.group),window.SS&&window.SS.scoreSys&&window.SS.scoreSys.addKill(rt==="head")}function Fe(B,Y,rt){if(!B.alive)return;let O=Y==="head"?Yy:Xy;B.health-=O,rt&&ue(rt),B.health<=0&&H(B,rt,Y)}n.onHit=function(Y){if(!Y||!Y.enemy||!Y.enemy.takeHit)return;let rt=Y.point;Y.enemy.takeHit(Y.part,rt),window.SS&&window.SS.hud&&window.SS.hud.hitMarker&&window.SS.hud.hitMarker()};function ee(B){let Y=M[0];for(let rt=0;rt<M.length;rt++)if(M[rt].life<=0){Y=M[rt];break}Y.life=.05,Y.sprite.visible=!0,Y.sprite.position.copy(B)}function U(B,Y){let rt=R[0];for(let nt=0;nt<R.length;nt++)if(R[nt].life<=0){rt=R[nt];break}rt.life=.07;let O=rt.line.geometry.attributes.position;O.setXYZ(0,B.x,B.y,B.z),O.setXYZ(1,Y.x,Y.y,Y.z),O.needsUpdate=!0,rt.line.geometry.computeBoundingSphere(),rt.line.visible=!0,rt.line.material.opacity=.9}function y(B){let Y=Sh();B.group.updateMatrixWorld(),$s.copy(B.muzzleLocal).applyMatrix4(B.group.matrixWorld);let O=(.42-$s.distanceTo(t.position)*.006)*(.55+.7*Y);B.engaged=!0,window.SS&&window.SS.input&&window.SS.input.cover&&(O*=.3),O*=1+iS*Gt,O=Math.max(.02,Math.min(.85,O));let nt=Math.random()<O&&i&&i.alive;if(Js.copy(t.position),nt||(Js.x+=(Math.random()-.5)*2.4,Js.y+=(Math.random()-.5)*1.2,Js.z+=(Math.random()-.5)*2.4),ee($s),U($s,Js),window.SS&&window.SS.audio&&window.SS.audio.enemyShot($s),B.rounds=(B.rounds||0)+1,B.rounds>=6&&(B.rounds=0),nt){let Q=Math.max(18,Math.min(22,20+(Y-.5)*4));i.damage(window.SS&&window.SS.input&&window.SS.input.cover?Q*.6:Q,$s)}}function X(B){let Y=window.SS&&window.SS.hud;Y&&typeof Y.callout=="function"&&Y.callout(B)}function j(B){let Y=[],rt=e.segments||[],O=t.position.z;for(let nt=0;nt<rt.length;nt++){let Q=rt[nt].coverPoints||[];for(let lt=0;lt<Q.length;lt++){let ht=Q[lt],at=O-ht.pos.z;at<20||at>55||B&&B.indexOf(ht.type)<0||Y.push(ht)}}return Y}function it(B){for(let Y=0;Y<L.length;Y++){if(!L[Y].alive)continue;let rt=L[Y].home;if((rt.x-B.x)**2+(rt.z-B.z)**2<2.2)return!0}return!1}function dt(B){let Y=Sh(),rt=B||(Math.random()<.45?"popper":Math.random()<.55?"shifter":"flanker"),O;rt==="popper"?O=["window","roof","wall","barrel","car"]:rt==="flanker"?O=["alley","door"]:O=["wall","barrel","car","door","alley"];let nt=j(O);if(nt.length||(nt=j(null)),!nt.length)return null;let Q=nt[Math.random()*nt.length|0];for(let ht=0;ht<6;ht++){let at=nt[Math.random()*nt.length|0];if(!it(at.pos)){Q=at;break}}if(it(Q.pos))return null;let lt=Yt(rt,Q);if(rt==="flanker"){let ht=Math.sign(Q.pos.x)||(Math.random()<.5?-1:1);lt.flankFrom.copy(lt.home),lt.flankFrom.x=Math.sign(lt.flankFrom.x)*Math.min(Math.abs(lt.flankFrom.x),6.9),lt.flankTo.set(ht*(1.6+Math.random()*1.2),0,lt.home.z+(Math.random()-.5)*2),lt.group.position.copy(lt.flankFrom),lt.exposed=!1}return rt==="shifter"&&(lt.goal=lt.home.clone(),lt.moveT=.2),lt.shootCd=.6+Math.random()*(1.4-Y),lt}function ft(B,Y){let rt=j(["wall","barrel","car","door"]),O=null,nt=1e9;for(let lt=0;lt<rt.length;lt++){let ht=rt[lt].pos;if(Y&&(ht.x-Y.x)**2+(ht.z-Y.z)**2<1)continue;let at=ht.distanceToSquared(B);at>.8&&at<64&&at<nt&&(nt=at,O=ht)}if(!O)return null;let Q=Math.sign(O.x)||1;return new V(Q*Math.min(Math.abs(O.x-Q*.3),uf),0,O.z)}function st(B,Y,rt){if(!B.alive)return;let O=1-.45*rt;if(B.behavior==="popper")if(B.exposed)B.showT-=Y,Ne(B),B.group.position.lerp(B.home,1-Math.exp(-10*Y)),B.showT<=0?(B.exposed=!1,B.hideT=(1+Math.random()*3)*O):i.alive&&window.SS.running&&(B.shootCd-=Y,B.shootCd<=0&&(y(B),B.shootCd=(.7+Math.random()*.8)*(1.15-.4*rt)));else{B.hideT-=Y;let nt=we(B);B.group.position.lerp(nt,1-Math.exp(-8*Y)),B.hideT<=0&&(B.exposed=!0,B.showT=.55+Math.random()*.7,B.shootCd=.12+Math.random()*.25)}else if(B.behavior==="shifter"){B.goal||(B.goal=B.home.clone());let nt=B.group.position.distanceTo(B.goal)>.35&&B.moveT<=0;if(B.moveT>0){if(B.moveT-=Y,B.exposed=!0,Ne(B),i.alive&&window.SS.running&&(B.shootCd-=Y,B.shootCd<=0&&(y(B),B.shootCd=.55+Math.random()*.5)),B.moveT<=0){let Q=ft(B.group.position,B.goal);B.goal=Q||B.home.clone()}}else if(nt){B.moveCalled||(B.moveCalled=!0,X("Moving!")),B.exposed=!0;let Q=3.4*Y*(1+.35*rt),lt=Ki.copy(B.goal).sub(B.group.position);lt.y=0;let ht=lt.length();ht>.05&&(lt.multiplyScalar(Q/ht),B.group.position.add(lt),B.group.lookAt(B.goal.x,B.group.position.y,B.goal.z))}else B.moveCalled=!1,B.moveT=.7+Math.random()*.8,B.shootCd=.15}else{let nt=(B.exposed,B.flankTo);if(B.group.position.distanceTo(B.flankTo)>.4){B.flankCalled||(B.flankCalled=!0,X(B.flankTo.x>=0?"Flanking right!":"Flanking left!")),B.exposed=!1;let lt=3.8*Y*(1+.3*rt);Ki.copy(B.flankTo).sub(B.group.position),Ki.y=0;let ht=Ki.length()||1;B.group.position.addScaledVector(Ki,lt/ht),B.group.lookAt(B.flankTo.x,B.group.position.y,B.flankTo.z)}else B.exposed=!0,B.group.position.y+=(0-B.group.position.y)*(1-Math.exp(-6*Y)),Ne(B),i.alive&&window.SS.running&&(B.shootCd-=Y,B.shootCd<=0&&(y(B),B.shootCd=(.65+Math.random()*.7)*(1.1-.35*rt)))}}function ct(){let B=0;for(let Y=0;Y<L.length;Y++)L[Y].alive&&(B+=1);return B}function pt(B){let Y=Sh();q-=B;let rt=ct();z==="quiet"?q<=0&&(z="burst",window.SS&&(window.SS.bursting=!0),X("Contact!"),window.SS&&window.SS.hud&&window.SS.hud.banner&&window.SS.hud.banner("CONTACT"),Z=3+Math.min(3,Y*3+Math.random()*2|0),q=8+Math.random()*6,W=.25):(q<=0||rt===0&&q<6)&&(z="quiet",window.SS&&(window.SS.bursting=!1),G=Math.random()<.4?0:Math.random()<.5?1:2,q=7+Math.random()*6-Y*2,W=.8);let O=z==="quiet"?G:Z;W-=B,window.SS&&window.SS.running&&!qy&&rt<O&&W<=0&&(W=dt()?z==="burst"?.45+(1-Y)*.55:2.2:.6);let nt=!!(window.SS&&window.SS.running);nt&&(ye+=B);let Q=window.SS?window.SS.distance:0;if(nt&&Q>ut+.05?(ut=Q,Ft=0,Dt=0,xt=Math.max(0,xt-2*B)):nt&&(xt+=B,Dt+=B,Ft+=B),Gt=Math.min(1,xt/nS+Math.min(.3,ye/rS)),zt>0&&(zt-=B),Dt>tS){for(let Rt=L.length-1;Rt>=0;Rt--){let Mt=L[Rt];Mt.alive&&(!Mt.exposed||Mt.group.position.y>.5?(Lt(Mt),L.splice(Rt,1)):Mt.behavior!=="flanker"&&(Mt.behavior="flanker",Mt.flankTo.set((Math.sign(Mt.group.position.x)||1)*2,0,Mt.group.position.z)))}Dt=0,zt=eS,X("Fall back!")}let lt=performance.now()/1e3,ht=Math.min(1,lt-(et||lt));if(et=lt,nt&&!(Q>ut-.05&&Ft===0)&&(Ft+=ht-B),At-=ht,At<=0){let Rt=.25-At;At=.25,Bt=!1;for(let Mt=L.length-1;Mt>=0;Mt--){let oe=L[Mt];if(!oe.alive)continue;oe.group.getWorldPosition(ot),ot.y+=1.3,vt.copy(ot).sub(t.position);let An=vt.length();vt.divideScalar(An),K.set(t.position,vt),K.far=An-.6,oe.seen=oe.exposed&&K.intersectObjects(e.colliders,!1).length===0,oe.unseenT=oe.seen?0:(oe.unseenT||0)+Rt,oe.seen&&An<Qy&&(Bt=!0,oe.engaged=!0),oe.unseenT>Ky&&(Lt(oe),L.splice(Mt,1))}}Ft>jy&&!Bt&&zt<=0&&(zt=3,Ft=0);let at=1+sS*Gt,Ct=t.position.z,bt=!1,Qt=0;for(let Rt=L.length-1;Rt>=0;Rt--){let Mt=L[Rt];if(!Mt.alive){L.splice(Rt,1);continue}if(Mt.group.position.z>Ct+6){Mt.alive=!1,ne(Mt),r.remove(Mt.group),L.splice(Rt,1);continue}st(Mt,B*at,Y),Mt.marker&&(Mt.marker.visible=!(window.SS&&window.SS.input&&window.SS.input.scope)&&Math.abs(Mt.group.position.z-Ct)>12);let oe=Mt.group.position.x-t.position.x,An=Mt.group.position.y-t.position.y,ts=Mt.group.position.z-t.position.z,Qs=Math.sqrt(oe*oe+An*An+ts*ts);Mt.engaged&&(bt=!0,Qt+=1)}nt&&(window.SS.walking=!bt||zt>0&&!Bt),window.SS&&(window.SS.engaged=Qt,window.SS.hud&&window.SS.hud.setRemaining&&window.SS.hud.setRemaining(nt&&bt?Qt:0)),window.SS&&(window.SS.pressure={pressure:Gt,standT:xt,stallT:Dt,graceT:zt});for(let Rt=0;Rt<M.length;Rt++){let Mt=M[Rt];Mt.life<=0||(Mt.life-=B,Mt.life<=0&&(Mt.sprite.visible=!1))}for(let Rt=0;Rt<R.length;Rt++){let Mt=R[Rt];Mt.life<=0||(Mt.life-=B,Mt.line.material.opacity=Math.max(0,Mt.life/.07),Mt.life<=0&&(Mt.line.visible=!1))}for(let Rt=0;Rt<F.length;Rt++){let Mt=F[Rt];Mt.life<=0||(Mt.life-=B,Mt.vel.y-=9*B,Mt.sprite.position.addScaledVector(Mt.vel,B),Mt.sprite.position.y<.05&&(Mt.sprite.position.y=.05,Mt.vel.y*=-.2,Mt.vel.x*=.6,Mt.vel.z*=.6),Mt.sprite.material.opacity=Math.max(0,Mt.life*2),Mt.life<=0&&(Mt.sprite.visible=!1))}if(I.length>12){let Rt=I.shift();s.remove(Rt),Rt.geometry.dispose()}o.update(B,Ct)}function Lt(B){B.alive&&ne(B),B.alive=!1,B.group.visible=!1,r.remove(B.group)}function gt(){for(let B=L.length-1;B>=0;B--)Lt(L[B]);L.length=0,o.clear&&o.clear();for(let B=0;B<I.length;B++)I[B].visible=!1;for(let B=0;B<F.length;B++)F[B].life=0,F[B].sprite.visible=!1;z="quiet",q=2.5,G=1,Z=4,W=1.2,Dt=xt=zt=ye=Gt=0,ut=0,Ft=0,Bt=!1,window.SS&&(window.SS.bursting=!1)}function mt(){for(let B=L.length-1;B>=0;B--)L[B].alive&&H(L[B],null,"body")}return D.update=pt,D.reset=gt,D.spawnEnemy=function(Y){return dt(Y||void 0)},D.killAll=mt,D}var ff="ss-highscores";function Tc(){try{let s=localStorage.getItem(ff),t=s?JSON.parse(s):[];return Array.isArray(t)?t:[]}catch{return[]}}function oS(s){try{localStorage.setItem(ff,JSON.stringify(s.slice(0,5)))}catch{}}function pf(s,t){let e={distance:0,kills:0,headshots:0,shotsFired:0,shotsHit:0,accuracy:0,score:0,ended:!1};function n(){return e.shotsFired?e.shotsHit/e.shotsFired*100:0}function i(){return Math.floor(e.distance)+e.kills*100+e.headshots*50}function r(){e.ended||(e.score=i()),e.accuracy=n(),window.SS&&(window.SS.score=e.score),s&&s.setScore&&s.setScore(e.score)}function o(){e.distance=0,e.kills=0,e.headshots=0,e.shotsFired=0,e.shotsHit=0,e.accuracy=0,e.score=0,e.ended=!1,r()}function a(f){e.distance=f||0,e.ended||r()}function c(){e.shotsFired+=1}function l(){e.shotsHit+=1}function u(f){e.kills+=1,f&&(e.headshots+=1,s&&s.headshotFlash&&s.headshotFlash(),t&&t.headshot&&t.headshot()),r()}function d(){if(e.ended)return{entry:null,table:Tc(),isNewBest:!1,best:h()};e.ended=!0;let f=n();e.accuracy=f;let p=f*e.kills*2;e.score=Math.floor(i()+p),window.SS&&(window.SS.score=e.score),s&&s.setScore&&s.setScore(e.score);let x=h(),g={score:e.score,distance:Math.floor(e.distance),kills:e.kills,headshots:e.headshots,accuracy:Math.round(f*10)/10,date:new Date().toISOString()},m=Tc();m.push(g),m.sort((S,E)=>E.score-S.score);let v=m.slice(0,5);oS(v);let N=g.score>x||m.length===1;return{entry:g,table:v,isNewBest:N,best:v.length?v[0].score:g.score}}function h(){let f=Tc();return f.length?f[0].score|0:0}return o(),{state:e,reset:o,setDistance:a,registerShot:c,registerHit:l,addKill:u,finish:d,best:h,table:Tc}}function mf(){let s=null,t=null,e=null,n=null,i=!1,r=10,o=9,a=7,c=!1;function l(){if(s)return!0;let M=window.AudioContext||window.webkitAudioContext;if(!M)return!1;s=new M,t=s.createGain(),t.gain.value=.75,t.connect(s.destination);let F=s.sampleRate*.85|0,I=s.createBuffer(2,F,s.sampleRate);for(let At=0;At<2;At++){let Bt=I.getChannelData(At);for(let K=0;K<F;K++){let ot=K/F;Bt[K]=(Math.random()*2-1)*(1-ot)*(1-ot)*.7}}let C=s.createConvolver();C.buffer=I;let L=s.createGain();L.gain.value=.38,C.connect(L),L.connect(t);let D=s.createDelay(1);D.delayTime.value=.17;let z=s.createGain();z.gain.value=.2;let q=s.createBiquadFilter();q.type="lowpass",q.frequency.value=1400,D.connect(q),q.connect(z),z.connect(t),e=s.createGain(),e.gain.value=1,e.connect(t),e.connect(C),e.connect(D);let G=s.sampleRate*2,Z=s.createBuffer(1,G,s.sampleRate),W=Z.getChannelData(0),et=0;for(let At=0;At<G;At++)et=et*.98+(Math.random()*2-1)*.02,W[At]=et*3.2;let ut=s.createBufferSource();ut.buffer=Z,ut.loop=!0;let Ft=s.createBiquadFilter();return Ft.type="lowpass",Ft.frequency.value=380,n=s.createGain(),n.gain.value=.09,ut.connect(Ft),Ft.connect(n),n.connect(t),ut.start(),!0}function u(M,R,F){let I=s.createGain(),C=s.currentTime;return I.gain.setValueAtTime(Math.max(1e-4,M),C),I.gain.exponentialRampToValueAtTime(1e-4,C+R),I.connect(F||t),I}function d(M){let R=Math.max(1,s.sampleRate*M|0),F=s.createBuffer(1,R,s.sampleRate),I=F.getChannelData(0);for(let C=0;C<R;C++)I[C]=Math.random()*2-1;return F}function h(M,R,F,I,C,L){if(!s)return;let D=s.createBufferSource();D.buffer=d(M);let z=s.createBiquadFilter();z.type=C||"bandpass",z.frequency.value=F,z.Q.value=I??.7;let q=u(R,M,L||t);D.connect(z),z.connect(q),D.start()}function f(M,R,F,I,C){if(!s)return;let L=s.createOscillator();L.type=I||"sine",L.frequency.setValueAtTime(M,s.currentTime);let D=u(F,R,C||t);return L.connect(D),L.start(),L.stop(s.currentTime+R+.02),L}function p(M){let R=s.createStereoPanner();return R.pan.value=Math.max(-1,Math.min(1,M||0)),R}function x(M){let R=window.SS&&window.SS.camera;if(!R||!M)return(Math.random()*2-1)*.6;let F=M.x-R.position.x,I=M.z-R.position.z,C=-R.rotation.y,L=F*Math.cos(C)+I*Math.sin(C),D=F*Math.sin(C)-I*Math.cos(C),z=Math.hypot(L,D)||1;return L/z}function g(){if(!l())return;h(.07,.55,1600,.6,"bandpass",e),h(.05,.35,420,.5,"lowpass",e);let M=s.createOscillator();M.type="sine";let R=s.currentTime;M.frequency.setValueAtTime(110,R),M.frequency.exponentialRampToValueAtTime(42,R+.09);let F=u(.55,.1,e);M.connect(F),M.start(),M.stop(R+.12)}function m(M){if(!s)return;let R=p(x(M)),F=s.createGain();F.gain.value=.28,R.connect(F),F.connect(t),h(.11,.4,700,.6,"lowpass",R),f(68,.09,.12,"sine",R)}function v(){if(!s)return;let M=p((Math.random()*2-1)*.85),R=s.createGain();R.gain.value=.16,M.connect(R),R.connect(t),h(.16,.35,480,.5,"lowpass",M),f(52,.12,.08,"sine",M)}function N(){s&&f(1800,.04,.12,"square")}function S(){if(!s)return;f(880,.09,.16,"sine");let M=s.createOscillator();M.type="sine";let R=s.currentTime;M.frequency.setValueAtTime(1320,R+.06);let F=s.createGain();F.gain.setValueAtTime(1e-4,R),F.gain.setValueAtTime(.14,R+.06),F.gain.exponentialRampToValueAtTime(1e-4,R+.22),M.connect(F),F.connect(t),M.start(R+.06),M.stop(R+.24)}function E(M){s&&(M==="end"?(h(.03,.22,2200,2,"highpass"),f(420,.04,.08,"square")):(h(.025,.28,2800,3,"highpass"),f(640,.03,.06,"square")))}function w(){if(!s)return;let M=s.currentTime,R=s.createOscillator();R.type="square",R.frequency.value=1900;let F=s.createGain();F.gain.setValueAtTime(.08,M),F.gain.exponentialRampToValueAtTime(1e-4,M+.05),R.connect(F),F.connect(t),R.start(M),R.stop(M+.06);let I=2+(Math.random()*3|0);for(let z=0;z<I;z++){let q=.06+z*(.09+Math.random()*.08),G=s.createBufferSource();G.buffer=d(.07);let Z=s.createBiquadFilter();Z.type="bandpass",Z.frequency.value=900+Math.random()*800,Z.Q.value=4;let W=s.createGain();W.gain.setValueAtTime(1e-4,M),W.gain.setValueAtTime(.12,M+q),W.gain.exponentialRampToValueAtTime(1e-4,M+q+.07),G.connect(Z),Z.connect(W),W.connect(t),G.start(M+q)}let C=s.createOscillator();C.type="sine",C.frequency.value=1400;let L=s.createGain(),D=M+.45;L.gain.setValueAtTime(.07,D),L.gain.exponentialRampToValueAtTime(1e-4,D+.06),C.connect(L),L.connect(t),C.start(D),C.stop(D+.07)}function P(){if(!s)return;let M=p((Math.random()*2-1)*.7),R=s.createGain();R.gain.value=.18,M.connect(R),R.connect(t);let F=s.createOscillator();F.type="sawtooth";let I=s.currentTime;F.frequency.setValueAtTime(280+Math.random()*40,I),F.frequency.exponentialRampToValueAtTime(140,I+.12);let C=s.createGain();C.gain.setValueAtTime(.2,I),C.gain.exponentialRampToValueAtTime(1e-4,I+.14);let L=s.createBiquadFilter();L.type="lowpass",L.frequency.value=900,F.connect(L),L.connect(C),C.connect(M),F.start(),F.stop(I+.16);let D=s.createOscillator();D.type="sawtooth",D.frequency.setValueAtTime(240,I+.16),D.frequency.exponentialRampToValueAtTime(110,I+.32);let z=s.createGain();z.gain.setValueAtTime(1e-4,I),z.gain.setValueAtTime(.16,I+.16),z.gain.exponentialRampToValueAtTime(1e-4,I+.34),D.connect(L),L.connect(z),z.connect(M),D.start(I+.16),D.stop(I+.36)}function _(){l()&&(i=!0,s.state==="suspended"&&s.resume())}function b(M){if(!s||!i)return;let R=!!(window.SS&&window.SS.running),F=!!(window.SS&&window.SS.bursting);n&&(n.gain.value=R&&window.SS.walking?.11:.05),F&&!c&&w(),c=F,R&&(r-=M,r<=0&&(r=16+Math.random()*18,w()),o-=M,o<=0&&(o=12+Math.random()*20,P()),a-=M,a<=0&&(a=6+Math.random()*10,v()))}return{unlock:_,update:b,gunfire:g,enemyShot:m,hit:N,headshot:S,reload:E,radio:w}}var aS=7,cS=4.4,gf=1,lS=4.5;function xf(s,t,e,n){let i=new be({color:10259042,roughness:.95}),r=new Ce(2.6,1.15,.6),o={state:"none",target:null,spawned:null,update:l,reset:u};function a(){let d=t.position.z,h=null,f=1e9;for(let x of e.segments||[])for(let g of x.coverPoints||[]){if(g.type!=="barrel"&&g.type!=="car")continue;let m=d-g.pos.z;if(m<1.5||m>aS||Math.abs(g.pos.x)>cS)continue;let v=m+Math.abs(g.pos.x-t.position.x);v<f&&(f=v,h=g.pos)}if(h)return new V(h.x,0,h.z+gf);let p=new $t(r,i);return p.position.set(t.position.x,.575,d-2.2),p.castShadow=p.receiveShadow=!0,s.add(p),e.colliders.push(p),o.spawned=p,new V(p.position.x,0,p.position.z+gf)}function c(){if(!o.spawned)return;s.remove(o.spawned);let d=e.colliders.indexOf(o.spawned);d>=0&&e.colliders.splice(d,1),o.spawned=null}function l(d,h){if(h){o.state!=="none"&&(o.state="none",o.target=null,c()),n.cover=!1,t.position.x+=(0-t.position.x)*(1-Math.exp(-1.5*d));return}if(!window.SS||!window.SS.running)return;o.target||(o.target=a(),o.state="moving");let f=o.target.x-t.position.x,p=o.target.z-t.position.z,x=Math.hypot(f,p);if(x>.05){let g=Math.min(x,lS*d)/x;t.position.x+=f*g,t.position.z+=p*g}else o.state="in";n.cover=o.state==="in"&&!n.scope}function u(){o.state="none",o.target=null,c(),n.cover=!1}return o}var Xn=new ic({antialias:!0});Xn.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));Xn.setSize(window.innerWidth,window.innerHeight);Xn.shadowMap.enabled=!0;Xn.shadowMap.type=ha;Xn.outputColorSpace=_e;document.body.appendChild(Xn.domElement);var Qi=new mr,Se=new ze(70,window.innerWidth/window.innerHeight,.1,220);Se.position.set(0,1.7,4);Se.rotation.order="YXZ";Qi.add(Se);var js=Ed(Qi,23165),qn=Rd(Xn.domElement),Tn=Bd(Se,js,Qi),Qr=Ud(),Ks=Od(Se,qn,Qr),to=df(Qi,Se,js,Tn,Ks),Li=mf(),Pi=pf(Qr,Li),bh=xf(Qi,Se,js,qn);window.SS={scene:Qi,camera:Se,world:js,input:qn,weapon:Tn,hud:Qr,player:Ks,enemies:to,audio:Li,scoreSys:Pi,cover:bh,walking:!0,distance:0,running:!1,bursting:!1,score:0,health:100,onDeath(){}};var _f=Tn.onHit;Tn.onHit=function(t){_f&&_f(t),Pi.registerHit(),Li.hit()};Tn.onShot=function(){Pi.registerShot(),Li.gunfire()};Tn.onReload=function(t){Li.reload(t)};window.SS.debug={spawnEnemy(s){return to.spawnEnemy(s)},killAll(){to.killAll()},damage(s){Ks.damage(s)}};var vf=3,wh=70,hS=28,jr=wh,Ac=1.7,Mh=0,yf=!1;function Sf(s){let t=qn.state,e=1-Math.exp(-12*s),n=1-Math.exp(-8*s);jr+=((t.scope?hS:wh)-jr)*e,Ac+=((t.cover?1:1.7)-Ac)*n,Math.abs(Se.fov-jr)>.01&&(Se.fov=jr,Se.updateProjectionMatrix()),Se.position.y=Ac,Se.rotation.y=-t.yaw,Se.rotation.x=-t.pitch,Se.rotation.z=0,Se.updateMatrixWorld()}function bf(s){requestAnimationFrame(bf);let t=Mh?Math.min(.05,(s-Mh)/1e3):0;Mh=s;let e=!Ks.alive;window.SS.walking&&!e&&(Se.position.z-=vf*t,window.SS.distance+=vf*t),e||bh.update(t||.016,window.SS.walking&&window.SS.running),Sf(t||.016);let n=t||.016;Ks.update(n),e||to.update(n),Tn.update(t,qn.state),Pi.setDistance(window.SS.distance),Li.update(n),Sf(0),qn.endFrame(),e||js.update(Se.position.z),Qr.onTarget(Tn.onTarget),Qr.update({distance:window.SS.distance,ammo:Tn.ammo,reloading:Tn.reloading,scoped:qn.scope,score:window.SS.score,health:window.SS.health}),Xn.render(Qi,Se)}function uS(){Se.aspect=window.innerWidth/window.innerHeight,Se.updateProjectionMatrix(),Xn.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)),Xn.setSize(window.innerWidth,window.innerHeight)}window.addEventListener("resize",uS);var Eh=document.getElementById("over"),dS=document.getElementById("over-new"),fS=document.getElementById("over-stats"),Mf=document.getElementById("over-table"),pS=document.getElementById("best");function wf(){pS.textContent="Best: "+Pi.best()}function mS(s){let t=s.entry;dS.style.display=s.isNewBest?"block":"none",t&&(fS.textContent="Score "+t.score+" \xB7 "+t.distance+" m \xB7 Kills "+t.kills+" \xB7 Headshots "+t.headshots+" \xB7 Accuracy "+t.accuracy+"%"),Mf.innerHTML="<tr><th>#</th><th>Score</th><th>Dist</th><th>Kills</th><th>HS</th><th>Acc</th><th>Date</th></tr>";let e=s.table||[];for(let n=0;n<e.length;n++){let i=e[n],r=document.createElement("tr"),o=(i.date||"").slice(0,10);r.innerHTML="<td>"+(n+1)+"</td><td>"+i.score+"</td><td>"+i.distance+"</td><td>"+i.kills+"</td><td>"+i.headshots+"</td><td>"+i.accuracy+"%</td><td>"+o+"</td>",Mf.appendChild(r)}Eh.style.display="flex",wf()}function gS(){Eh.style.display="none",Ks.reset(),to.reset(),Tn.reset(),Pi.reset(),qn.yaw=0,qn.pitch=0,qn.fire=!1,Se.position.set(0,1.7,4),jr=wh,Ac=1.7,window.SS.distance=0,window.SS.health=100,window.SS.bursting=!1,window.SS.walking=!0,window.SS.running=!0,window.SS.startedAt=performance.now(),window.SS.input&&(window.SS.input.fire=!1),bh.reset(),js.reset(Se.position.z),Pi.setDistance(0)}window.SS.onDeath=function(){if(!window.SS.running&&Eh.style.display==="flex")return;window.SS.running=!1,window.SS.walking=!1;let t=Pi.finish();mS(t)};document.getElementById("play").addEventListener("click",()=>{Li.unlock(),document.getElementById("start").style.display="none",window.SS.walking=!0,window.SS.running=!0,window.SS.startedAt=performance.now(),window.SS.input&&(window.SS.input.fire=!1),yf||(yf=!0,requestAnimationFrame(bf))});document.getElementById("restart").addEventListener("click",()=>{Li.unlock(),gS()});wf();if(/[?&]debug\b/.test(location.search)){let s=document.createElement("div");s.id="build-tag",s.style.cssText="position:fixed;left:4px;bottom:2px;z-index:99;font:10px monospace;color:#fff;background:rgba(0,0,0,.45);padding:1px 4px;pointer-events:none",s.textContent="build \u2026",document.body.appendChild(s),fetch("sw.js",{cache:"no-store"}).then(t=>t.text()).then(t=>{let e=t.match(/ss-[0-9a-f]{10}/);s.textContent="build "+(e?e[0]:"dev")}).catch(()=>{s.textContent="build ?"})}
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
