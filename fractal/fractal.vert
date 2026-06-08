#version 300 es
precision highp float;

layout (location = 0) in vec2 a_pos;
out vec2 DrawPos;

void main() {
    DrawPos = a_pos;
    gl_Position = vec4(a_pos, 0, 1);
}