varying vec2 vUv;

void main()
{
  vUv=uv; // 'uv' is the default attribute holding the object's texture coordinates
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}