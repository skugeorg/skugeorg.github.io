#version 300 es
precision highp float;

in vec3 v_color;
in vec3 v_normal;
in vec3 v_frag_pos;

out vec4 o_color;

uniform vec3 u_light_pos;
uniform float u_ambient_strength;

void main() {
    vec3 norm = normalize(v_normal);

    vec3 light_dir = normalize(u_light_pos - v_frag_pos);

    float diff = max(dot(norm, light_dir), 0.0);

    float distance = length(u_light_pos - v_frag_pos);
    float attenuation = 1.0 / (1.0 + 0.1 * distance + 0.05 * distance * distance);

    vec3 ambient = u_ambient_strength * v_color;
    vec3 diffuse = diff * v_color * attenuation;

    vec3 result = ambient + diffuse;
    o_color = vec4(result, 1.0);
}