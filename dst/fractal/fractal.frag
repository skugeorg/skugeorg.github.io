#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

uniform float u_time;
uniform int u_frac_type;
uniform vec2 u_offset;
uniform float u_zoom;
uniform vec3 u_color1;
uniform vec3 u_color2;

in vec2 DrawPos;

// Возведение комплексного числа в квадрат
vec2 square(vec2 A) {
    return vec2(A.x * A.x - A.y * A.y, 2.0 * A.x * A.y);
}

// Комплексное сопряжение (нужно для Трикона)
vec2 conj(vec2 A) {
    return vec2(A.x, -A.y);
}

void main() {
    vec2 uv = (DrawPos + u_offset) / u_zoom;
    vec2 z = vec2(0.0);
    vec2 c = uv;
    int n = 0;
    int max_iter = 256; // Увеличили итерации для большей детализации

    if (u_frac_type == 0) {
        // 0: Анимированное множество Жюлиа
        c = vec2(0.5 + 0.2 * sin(u_time / 10.0), 0.5 + sin(u_time) * 0.2);
        z = uv;
        while (length(z) < 2.0 && n < max_iter) {
            z = square(z) + c;
            n++;
        }
    } else if (u_frac_type == 1) {
        // 1: Множество Мандельброта
        z = vec2(0.0);
        c = uv;
        while (length(z) < 2.0 && n < max_iter) {
            z = square(z) + c;
            n++;
        }
    } else if (u_frac_type == 2) {
        // 2: Горящий корабль (Burning Ship)
        z = vec2(0.0);
        c = uv;
        while (length(z) < 2.0 && n < max_iter) {
            z = abs(z); // Берем модуль от каждой компоненты перед возведением в квадрат
            z = square(z) + c;
            n++;
        }
    } else if (u_frac_type == 3) {
        // 3: Трикон (Mandelbar)
        z = vec2(0.0);
        c = uv;
        while (length(z) < 2.0 && n < max_iter) {
            z = square(conj(z)) + c;
            n++;
        }
    }

    if (n == max_iter) {
        // Точка внутри фрактала
        float t = fract(length(uv) * 2.5 + u_time * 0.4);
        o_color = vec4(mix(u_color2, u_color1, t), 1.0);
    } else {
        // Точка снаружи фрактала (сглаженная раскраска для плавных градиентов)
        float log_zn = log(length(z)) / 2.0;
        float nu = log(log_zn / log(2.0)) / log(2.0);
        float smooth_n = float(n) + 1.0 - nu;
        float t = fract(smooth_n * 0.05 + u_time * 0.2);
        o_color = vec4(mix(u_color1, u_color2, t), 1.0);
    }
}