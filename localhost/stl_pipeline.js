// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.
// Shared STL/3D generation pipeline used by map components.

let f_apply_displacement = function (THREE, o_geometry, a_n__data, n_scl_x, n_scl_y, n_factor, s_type) {
    let o_pos = o_geometry.attributes.position;
    let n_cnt__vertex = o_pos.count;
    let n_col = n_scl_x;
    let o_vec = new THREE.Vector3();

    for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
        let n_idx_row = Math.floor(n_idx / n_col);
        let n_idx_col = n_idx % n_col;
        n_idx_row = Math.min(n_idx_row, n_scl_y - 1);
        n_idx_col = Math.min(n_idx_col, n_scl_x - 1);

        let n_idx__pixel = n_idx_row * n_scl_x + n_idx_col;
        let n_val = (n_idx__pixel < a_n__data.length) ? a_n__data[n_idx__pixel] : 127;
        let n_offset = ((n_val - 127) / 128) * n_factor;

        o_vec.set(o_pos.getX(n_idx), o_pos.getY(n_idx), o_pos.getZ(n_idx));

        if (s_type === 'sphere') {
            let n_len = o_vec.length();
            if (n_len > 0) {
                o_pos.setXYZ(n_idx,
                    o_vec.x + (o_vec.x / n_len) * n_offset,
                    o_vec.y + (o_vec.y / n_len) * n_offset,
                    o_vec.z + (o_vec.z / n_len) * n_offset
                );
            }
        } else if (s_type === 'cylinder') {
            let n_len_xz = Math.sqrt(o_vec.x * o_vec.x + o_vec.z * o_vec.z);
            if (n_len_xz > 0) {
                o_pos.setXYZ(n_idx,
                    o_vec.x + (o_vec.x / n_len_xz) * n_offset,
                    o_vec.y,
                    o_vec.z + (o_vec.z / n_len_xz) * n_offset
                );
            }
        } else if (s_type === 'plane') {
            o_pos.setZ(n_idx, o_vec.z + n_offset);
        }
    }
    o_pos.needsUpdate = true;
};

let f_o_geometry__solid_plane = function (THREE, o_geom__top, n_thickness, n_deg__chamfer, a_n__text_mask, n_mm__text_depth, o_hole) {
    let o_pos__top = o_geom__top.attributes.position;
    let o_idx__top = o_geom__top.index;
    let n_cnt__vertex = o_pos__top.count;

    let n_y_first = o_pos__top.getY(0);
    let n_col = 1;
    while (n_col < n_cnt__vertex && o_pos__top.getY(n_col) === n_y_first) {
        n_col++;
    }
    let n_row = n_cnt__vertex / n_col;

    let n_z_min = Infinity;
    for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
        let n_z = o_pos__top.getZ(n_idx);
        if (n_z < n_z_min) n_z_min = n_z;
    }
    let n_z_bottom = n_z_min - n_thickness;

    let a_n__pos = [];
    let a_n__idx = [];

    for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
        a_n__pos.push(o_pos__top.getX(n_idx), o_pos__top.getY(n_idx), o_pos__top.getZ(n_idx));
    }

    let n_y_min = Infinity;
    for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
        let n_y = o_pos__top.getY(n_idx);
        if (n_y < n_y_min) n_y_min = n_y;
    }

    for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
        a_n__pos.push(o_pos__top.getX(n_idx), o_pos__top.getY(n_idx), n_z_bottom);
    }

    if (a_n__text_mask && n_mm__text_depth > 0) {
        for (let n_r = 0; n_r < n_row; n_r++) {
            for (let n_c = 0; n_c < n_col; n_c++) {
                let n_idx__mask = n_r * n_col + n_c;
                if (a_n__text_mask[n_idx__mask] > 0) {
                    let n_idx__bottom = n_cnt__vertex + n_idx__mask;
                    let n_pos_z = n_idx__bottom * 3 + 2;
                    a_n__pos[n_pos_z] += n_mm__text_depth;
                }
            }
        }
    }

    if (n_deg__chamfer > 0) {
        let n_tan = Math.tan(n_deg__chamfer * Math.PI / 180);
        let n_z_top_at_edge = -Infinity;
        let n_off__last_row = (n_row - 1) * n_col;
        for (let n_c = 0; n_c < n_col; n_c++) {
            let n_z = a_n__pos[(n_off__last_row + n_c) * 3 + 2];
            if (n_z > n_z_top_at_edge) n_z_top_at_edge = n_z;
        }
        let n_edge_height = n_z_top_at_edge - n_z_bottom;
        let n_chamfer_depth = n_edge_height / n_tan;

        let n_cnt__total = n_cnt__vertex * 2;
        for (let n_idx = 0; n_idx < n_cnt__total; n_idx++) {
            let n_y = a_n__pos[n_idx * 3 + 1];
            let n_dist = n_y - n_y_min;
            if (n_dist >= n_chamfer_depth) continue;
            let n_z = a_n__pos[n_idx * 3 + 2];
            let n_chamfer_z = n_z_top_at_edge - n_dist * n_tan;
            if (n_z < n_chamfer_z) {
                a_n__pos[n_idx * 3 + 2] = n_chamfer_z;
            }
        }
    }

    if (o_idx__top) {
        for (let n_idx = 0; n_idx < o_idx__top.count; n_idx++) {
            a_n__idx.push(o_idx__top.getX(n_idx));
        }
    } else {
        for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
            a_n__idx.push(n_idx);
        }
    }

    if (o_idx__top) {
        for (let n_idx = 0; n_idx < o_idx__top.count; n_idx += 3) {
            a_n__idx.push(
                o_idx__top.getX(n_idx) + n_cnt__vertex,
                o_idx__top.getX(n_idx + 2) + n_cnt__vertex,
                o_idx__top.getX(n_idx + 1) + n_cnt__vertex
            );
        }
    }

    let f_add_wall_quad = function (n_a_top, n_b_top) {
        let n_a_bot = n_a_top + n_cnt__vertex;
        let n_b_bot = n_b_top + n_cnt__vertex;
        a_n__idx.push(n_a_top, n_b_top, n_b_bot);
        a_n__idx.push(n_a_top, n_b_bot, n_a_bot);
    };

    for (let n_idx = 0; n_idx < n_col - 1; n_idx++) {
        f_add_wall_quad(n_idx + 1, n_idx);
    }
    let n_off__last_row2 = (n_row - 1) * n_col;
    for (let n_idx = 0; n_idx < n_col - 1; n_idx++) {
        f_add_wall_quad(n_off__last_row2 + n_idx, n_off__last_row2 + n_idx + 1);
    }
    for (let n_idx = 0; n_idx < n_row - 1; n_idx++) {
        f_add_wall_quad(n_idx * n_col, (n_idx + 1) * n_col);
    }
    for (let n_idx = 0; n_idx < n_row - 1; n_idx++) {
        f_add_wall_quad((n_idx + 1) * n_col + n_col - 1, n_idx * n_col + n_col - 1);
    }

    if (o_hole) {
        let n_cx = o_hole.n_cx;
        let n_cy = o_hole.n_cy;
        let n_hole_r = o_hole.n_radius;
        let n_r_sq = n_hole_r * n_hole_r;

        let a_b__inside = new Uint8Array(n_cnt__vertex);
        for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
            let n_x = o_pos__top.getX(n_idx);
            let n_y = o_pos__top.getY(n_idx);
            let n_dx = n_x - n_cx;
            let n_dy = n_y - n_cy;
            if (n_dx * n_dx + n_dy * n_dy <= n_r_sq) {
                a_b__inside[n_idx] = 1;
            }
        }

        let n_z_top__max = -Infinity;
        let n_z_bottom__min = Infinity;
        for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
            let n_x = o_pos__top.getX(n_idx);
            let n_y = o_pos__top.getY(n_idx);
            let n_dx = n_x - n_cx;
            let n_dy = n_y - n_cy;
            let n_dist_sq = n_dx * n_dx + n_dy * n_dy;
            if (n_dist_sq <= n_r_sq * 2.25) {
                let n_zt = a_n__pos[n_idx * 3 + 2];
                let n_zb = a_n__pos[(n_cnt__vertex + n_idx) * 3 + 2];
                if (n_zt > n_z_top__max) n_z_top__max = n_zt;
                if (n_zb < n_z_bottom__min) n_z_bottom__min = n_zb;
            }
        }

        for (let n_idx = 0; n_idx < n_cnt__vertex; n_idx++) {
            if (!a_b__inside[n_idx]) continue;
            let n_x = o_pos__top.getX(n_idx);
            let n_y = o_pos__top.getY(n_idx);
            let n_dx = n_x - n_cx;
            let n_dy = n_y - n_cy;
            let n_dist = Math.sqrt(n_dx * n_dx + n_dy * n_dy);

            let n_px, n_py;
            if (n_dist < 0.001) {
                n_px = n_cx + n_hole_r;
                n_py = n_cy;
            } else {
                n_px = n_cx + (n_dx / n_dist) * n_hole_r;
                n_py = n_cy + (n_dy / n_dist) * n_hole_r;
            }

            let n_off_t = n_idx * 3;
            a_n__pos[n_off_t] = n_px;
            a_n__pos[n_off_t + 1] = n_py;
            a_n__pos[n_off_t + 2] = n_z_top__max;

            let n_off_b = (n_cnt__vertex + n_idx) * 3;
            a_n__pos[n_off_b] = n_px;
            a_n__pos[n_off_b + 1] = n_py;
            a_n__pos[n_off_b + 2] = n_z_bottom__min;
        }

        let a_n__idx_filtered = [];
        for (let n_i = 0; n_i < a_n__idx.length; n_i += 3) {
            let n_a = a_n__idx[n_i];
            let n_b = a_n__idx[n_i + 1];
            let n_c = a_n__idx[n_i + 2];
            if (a_b__inside[n_a % n_cnt__vertex] && a_b__inside[n_b % n_cnt__vertex] && a_b__inside[n_c % n_cnt__vertex]) {
                continue;
            }
            a_n__idx_filtered.push(n_a, n_b, n_c);
        }
        a_n__idx = a_n__idx_filtered;

        let f_add_hole_wall = function (n_v_in, n_v_out) {
            let n_t_in  = n_v_in;
            let n_t_out = n_v_out;
            let n_b_in  = n_v_in  + n_cnt__vertex;
            let n_b_out = n_v_out + n_cnt__vertex;
            a_n__idx.push(n_t_in, n_b_in, n_b_out);
            a_n__idx.push(n_t_in, n_b_out, n_t_out);
        };

        for (let n_r = 0; n_r < n_row; n_r++) {
            for (let n_c = 0; n_c < n_col - 1; n_c++) {
                let n_v0 = n_r * n_col + n_c;
                let n_v1 = n_v0 + 1;
                if (a_b__inside[n_v0] && !a_b__inside[n_v1]) {
                    f_add_hole_wall(n_v0, n_v1);
                } else if (!a_b__inside[n_v0] && a_b__inside[n_v1]) {
                    f_add_hole_wall(n_v1, n_v0);
                }
            }
        }
        for (let n_r = 0; n_r < n_row - 1; n_r++) {
            for (let n_c = 0; n_c < n_col; n_c++) {
                let n_v0 = n_r * n_col + n_c;
                let n_v1 = n_v0 + n_col;
                if (a_b__inside[n_v0] && !a_b__inside[n_v1]) {
                    f_add_hole_wall(n_v0, n_v1);
                } else if (!a_b__inside[n_v0] && a_b__inside[n_v1]) {
                    f_add_hole_wall(n_v1, n_v0);
                }
            }
        }
    }

    let o_geom = new THREE.BufferGeometry();
    o_geom.setAttribute('position', new THREE.Float32BufferAttribute(a_n__pos, 3));
    o_geom.setIndex(a_n__idx);

    return o_geom;
};

let f_o_buffer__stl_from_o_group = function (THREE, o_group) {
    let a_o_geometry = [];
    o_group.traverse(function (o_child) {
        if (o_child.isMesh) {
            let o_geom = o_child.geometry.clone();
            o_geom.applyMatrix4(o_child.matrixWorld);
            if (o_geom.index) {
                o_geom = o_geom.toNonIndexed();
            }
            a_o_geometry.push(o_geom);
        }
    });

    let n_cnt__triangle = 0;
    for (let o_geom of a_o_geometry) {
        n_cnt__triangle += o_geom.attributes.position.count / 3;
    }

    let n_len = 80 + 4 + n_cnt__triangle * 50;
    let o_buffer = new ArrayBuffer(n_len);
    let o_view = new DataView(o_buffer);

    let n_off = 80;
    o_view.setUint32(n_off, n_cnt__triangle, true);
    n_off += 4;

    let o_va = new THREE.Vector3();
    let o_vb = new THREE.Vector3();
    let o_vc = new THREE.Vector3();
    let o_cb = new THREE.Vector3();
    let o_ab = new THREE.Vector3();

    for (let o_geom of a_o_geometry) {
        let o_pos = o_geom.attributes.position;
        for (let n_idx = 0; n_idx < o_pos.count; n_idx += 3) {
            o_va.fromBufferAttribute(o_pos, n_idx);
            o_vb.fromBufferAttribute(o_pos, n_idx + 1);
            o_vc.fromBufferAttribute(o_pos, n_idx + 2);

            o_cb.subVectors(o_vc, o_vb);
            o_ab.subVectors(o_va, o_vb);
            o_cb.cross(o_ab).normalize();

            o_view.setFloat32(n_off, o_cb.x, true); n_off += 4;
            o_view.setFloat32(n_off, o_cb.y, true); n_off += 4;
            o_view.setFloat32(n_off, o_cb.z, true); n_off += 4;
            o_view.setFloat32(n_off, o_va.x, true); n_off += 4;
            o_view.setFloat32(n_off, o_va.y, true); n_off += 4;
            o_view.setFloat32(n_off, o_va.z, true); n_off += 4;
            o_view.setFloat32(n_off, o_vb.x, true); n_off += 4;
            o_view.setFloat32(n_off, o_vb.y, true); n_off += 4;
            o_view.setFloat32(n_off, o_vb.z, true); n_off += 4;
            o_view.setFloat32(n_off, o_vc.x, true); n_off += 4;
            o_view.setFloat32(n_off, o_vc.y, true); n_off += 4;
            o_view.setFloat32(n_off, o_vc.z, true); n_off += 4;
            o_view.setUint16(n_off, 0, true); n_off += 2;
        }
        o_geom.dispose();
    }

    return o_buffer;
};

let f_download_buffer = function (o_buffer, s_filename) {
    let o_blob = new Blob([o_buffer], { type: 'application/octet-stream' });
    let s_url = URL.createObjectURL(o_blob);
    let el_a = document.createElement('a');
    el_a.href = s_url;
    el_a.download = s_filename;
    el_a.click();
    URL.revokeObjectURL(s_url);
};

let f_n__nice_round = function (n_val) {
    if (n_val <= 0) return 0;
    let n_magnitude = Math.pow(10, Math.floor(Math.log10(n_val)));
    let n_leading = n_val / n_magnitude;
    let n_rounded = Math.round(n_leading * 10) / 10;
    return Math.round(n_rounded * n_magnitude);
};

let f_s__format_number = function (n_val) {
    return n_val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

let f_n_m__ruler_distance = function (n_m__real_width) {
    let n_target = n_m__real_width * 0.25;
    let a_n__nice = [1, 2, 5];
    let n_magnitude = Math.pow(10, Math.floor(Math.log10(n_target)));
    let n_best = n_magnitude;
    for (let n_i = 0; n_i < a_n__nice.length; n_i++) {
        let n_candidate = a_n__nice[n_i] * n_magnitude;
        if (n_candidate <= n_target * 1.5) n_best = n_candidate;
    }
    for (let n_i = 0; n_i < a_n__nice.length; n_i++) {
        let n_candidate = a_n__nice[n_i] * n_magnitude * 10;
        if (n_candidate <= n_target * 1.5) n_best = n_candidate;
    }
    return n_best;
};

let f_a_n__text_mask = function (n_col, n_row, n_mm_plate_x, n_mm_plate_y, s_text, n_m__real_width, n_mm__chamfer_depth) {
    n_mm__chamfer_depth = n_mm__chamfer_depth || 0;
    let el_canvas = document.createElement('canvas');
    el_canvas.width = n_col;
    el_canvas.height = n_row;
    let o_ctx = el_canvas.getContext('2d');

    let a_s__line = s_text.split('\n');
    let n_cnt__line = a_s__line.length;
    let n_font_ref = 100;
    let n_line_height_ref = n_font_ref * 1.25;
    o_ctx.font = n_font_ref + 'px sans-serif';
    let n_text_width_ref = 0;
    for (let n_i = 0; n_i < n_cnt__line; n_i++) {
        let n_w = o_ctx.measureText(a_s__line[n_i]).width;
        if (n_w > n_text_width_ref) n_text_width_ref = n_w;
    }
    let n_text_height_ref = n_cnt__line * n_line_height_ref;

    let n_px_per_mm_x = n_col / n_mm_plate_x;
    let n_px_per_mm_y = n_row / n_mm_plate_y;
    let n_px_per_mm = (n_px_per_mm_x + n_px_per_mm_y) / 2;

    let n_margin = Math.round(Math.min(n_col, n_row) * 0.04);
    let n_bar_height = Math.max(3, Math.round(n_row * 0.012));
    let n_font__ruler = Math.max(8, Math.round(n_row * 0.035));
    let n_ruler_zone_h = 0;
    let n_px__ruler = 0;
    let n_m__ruler = 0;
    let s_ruler = '';
    if (n_m__real_width > 0) {
        n_m__ruler = f_n_m__ruler_distance(n_m__real_width);
        let n_mm__ruler = n_m__ruler / n_m__real_width * n_mm_plate_x;
        n_px__ruler = n_mm__ruler * n_px_per_mm_x;
        if (n_m__ruler >= 1000) {
            s_ruler = (n_m__ruler / 1000) + ' km';
        } else {
            s_ruler = n_m__ruler + ' m';
        }
        n_ruler_zone_h = n_margin + n_font__ruler + n_bar_height * 2 + n_margin;
    }

    // chamfer dead zone: pixels at the bottom (front edge) that get cut away
    let n_chamfer_zone_h = n_mm__chamfer_depth * n_px_per_mm_y;

    // available text area excludes ruler zone (top) and chamfer zone (bottom)
    let n_mm_plate_y__text = n_mm_plate_y - n_ruler_zone_h / n_px_per_mm_y - n_mm__chamfer_depth;
    let n_rad__diagonal_text = Math.atan2(n_mm_plate_y__text, n_mm_plate_x);
    let n_cos_t = Math.cos(n_rad__diagonal_text);
    let n_sin_t = Math.sin(n_rad__diagonal_text);
    let n_rotated_w = n_text_width_ref * n_cos_t + n_text_height_ref * n_sin_t;
    let n_rotated_h = n_text_width_ref * n_sin_t + n_text_height_ref * n_cos_t;
    let n_scl_fit = Math.min(
        n_mm_plate_x / n_rotated_w,
        n_mm_plate_y__text / n_rotated_h
    );

    let n_font_final = n_font_ref * n_scl_fit;
    let n_font_px = n_font_final * n_px_per_mm;

    // center text between ruler zone (top) and chamfer zone (bottom)
    let n_row__text_center = (n_ruler_zone_h + n_row - n_chamfer_zone_h) / 2;
    o_ctx.clearRect(0, 0, n_col, n_row);
    o_ctx.save();
    o_ctx.translate(n_col / 2, n_row__text_center);
    o_ctx.scale(-1, 1);
    o_ctx.rotate(-n_rad__diagonal_text);
    let n_line_height_px = n_font_px * 1.25;
    o_ctx.font = n_font_px + 'px sans-serif';
    o_ctx.fillStyle = 'white';
    o_ctx.textAlign = 'center';
    o_ctx.textBaseline = 'middle';
    let n_y__start = -(n_cnt__line - 1) * n_line_height_px / 2;
    for (let n_i = 0; n_i < n_cnt__line; n_i++) {
        o_ctx.fillText(a_s__line[n_i], 0, n_y__start + n_i * n_line_height_px);
    }
    o_ctx.restore();

    if (n_m__real_width > 0 && n_px__ruler > 0) {
        // draw ruler at top-left corner (back edge) to avoid chamfer cutaway
        o_ctx.save();
        o_ctx.scale(-1, 1);
        let n_bar_x = -(n_col - n_margin);
        let n_bar_y = n_margin + n_font__ruler + n_bar_height;
        o_ctx.fillStyle = 'white';
        o_ctx.fillRect(n_bar_x, n_bar_y, n_px__ruler, n_bar_height);
        let n_tick_h = n_bar_height * 3;
        let n_tick_w = Math.max(2, n_bar_height * 0.6);
        o_ctx.fillRect(n_bar_x, n_bar_y - n_tick_h / 2 + n_bar_height / 2, n_tick_w, n_tick_h);
        o_ctx.fillRect(n_bar_x + n_px__ruler - n_tick_w, n_bar_y - n_tick_h / 2 + n_bar_height / 2, n_tick_w, n_tick_h);
        o_ctx.font = n_font__ruler + 'px sans-serif';
        o_ctx.textAlign = 'left';
        o_ctx.textBaseline = 'bottom';
        o_ctx.fillText(s_ruler, n_bar_x, n_bar_y - n_bar_height * 0.5);
        o_ctx.restore();
    }

    let o_imagedata = o_ctx.getImageData(0, 0, n_col, n_row);
    let a_n__rgba = o_imagedata.data;
    let a_n__mask = new Uint8Array(n_col * n_row);
    for (let n_idx = 0; n_idx < a_n__mask.length; n_idx++) {
        a_n__mask[n_idx] = a_n__rgba[n_idx * 4 + 3] > 127 ? 255 : 0;
    }
    return a_n__mask;
};

// o_config: { n_m_per_pixel, n_scl_x__map_selection, n_m__elevation_min, n_m__elevation_max,
//             n_mm__max_width, b_text__enabled, s_text__carve, n_mm__text_depth,
//             n_mm__baseplate, n_mm__hole_diameter, n_mm__hole_margin, s_corner__hole, s_name__location }
let f_n_mm__displacement = function (o_config, n_mm_width, n_factor) {
    if (o_config.n_m_per_pixel > 0 && o_config.n_scl_x__map_selection > 0) {
        let n_m__real_width = o_config.n_m_per_pixel * o_config.n_scl_x__map_selection;
        let n_scale = n_m__real_width * 1000 / n_mm_width;
        let n_m__elevation_range = o_config.n_m__elevation_max - o_config.n_m__elevation_min;
        let n_mm__correct = (n_m__elevation_range * 1000 / n_scale) / 2;
        return n_mm__correct * n_factor;
    }
    return n_factor * 10 * (n_mm_width / o_config.n_mm__max_width);
};

let f_o_group__build_variant = function (THREE, o_config, a_n__image_data, n_scl_x__image, n_scl_y__image, n_mm_width, b_with_hole, n_ve, n_mm__baseplate_override, n_pxmm) {
    let n_factor = n_ve;
    n_pxmm = n_pxmm || 10;
    let n_max_px = Math.round(n_mm_width * n_pxmm);
    let n_scl_x = n_scl_x__image;
    let n_scl_y = n_scl_y__image;
    let a_n__data = a_n__image_data;

    if (n_scl_x > n_max_px || n_scl_y > n_max_px) {
        let n_ds = Math.min(n_max_px / n_scl_x, n_max_px / n_scl_y);
        n_scl_x = Math.max(2, Math.floor(n_scl_x * n_ds));
        n_scl_y = Math.max(2, Math.floor(n_scl_y * n_ds));

        let el_src = document.createElement('canvas');
        el_src.width = n_scl_x__image;
        el_src.height = n_scl_y__image;
        let o_ctx_src = el_src.getContext('2d');
        let o_img = o_ctx_src.createImageData(n_scl_x__image, n_scl_y__image);
        for (let n_i = 0; n_i < a_n__image_data.length; n_i++) {
            let n_v = a_n__image_data[n_i];
            o_img.data[n_i * 4] = n_v;
            o_img.data[n_i * 4 + 1] = n_v;
            o_img.data[n_i * 4 + 2] = n_v;
            o_img.data[n_i * 4 + 3] = 255;
        }
        o_ctx_src.putImageData(o_img, 0, 0);
        let el_dst = document.createElement('canvas');
        el_dst.width = n_scl_x;
        el_dst.height = n_scl_y;
        let o_ctx_dst = el_dst.getContext('2d');
        o_ctx_dst.drawImage(el_src, 0, 0, n_scl_x, n_scl_y);
        let o_img_dst = o_ctx_dst.getImageData(0, 0, n_scl_x, n_scl_y);
        a_n__data = new Uint8Array(n_scl_x * n_scl_y);
        for (let n_i = 0; n_i < a_n__data.length; n_i++) {
            a_n__data[n_i] = o_img_dst.data[n_i * 4];
        }
    }

    let n_ratio = n_scl_x / n_scl_y;
    let n_plane_x = n_ratio >= 1 ? 2 : 2 * n_ratio;
    let n_plane_y = n_ratio >= 1 ? 2 / n_ratio : 2;
    let o_geometry = new THREE.PlaneGeometry(n_plane_x, n_plane_y, n_scl_x - 1, n_scl_y - 1);

    o_geometry.computeBoundingBox();
    let o_box = o_geometry.boundingBox;
    let n_max_dim = Math.max(
        o_box.max.x - o_box.min.x,
        o_box.max.y - o_box.min.y,
        o_box.max.z - o_box.min.z
    );
    let n_scl = n_mm_width / n_max_dim;
    o_geometry.scale(n_scl, n_scl, n_scl);

    let n_mm__displacement = f_n_mm__displacement(o_config, n_mm_width, n_factor);
    f_apply_displacement(THREE, o_geometry, a_n__data, n_scl_x, n_scl_y, n_mm__displacement, 'plane');

    // baseplate (computed first so chamfer depth is available for text mask)
    let n_mm__baseplate;
    if (n_mm__baseplate_override != null) {
        n_mm__baseplate = n_mm__baseplate_override;
    } else {
        n_mm__baseplate = Math.max(1, o_config.n_mm__baseplate * (n_mm_width / o_config.n_mm__max_width));
        n_mm__baseplate = Math.round(n_mm__baseplate * 2) / 2;
    }

    let n_deg__chamfer = 45;

    // chamfer depth in mm: how far the 45° cut extends from front edge into bottom face
    let n_mm__chamfer_depth = (n_mm__baseplate + n_mm__displacement) / Math.tan(n_deg__chamfer * Math.PI / 180);

    // text mask
    let a_n__text_mask_local = null;
    if (o_config.b_text__enabled && o_config.n_m_per_pixel > 0) {
        let n_mm_plate_x = n_ratio >= 1 ? n_mm_width : n_mm_width * n_ratio;
        let n_mm_plate_y = n_ratio >= 1 ? n_mm_width / n_ratio : n_mm_width;
        let n_m__real_width = o_config.n_m_per_pixel * o_config.n_scl_x__map_selection;
        let n_scale = n_m__real_width * 1000 / n_mm_width;
        let n_scale__nice = f_n__nice_round(n_scale);
        let a_s__line = ['TopoPrints'];
        if (o_config.s_name__location) a_s__line.push(o_config.s_name__location);
        a_s__line.push('1:' + f_s__format_number(n_scale__nice));
        a_s__line.push('VE: ' + n_factor.toFixed(1));
        let s_text = a_s__line.join('\n');
        a_n__text_mask_local = f_a_n__text_mask(n_scl_x, n_scl_y, n_mm_plate_x, n_mm_plate_y, s_text, n_m__real_width, n_mm__chamfer_depth);
    }

    // hole
    let o_hole = null;
    if (b_with_hole) {
        o_geometry.computeBoundingBox();
        let o_bb = o_geometry.boundingBox;
        let n_hole_radius = o_config.n_mm__hole_diameter / 2;
        let n_hole_margin = o_config.n_mm__hole_margin;
        let n_hole_cx, n_hole_cy;
        let s_corner = o_config.s_corner__hole;
        if (s_corner === 'tl') {
            n_hole_cx = o_bb.min.x + n_hole_margin + n_hole_radius;
            n_hole_cy = o_bb.max.y - n_hole_margin - n_hole_radius;
        } else if (s_corner === 'tr') {
            n_hole_cx = o_bb.max.x - n_hole_margin - n_hole_radius;
            n_hole_cy = o_bb.max.y - n_hole_margin - n_hole_radius;
        } else if (s_corner === 'bl') {
            n_hole_cx = o_bb.min.x + n_hole_margin + n_hole_radius;
            n_hole_cy = o_bb.min.y + n_hole_margin + n_hole_radius;
        } else {
            n_hole_cx = o_bb.max.x - n_hole_margin - n_hole_radius;
            n_hole_cy = o_bb.min.y + n_hole_margin + n_hole_radius;
        }
        o_hole = { n_cx: n_hole_cx, n_cy: n_hole_cy, n_radius: n_hole_radius };
    }

    let o_geom__solid = f_o_geometry__solid_plane(
        THREE, o_geometry, n_mm__baseplate, n_deg__chamfer,
        a_n__text_mask_local, o_config.n_mm__text_depth, o_hole
    );
    o_geom__solid.computeVertexNormals();

    let o_group = new THREE.Group();
    let o_mesh = new THREE.Mesh(o_geom__solid, new THREE.MeshBasicMaterial());
    o_group.add(o_mesh);
    o_geometry.dispose();

    return o_group;
};

let f_s__openscad_script = function (o_config, n_scl_x__image, n_scl_y__image, n_mm_width, s_heightmap_file, b_with_hole, n_ve, n_mm__baseplate_override) {
    let n_factor = n_ve;
    let n_scl_x = n_scl_x__image;
    let n_scl_y = n_scl_y__image;
    let n_ratio = n_scl_x / n_scl_y;
    let n_mm_plate_x = n_ratio >= 1 ? n_mm_width : n_mm_width * n_ratio;
    let n_mm_plate_y = n_ratio >= 1 ? n_mm_width / n_ratio : n_mm_width;

    let n_mm__baseplate;
    if (n_mm__baseplate_override != null) {
        n_mm__baseplate = n_mm__baseplate_override;
    } else {
        n_mm__baseplate = Math.max(1, o_config.n_mm__baseplate * (n_mm_width / o_config.n_mm__max_width));
        n_mm__baseplate = Math.round(n_mm__baseplate * 2) / 2;
    }

    let n_mm__displacement = 0;
    let n_scale = 0;
    if (o_config.n_m_per_pixel > 0 && o_config.n_scl_x__map_selection > 0) {
        let n_m__real_width = o_config.n_m_per_pixel * o_config.n_scl_x__map_selection;
        n_scale = n_m__real_width * 1000 / n_mm_width;
        let n_m__elevation_range = o_config.n_m__elevation_max - o_config.n_m__elevation_min;
        n_mm__displacement = (n_m__elevation_range * 1000 / n_scale) * n_factor;
    } else {
        n_mm__displacement = n_factor * 10 * (n_mm_width / o_config.n_mm__max_width);
    }

    let n_scl_z = n_mm__displacement / 100;
    let n_scl_factor_x = n_mm_plate_x / n_scl_x;
    let n_scl_factor_y = n_mm_plate_y / n_scl_y;

    let n_outer_r = o_config.n_mm__hole_diameter / 2 + 1.5;
    let n_inner_r = o_config.n_mm__hole_diameter / 2;
    let n_hole_margin = o_config.n_mm__hole_margin;

    let n_hole_cx = 0;
    let n_hole_cy = 0;
    let s_corner = o_config.s_corner__hole;
    if (s_corner === 'tl') {
        n_hole_cx = -n_mm_plate_x / 2 + n_hole_margin + n_outer_r;
        n_hole_cy = n_mm_plate_y / 2 - n_hole_margin - n_outer_r;
    } else if (s_corner === 'tr') {
        n_hole_cx = n_mm_plate_x / 2 - n_hole_margin - n_outer_r;
        n_hole_cy = n_mm_plate_y / 2 - n_hole_margin - n_outer_r;
    } else if (s_corner === 'bl') {
        n_hole_cx = -n_mm_plate_x / 2 + n_hole_margin + n_outer_r;
        n_hole_cy = -n_mm_plate_y / 2 + n_hole_margin + n_outer_r;
    } else {
        n_hole_cx = n_mm_plate_x / 2 - n_hole_margin - n_outer_r;
        n_hole_cy = -n_mm_plate_y / 2 + n_hole_margin + n_outer_r;
    }

    let n_scale__nice = n_scale > 0 ? f_n__nice_round(n_scale) : 0;
    let s_scale_text = n_scale__nice > 0 ? '1:' + f_s__format_number(n_scale__nice) : '';
    let s_location = o_config.s_name__location || '';
    let n_total_height = n_mm__baseplate + n_mm__displacement;

    let a_s__carve = ['TopoPrints'];
    if (s_location) a_s__carve.push(s_location);
    if (s_scale_text) a_s__carve.push(s_scale_text);
    a_s__carve.push('VE: ' + n_factor.toFixed(1));

    let s = '';
    s += '// TopoPrints — OpenSCAD model\n';
    s += '// ' + (s_location || 'Custom heightmap') + '\n';
    s += '// Width: ' + n_mm_width + 'mm, Scale: ' + (s_scale_text || 'N/A') + ', VE: ' + n_factor.toFixed(1) + '\n';
    s += '// Place this file in the same folder as the heightmap PNG\n\n';
    s += '$fn = 64;\n\n';
    s += '// --- Parameters ---\n';
    s += 'n_mm_plate_x = ' + n_mm_plate_x.toFixed(2) + ';\n';
    s += 'n_mm_plate_y = ' + n_mm_plate_y.toFixed(2) + ';\n';
    s += 'n_mm_baseplate = ' + n_mm__baseplate.toFixed(1) + ';\n';
    s += 'n_mm_displacement = ' + n_mm__displacement.toFixed(3) + ';\n';
    s += 'n_scl_x = ' + n_scl_factor_x.toFixed(6) + ';\n';
    s += 'n_scl_y = ' + n_scl_factor_y.toFixed(6) + ';\n';
    s += 'n_scl_z = ' + n_scl_z.toFixed(6) + ';\n';
    s += 'n_total_height = ' + n_total_height.toFixed(2) + ';\n';
    s += 's_heightmap = "' + s_heightmap_file + '";\n\n';
    s += '// --- Chamfer (45 deg cut on front edge for print bed) ---\n';
    s += 'n_deg_chamfer = 45;\n\n';

    if (o_config.b_text__enabled) {
        s += '// --- Text carving ---\n';
        s += 'n_mm_text_depth = ' + o_config.n_mm__text_depth.toFixed(2) + ';\n';
        s += 'a_s_text = ' + JSON.stringify(a_s__carve) + ';\n';
        s += 's_carve_text = str(a_s_text[0]';
        for (let n_i = 1; n_i < a_s__carve.length; n_i++) {
            s += ', "\\n", a_s_text[' + n_i + ']';
        }
        s += ');\n\n';
    }

    if (b_with_hole) {
        s += '// --- Corner hole ---\n';
        s += 'n_outer_r = ' + n_outer_r.toFixed(2) + ';\n';
        s += 'n_inner_r = ' + n_inner_r.toFixed(2) + ';\n';
        s += 'n_hole_cx = ' + n_hole_cx.toFixed(2) + ';\n';
        s += 'n_hole_cy = ' + n_hole_cy.toFixed(2) + ';\n\n';
    }

    s += '// --- Modules ---\n\n';
    s += 'module topo_surface() {\n';
    s += '    translate([-n_mm_plate_x/2, -n_mm_plate_y/2, 0])\n';
    s += '    scale([n_scl_x, n_scl_y, n_scl_z])\n';
    s += '    surface(file=s_heightmap, center=false, convexity=5);\n';
    s += '}\n\n';
    s += 'module baseplate() {\n';
    s += '    translate([0, 0, -n_mm_baseplate/2])\n';
    s += '    cube([n_mm_plate_x, n_mm_plate_y, n_mm_baseplate], center=true);\n';
    s += '}\n\n';
    s += 'module solid_model() {\n';
    s += '    union() {\n';
    s += '        topo_surface();\n';
    s += '        baseplate();\n';
    s += '    }\n';
    s += '}\n\n';
    s += 'module chamfered_model() {\n';
    s += '    intersection() {\n';
    s += '        solid_model();\n';
    s += '        translate([0, -n_mm_plate_y/2, -n_mm_baseplate])\n';
    s += '        rotate([n_deg_chamfer, 0, 0])\n';
    s += '        translate([0, 0, -200])\n';
    s += '        cube([n_mm_plate_x + 2, 400, 400], center=true);\n';
    s += '    }\n';
    s += '}\n\n';

    if (o_config.b_text__enabled) {
        s += 'module text_carve() {\n';
        s += '    n_diag_angle = atan2(n_mm_plate_y, n_mm_plate_x);\n';
        s += '    translate([0, 0, -n_mm_baseplate])\n';
        s += '    mirror([1, 0, 0])\n';
        s += '    rotate([0, 0, -n_diag_angle])\n';
        s += '    linear_extrude(height=n_mm_text_depth)\n';
        s += '    text(s_carve_text, size=n_mm_plate_x * 0.08, halign="center", valign="center", font="sans-serif");\n';
        s += '}\n\n';
    }

    if (b_with_hole) {
        s += 'module hole_ring() {\n';
        s += '    translate([n_hole_cx, n_hole_cy, -n_mm_baseplate - 0.01])\n';
        s += '    difference() {\n';
        s += '        cylinder(h=n_total_height + 0.02, r=n_outer_r);\n';
        s += '        translate([0, 0, -0.1])\n';
        s += '        cylinder(h=n_total_height + 0.24, r=n_inner_r);\n';
        s += '    }\n';
        s += '}\n\n';
    }

    s += '// --- Assembly ---\n';
    if (b_with_hole) {
        s += 'difference() {\n';
        s += '    union() {\n';
        s += '        chamfered_model();\n';
        s += '        hole_ring();\n';
        s += '    }\n';
        if (o_config.b_text__enabled) {
            s += '    text_carve();\n';
        }
        s += '}\n';
    } else if (o_config.b_text__enabled) {
        s += 'difference() {\n';
        s += '    chamfered_model();\n';
        s += '    text_carve();\n';
        s += '}\n';
    } else {
        s += 'chamfered_model();\n';
    }

    return s;
};

// orchestrate: generate 6 STL variants + heightmap PNG + 6 OpenSCAD scripts
let f_generate_and_download_all = async function (THREE, o_config, a_n__image_data, n_scl_x__image, n_scl_y__image, s_data_url__heightmap, f_on_status) {
    let s_name = o_config.s_name__location || 'topo';
    s_name = s_name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    let a_o_variant = [
        { n_mm_width: 220, s_suffix: 'large_220mm_ve1', b_hole: false, n_ve: 1.0, n_mm__baseplate: null, n_pxmm: null },
        { n_mm_width: 220, s_suffix: 'large_220mm_ve2', b_hole: false, n_ve: 2.0, n_mm__baseplate: null, n_pxmm: null },
        { n_mm_width: 160, s_suffix: 'medium_160mm_ve1', b_hole: false, n_ve: 1.0, n_mm__baseplate: null, n_pxmm: null },
        { n_mm_width: 160, s_suffix: 'medium_160mm_ve2', b_hole: false, n_ve: 2.0, n_mm__baseplate: null, n_pxmm: null },
        { n_mm_width: 35,  s_suffix: 'keychain_35mm_ve1', b_hole: true, n_ve: 1.0, n_mm__baseplate: 2, n_pxmm: null },
        { n_mm_width: 35,  s_suffix: 'keychain_35mm_ve2', b_hole: true, n_ve: 2.0, n_mm__baseplate: 2, n_pxmm: null },
    ];

    // download 6 STL files
    for (let n_i = 0; n_i < a_o_variant.length; n_i++) {
        let o_variant = a_o_variant[n_i];
        if (f_on_status) f_on_status('Generating STL ' + (n_i + 1) + '/' + a_o_variant.length + ' (' + o_variant.s_suffix + ')...');

        let o_group = f_o_group__build_variant(
            THREE, o_config, a_n__image_data, n_scl_x__image, n_scl_y__image,
            o_variant.n_mm_width, o_variant.b_hole, o_variant.n_ve, o_variant.n_mm__baseplate, o_variant.n_pxmm
        );
        let o_buffer = f_o_buffer__stl_from_o_group(THREE, o_group);

        o_group.traverse(function (o_child) {
            if (o_child.geometry) o_child.geometry.dispose();
            if (o_child.material) o_child.material.dispose();
        });

        f_download_buffer(o_buffer, s_name + '_' + o_variant.s_suffix + '.stl');

        if (n_i < a_o_variant.length - 1) {
            await new Promise(function (f_resolve) { setTimeout(f_resolve, 500); });
        }
    }

    await new Promise(function (f_resolve) { setTimeout(f_resolve, 500); });

    // download heightmap PNG
    if (f_on_status) f_on_status('Downloading heightmap PNG...');
    let s_heightmap_file = s_name + '_heightmap.png';
    if (s_data_url__heightmap) {
        let o_a = document.createElement('a');
        o_a.download = s_heightmap_file;
        o_a.href = s_data_url__heightmap;
        o_a.click();
    }

    await new Promise(function (f_resolve) { setTimeout(f_resolve, 500); });

    // download 6 OpenSCAD scripts
    let a_o_variant__scad = [
        { n_mm_width: 220, s_suffix: 'large_220mm_ve1', b_hole: false, n_ve: 1.0, n_mm__baseplate: null },
        { n_mm_width: 220, s_suffix: 'large_220mm_ve2', b_hole: false, n_ve: 2.0, n_mm__baseplate: null },
        { n_mm_width: 160, s_suffix: 'medium_160mm_ve1', b_hole: false, n_ve: 1.0, n_mm__baseplate: null },
        { n_mm_width: 160, s_suffix: 'medium_160mm_ve2', b_hole: false, n_ve: 2.0, n_mm__baseplate: null },
        { n_mm_width: 35,  s_suffix: 'keychain_35mm_ve1', b_hole: true, n_ve: 1.0, n_mm__baseplate: 1.5 },
        { n_mm_width: 35,  s_suffix: 'keychain_35mm_ve2', b_hole: true, n_ve: 2.0, n_mm__baseplate: 1.5 },
    ];

    for (let n_i = 0; n_i < a_o_variant__scad.length; n_i++) {
        let o_variant = a_o_variant__scad[n_i];
        if (f_on_status) f_on_status('Generating OpenSCAD ' + (n_i + 1) + '/' + a_o_variant__scad.length + '...');

        let s_script = f_s__openscad_script(
            o_config, n_scl_x__image, n_scl_y__image,
            o_variant.n_mm_width, s_heightmap_file, o_variant.b_hole, o_variant.n_ve, o_variant.n_mm__baseplate
        );

        let o_blob = new Blob([s_script], { type: 'text/plain' });
        let s_url = URL.createObjectURL(o_blob);
        let o_a = document.createElement('a');
        o_a.href = s_url;
        o_a.download = s_name + '_' + o_variant.s_suffix + '.scad';
        o_a.click();
        URL.revokeObjectURL(s_url);

        await new Promise(function (f_resolve) { setTimeout(f_resolve, 500); });
    }

    if (f_on_status) f_on_status('Done — 6 STL + 6 SCAD + heightmap PNG downloaded');
};

export {
    f_apply_displacement,
    f_o_geometry__solid_plane,
    f_o_buffer__stl_from_o_group,
    f_download_buffer,
    f_n__nice_round,
    f_s__format_number,
    f_n_m__ruler_distance,
    f_a_n__text_mask,
    f_n_mm__displacement,
    f_o_group__build_variant,
    f_s__openscad_script,
    f_generate_and_download_all,
};
