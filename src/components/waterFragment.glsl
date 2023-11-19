float ltime;
uniform vec2 iResolution;
uniform float iTime;
uniform sampler2D earthTexture;
varying vec2 vUv;

float animationSpeedFactor = 0.25; // Scale down the animation speed

float noise(vec2 p)
{
  return sin(p.x*10.)*sin(p.y*(3.+sin(ltime/11.)))+.2;
}

mat2 rotate(float angle)
{
  return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
}

float fbm(vec2 p)
{
  p*=1.1;
  float f=0.;
  float amp=.5;
  for(int i=0;i<3;i++){
    mat2 modify=rotate(ltime/50.*float(i*i));
    f+=amp*noise(p);
    p=modify*p;
    p*=2.;
    amp/=2.2;
  }
  return f;
}

float pattern(vec2 p,out vec2 q,out vec2 r){
  q=vec2(fbm(p+vec2(1.)),
  fbm(rotate(.1*ltime)*p+vec2(3.)));
  r=vec2(fbm(rotate(.2)*q+vec2(0.)),
  fbm(q+vec2(0.)));
  return fbm(p+1.*r);
}

vec3 hsv2rgb(vec3 c)
{
  vec4 K=vec4(1.,2./3.,1./3.,3.);
  vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
  return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}

void mainImage(out vec4 fragColor,in vec2 fragCoord){
  vec2 uv = vUv;
  vec4 earthTexColor=texture(earthTexture,uv);

  // Scale down the time to slow down the animation
  float scaledTime = iTime * animationSpeedFactor;

  if(earthTexColor.a<.5){
    ltime=scaledTime;
    float ctime=scaledTime+fbm(uv/8.)*40.;
    float ftime=fract(ctime/6.);
    ltime=floor(ctime/6.)+(1.-cos(ftime*3.1415)/2.);
    ltime=ltime*6.;
    vec2 q,r;
    float f=pattern(uv,q,r);
    
    float hue=.65;// Blue hue
    float saturation=1.3;// Full saturation
    float value=.4+r.x*.2;// Value adjusted for natural appearance on sphere
    
    vec3 col=hsv2rgb(vec3(hue,saturation,value));
    
    fragColor=vec4(col,1.);
  }else{
    // Otherwise, use the original texture color
    fragColor=earthTexColor;
  }
}

void main(){
  mainImage(gl_FragColor,gl_FragCoord.xy);
}
