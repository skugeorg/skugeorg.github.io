#version 300 es
precision highp float;

in vec3 a_pos;
in vec3 a_color;
in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 v_color;
out vec3 v_normal;
out vec3 v_frag_pos;

void main() {
    vec4 world_pos = u_model * vec4(a_pos, 1.0);
    v_frag_pos = world_pos.xyz;

    v_normal = mat3(u_model) * a_normal;
    v_color = a_color;

    gl_Position = u_projection * u_view * world_pos;
}